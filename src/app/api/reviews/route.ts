import { NextRequest, NextResponse } from 'next/server';
import { createReview, listReviewsByAnalyst } from '@/lib/reviews';
import { getDb } from '@/lib/mongodb';
import { getAuthenticatedUser } from '@/lib/authHelpers';
import { getPublicUserById } from '@/lib/auth';

const MIN_COMMENT_LENGTH = 10;

// Cache GET reviews responses for 60 seconds on the edge
export const revalidate = 60;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const analystParam = searchParams.get('analystId');

    if (!analystParam) {
      return NextResponse.json(
        { error: 'analystId query parameter is required' },
        { status: 400 }
      );
    }

    const analystId = Number(analystParam);
    if (Number.isNaN(analystId)) {
      return NextResponse.json(
        { error: 'analystId must be numeric' },
        { status: 400 }
      );
    }

    const reviews = await listReviewsByAnalyst(analystId);
    
    // Enrich reviews with user profile pictures
    const enrichedReviews = await Promise.all(
      reviews.map(async (review) => {
        const existingPicture = review.userProfilePicture ?? null;
        const reviewerId = review.reviewerId ?? review.userId ?? null;

        if (reviewerId) {
          try {
            const user = await getPublicUserById(reviewerId);
            const resolvedImage = user?.image?.trim();
            return {
              ...review,
              userProfilePicture: resolvedImage || existingPicture,
            };
          } catch (error) {
            console.error(`Failed to fetch user ${reviewerId} for review:`, error);
            return {
              ...review,
              userProfilePicture: existingPicture,
            };
          }
        }

        return {
          ...review,
          userProfilePicture: existingPicture,
        };
      })
    );

    const response = NextResponse.json({ reviews: enrichedReviews });
    response.headers.set(
      'Cache-Control',
      'public, max-age=0, s-maxage=60, stale-while-revalidate=300'
    );
    return response;
  } catch (error) {
    console.error('Failed to fetch reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { analystId, reviewerName, rating, comment, reviewDate } = body;

    if (typeof analystId !== 'number' || Number.isNaN(analystId)) {
      return NextResponse.json(
        { error: 'analystId is required and must be numeric' },
        { status: 400 }
      );
    }

    const trimmedName = (reviewerName || '').trim();
    if (trimmedName.length < 2) {
      return NextResponse.json(
        { error: 'Reviewer name must be at least 2 characters long' },
        { status: 400 }
      );
    }

    const normalizedRating = Number(rating);
    if (Number.isNaN(normalizedRating) || normalizedRating < 1 || normalizedRating > 5) {
      return NextResponse.json(
        { error: 'Rating must be a number between 1 and 5' },
        { status: 400 }
      );
    }

    const trimmedComment = (comment || '').trim();
    if (trimmedComment.length < MIN_COMMENT_LENGTH) {
      return NextResponse.json(
        { error: `Comment must be at least ${MIN_COMMENT_LENGTH} characters long` },
        { status: 400 }
      );
    }

    const db = await getDb();
    const analyst = await db.collection('team').findOne({ teamId: analystId }) ?? await db.collection('team').findOne({ teamId: String(analystId) });

    if (!analyst) {
      return NextResponse.json(
        { error: 'Analyst not found' },
        { status: 404 }
      );
    }

    // Get userId if user is logged in (optional)
    const userId = await getAuthenticatedUser(request);

    const dateString =
      typeof reviewDate === 'string' && reviewDate.trim().length > 0
        ? reviewDate.trim()
        : new Date().toISOString().split('T')[0];

    const review = await createReview({
      analystId,
      analystName: (analyst as Record<string, unknown>).name as string,
      reviewerName: trimmedName,
      userId: userId || null,
      reviewerId: userId || null,
      rating: normalizedRating,
      comment: trimmedComment,
      reviewDate: dateString,
    });

    return NextResponse.json({ review }, { status: 201 });
  } catch (error) {
    console.error('Failed to create review:', error);
    return NextResponse.json(
      { error: 'Failed to submit review' },
      { status: 500 }
    );
  }
}

