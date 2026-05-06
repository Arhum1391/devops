import { NextRequest, NextResponse } from 'next/server';
import { withNoAuth } from '@/lib/middleware';
import { getDb } from '@/lib/mongodb';
import { validateCalendlyToken, testCalendlyIntegration } from '@/lib/calendly';

async function getTeamMembers(req: NextRequest, userId: string) {
  try {
    const db = await getDb();
    const teamMembers = await db.collection('team').find({}).sort({ teamId: 1 }).toArray();
    const analysts = await db.collection('analysts').find({}).toArray();
    const analystMap = new Map(analysts.map((a: Record<string, unknown>) => [Number(a.analystId) ?? a.analystId, a]));

    return NextResponse.json(teamMembers.map((member: Record<string, unknown>) => {
      const teamId = Number(member.teamId) ?? member.teamId;
      const analyst = analystMap.get(teamId);
      let hasCalendly = false;
      if (analyst?.calendly) {
        const cal = typeof (analyst as Record<string, unknown>).calendly === 'string'
          ? JSON.parse((analyst as Record<string, unknown>).calendly as string)
          : (analyst as Record<string, unknown>).calendly;
        hasCalendly = (cal as Record<string, unknown>)?.enabled === true;
      }
      return {
        _id: member._id ?? member.id,
        id: member.teamId,
        name: member.name,
        role: member.role,
        about: member.about,
        bootcampAbout: member.bootcampAbout,
        calendar: member.calendar,
        image: member.image,
        hasCalendly,
        createdAt: member.createdAt,
        updatedAt: member.updatedAt,
      };
    }));
  } catch (error) {
    console.error('Get team members error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch team members' },
      { status: 500 }
    );
  }
}

async function createTeamMember(req: NextRequest, userId: string) {
  try {
    const body = await req.json();
    const { id, name, role, about, bootcampAbout, calendar, image, calendlyAccessToken } = body;

    if (!id || !name || !role || !about || !calendar) {
      return NextResponse.json(
        { error: 'ID, name, role, about, and calendar link are required' },
        { status: 400 }
      );
    }

    if (name.trim().length < 2) return NextResponse.json({ error: 'Name must be at least 2 characters long' }, { status: 400 });
    if (!/^[a-zA-Z\s\-']+$/.test(name.trim())) return NextResponse.json({ error: 'Name can only contain letters, spaces, hyphens, and apostrophes' }, { status: 400 });
    if (role.trim().length < 2) return NextResponse.json({ error: 'Role must be at least 2 characters long' }, { status: 400 });
    if (about.trim().length < 10) return NextResponse.json({ error: 'About must be at least 10 characters long' }, { status: 400 });
    if (!/^https?:\/\//.test(calendar.trim())) return NextResponse.json({ error: 'Please enter a valid calendar URL' }, { status: 400 });

    const db = await getDb();
    const existingMembers = await db.collection('team').find({}).project({ teamId: 1 }).toArray();
    const maxId = Math.max(...existingMembers.map((m: Record<string, unknown>) => Number(m.teamId) || 0), 0);
    const expectedId = maxId + 1;
    if (Number(id) !== expectedId) {
      return NextResponse.json({ error: `Invalid ID. Expected ${expectedId}, got ${id}` }, { status: 400 });
    }

    const docId = crypto.randomUUID();
    const now = new Date();
    const teamDoc = {
      _id: docId,
      id: docId,
      teamId: Number(id),
      name,
      role,
      about,
      bootcampAbout: bootcampAbout || null,
      calendar,
      image: image || null,
      createdAt: now,
      updatedAt: now,
    };
    await db.collection('team').insertOne(teamDoc);

    if (calendlyAccessToken?.trim()) {
      try {
        const validationResult = await validateCalendlyToken(calendlyAccessToken.trim());
        if (!validationResult.success || !validationResult.userUri) {
          return NextResponse.json({ error: 'Invalid Calendly access token', details: validationResult.error }, { status: 400 });
        }
        await db.collection('analysts').updateOne(
          { analystId: Number(id) },
          { $set: { name, calendly: { enabled: true, userUri: validationResult.userUri, accessToken: calendlyAccessToken.trim() }, updatedAt: now } },
          { upsert: true }
        );
      } catch (e) {
        return NextResponse.json({ error: 'Failed to set up Calendly credentials' }, { status: 500 });
      }
    }

    return NextResponse.json({
      _id: docId,
      id: Number(id),
      name,
      role,
      about,
      bootcampAbout: bootcampAbout || null,
      calendar,
      image: image || null,
      createdAt: now,
      updatedAt: now,
    }, { status: 201 });
  } catch (error) {
    console.error('Create team member error:', error);
    return NextResponse.json({ error: 'Failed to create team member' }, { status: 500 });
  }
}

export const GET = withNoAuth(getTeamMembers);
export const POST = withNoAuth(createTeamMember);
