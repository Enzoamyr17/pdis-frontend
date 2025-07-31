'use client';

import { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { DateSelectArg, EventClickArg } from '@fullcalendar/core';

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  allDay?: boolean;
}

// Google Calendar API response types
interface GoogleCalendarDateTime {
  dateTime?: string;
  date?: string;
  timeZone?: string;
}

interface GoogleCalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: GoogleCalendarDateTime;
  end: GoogleCalendarDateTime;
  status?: string;
  location?: string;
}

export default function BigCalendar() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      console.log('Fetching calendar events...');
      const response = await fetch('/api/calendar/events');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Calendar API response:', data);
      
      if (data.error) {
        throw new Error(data.error + (data.details ? `: ${data.details}` : ''));
      }
      
      const formattedEvents = data.events?.map((event: GoogleCalendarEvent) => ({
        id: event.id,
        title: event.summary,
        start: event.start?.dateTime || event.start?.date || '',
        end: event.end?.dateTime || event.end?.date || '',
        allDay: !event.start?.dateTime,
      })) || [];
      
      console.log('Formatted events:', formattedEvents);
      setEvents(formattedEvents);
    } catch (error) {
      console.error('Failed to fetch events:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      // Show user-friendly error message
      alert(`Failed to load calendar events: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDateSelect = async (selectInfo: DateSelectArg) => {
    const title = prompt('Event Title:');
    if (!title) return;

    const eventData = {
      title,
      start: selectInfo.startStr,
      end: selectInfo.endStr,
      allDay: selectInfo.allDay,
    };

    try {
      const response = await fetch('/api/calendar/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData),
      });

      if (response.ok) {
        fetchEvents(); // Refresh events
      }
    } catch (error) {
      console.error('Failed to create event:', error);
    }
  };

  const handleEventClick = async (clickInfo: EventClickArg) => {
    const action = prompt(`What would you like to do with '${clickInfo.event.title}'?\nType 'edit' to edit or 'delete' to delete:`);
    
    if (action === 'delete') {
      if (confirm(`Delete event '${clickInfo.event.title}'?`)) {
        try {
          await fetch(`/api/calendar/events/${clickInfo.event.id}`, {
            method: 'DELETE',
          });
          
          clickInfo.event.remove();
        } catch (error) {
          console.error('Failed to delete event:', error);
        }
      }
    } else if (action === 'edit') {
      const newTitle = prompt('New event title:', clickInfo.event.title);
      const newDescription = prompt('Event description:');
      
      if (newTitle) {
        try {
          const eventData = {
            title: newTitle,
            description: newDescription,
            start: clickInfo.event.startStr,
            end: clickInfo.event.endStr,
          };

          const response = await fetch(`/api/calendar/events/${clickInfo.event.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(eventData),
          });

          if (response.ok) {
            fetchEvents(); // Refresh events
          }
        } catch (error) {
          console.error('Failed to update event:', error);
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue mx-auto mb-2"></div>
          <div className="text-blue/70">Loading calendar events...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Debug info - remove this once calendar is working */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mb-4 p-3 bg-blue/10 border border-blue/20 rounded">
          <div className="text-sm font-medium text-blue mb-2">🔍 Debug Information</div>
          <div className="text-xs text-blue/80 space-y-1">
            <div><strong>Events found:</strong> {events.length}</div>
            {events.length === 0 && (
              <div className="mt-2 p-2 bg-yellow/10 border border-yellow/30 rounded text-yellow-800">
                <div className="font-medium">⚠️ No events loaded</div>
                <div className="mt-1">Check the browser console and server logs for detailed error information.</div>
                <div className="mt-1">Common issues:</div>
                <ul className="ml-4 list-disc text-xs">
                  <li>Google authentication expired - try logging out and back in</li>
                  <li>Missing calendar permissions in Google account</li>
                  <li>Server configuration issues</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
      
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay'
        }}
        initialView="dayGridMonth"
        editable={true}
        selectable={true}
        selectMirror={true}
        dayMaxEvents={true}
        weekends={true}
        events={events}
        select={handleDateSelect}
        eventClick={handleEventClick}
        height="auto"
      />
    </div>
  );
}