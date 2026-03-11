import { NextRequest, NextResponse } from 'next/server';
import { withNoAuth } from '@/lib/middleware';
import { getDb } from '@/lib/mongodb';

async function handler(req: NextRequest, userId: string) {
  try {
    const db = await getDb();
    let teamMembersCount = 0;
    let subscribersCount = 0;
    let bookingsTodayCount = 0;
    let activeBootcampsCount = 0;

    try {
      teamMembersCount = await db.collection('team').countDocuments();
    } catch (error) {
      console.error('Error counting team members:', error);
    }

    try {
      subscribersCount = await db.collection('subscribers').countDocuments({ isActive: true });
    } catch (error) {
      console.warn('Subscribers error:', error);
    }

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      bookingsTodayCount = await db.collection('bookings').countDocuments({
        date: { $gte: today, $lt: tomorrow },
      });
    } catch (error) {
      console.warn('Bookings error:', error);
    }

    try {
      activeBootcampsCount = await db.collection('bootcamps').countDocuments({ isActive: true });
    } catch (error) {
      console.warn('Bootcamps error:', error);
    }

    const stats = {
      teamMembers: teamMembersCount,
      subscribers: subscribersCount,
      bookingsToday: bookingsTodayCount,
      activeBootcamps: activeBootcampsCount,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}

export const GET = withNoAuth(handler);
