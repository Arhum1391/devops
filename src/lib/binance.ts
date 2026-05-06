import crypto from 'crypto';

type HttpMethod = 'GET' | 'POST' | 'DELETE' | 'PUT';

export type BinanceClientConfig = {
  baseUrl?: string;
  recvWindow?: number;
};

export type BinanceCredentials = {
  apiKey: string;
  apiSecret: string;
  useTestnet?: boolean;
};

export type BinanceRateLimitInfo = {
  usedWeight1m?: number;
  orderCount10s?: number;
  orderCount1m?: number;
  rawHeaders: Record<string, string>;
};

export type BinanceApiResponse<T> = {
  data: T;
  rateLimit: BinanceRateLimitInfo;
};

export type AccountBalance = {
  asset: string;
  free: string;
  locked: string;
};

export type AccountInformation = {
  makerCommission: number;
  takerCommission: number;
  buyerCommission: number;
  sellerCommission: number;
  canTrade: boolean;
  canWithdraw: boolean;
  canDeposit: boolean;
  updateTime: number;
  accountType: string;
  balances: AccountBalance[];
};

export type TickerPrice = {
  symbol: string;
  price: string;
};

export type KlinePoint = {
  openTime: number;
  closeTime: number;
  closePrice: number;
};

export class BinanceApiError extends Error {
  public readonly status: number;
  public readonly code?: number | string;
  public readonly data?: unknown;
  public readonly isRateLimit: boolean;
  public readonly retryAfterMs?: number;

  constructor(options: {
    message: string;
    status: number;
    code?: number | string;
    data?: unknown;
    isRateLimit?: boolean;
    retryAfterMs?: number;
  }) {
    super(options.message);
    this.name = 'BinanceApiError';
    this.status = options.status;
    this.code = options.code;
    this.data = options.data;
    this.isRateLimit = options.isRateLimit ?? false;
    this.retryAfterMs = options.retryAfterMs;
  }
}

type RequestOptions = {
  method?: HttpMethod;
  params?: Record<string, string | number | boolean | undefined>;
  requiresSignature?: boolean;
  recvWindow?: number;
};

const DEFAULT_MAINNET_BASE_URL = 'https://api.binance.com';
const DEFAULT_TESTNET_BASE_URL = 'https://testnet.binance.vision';
const DEFAULT_RECV_WINDOW = 60000; // Increased to 60 seconds to handle time sync issues

const toStringRecord = (
  params: Record<string, string | number | boolean | undefined>
): Record<string, string> => {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === 'undefined') {
      continue;
    }
    if (Array.isArray(value)) {
      throw new Error(`Array values are not supported for Binance query param "${key}".`);
    }
    result[key] = String(value);
  }
  return result;
};

const resolveBaseUrl = (credentials: BinanceCredentials, config?: BinanceClientConfig): string => {
  if (config?.baseUrl) {
    return trimTrailingSlash(config.baseUrl);
  }

  const envBaseUrl = process.env.BINANCE_API_BASE_URL;
  if (envBaseUrl) {
    return trimTrailingSlash(envBaseUrl);
  }

  const { useTestnet } = credentials;
  return useTestnet ? DEFAULT_TESTNET_BASE_URL : DEFAULT_MAINNET_BASE_URL;
};

const trimTrailingSlash = (input: string): string => input.replace(/\/+$/, '');

const parseRetryAfter = (headers: Headers): number | undefined => {
  const retryAfter = headers.get('retry-after');
  if (!retryAfter) {
    return undefined;
  }

  const delaySeconds = Number(retryAfter);
  if (!Number.isNaN(delaySeconds)) {
    return delaySeconds * 1000;
  }

  const retryDate = new Date(retryAfter);
  if (!Number.isNaN(retryDate.getTime())) {
    return Math.max(retryDate.getTime() - Date.now(), 0);
  }

  return undefined;
};

const parseRateLimitHeaders = (headers: Headers): BinanceRateLimitInfo => {
  const raw: Record<string, string> = {};
  headers.forEach((value, key) => {
    if (key.toLowerCase().startsWith('x-mbx')) {
      raw[key] = value;
    }
  });

  const toNumber = (value: string | null): number | undefined => {
    if (!value) {
      return undefined;
    }
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  };

  return {
    usedWeight1m: toNumber(headers.get('x-mbx-used-weight-1m')),
    orderCount10s: toNumber(headers.get('x-mbx-order-count-10s')),
    orderCount1m: toNumber(headers.get('x-mbx-order-count-1m')),
    rawHeaders: raw,
  };
};

