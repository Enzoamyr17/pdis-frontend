'use client';

import { useState, useEffect, useCallback } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { DateSelectArg, EventClickArg, EventDropArg, EventApi } from '@fullcalendar/core';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Calendar, Clock, MapPin, Users, Edit, Trash2, Plus, X, Check, CheckCircle2, XCircle, HelpCircle, User, ChevronDown } from 'lucide-react';

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  allDay?: boolean;
  description?: string;
  location?: string;
  attendees?: string[];
  organizer?: {
    email: string;
    displayName?: string;
  };
  isInvitation?: boolean;
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
}

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
  attendees?: Array<{
    email: string;
    displayName?: string;
    responseStatus?: 'needsAction' | 'declined' | 'tentative' | 'accepted';
  }>;
  organizer?: {
    email: string;
    displayName?: string;
  };
  conferenceData?: {
    conferenceSolution: {
      name: string;
    };
    entryPoints: Array<{
      entryPointType: string;
      uri: string;
    }>;
  };
}

interface EventFormData {
  title: string;
  description: string;
  location: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  attendees: string[];
  allDay: boolean;
}

interface EventResizeInfo {
  event: EventApi;
  revert: () => void;
}

export default function BigCalendar() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<GoogleCalendarEvent | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState<string>('');
  const [eventFormData, setEventFormData] = useState<EventFormData>({
    title: '',
    description: '',
    location: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    attendees: [''],
    allDay: false
  });
  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState<string>('');

  const fetchEvents = useCallback(async () => {
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

      // Get current user email from API response, session, or use existing
      let userEmail = data.userEmail || currentUserEmail;
      
      // If we still don't have user email, try to get it from session again
      if (!userEmail) {
        try {
          const sessionResponse = await fetch('/api/auth/session');
          if (sessionResponse.ok) {
            const sessionData = await sessionResponse.json();
            if (sessionData?.user?.email) {
              userEmail = sessionData.user.email;
              setCurrentUserEmail(userEmail);
            }
          }
        } catch (sessionError) {
          console.log('Could not fetch session for user email:', sessionError);
        }
      }
      
      // Update state if we got a new email
      if (userEmail && userEmail !== currentUserEmail) {
        setCurrentUserEmail(userEmail);
      }
      
      console.log('Current user email:', userEmail);
      
      const formattedEvents = data.events?.map((event: GoogleCalendarEvent) => {
        console.log('Processing event:', event.summary, 'Organizer:', event.organizer?.email, 'User:', userEmail);
        
        // Determine if this is an invitation (user is not the organizer)
        const isInvitation = !!(event.organizer && userEmail && event.organizer.email !== userEmail);
        
        console.log('Is invitation?', isInvitation, 'for event:', event.summary);
        
        const calendarEvent: CalendarEvent = {
          id: event.id,
          title: event.summary,
          start: event.start?.dateTime || event.start?.date || '',
          end: event.end?.dateTime || event.end?.date || '',
          allDay: !event.start?.dateTime,
          description: event.description,
          location: event.location,
          attendees: event.attendees?.map(a => a.email) || [],
          organizer: event.organizer,
          isInvitation: isInvitation
        };

        // Style invitation events with white background and blue border
        if (isInvitation) {
          calendarEvent.backgroundColor = '#ffffff';
          calendarEvent.borderColor = '#1B2E6E';
          calendarEvent.textColor = '#1B2E6E';
          console.log('Applied invitation styling to:', event.summary);
        }

        return calendarEvent;
      }) || [];
      
      console.log('Formatted events:', formattedEvents);
      console.log('Events with invitations:', formattedEvents.filter((e: CalendarEvent) => e.isInvitation));
      setEvents(formattedEvents);
    } catch (error) {
      console.error('Failed to fetch events:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`Failed to load calendar events: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }, [currentUserEmail]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleDateSelect = useCallback((selectInfo: DateSelectArg) => {
    const startDate = new Date(selectInfo.start);
    const endDate = new Date(selectInfo.end);
    
    setEventFormData({
      title: '',
      description: '',
      location: '',
      startDate: startDate.toISOString().split('T')[0],
      startTime: selectInfo.allDay ? '' : startDate.toTimeString().slice(0, 5),
      endDate: endDate.toISOString().split('T')[0],
      endTime: selectInfo.allDay ? '' : endDate.toTimeString().slice(0, 5),
      attendees: [''],
      allDay: selectInfo.allDay
    });
    
    setShowCreateModal(true);
  }, []);

  const handleEventClick = useCallback(async (clickInfo: EventClickArg) => {
    try {
      const response = await fetch(`/api/calendar/events/${clickInfo.event.id}`);
      if (response.ok) {
        const eventData = await response.json();
        setSelectedEvent(eventData);
        setIsEditing(false);
        setShowEventModal(true);
      } else {
        console.error('Failed to fetch event:', await response.text());
      }
    } catch (error) {
      console.error('Failed to fetch event details:', error);
    }
  }, []);

  const handleEventDrop = async (dropInfo: EventDropArg) => {
    try {
      const eventData = {
        title: dropInfo.event.title,
        start: dropInfo.event.startStr,
        end: dropInfo.event.endStr,
        allDay: dropInfo.event.allDay
      };

      const response = await fetch(`/api/calendar/events/${dropInfo.event.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData),
      });

      if (!response.ok) {
        dropInfo.revert();
        console.error('Failed to update event');
      }
    } catch (error) {
      dropInfo.revert();
      console.error('Failed to update event:', error);
    }
  };

  const handleEventResize = async (resizeInfo: EventResizeInfo) => {
    try {
      const eventData = {
        title: resizeInfo.event.title,
        start: resizeInfo.event.startStr,
        end: resizeInfo.event.endStr,
        allDay: resizeInfo.event.allDay
      };

      const response = await fetch(`/api/calendar/events/${resizeInfo.event.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData),
      });

      if (!response.ok) {
        resizeInfo.revert();
        console.error('Failed to update event');
      }
    } catch (error) {
      resizeInfo.revert();
      console.error('Failed to update event:', error);
    }
  };

  const handleCreateEvent = useCallback(async () => {
    if (!eventFormData.title.trim() || isSubmitting) return;

    setIsSubmitting(true);
    
    try {
      const startDateTime = eventFormData.allDay 
        ? eventFormData.startDate
        : `${eventFormData.startDate}T${eventFormData.startTime}:00`;
        
      const endDateTime = eventFormData.allDay 
        ? eventFormData.endDate
        : `${eventFormData.endDate}T${eventFormData.endTime}:00`;

      const attendeesList = eventFormData.attendees.filter(email => email.trim());
      
      const eventData: {
        title: string;
        start: string;
        end: string;
        allDay: boolean;
        description?: string;
        location?: string;
        attendees?: string[];
      } = {
        title: eventFormData.title,
        start: startDateTime,
        end: endDateTime,
        allDay: eventFormData.allDay,
      };

      // Only add optional fields if they have values
      if (eventFormData.description && eventFormData.description.trim()) {
        eventData.description = eventFormData.description;
      }
      
      if (eventFormData.location && eventFormData.location.trim()) {
        eventData.location = eventFormData.location;
      }
      
      if (attendeesList.length > 0) {
        eventData.attendees = attendeesList;
      }

      console.log('Creating event with data:', eventData);

      const response = await fetch('/api/calendar/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData),
      });

      if (response.ok) {
        setShowCreateModal(false);
        await fetchEvents();
        setEventFormData({
          title: '',
          description: '',
          location: '',
          startDate: '',
          startTime: '',
          endDate: '',
          endTime: '',
          attendees: [''],
          allDay: false
        });
      } else {
        console.error('Failed to create event:', await response.text());
      }
    } catch (error) {
      console.error('Failed to create event:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [eventFormData, isSubmitting, fetchEvents]);

  const handleUpdateEvent = useCallback(async () => {
    if (!selectedEvent || !eventFormData.title.trim() || isSubmitting) return;

    setIsSubmitting(true);
    
    try {
      const startDateTime = eventFormData.allDay 
        ? eventFormData.startDate
        : `${eventFormData.startDate}T${eventFormData.startTime}:00`;
        
      const endDateTime = eventFormData.allDay 
        ? eventFormData.endDate
        : `${eventFormData.endDate}T${eventFormData.endTime}:00`;

      const attendeesList = eventFormData.attendees.filter(email => email.trim());
      
      const eventData: {
        title: string;
        start: string;
        end: string;
        allDay: boolean;
        description?: string;
        location?: string;
        attendees?: string[];
      } = {
        title: eventFormData.title,
        start: startDateTime,
        end: endDateTime,
        allDay: eventFormData.allDay,
      };

      // Only add optional fields if they have values
      if (eventFormData.description && eventFormData.description.trim()) {
        eventData.description = eventFormData.description;
      }
      
      if (eventFormData.location && eventFormData.location.trim()) {
        eventData.location = eventFormData.location;
      }
      
      if (attendeesList.length > 0) {
        eventData.attendees = attendeesList;
      }

      const response = await fetch(`/api/calendar/events/${selectedEvent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData),
      });

      if (response.ok) {
        setShowEventModal(false);
        setIsEditing(false);
        setSelectedEvent(null);
        await fetchEvents();
      } else {
        console.error('Failed to update event:', await response.text());
      }
    } catch (error) {
      console.error('Failed to update event:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedEvent, eventFormData, isSubmitting, fetchEvents]);

  const addAttendeeField = useCallback(() => {
    setEventFormData(prev => ({
      ...prev,
      attendees: [...prev.attendees, '']
    }));
  }, []);

  const removeAttendeeField = useCallback((index: number) => {
    setEventFormData(prev => ({
      ...prev,
      attendees: prev.attendees.filter((_, i) => i !== index)
    }));
  }, []);

  const updateAttendeeField = useCallback((index: number, value: string) => {
    setEventFormData(prev => ({
      ...prev,
      attendees: prev.attendees.map((email, i) => i === index ? value : email)
    }));
  }, []);

  const startInlineEdit = useCallback((field: string, currentValue: string) => {
    setEditingField(field);
    setTempValue(currentValue);
  }, []);

  const saveInlineEdit = useCallback(async (field: string) => {
    if (!selectedEvent) return;

    const updatedData = { ...eventFormData };
    if (field === 'title') updatedData.title = tempValue;
    else if (field === 'description') updatedData.description = tempValue;
    else if (field === 'startDate') updatedData.startDate = tempValue;
    else if (field === 'startTime') updatedData.startTime = tempValue;
    else if (field === 'endDate') updatedData.endDate = tempValue;
    else if (field === 'endTime') updatedData.endTime = tempValue;

    setEventFormData(updatedData);
    setEditingField(null);
    
    // Auto-save the change
    await handleUpdateEvent();
  }, [selectedEvent, eventFormData, tempValue, handleUpdateEvent]);

  const cancelInlineEdit = useCallback(() => {
    setEditingField(null);
    setTempValue('');
  }, []);


  const handleRSVPResponse = useCallback(async (responseStatus: 'accepted' | 'declined' | 'tentative') => {
    if (!selectedEvent || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/calendar/events/${selectedEvent.id}/rsvp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: responseStatus }),
      });

      if (response.ok) {
        // Refresh events to show updated RSVP status
        await fetchEvents();
        
        // Update the selectedEvent to reflect the new status
        const updatedEvent = { ...selectedEvent };
        if (updatedEvent.attendees && currentUserEmail) {
          updatedEvent.attendees = updatedEvent.attendees.map(attendee => 
            attendee.email === currentUserEmail 
              ? { ...attendee, responseStatus }
              : attendee
          );
        }
        setSelectedEvent(updatedEvent);
        
        console.log(`RSVP response ${responseStatus} sent successfully`);
      } else {
        console.error('Failed to send RSVP response:', await response.text());
        alert('Failed to send RSVP response. Please try again.');
      }
    } catch (error) {
      console.error('Failed to send RSVP response:', error);
      alert('Failed to send RSVP response. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedEvent, isSubmitting, currentUserEmail, fetchEvents]);

  const handleDeleteEvent = useCallback(async () => {
    if (!selectedEvent || isSubmitting) return;

    if (confirm(`Delete event '${selectedEvent.summary}'?`)) {
      setIsSubmitting(true);
      try {
        const response = await fetch(`/api/calendar/events/${selectedEvent.id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setShowEventModal(false);
          setSelectedEvent(null);
          await fetchEvents();
        } else {
          console.error('Failed to delete event:', await response.text());
        }
      } catch (error) {
        console.error('Failed to delete event:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  }, [selectedEvent, isSubmitting, fetchEvents]);

  const startEditMode = useCallback(() => {
    if (!selectedEvent) return;
    
    const startDate = new Date(selectedEvent.start.dateTime || selectedEvent.start.date!);
    const endDate = new Date(selectedEvent.end.dateTime || selectedEvent.end.date!);
    
    const formData = {
      title: selectedEvent.summary,
      description: selectedEvent.description || '',
      location: selectedEvent.location || '',
      startDate: startDate.toISOString().split('T')[0],
      startTime: selectedEvent.start.dateTime ? startDate.toTimeString().slice(0, 5) : '',
      endDate: endDate.toISOString().split('T')[0],
      endTime: selectedEvent.end.dateTime ? endDate.toTimeString().slice(0, 5) : '',
      attendees: selectedEvent.attendees?.map(a => a.email) || [''],
      allDay: !selectedEvent.start.dateTime
    };
    
    setEventFormData(formData);
    setIsEditing(true);
  }, [selectedEvent]);

  // Initialize eventFormData for inline editing when event modal opens
  useEffect(() => {
    if (selectedEvent && !isEditing) {
      const startDate = new Date(selectedEvent.start.dateTime || selectedEvent.start.date!);
      const endDate = new Date(selectedEvent.end.dateTime || selectedEvent.end.date!);
      
      setEventFormData({
        title: selectedEvent.summary,
        description: selectedEvent.description || '',
        location: selectedEvent.location || '',
        startDate: startDate.toISOString().split('T')[0],
        startTime: selectedEvent.start.dateTime ? startDate.toTimeString().slice(0, 5) : '',
        endDate: endDate.toISOString().split('T')[0],
        endTime: selectedEvent.end.dateTime ? endDate.toTimeString().slice(0, 5) : '',
        attendees: selectedEvent.attendees?.map(a => a.email) || [''],
        allDay: !selectedEvent.start.dateTime
      });
    }
  }, [selectedEvent, isEditing]);

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
    <>
      <div className="p-4">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          }}
          initialView="timeGridDay"
          editable={true}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={true}
          weekends={true}
          events={events}
          select={handleDateSelect}
          eventClick={handleEventClick}
          eventDrop={handleEventDrop}
          eventResize={handleEventResize}
          height="auto"
        />
      </div>

      {/* Create Event Modal */}
      <Sheet open={showCreateModal} onOpenChange={setShowCreateModal}>
        <SheetContent className="w-[90vw] max-w-md overflow-y-auto bg-white p-4">
          <SheetHeader className="pb-6">
            <SheetTitle className="flex items-center gap-2 text-blue">
              <Plus className="h-5 w-5" />
              Create New Event
            </SheetTitle>
          </SheetHeader>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-900">Title *</label>
              <Input
                value={eventFormData.title}
                onChange={(e) => setEventFormData(prev => ({...prev, title: e.target.value}))}
                placeholder="Enter event title"
                className="border-gray-300 focus:border-blue focus:ring-blue"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-900">Description</label>
              <textarea
                className="min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue focus:ring-2 focus:ring-blue/20 outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                value={eventFormData.description}
                onChange={(e) => setEventFormData(prev => ({...prev, description: e.target.value}))}
                placeholder="Enter event description"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-900 flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                Location
              </label>
              <Input
                value={eventFormData.location}
                onChange={(e) => setEventFormData(prev => ({...prev, location: e.target.value}))}
                placeholder="Enter event location"
                className="border-gray-300 focus:border-blue focus:ring-blue"
              />
            </div>
            
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="allDay"
                checked={eventFormData.allDay}
                onChange={(e) => setEventFormData(prev => ({...prev, allDay: e.target.checked}))}
                className="h-4 w-4 text-blue border-gray-300 rounded focus:ring-blue"
              />
              <label htmlFor="allDay" className="text-sm font-medium text-gray-900">All day event</label>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-900 flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Start Date
                </label>
                <Input
                  type="date"
                  value={eventFormData.startDate}
                  onChange={(e) => setEventFormData(prev => ({...prev, startDate: e.target.value}))}
                  className="border-gray-300 focus:border-blue focus:ring-blue"
                />
              </div>
              
              {!eventFormData.allDay && (
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-900 flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    Start Time
                  </label>
                  <Input
                    type="time"
                    value={eventFormData.startTime}
                    onChange={(e) => setEventFormData(prev => ({...prev, startTime: e.target.value}))}
                    className="border-gray-300 focus:border-blue focus:ring-blue"
                  />
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-900 flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  End Date
                </label>
                <Input
                  type="date"
                  value={eventFormData.endDate}
                  onChange={(e) => setEventFormData(prev => ({...prev, endDate: e.target.value}))}
                  className="border-gray-300 focus:border-blue focus:ring-blue"
                />
              </div>
              
              {!eventFormData.allDay && (
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-900 flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    End Time
                  </label>
                  <Input
                    type="time"
                    value={eventFormData.endTime}
                    onChange={(e) => setEventFormData(prev => ({...prev, endTime: e.target.value}))}
                    className="border-gray-300 focus:border-blue focus:ring-blue"
                  />
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-gray-900 flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  Attendees
                </label>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={addAttendeeField}
                  className="h-7 px-2 text-xs"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add
                </Button>
              </div>
              {eventFormData.attendees.map((email, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={email}
                    onChange={(e) => updateAttendeeField(index, e.target.value)}
                    placeholder="attendee@example.com"
                    className="border-gray-300 focus:border-blue focus:ring-blue"
                  />
                  {eventFormData.attendees.length > 1 && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => removeAttendeeField(index)}
                      className="h-9 w-9 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-6 mt-6 border-t">
            <Button 
              variant="outline" 
              onClick={() => setShowCreateModal(false)}
              disabled={isSubmitting}
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateEvent} 
              disabled={!eventFormData.title.trim() || isSubmitting}
              className="bg-blue hover:bg-blue/90 text-white"
            >
              {isSubmitting ? 'Creating...' : 'Create Event'}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Event Details Modal */}
      <Sheet open={showEventModal} onOpenChange={setShowEventModal}>
        <SheetContent className="w-[90vw] max-w-md overflow-y-auto bg-white p-4">
          <SheetHeader className="pb-6">
            <SheetTitle className="flex items-center gap-2 text-blue">
              <Calendar className="h-5 w-5" />
              {isEditing ? 'Edit Event' : 'Event Details'}
            </SheetTitle>
          </SheetHeader>
          
          {selectedEvent && (
            <div className="space-y-6">
              {isEditing ? (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-900">Title *</label>
                    <Input
                      value={eventFormData.title}
                      onChange={(e) => setEventFormData(prev => ({...prev, title: e.target.value}))}
                      placeholder="Event title"
                      className="border-gray-300 focus:border-blue focus:ring-blue"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-900">Description</label>
                    <textarea
                      className="min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue focus:ring-2 focus:ring-blue/20 outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                      value={eventFormData.description}
                      onChange={(e) => setEventFormData(prev => ({...prev, description: e.target.value}))}
                      placeholder="Event description"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-900">Location</label>
                    <Input
                      value={eventFormData.location}
                      onChange={(e) => setEventFormData(prev => ({...prev, location: e.target.value}))}
                      placeholder="Event location"
                      className="border-gray-300 focus:border-blue focus:ring-blue"
                    />
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="editAllDay"
                      checked={eventFormData.allDay}
                      onChange={(e) => setEventFormData(prev => ({...prev, allDay: e.target.checked}))}
                      className="h-4 w-4 text-blue border-gray-300 rounded focus:ring-blue"
                    />
                    <label htmlFor="editAllDay" className="text-sm font-medium text-gray-900">All day event</label>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-900 flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Start Date
                      </label>
                      <Input
                        type="date"
                        value={eventFormData.startDate}
                        onChange={(e) => setEventFormData(prev => ({...prev, startDate: e.target.value}))}
                        className="border-gray-300 focus:border-blue focus:ring-blue"
                      />
                    </div>
                    
                    {!eventFormData.allDay && (
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-900 flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          Start Time
                        </label>
                        <Input
                          type="time"
                          value={eventFormData.startTime}
                          onChange={(e) => setEventFormData(prev => ({...prev, startTime: e.target.value}))}
                          className="border-gray-300 focus:border-blue focus:ring-blue"
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-900 flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        End Date
                      </label>
                      <Input
                        type="date"
                        value={eventFormData.endDate}
                        onChange={(e) => setEventFormData(prev => ({...prev, endDate: e.target.value}))}
                        className="border-gray-300 focus:border-blue focus:ring-blue"
                      />
                    </div>
                    
                    {!eventFormData.allDay && (
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-900 flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          End Time
                        </label>
                        <Input
                          type="time"
                          value={eventFormData.endTime}
                          onChange={(e) => setEventFormData(prev => ({...prev, endTime: e.target.value}))}
                          className="border-gray-300 focus:border-blue focus:ring-blue"
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-semibold text-gray-900 flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        Attendees
                      </label>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={addAttendeeField}
                        className="h-7 px-2 text-xs"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add
                      </Button>
                    </div>
                    {eventFormData.attendees.map((email, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          value={email}
                          onChange={(e) => updateAttendeeField(index, e.target.value)}
                          placeholder="attendee@example.com"
                          className="border-gray-300 focus:border-blue focus:ring-blue"
                        />
                        {eventFormData.attendees.length > 1 && (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => removeAttendeeField(index)}
                            className="h-9 w-9 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-4">
                    <div>
                      {editingField === 'title' ? (
                        <div className="flex items-center gap-2">
                          <Input
                            value={tempValue}
                            onChange={(e) => setTempValue(e.target.value)}
                            className="font-semibold text-lg border-gray-300 focus:border-blue focus:ring-blue"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveInlineEdit('title');
                              if (e.key === 'Escape') cancelInlineEdit();
                            }}
                            autoFocus
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => saveInlineEdit('title')}
                            className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={cancelInlineEdit}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <h3 
                          className="font-semibold text-lg text-gray-900 cursor-pointer hover:text-blue-600 hover:underline"
                          onClick={() => startInlineEdit('title', selectedEvent.summary)}
                        >
                          {selectedEvent.summary}
                        </h3>
                      )}
                      {editingField === 'description' ? (
                        <div className="flex items-start gap-2 mt-1">
                          <textarea
                            value={tempValue}
                            onChange={(e) => setTempValue(e.target.value)}
                            className="min-h-[60px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue focus:ring-2 focus:ring-blue/20 outline-none"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && e.ctrlKey) saveInlineEdit('description');
                              if (e.key === 'Escape') cancelInlineEdit();
                            }}
                            autoFocus
                          />
                          <div className="flex flex-col gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => saveInlineEdit('description')}
                              className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={cancelInlineEdit}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        selectedEvent.description && (
                          <p 
                            className="text-sm text-gray-600 mt-1 cursor-pointer hover:text-blue-600 hover:underline"
                            onClick={() => startInlineEdit('description', selectedEvent.description || '')}
                          >
                            {selectedEvent.description}
                          </p>
                        )
                      )}
                      {!selectedEvent.description && editingField !== 'description' && (
                        <p 
                          className="text-sm text-gray-400 mt-1 cursor-pointer hover:text-blue-600 italic"
                          onClick={() => startInlineEdit('description', '')}
                        >
                          Click to add description
                        </p>
                      )}
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        {editingField === 'startDate' ? (
                          <div className="flex items-center gap-2">
                            <Input
                              type="date"
                              value={tempValue}
                              onChange={(e) => setTempValue(e.target.value)}
                              className="text-sm w-40 border-gray-300 focus:border-blue focus:ring-blue"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') saveInlineEdit('startDate');
                                if (e.key === 'Escape') cancelInlineEdit();
                              }}
                              autoFocus
                            />
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => saveInlineEdit('startDate')}
                              className="h-7 w-7 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                            >
                              <Check className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={cancelInlineEdit}
                              className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <span 
                            className="text-sm text-gray-700 cursor-pointer hover:text-blue-600 hover:underline"
                            onClick={() => startInlineEdit('startDate', new Date(selectedEvent.start.dateTime || selectedEvent.start.date!).toISOString().split('T')[0])}
                          >
                            {new Date(selectedEvent.start.dateTime || selectedEvent.start.date!).toLocaleDateString()}
                            {selectedEvent.start.dateTime && editingField === 'startTime' ? (
                              <> at 
                                <Input
                                  type="time"
                                  value={tempValue}
                                  onChange={(e) => setTempValue(e.target.value)}
                                  className="inline-block w-20 mx-1 text-sm border-gray-300 focus:border-blue focus:ring-blue"
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') saveInlineEdit('startTime');
                                    if (e.key === 'Escape') cancelInlineEdit();
                                  }}
                                  autoFocus
                                />
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => saveInlineEdit('startTime')}
                                  className="inline-block h-6 w-6 p-0 mx-1 text-green-600 hover:text-green-700 hover:bg-green-50"
                                >
                                  <Check className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={cancelInlineEdit}
                                  className="inline-block h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </>
                            ) : (
                              selectedEvent.start.dateTime && (
                                <> at <span 
                                  className="cursor-pointer hover:text-blue-600 hover:underline"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    startInlineEdit('startTime', new Date(selectedEvent.start.dateTime!).toTimeString().slice(0, 5));
                                  }}
                                >
                                  {new Date(selectedEvent.start.dateTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </span></>
                              )
                            )}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-700">
                          {selectedEvent.start.dateTime ? (
                            <>
                              {editingField === 'endTime' ? (
                                <div className="inline-flex items-center gap-1">
                                  <span>{new Date(selectedEvent.start.dateTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - </span>
                                  <Input
                                    type="time"
                                    value={tempValue}
                                    onChange={(e) => setTempValue(e.target.value)}
                                    className="inline-block w-20 text-sm border-gray-300 focus:border-blue focus:ring-blue"
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') saveInlineEdit('endTime');
                                      if (e.key === 'Escape') cancelInlineEdit();
                                    }}
                                    autoFocus
                                  />
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => saveInlineEdit('endTime')}
                                    className="h-6 w-6 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                                  >
                                    <Check className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={cancelInlineEdit}
                                    className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              ) : (
                                <>
                                  {new Date(selectedEvent.start.dateTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - 
                                  <span 
                                    className="cursor-pointer hover:text-blue-600 hover:underline"
                                    onClick={() => startInlineEdit('endTime', new Date(selectedEvent.end.dateTime!).toTimeString().slice(0, 5))}
                                  >
                                    {new Date(selectedEvent.end.dateTime!).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                  </span>
                                </>
                              )}
                            </>
                          ) : (
                            'All day'
                          )}
                        </span>
                      </div>
                      
                      {selectedEvent.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-700">{selectedEvent.location}</span>
                        </div>
                      )}
                      
                      {selectedEvent.organizer && (
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-700">
                            <span className="font-medium">Organizer:</span> {selectedEvent.organizer.displayName || selectedEvent.organizer.email}
                          </span>
                        </div>
                      )}
                      
                      {selectedEvent.attendees && selectedEvent.attendees.length > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-gray-500" />
                            <span className="text-sm font-medium text-gray-700">Attendees ({selectedEvent.attendees.length})</span>
                          </div>
                          <div className="space-y-1 ml-6">
                            {selectedEvent.attendees.map((attendee, index) => (
                              <div key={index} className="flex items-center justify-between text-sm text-gray-600">
                                <span>{attendee.displayName || attendee.email}</span>
                                {attendee.email === currentUserEmail && selectedEvent.organizer?.email !== currentUserEmail ? (
                                  // Show dropdown for current user if it's an invitation
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild disabled={isSubmitting}>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-6 px-2 text-xs gap-1"
                                      >
                                        <span className={`flex items-center gap-1 ${
                                          attendee.responseStatus === 'accepted' ? 'text-green-600' :
                                          attendee.responseStatus === 'declined' ? 'text-red-600' :
                                          attendee.responseStatus === 'tentative' ? 'text-yellow-600' :
                                          'text-gray-600'
                                        }`}>
                                          {attendee.responseStatus === 'accepted' && <CheckCircle2 className="h-3 w-3" />}
                                          {attendee.responseStatus === 'declined' && <XCircle className="h-3 w-3" />}
                                          {attendee.responseStatus === 'tentative' && <HelpCircle className="h-3 w-3" />}
                                          {(!attendee.responseStatus || attendee.responseStatus === 'needsAction') && <HelpCircle className="h-3 w-3" />}
                                          {attendee.responseStatus === 'accepted' ? 'Yes' :
                                           attendee.responseStatus === 'declined' ? 'No' :
                                           attendee.responseStatus === 'tentative' ? 'Maybe' :
                                           'Pending'}
                                        </span>
                                        <ChevronDown className="h-3 w-3" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-20">
                                      <DropdownMenuItem 
                                        onClick={() => handleRSVPResponse('accepted')}
                                        className="text-xs cursor-pointer"
                                      >
                                        <CheckCircle2 className="h-3 w-3 text-green-600 mr-1" />
                                        Yes
                                      </DropdownMenuItem>
                                      <DropdownMenuItem 
                                        onClick={() => handleRSVPResponse('tentative')}
                                        className="text-xs cursor-pointer"
                                      >
                                        <HelpCircle className="h-3 w-3 text-yellow-600 mr-1" />
                                        Maybe
                                      </DropdownMenuItem>
                                      <DropdownMenuItem 
                                        onClick={() => handleRSVPResponse('declined')}
                                        className="text-xs cursor-pointer"
                                      >
                                        <XCircle className="h-3 w-3 text-red-600 mr-1" />
                                        No
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                ) : (
                                  // Show status badge for other attendees or non-invitations
                                  attendee.responseStatus && (
                                    <span className={`px-1.5 py-0.5 rounded-xs text-xs ${
                                      attendee.responseStatus === 'accepted' ? 'bg-green-100 text-green-700' :
                                      attendee.responseStatus === 'declined' ? 'bg-red-100 text-red-700' :
                                      attendee.responseStatus === 'tentative' ? 'bg-yellow-100 text-yellow-700' :
                                      'bg-gray-100 text-gray-700'
                                    }`}>
                                      {attendee.responseStatus === 'needsAction' ? 'Pending' : attendee.responseStatus}
                                    </span>
                                  )
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {selectedEvent.conferenceData && (
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-gray-700">Meeting Link:</p>
                          {selectedEvent.conferenceData.entryPoints.map((entry, index) => (
                            <a
                              key={index}
                              href={entry.uri}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:underline block"
                            >
                              {entry.uri}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
          

          <div className="flex justify-end gap-3 pt-6 mt-6 border-t">
            {!isEditing ? (
              <>
                <Button 
                  variant="outline" 
                  onClick={() => setShowEventModal(false)}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Close
                </Button>
                {/* Only show Edit and Delete for events the user owns */}
                {selectedEvent && (!selectedEvent.organizer || !currentUserEmail || selectedEvent.organizer.email === currentUserEmail) && (
                  <>
                    <Button 
                      variant="outline" 
                      onClick={startEditMode}
                      className="border-blue text-blue hover:bg-blue/10"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      variant="destructive" 
                      onClick={handleDeleteEvent}
                      disabled={isSubmitting}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      {isSubmitting ? 'Deleting...' : 'Delete'}
                    </Button>
                  </>
                )}
              </>
            ) : (
              <>
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditing(false)}
                  disabled={isSubmitting}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleUpdateEvent} 
                  disabled={!eventFormData.title.trim() || isSubmitting}
                  className="bg-blue hover:bg-blue/90 text-white"
                >
                  {isSubmitting ? 'Updating...' : 'Update Event'}
                </Button>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}