/**
 * MongoDB client for Next.js
 * Replaces Prisma - uses MONGODB_URI from .env
 */
import { MongoClient, Db } from 'mongodb';

const uri = process.env.MONGODB_URI!;
const dbName = process.env.MONGODB_DATABASE || 'inspired_analyst';

if (!uri) {
  throw new Error('MONGODB_URI is required in .env');
}

const globalForMongo = global as unknown as { mongoClient: MongoClient; db: Db };

async function connect(): Promise<{ client: MongoClient; db: Db }> {
  if (globalForMongo.mongoClient && globalForMongo.db) {
    return { client: globalForMongo.mongoClient, db: globalForMongo.db };
  }

  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);

  if (process.env.NODE_ENV !== 'production') {
    globalForMongo.mongoClient = client;
    globalForMongo.db = db;
  }

  return { client, db };
}

export async function getDb(): Promise<Db> {
  const { db } = await connect();
  return db;
}

export async function getMongoClient(): Promise<MongoClient> {
  const { client } = await connect();
  return client;
}

/** Convert _id to id for API responses (MongoDB uses _id, app expects id) */
export function toApiDoc<T extends { _id?: unknown }>(doc: T | null): (Omit<T, '_id'> & { id: string }) | null {
  if (!doc) return null;
  const { _id, ...rest } = doc as T & { _id: string };
  return { ...rest, id: _id ?? (doc as { id?: string }).id } as Omit<T, '_id'> & { id: string };
}

/** Convert array of docs */
export function toApiDocs<T extends { _id?: unknown }>(docs: T[]): (Omit<T, '_id'> & { id: string })[] {
  return docs.map((d) => toApiDoc(d)!).filter(Boolean);
}

export default { getDb, getMongoClient, toApiDoc, toApiDocs };
