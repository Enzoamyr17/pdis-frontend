import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getCalendarClient } from '@/lib/google-calendar';

export async function PUT(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
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
  { params }: { params: { eventId: string } }
) {
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