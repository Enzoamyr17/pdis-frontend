'use client'

import { useState, useEffect } from "react"
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import { EventClickArg, DateSelectArg, EventChangeArg } from '@fullcalendar/core'

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
  onDateClick?: (info: any) => void
  className?: string
}

export default function Calendar({ 
  events = [],
  onEventClick,
  onDateClick,
  className = ""
}: CalendarProps) {
  const [isClient, setIsClient] = useState(false)

  // Ensure client-side hydration
  useEffect(() => {
    setIsClient(true)
  }, [])

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
      backgroundColor: '#3b82f6',
      borderColor: '#3b82f6',
      textColor: 'white'
    },
    {
      title: 'Design Review',
      date: addDays(0),
      backgroundColor: '#f59e42',
      borderColor: '#f59e42',
      textColor: 'white'
    },
    {
      title: 'Client Call',
      date: addDays(0),
      backgroundColor: '#f43f5e',
      borderColor: '#f43f5e',
      textColor: 'white'
    },
    // 2-day event
    {
      title: 'Sprint Planning',
      start: addDays(1),
      end: addDays(3), // end is exclusive, so this covers 2 days
      backgroundColor: '#10b981',
      borderColor: '#10b981',
      textColor: 'white'
    },
    // Long event (4 days)
    {
      title: 'Hackathon',
      start: addDays(4),
      end: addDays(8), // 4 days
      backgroundColor: '#6366f1',
      borderColor: '#6366f1',
      textColor: 'white'
    },
    // Other single-day events
    {
      title: 'Team Lunch',
      date: addDays(2),
      backgroundColor: '#eab308',
      borderColor: '#eab308',
      textColor: 'white'
    },
    {
      title: 'Demo Day',
      date: addDays(3),
      backgroundColor: '#0ea5e9',
      borderColor: '#0ea5e9',
      textColor: 'white'
    },
    {
      title: '1:1 with Manager',
      date: addDays(5),
      backgroundColor: '#14b8a6',
      borderColor: '#14b8a6',
      textColor: 'white'
    },
    {
      title: 'Retrospective',
      date: addDays(7),
      backgroundColor: '#a21caf',
      borderColor: '#a21caf',
      textColor: 'white'
    },
    {
      title: 'Sprint Start',
      date: addDays(9),
      backgroundColor: '#f97316',
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
    <div className={`h-full minimal-calendar ${className}`}>
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridDay"
        headerToolbar={{
          left: 'prev,next',
          center: 'title',
          right: 'today'
        }}
        height="100%"
        moreLinkClick="popover"
        eventDisplay="block"
        nowIndicator={true}
        showNonCurrentDates={false}
        fixedWeekCount={false}
        events={calendarEvents}
        eventClick={onEventClick || ((info: EventClickArg) => {
          console.log('Event: ' + info.event.title)
        })}
        dateClick={onDateClick || ((info) => {
          console.log('Clicked on: ' + info.dateStr)
        })}
      />
      <style jsx global>{`
        .minimal-calendar .fc {
          font-size: 11px;
        }
        
        .minimal-calendar .fc-header-toolbar {
          margin-bottom: 8px;
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
          min-height: 28px;
        }
        
        .minimal-calendar .fc-col-header-cell {
          background: transparent;
          border-color: #f4f4f5;
          font-weight: 500;
          color: #71717a;
          font-size: 10px;
          padding: 4px 2px;
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
          font-size: 10px;
          padding: 1px 3px;
          margin: 1px 2px;
          border-width: 0;
        }
        
        .minimal-calendar .fc-daygrid-event-harness {
          margin-top: 1px;
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