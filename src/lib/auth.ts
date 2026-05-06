import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDb } from './mongodb';
import { User } from '@/types/admin';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): { userId: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string };
  } catch {
    return null;
  }
}

export interface PublicUser {
  _id?: string;
  id?: string;
  email: string;
  password: string;
  name?: string | null;
  image?: string | null;
  isPaid: boolean;
  subscriptionStatus: string;
  lastPaymentAt?: Date | null;
  emailVerified?: boolean;
  emailVerificationToken?: string | null;
  emailVerificationTokenExpiry?: Date | null;
  passwordResetToken?: string | null;
  passwordResetTokenExpiry?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

function toPublicUser(doc: Record<string, unknown> | null): PublicUser | null {
  if (!doc) return null;
  const id = String(doc._id ?? doc.id ?? '');
  return {
    _id: id,
    id,
    email: String(doc.email ?? ''),
    password: String(doc.password ?? ''),
    name: doc.name as string | null | undefined,
    image: doc.image as string | null | undefined,
    isPaid: Boolean(doc.isPaid),
    subscriptionStatus: String(doc.subscriptionStatus ?? 'none'),
    lastPaymentAt: doc.lastPaymentAt as Date | null | undefined,
    emailVerified: Boolean(doc.emailVerified),
    emailVerificationToken: doc.emailVerificationToken as string | null | undefined,
    emailVerificationTokenExpiry: doc.emailVerificationTokenExpiry as Date | null | undefined,
    passwordResetToken: doc.passwordResetToken as string | null | undefined,
    passwordResetTokenExpiry: doc.passwordResetTokenExpiry as Date | null | undefined,
    createdAt: doc.createdAt as Date,
    updatedAt: doc.updatedAt as Date,
  };
}

export async function createAdminUser(username: string, password: string): Promise<User> {
  const hashedPassword = await hashPassword(password);
  const db = await getDb();
  const doc = {
    _id: crypto.randomUUID(),
    id: crypto.randomUUID(),
    username,
    password: hashedPassword,
    createdAt: new Date(),
  };
  await db.collection('users').insertOne(doc);
  return { _id: doc._id, username, password: hashedPassword, createdAt: doc.createdAt };
}

export async function getUserByUsername(username: string): Promise<User | null> {
  const db = await getDb();
  const user = await db.collection('users').findOne({ username });
  return user ? { _id: String(user._id ?? user.id), username: user.username, password: user.password, createdAt: user.createdAt } : null;
}

export async function getAdminUserById(id: string): Promise<User | null> {
  const db = await getDb();
  const user = await db.collection('users').findOne({ $or: [{ _id: id }, { id }] });
  return user ? { _id: String(user._id ?? user.id), username: user.username, password: user.password, createdAt: user.createdAt } : null;
}

export async function createUser(username: string, password: string): Promise<User> {
  return createAdminUser(username, password);
}

export async function getUserById(id: string): Promise<User | null> {
  return getAdminUserById(id);
}

export async function createPublicUser(email: string, password: string, name?: string, emailVerificationToken?: string): Promise<PublicUser> {
  const hashedPassword = await hashPassword(password);
  const id = crypto.randomUUID();
  const now = new Date();
  const emailVerificationTokenExpiry = emailVerificationToken ? new Date(Date.now() + 24 * 60 * 60 * 1000) : null;

  const doc = {
    _id: id,
    id,
    email,
    password: hashedPassword,
    name: name || null,
    image: null,
    isPaid: false,
    subscriptionStatus: 'none',
    lastPaymentAt: null,
    emailVerified: false,
    emailVerificationToken: emailVerificationToken || null,
    emailVerificationTokenExpiry,
    passwordResetToken: null,
    passwordResetTokenExpiry: null,
    createdAt: now,
    updatedAt: now,
  };
  const db = await getDb();
  await db.collection('public_users').insertOne(doc);
  return toPublicUser(doc)!;
}

export async function getPublicUserByEmail(email: string): Promise<PublicUser | null> {
  const db = await getDb();
  const user = await db.collection('public_users').findOne({ email });
  return toPublicUser(user as Record<string, unknown> | null);
}

export async function getPublicUserById(id: string): Promise<PublicUser | null> {
  const db = await getDb();
  const user = await db.collection('public_users').findOne({ $or: [{ _id: id }, { id }] });
  return toPublicUser(user as Record<string, unknown> | null);
}

export async function updatePublicUser(
  id: string,
  updates: {
    name?: string | null;
    email?: string;
    image?: string | null;
    isPaid?: boolean;
    subscriptionStatus?: string;
    lastPaymentAt?: Date | null;
    emailVerified?: boolean;
    emailVerificationToken?: string | null;
    emailVerificationTokenExpiry?: Date | null;
    passwordResetToken?: string | null;
    passwordResetTokenExpiry?: Date | null;
    password?: string;
  }
): Promise<PublicUser | null> {
  const db = await getDb();
  const updateData: Record<string, unknown> = { ...updates, updatedAt: new Date() };
  const result = await db.collection('public_users').findOneAndUpdate(
    { $or: [{ _id: id }, { id }] },
    { $set: updateData },
    { returnDocument: 'after' }
  );
  return toPublicUser(result as Record<string, unknown> | null);
}

export function generateSecureToken(): string {
  return require('crypto').randomBytes(32).toString('hex');
}

export async function getPublicUserByVerificationToken(token: string): Promise<PublicUser | null> {
  const db = await getDb();
  const user = await db.collection('public_users').findOne({
    emailVerificationToken: token,
    emailVerificationTokenExpiry: { $gt: new Date() },
  });
  return toPublicUser(user as Record<string, unknown> | null);
}

export async function getPublicUserByPasswordResetToken(token: string): Promise<PublicUser | null> {
  const db = await getDb();
  const user = await db.collection('public_users').findOne({
    passwordResetToken: token,
    passwordResetTokenExpiry: { $gt: new Date() },
  });
  return toPublicUser(user as Record<string, unknown> | null);
}
