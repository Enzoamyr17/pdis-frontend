import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getCalendarClient } from '@/lib/google-calendar';

export async function GET() {
  try {
    // Step 1: Check session
    const session = await getServerSession(authOptions);
    console.log('Session check:', {
      hasSession: !!session,
      userId: session?.user?.id,
      userEmail: session?.user?.email
    });


    if (!session?.user?.id) {
      console.log('No session or user ID found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Step 2: Check environment variables
    console.log('Environment check:', {
      hasGoogleClientId: !!process.env.GOOGLE_CLIENT_ID,
      hasGoogleClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
      nodeEnv: process.env.NODE_ENV
    });

    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      console.error('Missing Google OAuth environment variables');
      return NextResponse.json({ 
        error: 'Server configuration error',
        details: 'Missing Google OAuth credentials'
      }, { status: 500 });
    }

    // Step 3: Get calendar client with proper token handling
    console.log('Creating calendar client with token refresh support...');
    const calendar = await getCalendarClient(session.user.id);
    console.log('Calendar client created successfully');
    
    // Step 4: Set up date range
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const sixMonthsFromNow = new Date();
    sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);
    
    console.log('Fetching calendar events for user:', session.user.id);
    console.log('Date range:', sixMonthsAgo.toISOString(), 'to', sixMonthsFromNow.toISOString());
    
    // Step 5: Fetch events from Google Calendar
    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: sixMonthsAgo.toISOString(),
      timeMax: sixMonthsFromNow.toISOString(),
      maxResults: 250,
      singleEvents: true,
      orderBy: 'startTime',
    });


    console.log('Calendar API response:', {
      itemsCount: response.data.items?.length || 0,
      items: response.data.items?.slice(0, 3) // Log first 3 events for debugging
    });

    return NextResponse.json({ 
      events: response.data.items || [],
      debug: {
        count: response.data.items?.length || 0,
        timeRange: `${sixMonthsAgo.toISOString()} to ${sixMonthsFromNow.toISOString()}`,
        userId: session.user.id
      }
    });
  } catch (error) {
    console.error('Calendar API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    // Enhanced error logging
    console.error('Detailed error information:', {
      message: errorMessage,
      stack: errorStack,
      name: error instanceof Error ? error.name : 'Unknown',
      // Check if it's a Google API error
      isGoogleError: error && typeof error === 'object' && 'code' in error,
      googleErrorCode: error && typeof error === 'object' && 'code' in error ? error.code : undefined,
      googleErrorMessage: error && typeof error === 'object' && 'message' in error ? error.message : undefined
    });

    return NextResponse.json({ 
      error: 'Failed to fetch events',
      details: errorMessage,
      type: error instanceof Error ? error.name : 'Unknown',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { title, start, end, description, location, attendees, allDay, timeZone } = await request.json();
    console.log('Received request data:', { title, start, end, description, location, attendees, allDay });
    
    const calendar = await getCalendarClient(session.user.id);

    // Validate and format datetime strings
    let startFormatted, endFormatted;
    
    if (allDay) {
      // For all-day events, use date format (YYYY-MM-DD)
      startFormatted = { date: start.split('T')[0] };
      endFormatted = { date: end.split('T')[0] };
    } else {
      // For timed events, preserve the local time intention from the frontend
      // The frontend sends datetime strings like "2024-01-01T10:00:00" meaning 10:00 in their local timezone
      const eventTimeZone = timeZone || 'Asia/Manila';
      
      // Instead of parsing and converting, use the datetime directly with the intended timezone
      // This prevents timezone shifts from Date constructor + toISOString()
      if (!start.includes('T') || !end.includes('T')) {
        throw new Error('Invalid datetime format - expected ISO format with time');
      }
      
      startFormatted = { 
        dateTime: start,
        timeZone: eventTimeZone
      };
      endFormatted = { 
        dateTime: end,
        timeZone: eventTimeZone
      };
    }

    const event: {
      summary: string;
      description?: string;
      location?: string;
      start: { date?: string; dateTime?: string; timeZone?: string };
      end: { date?: string; dateTime?: string; timeZone?: string };
      attendees?: Array<{ email: string }>;
      conferenceData?: {
        createRequest: {
          requestId: string;
          conferenceSolutionKey: {
            type: string;
          };
        };
      };
    } = {
      summary: title,
      start: startFormatted,
      end: endFormatted,
    };

    // Only add optional fields if they have values
    if (description && description.trim()) {
      event.description = description;
    }
    
    if (location && location.trim()) {
      event.location = location;
    }
    
    if (attendees && attendees.length > 0) {
      event.attendees = attendees.map((email: string) => ({ email }));
    }

    // Only add conference data for non-all-day events with attendees
    if (!allDay && attendees && attendees.length > 0) {
      event.conferenceData = {
        createRequest: {
          requestId: Math.random().toString(36).substring(7),
          conferenceSolutionKey: {
            type: 'hangoutsMeet',
          },
        },
      };
    }

    const insertOptions: {
      calendarId: string;
      requestBody: typeof event;
      conferenceDataVersion?: number;
    } = {
      calendarId: 'primary',
      requestBody: event,
    };

    // Only set conferenceDataVersion if we have conference data
    if (event.conferenceData) {
      insertOptions.conferenceDataVersion = 1;
    }

    console.log('Final event object being sent to Google Calendar:', JSON.stringify(event, null, 2));
    console.log('Insert options:', JSON.stringify(insertOptions, null, 2));

    const response = await calendar.events.insert(insertOptions);

    return NextResponse.json({ event: response.data });
  } catch (error) {
    console.error('Create event error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ 
      error: 'Failed to create event',
      details: errorMessage,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}