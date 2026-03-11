import { getDb } from './mongodb';
import { Review, ReviewStatus } from '@/types/admin';

export type CreateReviewInput = {
  analystId: number;
  analystName: string;
  reviewerName: string;
  userId?: string | null;
  reviewerId?: string | null;
  rating: number;
  comment: string;
  reviewDate: string;
};

export type FetchReviewsOptions = {
  includePending?: boolean;
  limit?: number;
};

function serializeReview(doc: Record<string, unknown>): Review {
  return {
    _id: String(doc._id ?? doc.id ?? ''),
    analystId: Number(doc.analystId),
    analystName: String(doc.analystName ?? ''),
    reviewerName: String(doc.reviewerName ?? ''),
    userId: doc.userId as string | null | undefined,
    reviewerId: doc.reviewerId as string | null | undefined,
    userProfilePicture: doc.userProfilePicture as string | null | undefined,
    rating: Number(doc.rating),
    comment: String(doc.comment ?? ''),
    reviewDate: String(doc.reviewDate ?? ''),
    status: (doc.status as ReviewStatus) ?? 'pending',
    createdAt: doc.createdAt as Date,
    updatedAt: doc.updatedAt as Date,
    approvedAt: doc.approvedAt as Date | null | undefined,
    rejectedAt: doc.rejectedAt as Date | null | undefined,
  };
}

export async function listReviewsByAnalyst(
  analystId: number,
  { includePending = false, limit }: FetchReviewsOptions = {}
): Promise<Review[]> {
  const db = await getDb();
  const filter: Record<string, unknown> = { analystId };
  if (!includePending) filter.status = 'approved';

  const cursor = db.collection('reviews').find(filter).sort({ createdAt: -1 });
  const docs = limit ? await cursor.limit(limit).toArray() : await cursor.toArray();
  return docs.map((d) => serializeReview(d as Record<string, unknown>));
}

export type ReviewStats = {
  totalReviews: number;
  averageRating: number | null;
};

export async function getReviewStatsForAnalyst(analystId: number): Promise<ReviewStats> {
  const db = await getDb();
  const result = await db
    .collection('reviews')
    .aggregate([
      { $match: { analystId, status: 'approved' } },
      { $group: { _id: null, count: { $sum: 1 }, avgRating: { $avg: '$rating' } } },
    ])
    .toArray();
  const r = result[0] as { count?: number; avgRating?: number } | undefined;
  return {
    totalReviews: r?.count ?? 0,
    averageRating: r?.avgRating ?? null,
  };
}

export async function listAllReviews(status?: ReviewStatus, analystId?: number): Promise<Review[]> {
  const db = await getDb();
  const filter: Record<string, unknown> = {};
  if (status) filter.status = status;
  if (typeof analystId === 'number' && !Number.isNaN(analystId)) filter.analystId = analystId;

  const docs = await db.collection('reviews').find(filter).sort({ createdAt: -1 }).toArray();
  return docs.map((d) => serializeReview(d as Record<string, unknown>));
}

export async function createReview(input: CreateReviewInput): Promise<Review> {
  const db = await getDb();
  const id = crypto.randomUUID();
  const now = new Date();
  const doc = {
    _id: id,
    id,
    analystId: input.analystId,
    analystName: input.analystName,
    reviewerName: input.reviewerName.trim(),
    comment: input.comment.trim(),
    rating: Math.min(Math.max(Math.round(input.rating), 1), 5),
    reviewDate: input.reviewDate,
    userId: input.userId || null,
    reviewerId: input.reviewerId || null,
    status: 'pending',
    createdAt: now,
    updatedAt: now,
  };
  await db.collection('reviews').insertOne(doc);
  return serializeReview(doc);
}

export async function approveReview(reviewId: string): Promise<boolean> {
  const db = await getDb();
  const r = await db.collection('reviews').updateOne(
    { $or: [{ _id: reviewId }, { id: reviewId }] },
    { $set: { status: 'approved', approvedAt: new Date(), updatedAt: new Date() } }
  );
  return r.modifiedCount > 0;
}

export async function deleteReview(reviewId: string): Promise<boolean> {
  const db = await getDb();
  const r = await db.collection('reviews').deleteOne({ $or: [{ _id: reviewId }, { id: reviewId }] });
  return r.deletedCount > 0;
}
