import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

/**
 * GET /api/calendly/event-types
 * Fetches all event types for a specific Calendly user
 * Query params: analystId (required)
 */
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

    // Fetch analyst's Calendly credentials directly from database
    const analystIdNum = parseInt(analystId);
    if (isNaN(analystIdNum)) {
      return NextResponse.json(
        { error: `Invalid analyst ID: ${analystId}` },
        { status: 400 }
      );
    }

    const db = await getDb();
    const analyst = await db.collection('analysts').findOne({ $or: [{ analystId: analystIdNum }, { analystId: analystId }] });

    if (!analyst) {
      return NextResponse.json(
        { error: `Analyst with ID ${analystId} not found` },
        { status: 404 }
      );
    }

    let calendly: Record<string, unknown> | null = null;
    const cal = (analyst as Record<string, unknown>).calendly;
    if (cal) {
      calendly = typeof cal === 'string' ? JSON.parse(cal) : (cal as Record<string, unknown>);
    }

    if (!calendly || !calendly.enabled) {
      return NextResponse.json(
        { error: `Calendly integration is not enabled for analyst ${analystId}` },
        { status: 400 }
      );
    }

    if (!calendly.userUri || !calendly.accessToken) {
      return NextResponse.json(
        { error: `Incomplete Calendly credentials for analyst ${analystId}` },
        { status: 400 }
      );
    }

    const { userUri, accessToken } = calendly;

    // Debug logging
    console.log('=== CALENDLY EVENT TYPES API DEBUG ===');
    console.log('1. Request parameters:');
    console.log('   - analystId:', analystId);
    console.log('   - analyst name:', analyst.name);
    console.log('2. Credentials check:');
    console.log('   - userUri exists:', !!userUri);
    console.log('   - accessToken exists:', !!accessToken);
    console.log('   - userUri value:', userUri);
    console.log('=====================================');

    // Fetch event types from Calendly API
        // First, get the current user's info to ensure we're using the right user URI
        const userResponse = await fetch('https://api.calendly.com/users/me', {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        });

        if (!userResponse.ok) {
            const errorData = await userResponse.json().catch(() => ({}));
            console.error('Failed to get current user info:', errorData);
            return NextResponse.json(
                { error: 'Failed to get current user info', details: errorData },
                { status: userResponse.status }
            );
        }

        const userData = await userResponse.json();
        const currentUserUri = userData.resource.uri;
        
        console.log('Current user URI from token:', currentUserUri);
        console.log('Requested user URI:', userUri);
        
        // Use the current user's URI if it matches, otherwise use the requested URI
        const targetUserUri = currentUserUri === userUri ? currentUserUri : userUri;

        const response = await fetch(
            `https://api.calendly.com/event_types?user=${encodeURIComponent(targetUserUri)}&active=true`,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            }
        );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Calendly API error:', errorData);
      return NextResponse.json(
        { error: 'Failed to fetch event types from Calendly', details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Transform the data to a simpler format
    const allEventTypes = data.collection?.map((eventType: any) => ({
      id: eventType.uri,
      slug: eventType.slug,
      name: eventType.name,
      duration: eventType.duration,
      description: eventType.description_plain || eventType.description_html || '',
      active: eventType.active,
      booking_url: eventType.scheduling_url,
      color: eventType.color || '#000000',
    })) || [];

    // Filter event types to only include those that belong to the current user
    // We can identify this by checking if the booking_url contains the user's scheduling URL
    const userSchedulingUrl = userData.resource.scheduling_url;
    console.log('User scheduling URL:', userSchedulingUrl);
    
    const eventTypes = allEventTypes.filter((eventType: any) => {
      // Check if the booking URL belongs to the current user
      const belongsToUser = eventType.booking_url && eventType.booking_url.includes(userSchedulingUrl);
      console.log(`Event "${eventType.name}": ${eventType.booking_url} -> belongs to user: ${belongsToUser}`);
      return belongsToUser;
    });
    
    console.log(`✅ Filtered event types: ${allEventTypes.length} -> ${eventTypes.length}`);

    return NextResponse.json({
      success: true,
      eventTypes,
      count: eventTypes.length,
      analystId: parseInt(analystId),
      userUri: targetUserUri,
      userSchedulingUrl: userSchedulingUrl,
      originalCount: allEventTypes.length
    });
  } catch (error) {
    console.error('Error fetching Calendly event types:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

