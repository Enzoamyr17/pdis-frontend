import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getCalendarClient } from '@/lib/google-calendar';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ eventId: string }> }
) {
  const params = await context.params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { status } = await request.json();
    const calendar = await getCalendarClient(session.user.id);
    
    // First, get the current event
    const eventResponse = await calendar.events.get({
      calendarId: 'primary',
      eventId: params.eventId,
    });

    const event = eventResponse.data;
    if (!event.attendees) {
      return NextResponse.json({ error: 'No attendees found for this event' }, { status: 400 });
    }

    // Update the attendee's response status
    const updatedAttendees = event.attendees.map((attendee) => {
      if (attendee.email === session.user.email) {
        return { ...attendee, responseStatus: status };
      }
      return attendee;
    });

    // Update the event with new attendee status
    const updateResponse = await calendar.events.update({
      calendarId: 'primary',
      eventId: params.eventId,
      requestBody: {
        ...event,
        attendees: updatedAttendees,
      },
    });

    return NextResponse.json({ 
      message: 'RSVP updated successfully',
      event: updateResponse.data 
    });
  } catch (error) {
    console.error('RSVP update error:', error);
    return NextResponse.json({ error: 'Failed to update RSVP' }, { status: 500 });
  }
}