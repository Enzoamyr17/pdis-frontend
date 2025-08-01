'use client'

import { useState, useEffect, useRef } from "react"
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import { EventClickArg } from '@fullcalendar/core'
import { DateClickArg } from '@fullcalendar/interaction'

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

interface CalendarProps {
  events?: CalendarEvent[]
  onEventClick?: (info: EventClickArg) => void
  onDateClick?: (info: DateClickArg) => void
  className?: string
}

// Helper function to get UTC+8 date string
const getUTC8DateString = () => {
  const now = new Date();
  const utc8Date = new Date(now.getTime() + (8 * 60 * 60 * 1000));
  return utc8Date.toISOString().split('T')[0];
};

export default function Calendar({ 
  onEventClick,
  onDateClick,
  className = ""
}: CalendarProps) {
  const [isClient, setIsClient] = useState(false)
  const [forceUpdate, setForceUpdate] = useState(0)
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [currentDateKey, setCurrentDateKey] = useState(() => getUTC8DateString())
  const calendarRef = useRef<FullCalendar>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Ensure client-side hydration
  useEffect(() => {
    setIsClient(true)
    fetchTodaysEvents()
  }, [])

  // Check for date changes periodically
  useEffect(() => {
    const checkDateChange = () => {
      const newDateKey = getUTC8DateString()
      if (newDateKey !== currentDateKey) {
        console.log('Date changed from', currentDateKey, 'to', newDateKey)
        setCurrentDateKey(newDateKey)
        setLoading(true)
        fetchTodaysEvents()
        setForceUpdate(prev => prev + 1)
      }
    }

    // Check every minute for date changes
    const interval = setInterval(checkDateChange, 60000)
    
    // Also check immediately
    checkDateChange()

    return () => clearInterval(interval)
  }, [currentDateKey])

  // Handle resize events to force calendar re-render
  useEffect(() => {
    if (!isClient || !containerRef.current) return

    const resizeObserver = new ResizeObserver(() => {
      // Force calendar to update its layout
      if (calendarRef.current?.getApi()) {
        calendarRef.current.getApi().updateSize()
        setForceUpdate(prev => prev + 1)
      }
    })

    resizeObserver.observe(containerRef.current)

    return () => {
      resizeObserver.disconnect()
    }
  }, [isClient])

  const fetchTodaysEvents = async () => {
    try {
      const response = await fetch('/api/calendar/events');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.error) {
        console.error('Calendar API error:', data.error);
        setCalendarEvents([]);
        return;
      }
      
      const todayStr = getUTC8DateString();
      console.log('Mini calendar - Current date (UTC+8):', todayStr);
      
      const todaysEvents = data.events?.filter((event: GoogleCalendarEvent) => {
        const eventDate = event.start?.dateTime || event.start?.date || '';
        const eventDateStr = eventDate.split('T')[0];
        return eventDateStr === todayStr;
      }).map((event: GoogleCalendarEvent) => ({
        id: event.id,
        title: event.summary,
        start: event.start?.dateTime || event.start?.date || '',
        end: event.end?.dateTime || event.end?.date || '',
        allDay: !event.start?.dateTime,
      })) || [];
      
      setCalendarEvents(todaysEvents);
    } catch (error) {
      console.error('Failed to fetch today\'s events:', error);
      setCalendarEvents([]);
    } finally {
      setLoading(false);
    }
  };

  if (!isClient || loading) {
    return (
      <div className={`h-full minimal-calendar ${className}`}>
        <div className="flex items-center justify-center h-full text-zinc-500 text-sm">
          Loading calendar...
        </div>
      </div>
    )
  }

  return (
    <div ref={containerRef} className={`h-full minimal-calendar ${className}`}>
      <FullCalendar
        ref={calendarRef}
        key={`${forceUpdate}-${currentDateKey}`} // Force re-render when size changes or date changes
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridDay"
        headerToolbar={{
          left: '',
          center: 'title',
          right: ''
        }}
        dayHeaderFormat={{ weekday: 'short' }}
        dayHeaders={false}
        height="100%"
        validRange={(() => {
          const dateStr = getUTC8DateString();
          return { start: dateStr, end: dateStr };
        })()}
        moreLinkClick="popover"
        eventDisplay="block"
        showNonCurrentDates={false}
        fixedWeekCount={false}
        events={calendarEvents}
        eventClick={onEventClick || ((info: EventClickArg) => {
          console.log('Event: ' + info.event.title)
        })}
        dateClick={onDateClick || ((info: DateClickArg) => {
          console.log('Clicked on: ' + info.dateStr)
        })}
      />
      <style jsx global>{`
        .minimal-calendar .fc {
          font-size: 11px;
        }
        
        .minimal-calendar .fc-header-toolbar {
          margin-bottom: 4px;
        }
        
        .minimal-calendar .fc-toolbar-title {
          font-size: 14px !important;
          font-weight: 600 !important;
          color: var(--color-blue) !important;
        }
        
        .minimal-calendar .fc-button {
          background: transparent !important;
          border: 1px solid #e4e4e7 !important;
          color: var(--color-blue) !important;
          font-size: 11px !important;
          padding: 2px 8px !important;
          height: 24px !important;
          border-radius: 6px !important;
          box-shadow: none !important;
        }
        
        .minimal-calendar .fc-button:hover {
          background: #f1f5f9 !important;
          border-color: var(--color-blue) !important;
        }
        
        .minimal-calendar .fc-button:focus,
        .minimal-calendar .fc-button:active {
          box-shadow: none !important;
          background: #e2e8f0 !important;
        }
        
        .minimal-calendar .fc-daygrid-day-frame {
          min-height: 20px;
          padding: 2px !important;
        }
        
        .minimal-calendar .fc-daygrid-body {
          border: none;
        }
        
        .minimal-calendar .fc-scrollgrid {
          border: none;
        }
        
        .minimal-calendar .fc-daygrid-day-top {
          padding: 2px 4px !important;
        }
        
        .minimal-calendar .fc-col-header-cell {
          display: none !important;
        }
        
        .minimal-calendar .fc-daygrid-day {
          border-color: #f4f4f5;
        }
        
        .minimal-calendar .fc-daygrid-day-number {
          color: #52525b;
          font-size: 11px;
          padding: 2px 4px;
        }
        
        .minimal-calendar .fc-daygrid-day.fc-day-today {
          background: color-mix(in srgb, var(--color-blue) 5%, transparent) !important;
        }
        
        .minimal-calendar .fc-daygrid-day.fc-day-today .fc-daygrid-day-number {
          color: var(--color-blue) !important;
          font-weight: 600 !important;
        }
        
        .minimal-calendar .fc-event {
          border-radius: 3px;
          font-size: 16px;
          font-weight: 500;
          padding: 2px 4px;
          margin: 0px 1px 1px 1px;
          border-width: 0;
        }
        
        .minimal-calendar .fc-daygrid-event-harness {
          margin-top: 0px;
        }
        
        .minimal-calendar .fc-more-link {
          font-size: 9px;
          color: #6b7280;
          margin: 1px 2px;
        }
      `}</style>
    </div>
  )
} 