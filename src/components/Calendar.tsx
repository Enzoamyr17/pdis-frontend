'use client'

import { useState, useEffect, useRef } from "react"
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import { EventClickArg } from '@fullcalendar/core'
import { DateClickArg } from '@fullcalendar/interaction'

interface CalendarEvent {
  title: string
  date?: string // Make optional
  backgroundColor?: string
  borderColor?: string
  textColor?: string
  start?: string // For multi-day events
  end?: string // For multi-day events
}

interface CalendarProps {
  events?: CalendarEvent[]
  onEventClick?: (info: EventClickArg) => void
  onDateClick?: (info: DateClickArg) => void
  className?: string
}

export default function Calendar({ 
  events = [],
  onEventClick,
  onDateClick,
  className = ""
}: CalendarProps) {
  const [isClient, setIsClient] = useState(false)
  const [forceUpdate, setForceUpdate] = useState(0)
  const calendarRef = useRef<FullCalendar>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Ensure client-side hydration
  useEffect(() => {
    setIsClient(true)
  }, [])

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

  const today = new Date();
  const addDays = (days: number) => {
    const d = new Date(today);
    d.setDate(today.getDate() + days);
    return d.toISOString();
  };

  const defaultEvents: CalendarEvent[] = [
    // Multiple events on the same day (today)
    {
      title: 'Morning Standup',
      date: addDays(0),
      backgroundColor: '#1B2E6E',
      borderColor: '#3b82f6',
      textColor: 'white'
    },
    {
      title: 'Design Review',
      date: addDays(0),
      backgroundColor: '#1B2E6E',
      borderColor: '#f59e42',
      textColor: 'white'
    },
    {
      title: 'Client Call',
      date: addDays(0),
      backgroundColor: '#1B2E6E',
      borderColor: '#f43f5e',
      textColor: 'white'
    },
    // 2-day event
    {
      title: 'Sprint Planning',
      start: addDays(1),
      end: addDays(3), // end is exclusive, so this covers 2 days
      backgroundColor: '#1B2E6E',
      borderColor: '#10b981',
      textColor: 'white'
    },
    // Long event (4 days)
    {
      title: 'Hackathon',
      start: addDays(4),
      end: addDays(8), // 4 days
      backgroundColor: '#1B2E6E',
      borderColor: '#6366f1',
      textColor: 'white'
    },
    // Other single-day events
    {
      title: 'Team Lunch',
      date: addDays(2),
      backgroundColor: '#1B2E6E',
      borderColor: '#eab308',
      textColor: 'white'
    },
    {
      title: 'Demo Day',
      date: addDays(3),
      backgroundColor: '#1B2E6E',
      borderColor: '#0ea5e9',
      textColor: 'white'
    },
    {
      title: '1:1 with Manager',
      date: addDays(5),
      backgroundColor: '#1B2E6E',
      borderColor: '#14b8a6',
      textColor: 'white'
    },
    {
      title: 'Retrospective',
      date: addDays(7),
      backgroundColor: '#1B2E6E',
      borderColor: '#a21caf',
      textColor: 'white'
    },
    {
      title: 'Sprint Start',
      date: addDays(9),
      backgroundColor: '#1B2E6E',
      borderColor: '#f97316',
      textColor: 'white'
    }
  ];

  const calendarEvents = events.length > 0 ? events : defaultEvents

  if (!isClient) {
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
        key={forceUpdate} // Force re-render when size changes
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
        validRange={{ start: today.toISOString().split('T')[0], end: today.toISOString().split('T')[0] }}
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
          font-weight: 600;
          color: #3b82f6;
        }
        
        .minimal-calendar .fc-button {
          background: transparent !important;
          border: 1px solid #e4e4e7 !important;
          color: #3b82f6 !important;
          font-size: 11px !important;
          padding: 2px 8px !important;
          height: 24px !important;
          border-radius: 6px !important;
          box-shadow: none !important;
        }
        
        .minimal-calendar .fc-button:hover {
          background: #f1f5f9 !important;
          border-color: #3b82f6 !important;
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
          background: rgba(59, 130, 246, 0.05);
        }
        
        .minimal-calendar .fc-daygrid-day.fc-day-today .fc-daygrid-day-number {
          color: #3b82f6;
          font-weight: 600;
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