import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { validateCalendlyToken, testCalendlyIntegration } from '@/lib/calendly';

async function updateTeamMember(req: NextRequest, userId: string, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await req.json();
    const { name, role, about, bootcampAbout, calendar, image, calendlyAccessToken } = body;

    const db = await getDb();
    const existingTeamMember = await db.collection('team').findOne({ $or: [{ _id: id }, { id }] }) as Record<string, unknown> | null;
    if (!existingTeamMember) {
      return NextResponse.json({ error: 'Team member not found' }, { status: 404 });
    }

    const teamId = existingTeamMember.teamId ?? existingTeamMember.team_id;
    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (name !== undefined) updateData.name = name;
    if (role !== undefined) updateData.role = role;
    if (about !== undefined) updateData.about = about;
    if (bootcampAbout !== undefined) updateData.bootcampAbout = bootcampAbout;
    if (calendar !== undefined) updateData.calendar = calendar;
    if (image !== undefined) updateData.image = image;

    await db.collection('team').updateOne(
      { $or: [{ _id: id }, { id }] },
      { $set: updateData }
    );

    if (calendlyAccessToken !== undefined) {
      if (calendlyAccessToken?.trim()) {
        try {
          const validationResult = await validateCalendlyToken(calendlyAccessToken.trim());
          if (!validationResult.success || !validationResult.userUri) {
            return NextResponse.json({ error: 'Invalid Calendly access token' }, { status: 400 });
          }
          await db.collection('analysts').updateOne(
            { analystId: teamId },
            { $set: { name: name ?? existingTeamMember.name, calendly: { enabled: true, userUri: validationResult.userUri, accessToken: calendlyAccessToken.trim() }, updatedAt: new Date() } },
            { upsert: true }
          );
        } catch (e) {
          return NextResponse.json({ error: 'Failed to update Calendly credentials' }, { status: 500 });
        }
      } else {
        await db.collection('analysts').updateOne(
          { analystId: teamId },
          { $set: { calendly: { enabled: false, userUri: null, accessToken: null }, updatedAt: new Date() } }
        );
      }
    }

    return NextResponse.json({ message: 'Team member updated successfully' });
  } catch (error) {
    console.error('Update team member error:', error);
    return NextResponse.json({ error: 'Failed to update team member' }, { status: 500 });
  }
}

async function deleteTeamMember(req: NextRequest, userId: string, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const db = await getDb();
    const teamMember = await db.collection('team').findOne({ $or: [{ _id: id }, { id }] }) as Record<string, unknown> | null;
    if (!teamMember) {
      return NextResponse.json({ error: 'Team member not found' }, { status: 404 });
    }

    const teamId = teamMember.teamId;
    await db.collection('analysts').deleteOne({ analystId: teamId });
    await db.collection('team').deleteOne({ $or: [{ _id: id }, { id }] });

    return NextResponse.json({ message: 'Team member deleted successfully' });
  } catch (error) {
    console.error('Delete team member error:', error);
    return NextResponse.json({ error: 'Failed to delete team member' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return updateTeamMember(req, '', { params: resolvedParams });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return deleteTeamMember(req, '', { params: resolvedParams });
}
