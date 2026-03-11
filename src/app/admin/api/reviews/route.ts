import { NextRequest, NextResponse } from 'next/server';
import { withNoAuth } from '@/lib/middleware';
import { listAllReviews } from '@/lib/reviews';
import { ReviewStatus } from '@/types/admin';

async function getReviews(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const statusParam = searchParams.get('status') as ReviewStatus | null;
    const analystParam = searchParams.get('analystId');

    if (statusParam && !['pending', 'approved', 'rejected'].includes(statusParam)) {
      return NextResponse.json(
        { error: 'Invalid status filter' },
        { status: 400 }
      );
    }

    let analystId: number | undefined;
    if (analystParam !== null) {
      const parsed = Number(analystParam);
      if (Number.isNaN(parsed)) {
        return NextResponse.json(
          { error: 'analystId must be numeric' },
          { status: 400 }
        );
      }
      analystId = parsed;
    }

    const reviews = await listAllReviews(statusParam ?? undefined, analystId);
    return NextResponse.json({ reviews });
  } catch (error) {
    console.error('Admin reviews fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

export const GET = withNoAuth(getReviews);

