import crypto from 'crypto';

export type EncryptedPayload = {
  iv: string;
  authTag: string;
  cipherText: string;
};

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;

let cachedKey: Buffer | null = null;

const decodeKey = (rawKey: string): Buffer => {
  const normalized = rawKey.trim();

  const base64Match = /^[A-Za-z0-9+/=]+$/;
  const hexMatch = /^[0-9a-fA-F]+$/;

  if (base64Match.test(normalized)) {
    const buf = Buffer.from(normalized, 'base64');
    if (buf.length === 32) {
      return buf;
    }
  }

  if (hexMatch.test(normalized)) {
    const buf = Buffer.from(normalized, 'hex');
    if (buf.length === 32) {
      return buf;
    }
  }

  if (normalized.length === 32) {
    const buf = Buffer.from(normalized, 'utf8');
    if (buf.length === 32) {
      return buf;
    }
  }

  throw new Error(
    'BINANCE_CREDENTIALS_ENCRYPTION_KEY must be a 32-byte key encoded as base64, hex, or 32-character UTF-8.'
  );
};

const getKey = (): Buffer => {
  if (!cachedKey) {
    const envKey = process.env.BINANCE_CREDENTIALS_ENCRYPTION_KEY;
    if (!envKey) {
      throw new Error('BINANCE_CREDENTIALS_ENCRYPTION_KEY environment variable is not set.');
    }

    cachedKey = decodeKey(envKey);
  }

  return cachedKey;
};

export const encryptString = (plainText: string): EncryptedPayload => {
  const key = getKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return {
    iv: iv.toString('base64'),
    authTag: authTag.toString('base64'),
    cipherText: encrypted.toString('base64'),
  };
};

export const decryptString = (payload: EncryptedPayload): string => {
  const key = getKey();
  const iv = Buffer.from(payload.iv, 'base64');
  const authTag = Buffer.from(payload.authTag, 'base64');
  const cipherText = Buffer.from(payload.cipherText, 'base64');

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([decipher.update(cipherText), decipher.final()]);
  return decrypted.toString('utf8');
};

export const scrubEncryptionKeyCache = (): void => {
  cachedKey = null;
};
















