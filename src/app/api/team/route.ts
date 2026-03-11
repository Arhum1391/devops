import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { resolveTeamMemberImage } from '@/lib/teamImages';

export const dynamic = 'force-dynamic';

interface Analyst {
  id: number;
  name: string;
  description: string;
  image: string;
  about: string;
}

export async function GET() {
  try {
    const db = await getDb();
    const teamMembers = await db.collection('team').find({}).sort({ teamId: 1 }).toArray();

    const analysts: Analyst[] = teamMembers.map((member: Record<string, unknown>) => {
      const name = String(member.name ?? '');
      const imageUrl = resolveTeamMemberImage(member.image as string | null | undefined, name);
      return {
        id: Number(member.teamId ?? member._id ?? 0),
        name,
        description: String(member.role ?? 'Role unavailable'),
        image: imageUrl,
        about: String(member.about ?? 'About info unavailable'),
      };
    });

    const response = NextResponse.json({
      team: analysts,
      rawTeam: teamMembers,
    });
    response.headers.set(
      'Cache-Control',
      'public, max-age=0, s-maxage=60, stale-while-revalidate=300'
    );
    return response;
  } catch (error: any) {
    console.error('❌ Team API: Database connection or query error:', error);
    console.error('❌ Team API: Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 },
    );
  }
}
