import React, { useState, useEffect } from 'react';
import { Clock, MapPin, Users, Plus, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface TimelineEvent {
  id: string;
  title: string;
  description?: string;
  event_date: string;
  location?: string;
  venue_name?: string;
  is_main_event: boolean;
  dress_code?: string;
  notes?: string;
}

const EventTimeline: React.FC = () => {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<TimelineEvent | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_date: '',
    location: '',
    venue_name: '',
    dress_code: '',
    notes: '',
    is_main_event: false
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('wedding_events')
        .select('*')
        .order('event_date', { ascending: true });

      if (error) throw error;
      const mappedEvents = (data || []).map(event => {
        const eventData = event as any;
        return {
          id: eventData.id,
          title: eventData.title || eventData.name || 'Untitled Event',
          event_date: eventData.event_date || eventData.date || new Date().toISOString(),
          description: eventData.description || '',
          location: eventData.location || '',
          venue_name: eventData.venue_name || '',
          is_main_event: eventData.is_main_event || false,
          dress_code: eventData.dress_code || '',
          notes: eventData.notes || ''
        };
      }) as TimelineEvent[];
      setEvents(mappedEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast({
        title: "Error",
        description: "Failed to load events",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const eventData = {
        title: formData.title,
        description: formData.description || null,
        event_date: formData.event_date,
        location: formData.location || null,
        venue_name: formData.venue_name || null,
        dress_code: formData.dress_code || null,
        notes: formData.notes || null,
        is_main_event: formData.is_main_event,
      };

      if (editingEvent) {
        const { error } = await supabase
          .from('wedding_events')
          .update(eventData)
          .eq('id', editingEvent.id);
        
        if (error) throw error;
        toast({ title: "Success", description: "Event updated successfully" });
      } else {
        const { error } = await (supabase as any)
          .from('wedding_events')
          .insert([eventData]);
        
        if (error) throw error;
        toast({ title: "Success", description: "Event added successfully" });
      }

      resetForm();
      fetchEvents();
    } catch (error) {
      console.error('Error saving event:', error);
      toast({
        title: "Error",
        description: "Failed to save event",
        variant: "destructive"
      });
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      const { error } = await supabase
        .from('wedding_events')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({ title: "Success", description: "Event deleted successfully" });
      fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      toast({
        title: "Error",
        description: "Failed to delete event",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      event_date: '',
      location: '',
      venue_name: '',
      dress_code: '',
      notes: '',
      is_main_event: false
    });
    setEditingEvent(null);
    setShowForm(false);
  };

  const editEvent = (event: TimelineEvent) => {
    setFormData({
      title: event.title,
      description: event.description || '',
      event_date: event.event_date.split('T')[0], // Format for date input
      location: event.location || '',
      venue_name: event.venue_name || '',
      dress_code: event.dress_code || '',
      notes: event.notes || '',
      is_main_event: event.is_main_event
    });
    setEditingEvent(event);
    setShowForm(true);
  };

  const formatEventTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  if (loading) {
    return <div className="text-center py-4">Loading timeline...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-wedding-navy">Wedding Timeline</h4>
        <Button 
          onClick={() => setShowForm(true)} 
          size="sm"
          className="text-xs"
        >
          <Plus className="w-3 h-3 mr-1" />
          Add Event
        </Button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="glass-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h5 className="text-sm font-medium">{editingEvent ? 'Edit' : 'Add'} Event</h5>
            <Button variant="outline" size="sm" onClick={resetForm}>Cancel</Button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Input
                placeholder="Event title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                className="text-sm"
              />
              
              <Input
                type="datetime-local"
                value={formData.event_date}
                onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                required
                className="text-sm"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <Input
                placeholder="Venue name"
                value={formData.venue_name}
                onChange={(e) => setFormData({ ...formData, venue_name: e.target.value })}
                className="text-sm"
              />
              
              <Input
                placeholder="Dress code"
                value={formData.dress_code}
                onChange={(e) => setFormData({ ...formData, dress_code: e.target.value })}
                className="text-sm"
              />
            </div>
            
            <Textarea
              placeholder="Event description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="text-sm min-h-16"
            />
            
            <Button type="submit" size="sm" className="w-full">
              {editingEvent ? 'Update' : 'Add'} Event
            </Button>
          </form>
        </div>
      )}

      {/* Timeline */}
      <div className="space-y-3 h-72 overflow-y-auto">
        {events.map((event) => {
          const { date, time } = formatEventTime(event.event_date);
          return (
            <div key={event.id} className="glass-card p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center space-x-2">
                    <h6 className="text-sm font-semibold text-wedding-navy">
                      {event.title}
                    </h6>
                    {event.is_main_event && (
                      <Badge variant="default" className="text-xs">Main Event</Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{date} • {time}</span>
                    </div>
                    
                    {event.venue_name && (
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-3 h-3" />
                        <span>{event.venue_name}</span>
                      </div>
                    )}
                  </div>
                  
                  {event.description && (
                    <p className="text-xs text-muted-foreground">
                      {event.description}
                    </p>
                  )}
                  
                  {event.dress_code && (
                    <div className="text-xs">
                      <span className="font-medium">Dress Code:</span> {event.dress_code}
                    </div>
                  )}
                </div>
                
                <div className="flex space-x-1 flex-shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => editEvent(event)}
                    className="text-xs px-2 py-1 h-6"
                  >
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteEvent(event.id)}
                    className="text-xs px-2 py-1 h-6"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
        
        {events.length === 0 && (
          <div className="text-center text-sm text-muted-foreground py-8">
            No events scheduled yet. Add your first event to get started!
          </div>
        )}
      </div>
    </div>
  );
};

export default EventTimeline;