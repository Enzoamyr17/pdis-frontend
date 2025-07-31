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
    const { title, start, end, description, attendees } = await request.json();
    const calendar = await getCalendarClient(session.user.id);

    const event = {
      summary: title,
      description: description,
      start: {
        dateTime: start,
        timeZone: 'UTC',
      },
      end: {
        dateTime: end,
        timeZone: 'UTC',
      },
      attendees: attendees?.map((email: string) => ({ email })),
      conferenceData: {
        createRequest: {
          requestId: Math.random().toString(36).substring(7),
          conferenceSolutionKey: {
            type: 'hangoutsMeet',
          },
        },
      },
    };

    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
      conferenceDataVersion: 1,
    });

    return NextResponse.json({ event: response.data });
  } catch (error) {
    console.error('Create event error:', error);
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
}