'use client';

import { useState, useEffect, useCallback } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { DateSelectArg, EventClickArg, EventDropArg, EventResizeDoneArg } from '@fullcalendar/core';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar, Clock, MapPin, Users, Edit, Trash2, Plus } from 'lucide-react';

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  allDay?: boolean;
  description?: string;
  location?: string;
  attendees?: string[];
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
  attendees: string;
  allDay: boolean;
}

export default function BigCalendar() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<GoogleCalendarEvent | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [eventFormData, setEventFormData] = useState<EventFormData>({
    title: '',
    description: '',
    location: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    attendees: '',
    allDay: false
  });

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
        description: event.description,
        location: event.location,
        attendees: event.attendees?.map(a => a.email) || []
      })) || [];
      
      console.log('Formatted events:', formattedEvents);
      setEvents(formattedEvents);
    } catch (error) {
      console.error('Failed to fetch events:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`Failed to load calendar events: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

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
      attendees: '',
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

  const handleEventResize = async (resizeInfo: EventResizeDoneArg) => {
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

      const attendeesList = eventFormData.attendees ? eventFormData.attendees.split(',').map(email => email.trim()).filter(email => email) : [];
      
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
          attendees: '',
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
  }, [eventFormData, isSubmitting]);

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

      const attendeesList = eventFormData.attendees ? eventFormData.attendees.split(',').map(email => email.trim()).filter(email => email) : [];
      
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
  }, [selectedEvent, eventFormData, isSubmitting]);

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
  }, [selectedEvent, isSubmitting]);

  const startEditMode = useCallback(() => {
    if (!selectedEvent) return;
    
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
      attendees: selectedEvent.attendees?.map(a => a.email).join(', ') || '',
      allDay: !selectedEvent.start.dateTime
    });
    
    setIsEditing(true);
  }, [selectedEvent]);

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
        <SheetContent className="w-[90vw] max-w-md overflow-y-auto bg-white">
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
              <label className="text-sm font-semibold text-gray-900 flex items-center gap-1">
                <Users className="h-4 w-4" />
                Attendees
              </label>
              <Input
                value={eventFormData.attendees}
                onChange={(e) => setEventFormData(prev => ({...prev, attendees: e.target.value}))}
                placeholder="email1@example.com, email2@example.com"
                className="border-gray-300 focus:border-blue focus:ring-blue"
              />
              <p className="text-xs text-gray-500">Separate multiple emails with commas</p>
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
        <SheetContent className="w-[90vw] max-w-md overflow-y-auto bg-white">
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
                    <label className="text-sm font-semibold text-gray-900 flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      Attendees
                    </label>
                    <Input
                      value={eventFormData.attendees}
                      onChange={(e) => setEventFormData(prev => ({...prev, attendees: e.target.value}))}
                      placeholder="email1@example.com, email2@example.com"
                      className="border-gray-300 focus:border-blue focus:ring-blue"
                    />
                    <p className="text-xs text-gray-500">Separate multiple emails with commas</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900">{selectedEvent.summary}</h3>
                      {selectedEvent.description && (
                        <p className="text-sm text-gray-600 mt-1">{selectedEvent.description}</p>
                      )}
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-700">
                          {new Date(selectedEvent.start.dateTime || selectedEvent.start.date!).toLocaleDateString()}
                          {selectedEvent.start.dateTime && (
                            <> at {new Date(selectedEvent.start.dateTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</>
                          )}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-700">
                          {selectedEvent.start.dateTime ? (
                            `${new Date(selectedEvent.start.dateTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - ${new Date(selectedEvent.end.dateTime!).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`
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
                      
                      {selectedEvent.attendees && selectedEvent.attendees.length > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-gray-500" />
                            <span className="text-sm font-medium text-gray-700">Attendees ({selectedEvent.attendees.length})</span>
                          </div>
                          <div className="space-y-1 ml-6">
                            {selectedEvent.attendees.map((attendee, index) => (
                              <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                                <span>{attendee.displayName || attendee.email}</span>
                                {attendee.responseStatus && (
                                  <span className={`px-1.5 py-0.5 rounded-xs text-xs ${
                                    attendee.responseStatus === 'accepted' ? 'bg-green-100 text-green-700' :
                                    attendee.responseStatus === 'declined' ? 'bg-red-100 text-red-700' :
                                    attendee.responseStatus === 'tentative' ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-gray-100 text-gray-700'
                                  }`}>
                                    {attendee.responseStatus === 'needsAction' ? 'Pending' : attendee.responseStatus}
                                  </span>
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