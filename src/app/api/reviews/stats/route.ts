import { NextRequest, NextResponse } from 'next/server';
import { getReviewStatsForAnalyst } from '@/lib/reviews';

export const dynamic = 'force-dynamic';

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
    if (Number.isNaN(analystId) || analystId < 0) {
      return NextResponse.json(
        { error: 'analystId must be a non-negative number' },
        { status: 400 }
      );
    }

    const stats = await getReviewStatsForAnalyst(analystId);
    const response = NextResponse.json({ stats });
    response.headers.set(
      'Cache-Control',
      'public, max-age=0, s-maxage=60, stale-while-revalidate=300'
    );
    return response;
  } catch (error) {
    console.error('Failed to fetch review stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch review stats' },
      { status: 500 }
    );
  }
}

