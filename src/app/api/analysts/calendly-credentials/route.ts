import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const analystId = searchParams.get('analystId');

    if (!analystId) {
      return NextResponse.json(
        { error: 'Analyst ID is required' },
        { status: 400 }
      );
    }

    const analystIdNum = parseInt(analystId);
    if (isNaN(analystIdNum)) {
      return NextResponse.json(
        { error: `Invalid analyst ID: ${analystId}` },
        { status: 400 }
      );
    }

    const db = await getDb();
    const teamMember = await db.collection('team').findOne({ teamId: analystIdNum }) ?? await db.collection('team').findOne({ teamId: String(analystIdNum) });

    if (!teamMember) {
      return NextResponse.json(
        { error: `Analyst with ID ${analystId} not found` },
        { status: 404 }
      );
    }

    const tm = teamMember as Record<string, unknown>;
    const analyst = await db.collection('analysts').findOne({ analystId: analystIdNum }) ?? await db.collection('analysts').findOne({ analystId: String(analystIdNum) });

    if (!analyst) {
      return NextResponse.json({
        success: false,
        analyst: {
          analystId: tm.teamId ?? analystIdNum,
          name: tm.name,
          calendly: { enabled: false }
        },
        credentials: null,
        message: `Analyst ${tm.name} (ID ${analystIdNum}) does not have Calendly configured`
      });
    }

    const a = analyst as Record<string, unknown>;
    let calendly: Record<string, unknown> | null = null;
    const cal = a.calendly;
    if (cal) {
      calendly = typeof cal === 'string' ? JSON.parse(cal) : (cal as Record<string, unknown>);
    }

    if (!calendly || !calendly.enabled) {
      return NextResponse.json({
        success: false,
        analyst: {
          analystId: a.analystId ?? analystIdNum,
          name: a.name,
          calendly: { enabled: false }
        },
        credentials: null,
        message: calendly ? `Calendly integration is not enabled for analyst ${analystId}` : `No Calendly configuration found for analyst ${analystId}`
      });
    }

    if (!calendly.userUri || !calendly.accessToken) {
      return NextResponse.json({
        success: false,
        analyst: {
          analystId: a.analystId,
          name: a.name,
          calendly: { enabled: true, hasUserUri: !!calendly.userUri, hasAccessToken: !!calendly.accessToken }
        },
        credentials: null,
        message: `Incomplete Calendly credentials for analyst ${analystId}`
      });
    }

    return NextResponse.json({
      success: true,
      analyst: {
        analystId: a.analystId,
        name: a.name,
        calendly: { enabled: calendly.enabled, userUri: calendly.userUri }
      },
      credentials: {
        userUri: calendly.userUri,
        accessToken: calendly.accessToken
      }
    });
  } catch (error) {
    console.error('Error fetching analyst Calendly credentials:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { analystId, userUri, accessToken, enabled = true } = body;

    if (!analystId) {
      return NextResponse.json(
        { error: 'Analyst ID is required' },
        { status: 400 }
      );
    }

    if (enabled && (!userUri || !accessToken)) {
      return NextResponse.json(
        { error: 'User URI and access token are required when enabling Calendly' },
        { status: 400 }
      );
    }

    const calendlyData = enabled
      ? { enabled: true, userUri, accessToken }
      : { enabled: false, userUri: null, accessToken: null };

    const db = await getDb();
    const analystIdNum = parseInt(analystId);
    const result = await db.collection('analysts').updateOne(
      { $or: [{ analystId: analystIdNum }, { analystId: String(analystIdNum) }] },
      { $set: { calendly: calendlyData, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: `Analyst with ID ${analystId} not found` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Calendly credentials updated for analyst ${analystId}`,
      updated: true,
    });
  } catch (error) {
    console.error('Error updating analyst Calendly credentials:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