const safeJsonParse = (text: string): unknown => {
  try {
    return text ? JSON.parse(text) : undefined;
  } catch {
    return undefined;
  }
};

export class BinanceClient {
  private readonly apiKey: string;
  private readonly apiSecret: string;
  private readonly baseUrl: string;
  private readonly defaultRecvWindow: number;

  constructor(credentials: BinanceCredentials, config?: BinanceClientConfig) {
    this.apiKey = credentials.apiKey;
    this.apiSecret = credentials.apiSecret;
    this.baseUrl = resolveBaseUrl(credentials, config);
    this.defaultRecvWindow = config?.recvWindow ?? DEFAULT_RECV_WINDOW;
  }

  async getAccountInformation(): Promise<BinanceApiResponse<AccountInformation>> {
    return this.request<AccountInformation>('/api/v3/account', {
      requiresSignature: true,
    });
  }

  async getTickerPrices(symbols?: string[]): Promise<BinanceApiResponse<TickerPrice[]>> {
    const params =
      symbols && symbols.length
        ? { symbols: JSON.stringify(symbols.map(symbol => symbol.toUpperCase())) }
        : {};

    return this.request<TickerPrice[]>('/api/v3/ticker/price', {
      params,
    });
  }

  async getKlines(params: {
    symbol: string;
    interval: string;
    limit: number;
  }): Promise<BinanceApiResponse<KlinePoint[]>> {
    const raw = await this.request<any[]>('/api/v3/klines', {
      params: {
        symbol: params.symbol,
        interval: params.interval,
        limit: params.limit,
      },
    });

    const mapped: KlinePoint[] = raw.data.map(entry => ({
      openTime: Number(entry[0]),
      closeTime: Number(entry[6]),
      closePrice: Number(entry[4]),
    }));

    return {
      data: mapped,
      rateLimit: raw.rateLimit,
    };
  }

  private async request<T>(path: string, options: RequestOptions = {}): Promise<BinanceApiResponse<T>> {
    const method = options.method ?? 'GET';
    const params = options.params ?? {};
    const requiresSignature = options.requiresSignature ?? false;
    const recvWindow = options.recvWindow ?? this.defaultRecvWindow;

    const query = toStringRecord(params);
    const url = new URL(`${this.baseUrl}${path}`);

    if (requiresSignature) {
      query.timestamp = Date.now().toString();
      query.recvWindow = recvWindow.toString();
    }

    const searchParams = new URLSearchParams(query);
    const queryString = searchParams.toString();

    if (queryString) {
      url.search = queryString;
    }

    let signature: string | undefined;
    if (requiresSignature) {
      signature = crypto.createHmac('sha256', this.apiSecret).update(queryString).digest('hex');
      url.searchParams.set('signature', signature);
    }

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.apiKey) {
      headers['X-MBX-APIKEY'] = this.apiKey;
    }

    // Add timeout and retry logic for network issues
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
    
    let response: Response;
    try {
      response = await fetch(url.toString(), { 
        method, 
        headers,
        signal: controller.signal,
        // Add connection timeout and keep-alive settings
        keepalive: true,
      });
      clearTimeout(timeoutId);
    } catch (error) {
      clearTimeout(timeoutId);
      
      // Handle specific timeout errors
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new BinanceApiError('Request timeout - Binance API is not responding', 'TIMEOUT', undefined, 5000);
        }
        if (error.message.includes('Connect Timeout') || error.message.includes('ECONNRESET')) {
          throw new BinanceApiError('Connection timeout - Please check your internet connection', 'CONNECTION_TIMEOUT', undefined, 10000);
        }
      }
      throw error;
    }
    
    const rateLimit = parseRateLimitHeaders(response.headers);

    if (!response.ok) {
      const text = await response.text();
      const parsed = safeJsonParse(text) as { code?: number; msg?: string } | undefined;
      const message =
        parsed?.msg ??
        `Binance API responded with status ${response.status}${parsed?.code ? ` (code ${parsed.code})` : ''}.`;

      const isRateLimit = response.status === 418 || response.status === 429;
      const retryAfterMs = isRateLimit ? parseRetryAfter(response.headers) : undefined;

      throw new BinanceApiError({
        message,
        status: response.status,
        code: parsed?.code,
        data: parsed,
        isRateLimit,
        retryAfterMs,
      });
    }

    // Binance typically returns JSON responses; handle empty bodies gracefully.
    const text = await response.text();
    const data = safeJsonParse(text) as T;

    return {
      data,
      rateLimit,
    };
  }
}

export const createBinanceClient = (
  credentials: BinanceCredentials,
  config?: BinanceClientConfig
): BinanceClient => {
  return new BinanceClient(credentials, config);
};

