import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getCalendarClient } from '@/lib/google-calendar';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ eventId: string }> }
) {
  const params = await context.params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const calendar = await getCalendarClient(session.user.id);
    
    const response = await calendar.events.get({
      calendarId: 'primary',
      eventId: params.eventId,
    });

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Get event error:', error);
    return NextResponse.json({ error: 'Failed to fetch event' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ eventId: string }> }
) {
  const params = await context.params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { title, start, end, description, location, attendees, allDay, timeZone } = await request.json();
    const calendar = await getCalendarClient(session.user.id);

    const event: {
      summary: string;
      description?: string;
      location?: string;
      start: { date?: string; dateTime?: string; timeZone: string };
      end: { date?: string; dateTime?: string; timeZone: string };
      attendees?: Array<{ email: string }>;
    } = {
      summary: title,
      description: description,
      location: location,
      start: allDay ? {
        date: start.split('T')[0],
        timeZone: timeZone || 'Asia/Manila',
      } : {
        dateTime: start,
        timeZone: timeZone || 'Asia/Manila',
      },
      end: allDay ? {
        date: end.split('T')[0],
        timeZone: timeZone || 'Asia/Manila',
      } : {
        dateTime: end,
        timeZone: timeZone || 'Asia/Manila',
      },
      attendees: attendees?.map((email: string) => ({ email })),
    };

    const response = await calendar.events.update({
      calendarId: 'primary',
      eventId: params.eventId,
      requestBody: event,
    });

    return NextResponse.json({ event: response.data });
  } catch (error) {
    console.error('Update event error:', error);
    return NextResponse.json({ error: 'Failed to update event' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ eventId: string }> }
) {
  const params = await context.params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const calendar = await getCalendarClient(session.user.id);
    
    await calendar.events.delete({
      calendarId: 'primary',
      eventId: params.eventId,
    });

    return NextResponse.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Delete event error:', error);
    return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 });
  }
}