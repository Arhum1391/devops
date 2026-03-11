import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

/**
 * GET /api/calendly/availability
 * Fetches available time slots for a specific event type
 * Query params: 
 *   - eventTypeUri: URI of the event type
 *   - startDate: Start date in YYYY-MM-DD format
 *   - endDate: End date in YYYY-MM-DD format (optional, defaults to startDate)
 *   - timezone: User's timezone (optional, defaults to UTC)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventTypeUri = searchParams.get('eventTypeUri');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate') || startDate;
    const userTimezone = searchParams.get('timezone') || 'UTC';
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

    if (!calendly.accessToken) {
      return NextResponse.json(
        { error: `Incomplete Calendly credentials for analyst ${analystId}` },
        { status: 400 }
      );
    }

    const { accessToken } = calendly;

    if (!eventTypeUri || !startDate) {
      return NextResponse.json(
        { error: 'Event type URI and start date are required' },
        { status: 400 }
      );
    }

    // Format dates for Calendly API (ISO 8601 format)
    const startTime = `${startDate}T00:00:00Z`;
    const endTime = `${endDate}T23:59:59Z`;

    // Fetch available time slots from Calendly API
    const url = new URL('https://api.calendly.com/event_type_available_times');
    url.searchParams.append('event_type', eventTypeUri);
    url.searchParams.append('start_time', startTime);
    url.searchParams.append('end_time', endTime);

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Calendly API error:', {
        status: response.status,
        statusText: response.statusText,
        url: url.toString(),
        errorData,
        requestParams: {
          eventTypeUri,
          startTime,
          endTime,
          analystId
        }
      });
      return NextResponse.json(
        { error: 'Failed to fetch availability from Calendly', details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();

    console.log('Calendly API Response:', {
      collectionLength: data.collection?.length || 0,
      firstSlot: data.collection?.[0]
    });

    // Transform the data to group by date
    const availabilityByDate: Record<string, string[]> = {};
    const slotUrlsByDateTime: Record<string, string> = {};
    const rawSlotsByDateTime: Record<string, string> = {}; // Store raw ISO timestamps
    
    if (data.collection && Array.isArray(data.collection)) {
      data.collection.forEach((slot: any) => {
        // Parse the UTC time from Calendly
        const utcDate = new Date(slot.start_time);
        
        // Convert UTC time to user's timezone
        const localDate = new Date(utcDate.toLocaleString("en-US", {timeZone: userTimezone}));
        
        // Get date in YYYY-MM-DD format (use user's local date)
        const year = localDate.getFullYear();
        const month = String(localDate.getMonth() + 1).padStart(2, '0');
        const day = String(localDate.getDate()).padStart(2, '0');
        const date = `${year}-${month}-${day}`;
        
        // Format time in user's timezone
        const hours = localDate.getHours();
        const minutes = localDate.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours % 12 || 12;
        const displayMinutes = String(minutes).padStart(2, '0');
        const time = `${displayHours}:${displayMinutes} ${ampm}`;

        if (!availabilityByDate[date]) {
          availabilityByDate[date] = [];
        }
        availabilityByDate[date].push(time);
        
        // Store the scheduling URL and raw timestamp for this specific date/time combination
        const dateTimeKey = `${date}|${time}`;
        slotUrlsByDateTime[dateTimeKey] = slot.scheduling_url;
        rawSlotsByDateTime[dateTimeKey] = slot.start_time; // Store ISO timestamp
        
        // Debug logging for first few slots
        if (Object.keys(slotUrlsByDateTime).length <= 5) {
          console.log('API slot processing:', {
            rawTimestamp: slot.start_time,
            userTimezone: userTimezone,
            utcDate: utcDate.toISOString(),
            localDate: localDate.toISOString(),
            displayDate: date,
            utcHours: utcDate.getUTCHours(),
            localHours: hours,
            formattedTime: time,
            dateTimeKey: dateTimeKey,
            schedulingUrl: slot.scheduling_url
          });
        }
      });
    }

    // Get available dates (dates with at least one slot)
    const availableDates = Object.keys(availabilityByDate).sort();

    console.log('Transformed availability:', {
      availableDatesCount: availableDates.length,
      availableDates,
      sampleDate: availableDates[0],
      sampleTimes: availableDates[0] ? availabilityByDate[availableDates[0]] : [],
      sampleSlotUrls: availableDates[0] ? Object.keys(slotUrlsByDateTime).filter(key => key.startsWith(availableDates[0])).slice(0, 3) : [],
      sampleRawTimestamps: availableDates[0] ? Object.keys(rawSlotsByDateTime).filter(key => key.startsWith(availableDates[0])).slice(0, 3) : []
    });

    return NextResponse.json({
      success: true,
      availableDates,
      availabilityByDate,
      slotUrls: slotUrlsByDateTime,
      rawTimestamps: rawSlotsByDateTime,
      totalSlots: data.collection?.length || 0,
    });
  } catch (error) {
    console.error('Error fetching Calendly availability:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

