import { NextRequest, NextResponse } from 'next/server';
import { approveReview, deleteReview } from '@/lib/reviews';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const body = await req.json();
    const { status } = body;

    if (status !== 'approved') {
      return NextResponse.json(
        { error: 'Only approving reviews is supported via PATCH' },
        { status: 400 }
      );
    }

    const updated = await approveReview(id);
    if (!updated) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Review approved' });
  } catch (error) {
    console.error('Failed to update review status:', error);
    return NextResponse.json(
      { error: 'Failed to update review' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const removed = await deleteReview(id);
    if (!removed) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Review deleted' });
  } catch (error) {
    console.error('Failed to delete review:', error);
    return NextResponse.json(
      { error: 'Failed to delete review' },
      { status: 500 }
    );
  }
}

