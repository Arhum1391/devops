import { getDb } from './mongodb';
import { decryptString, encryptString, EncryptedPayload } from './crypto';

type Nullable<T> = T | null | undefined;

export type BinanceCredentialDocument = {
  id?: string;
  userId: string;
  apiKey: EncryptedPayload;
  apiSecret: EncryptedPayload;
  passphrase?: EncryptedPayload;
  useTestnet?: boolean;
  label?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateBinanceCredentialsInput = {
  apiKey: string;
  apiSecret: string;
  passphrase?: Nullable<string>;
  label?: Nullable<string>;
  useTestnet?: boolean;
};

export type DecryptedBinanceCredentials = {
  apiKey: string;
  apiSecret: string;
  passphrase?: string;
  useTestnet: boolean;
  label?: string | null;
};

const validateUserId = (value: string): string => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(value)) {
    throw new Error('Invalid user id provided for Binance credential lookup.');
  }
  return value;
};

export const upsertBinanceCredentials = async (
  userId: string,
  payload: CreateBinanceCredentialsInput
): Promise<void> => {
  const validatedUserId = validateUserId(userId);
  const encryptedApiKey = encryptString(payload.apiKey);
  const encryptedApiSecret = encryptString(payload.apiSecret);
  const encryptedPassphrase = payload.passphrase ? encryptString(payload.passphrase) : undefined;

  const apiKeyJson = JSON.stringify(encryptedApiKey);
  const apiSecretJson = JSON.stringify(encryptedApiSecret);
  const passphraseJson = encryptedPassphrase ? JSON.stringify(encryptedPassphrase) : null;

  const db = await getDb();
  await db.collection('binance_credentials').updateOne(
    { userId: validatedUserId },
    {
      $set: {
        apiKey: apiKeyJson,
        apiSecret: apiSecretJson,
        passphrase: passphraseJson,
        useTestnet: payload.useTestnet ?? false,
        label: payload.label ?? null,
        updatedAt: new Date(),
      },
    },
    { upsert: true }
  );
};

export const deleteBinanceCredentials = async (userId: string): Promise<void> => {
  const validatedUserId = validateUserId(userId);
  const db = await getDb();
  await db.collection('binance_credentials').deleteMany({ userId: validatedUserId });
};

export const getEncryptedBinanceCredentials = async (
  userId: string
): Promise<BinanceCredentialDocument | null> => {
  const validatedUserId = validateUserId(userId);
  const db = await getDb();
  const credential = await db.collection('binance_credentials').findOne({ userId: validatedUserId });

  if (!credential) return null;

  return {
    id: String(credential._id ?? credential.id ?? ''),
    userId: credential.userId,
    apiKey: JSON.parse(credential.apiKey) as EncryptedPayload,
    apiSecret: JSON.parse(credential.apiSecret) as EncryptedPayload,
    passphrase: credential.passphrase ? (JSON.parse(credential.passphrase) as EncryptedPayload) : undefined,
    useTestnet: credential.useTestnet,
    label: credential.label,
    createdAt: credential.createdAt,
    updatedAt: credential.updatedAt,
  };
};

export const getDecryptedBinanceCredentials = async (
  userId: string
): Promise<DecryptedBinanceCredentials | null> => {
  const doc = await getEncryptedBinanceCredentials(userId);

  if (!doc) {
    return null;
  }

  const result: DecryptedBinanceCredentials = {
    apiKey: decryptString(doc.apiKey),
    apiSecret: decryptString(doc.apiSecret),
    useTestnet: doc.useTestnet ?? false,
    label: doc.label ?? null,
  };

  if (doc.passphrase) {
    result.passphrase = decryptString(doc.passphrase);
  }

  return result;
};
