import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    let record = await db.collection('bookings').findOne({ stripeSessionId: sessionId });
    let recordType = 'booking';

    if (!record) {
      const bootcampRecord = await db.collection('bootcamp_registrations').findOne({ stripeSessionId: sessionId });
      if (bootcampRecord) {
        record = bootcampRecord as Record<string, unknown>;
        recordType = 'bootcamp';
      }
    }

    if (!record) {
      return NextResponse.json(
        { error: 'Payment session not found' },
        { status: 404 }
      );
    }

    const r = record as Record<string, unknown>;
    const now = new Date();
    const expiresAt = r.expiresAt as Date | null | undefined;
    const expired = expiresAt && now > new Date(expiresAt);

    if (expired && (r.status === 'pending' || r.status === 'PENDING')) {
      if (recordType === 'booking') {
        await db.collection('bookings').updateOne(
          { $or: [{ _id: r._id }, { id: r.id }] },
          { $set: { status: 'cancelled' } }
        );
        r.status = 'cancelled';
      } else {
        await db.collection('bootcamp_registrations').updateOne(
          { $or: [{ _id: r._id }, { id: r.id }] },
          { $set: { status: 'cancelled' } }
        );
        r.status = 'cancelled';
      }
    }

    const response: Record<string, unknown> = {
      success: true,
      sessionId: r.stripeSessionId || r.id,
      type: recordType,
      status: r.status,
      paymentStatus: r.status,
      createdAt: r.createdAt,
      expiresAt: r.expiresAt,
      expired: expired || false
    };

    if (recordType === 'booking') {
      response.customerEmail = r.clientEmail;
      response.customerName = r.clientName;
      response.service = r.service;
      response.date = r.date;
      response.time = r.time;
      response.updatedAt = r.updatedAt;
    } else {
      response.customerEmail = r.customerEmail;
      response.customerName = r.customerName;
      response.bootcampId = r.bootcampId;
      response.notes = r.notes;
      response.updatedAt = r.updatedAt;
    }

    const statusLower = String(r.status ?? '').toLowerCase();
    if (statusLower === 'paid' || statusLower === 'confirmed' || statusLower === 'completed') {
      response.paymentDetails = { note: 'Payment details not stored in database. Query Stripe API for full details.' };
    }
    if (statusLower === 'pending' && !expired) {
      response.checkoutUrl = `https://checkout.stripe.com/pay/${sessionId}`;
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Payment status error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    let record = await db.collection('bookings').findOne({ stripeSessionId: sessionId });
    let recordType = 'booking';

    if (!record) {
      const bootcampRecord = await db.collection('bootcamp_registrations').findOne({ stripeSessionId: sessionId });
      if (bootcampRecord) {
        record = bootcampRecord as Record<string, unknown>;
        recordType = 'bootcamp';
      }
    }

    if (!record) {
      return NextResponse.json(
        { error: 'Payment session not found' },
        { status: 404 }
      );
    }

    const r = record as Record<string, unknown>;
    return NextResponse.json({
      success: true,
      message: 'Status refreshed',
      sessionId: r.stripeSessionId || r.id,
      type: recordType,
      status: r.status,
      paymentStatus: r.status,
      lastUpdated: r.updatedAt
    });
  } catch (error) {
    console.error('Payment status refresh error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
