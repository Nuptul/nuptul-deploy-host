import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Plus, 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Edit3, 
  Trash2, 
  Eye, 
  CheckCircle,
  AlertTriangle,
  Save,
  X,
  Search,
  Filter,
  RefreshCw,
  Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { getLiquidGlassStyle, stylePresets } from '@/utils/styleHelpers';
import styles from '@/components/dashboard/dashboard.module.css';

interface WeddingEvent {
  id: string;
  title: string;
  description: string | null;
  date: string;
  start_time: string;
  end_time: string | null;
  location: string | null;
  event_type: 'ceremony' | 'reception' | 'cocktail' | 'dinner' | 'dancing' | 'other';
  is_public: boolean;
  max_attendees: number | null;
  dress_code: string | null;
  special_instructions: string | null;
  created_at: string;
  updated_at: string;
}

interface EventFormData {
  title: string;
  description: string;
  date: string;
  start_time: string;
  end_time: string;
  location: string;
  event_type: 'ceremony' | 'reception' | 'cocktail' | 'dinner' | 'dancing' | 'other';
  is_public: boolean;
  max_attendees: string;
  dress_code: string;
  special_instructions: string;
}

const EVENT_TYPE_COLORS = {
  ceremony: 'bg-purple-100 text-purple-800 border-purple-200',
  reception: 'bg-blue-100 text-blue-800 border-blue-200',
  cocktail: 'bg-green-100 text-green-800 border-green-200',
  dinner: 'bg-orange-100 text-orange-800 border-orange-200',
  dancing: 'bg-pink-100 text-pink-800 border-pink-200',
  other: 'bg-gray-100 text-gray-800 border-gray-200'
} as const;

const AdminEvents: React.FC = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<WeddingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingEvent, setEditingEvent] = useState<WeddingEvent | null>(null);
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    date: '',
    start_time: '',
    end_time: '',
    location: '',
    event_type: 'other',
    is_public: true,
    max_attendees: '',
    dress_code: '',
    special_instructions: ''
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('wedding_events')
        .select('*')
        .order('date', { ascending: true })
        .order('start_time', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load events');
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
        date: formData.date,
        start_time: formData.start_time,
        end_time: formData.end_time || null,
        location: formData.location || null,
        event_type: formData.event_type,
        is_public: formData.is_public,
        max_attendees: formData.max_attendees ? parseInt(formData.max_attendees) : null,
        dress_code: formData.dress_code || null,
        special_instructions: formData.special_instructions || null,
        updated_at: new Date().toISOString()
      };

      if (editingEvent) {
        // Update existing event
        const { error } = await supabase
          .from('wedding_events')
          .update(eventData)
          .eq('id', editingEvent.id);

        if (error) throw error;
        toast.success('Event updated successfully');
      } else {
        // Create new event
        const { error } = await supabase
          .from('wedding_events')
          .insert([{
            ...eventData,
            created_at: new Date().toISOString()
          }]);

        if (error) throw error;
        toast.success('Event created successfully');
      }

      setShowAddDialog(false);
      setEditingEvent(null);
      resetForm();
      fetchEvents();
    } catch (error) {
      console.error('Error saving event:', error);
      toast.error(editingEvent ? 'Failed to update event' : 'Failed to create event');
    }
  };

  const handleEdit = (event: WeddingEvent) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description || '',
      date: event.date,
      start_time: event.start_time,
      end_time: event.end_time || '',
      location: event.location || '',
      event_type: event.event_type,
      is_public: event.is_public,
      max_attendees: event.max_attendees?.toString() || '',
      dress_code: event.dress_code || '',
      special_instructions: event.special_instructions || ''
    });
    setShowAddDialog(true);
  };

  const handleDelete = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;

    try {
      const { error } = await supabase
        .from('wedding_events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;
      
      toast.success('Event deleted successfully');
      fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      date: '',
      start_time: '',
      end_time: '',
      location: '',
      event_type: 'other',
      is_public: true,
      max_attendees: '',
      dress_code: '',
      special_instructions: ''
    });
  };

  const exportEvents = () => {
    try {
      const headers = ['Title', 'Description', 'Date', 'Start Time', 'End Time', 'Location', 'Type', 'Public', 'Max Attendees', 'Dress Code'];
      const rows = events.map(event => [
        event.title,
        event.description || '',
        event.date,
        event.start_time,
        event.end_time || '',
        event.location || '',
        event.event_type,
        event.is_public ? 'Yes' : 'No',
        event.max_attendees?.toString() || '',
        event.dress_code || ''
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `wedding-events-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success('Events exported successfully');
    } catch (error) {
      console.error('Error exporting events:', error);
      toast.error('Failed to export events');
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = 
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'all' || event.event_type === typeFilter;
    
    return matchesSearch && matchesType;
  });

  // Group events by date
  const groupedEvents = filteredEvents.reduce((groups, event) => {
    const date = event.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(event);
    return groups;
  }, {} as Record<string, WeddingEvent[]>);

  const stats = [
    { 
      label: 'Total Events', 
      value: events.length, 
      icon: Calendar, 
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    { 
      label: 'Public Events', 
      value: events.filter(e => e.is_public).length, 
      icon: Eye, 
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    { 
      label: 'This Week', 
      value: events.filter(e => {
        const eventDate = new Date(e.date);
        const today = new Date();
        const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
        return eventDate >= today && eventDate <= weekFromNow;
      }).length, 
      icon: Clock, 
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    { 
      label: 'Venues', 
      value: new Set(events.map(e => e.location).filter(Boolean)).size, 
      icon: MapPin, 
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ];

  return (
    <div className="min-h-screen px-5 pt-12 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className={`rounded-full transition-all duration-200 hover:scale-105 ${styles.actionButton}`}
            style={{
              minWidth: '44px',
              minHeight: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0.25) 100%)',
              backdropFilter: 'blur(20px) saturate(1.8)',
              WebkitBackdropFilter: 'blur(20px) saturate(1.8)',
              border: '1px solid rgba(255, 255, 255, 0.4)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08), inset 0 1px 1px rgba(255, 255, 255, 0.7)'
            }}
          >
            <ArrowLeft className="w-5 h-5" style={{ color: 'rgba(0, 0, 0, 0.7)' }} />
          </button>
          <div>
            <h1 style={{ 
              fontFamily: '"Bodoni Moda", serif',
              fontSize: '32px',
              fontWeight: '600',
              color: '#002147'
            }}>Event Timeline</h1>
            <p style={{ 
              fontFamily: '"Montserrat", sans-serif',
              fontSize: '16px',
              color: 'rgba(0, 0, 0, 0.6)'
            }}>Manage wedding events and schedule</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchEvents()}
            className={`rounded-lg flex items-center gap-2 transition-all duration-200 hover:scale-105 ${styles.actionButton}`}
            style={{
              minHeight: '44px',
              padding: '0 20px',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0.25) 100%)',
              backdropFilter: 'blur(20px) saturate(1.8)',
              WebkitBackdropFilter: 'blur(20px) saturate(1.8)',
              border: '1px solid rgba(255, 255, 255, 0.4)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08), inset 0 1px 1px rgba(255, 255, 255, 0.7)',
              fontFamily: '"Montserrat", sans-serif',
              fontSize: '14px',
              fontWeight: '600',
              color: '#000000'
            }}
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button
            onClick={exportEvents}
            className={`rounded-lg flex items-center gap-2 transition-all duration-200 hover:scale-105 ${styles.actionButton}`}
            style={{
              minHeight: '44px',
              padding: '0 20px',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0.25) 100%)',
              backdropFilter: 'blur(20px) saturate(1.8)',
              WebkitBackdropFilter: 'blur(20px) saturate(1.8)',
              border: '1px solid rgba(255, 255, 255, 0.4)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08), inset 0 1px 1px rgba(255, 255, 255, 0.7)',
              fontFamily: '"Montserrat", sans-serif',
              fontSize: '14px',
              fontWeight: '600',
              color: '#000000'
            }}
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <button 
                onClick={() => {
                  setEditingEvent(null);
                  resetForm();
                }}
                className={`rounded-lg flex items-center gap-2 transition-all duration-200 hover:scale-105 ${styles.actionButton}`}
                style={{
                  minHeight: '44px',
                  padding: '0 24px',
                  background: 'linear-gradient(135deg, rgba(0, 33, 71, 0.9) 0%, rgba(0, 33, 71, 0.8) 100%)',
                  backdropFilter: 'blur(20px) saturate(1.8)',
                  WebkitBackdropFilter: 'blur(20px) saturate(1.8)',
                  border: '1px solid rgba(0, 33, 71, 0.3)',
                  boxShadow: '0 4px 16px rgba(0, 33, 71, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.3)',
                  fontFamily: '"Montserrat", sans-serif',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#ffffff'
                }}
              >
                <Plus className="w-4 h-4" />
                Add Event
              </button>
            </DialogTrigger>
            <DialogContent className="glass-popup max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingEvent ? 'Edit Event' : 'Add New Event'}
                </DialogTitle>
                <DialogDescription>
                  {editingEvent ? 'Update event details and timeline.' : 'Create a new event for your wedding timeline.'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="font-medium text-wedding-navy">Event Details</h3>
                  <div>
                    <Label htmlFor="title">Event Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      placeholder="e.g., Wedding Ceremony"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="Brief description of the event"
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="event_type">Event Type</Label>
                      <Select value={formData.event_type} onValueChange={(value: any) => setFormData({...formData, event_type: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ceremony">Ceremony</SelectItem>
                          <SelectItem value="reception">Reception</SelectItem>
                          <SelectItem value="cocktail">Cocktail Hour</SelectItem>
                          <SelectItem value="dinner">Dinner</SelectItem>
                          <SelectItem value="dancing">Dancing</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                        placeholder="Event location"
                      />
                    </div>
                  </div>
                </div>

                {/* Date & Time */}
                <div className="space-y-4">
                  <h3 className="font-medium text-wedding-navy">Date & Time</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="date">Date</Label>
                      <Input
                        id="date"
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({...formData, date: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="start_time">Start Time</Label>
                      <Input
                        id="start_time"
                        type="time"
                        value={formData.start_time}
                        onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="end_time">End Time (Optional)</Label>
                      <Input
                        id="end_time"
                        type="time"
                        value={formData.end_time}
                        onChange={(e) => setFormData({...formData, end_time: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                {/* Additional Details */}
                <div className="space-y-4">
                  <h3 className="font-medium text-wedding-navy">Additional Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="max_attendees">Max Attendees (Optional)</Label>
                      <Input
                        id="max_attendees"
                        type="number"
                        value={formData.max_attendees}
                        onChange={(e) => setFormData({...formData, max_attendees: e.target.value})}
                        placeholder="Maximum number of attendees"
                      />
                    </div>
                    <div>
                      <Label htmlFor="dress_code">Dress Code</Label>
                      <Input
                        id="dress_code"
                        value={formData.dress_code}
                        onChange={(e) => setFormData({...formData, dress_code: e.target.value})}
                        placeholder="e.g., Cocktail Attire"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="special_instructions">Special Instructions</Label>
                    <Textarea
                      id="special_instructions"
                      value={formData.special_instructions}
                      onChange={(e) => setFormData({...formData, special_instructions: e.target.value})}
                      placeholder="Any special instructions for guests"
                      rows={3}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="is_public"
                      checked={formData.is_public}
                      onChange={(e) => setFormData({...formData, is_public: e.target.checked})}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="is_public">Make this event public for guests</Label>
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setShowAddDialog(false);
                      setEditingEvent(null);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-wedding-navy hover:bg-wedding-navy/90">
                    {editingEvent ? 'Update Event' : 'Create Event'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div 
              key={index} 
              className={`p-5 rounded-2xl transition-all duration-300 hover:scale-[1.02] ${styles.liquidGlassCard}`}
              style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0.25) 100%)',
                backdropFilter: 'blur(25px) saturate(1.8)',
                WebkitBackdropFilter: 'blur(25px) saturate(1.8)',
                border: '1px solid rgba(255, 255, 255, 0.4)',
                boxShadow: '0 8px 32px rgba(31, 38, 135, 0.12), inset 0 1px 1px rgba(255, 255, 255, 0.6)'
              }}
            >
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div>
                  <div style={{
                    fontFamily: '"Bodoni Moda", serif',
                    fontSize: '28px',
                    fontWeight: '600',
                    color: '#002147'
                  }}>{stat.value}</div>
                  <div style={{
                    fontFamily: '"Montserrat", sans-serif',
                    fontSize: '14px',
                    color: 'rgba(0, 0, 0, 0.6)'
                  }}>{stat.label}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div 
        className={`p-5 mb-6 rounded-2xl ${styles.liquidGlassCard}`}
        style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0.25) 100%)',
          backdropFilter: 'blur(25px) saturate(1.8)',
          WebkitBackdropFilter: 'blur(25px) saturate(1.8)',
          border: '1px solid rgba(255, 255, 255, 0.4)',
          boxShadow: '0 8px 32px rgba(31, 38, 135, 0.12), inset 0 1px 1px rgba(255, 255, 255, 0.6)'
        }}
      >
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-4 top-1/2 transform -translate-y-1/2" style={{ color: 'rgba(0, 0, 0, 0.5)' }} />
            <Input
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4" style={{ color: 'rgba(0, 0, 0, 0.5)' }} />
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="ceremony">Ceremony</SelectItem>
                <SelectItem value="reception">Reception</SelectItem>
                <SelectItem value="cocktail">Cocktail</SelectItem>
                <SelectItem value="dinner">Dinner</SelectItem>
                <SelectItem value="dancing">Dancing</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Events Timeline */}
      <div 
        className={`p-6 rounded-2xl ${styles.liquidGlassCard}`}
        style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0.25) 100%)',
          backdropFilter: 'blur(25px) saturate(1.8)',
          WebkitBackdropFilter: 'blur(25px) saturate(1.8)',
          border: '1px solid rgba(255, 255, 255, 0.4)',
          boxShadow: '0 8px 32px rgba(31, 38, 135, 0.12), inset 0 1px 1px rgba(255, 255, 255, 0.6)'
        }}
      >
        <h2 style={{
          fontFamily: '"Bodoni Moda", serif',
          fontSize: '24px',
          fontWeight: '600',
          color: '#002147',
          marginBottom: '16px'
        }}>
          Event Timeline ({filteredEvents.length} events)
        </h2>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-wedding-navy mx-auto"></div>
          </div>
        ) : Object.keys(groupedEvents).length === 0 ? (
          <div className="text-center py-8">
            <p style={{
              fontFamily: '"Montserrat", sans-serif',
              fontSize: '16px',
              color: 'rgba(0, 0, 0, 0.6)'
            }}>
              {searchTerm || typeFilter !== 'all' ? 
                'No events found matching your criteria.' : 
                'No events scheduled yet. Click "Add Event" to get started.'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedEvents)
              .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
              .map(([date, dayEvents]) => (
                <div key={date} className="space-y-3">
                  {/* Date Header */}
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-wedding-navy rounded-full"></div>
                    <h3 style={{
                      fontFamily: '"Bodoni Moda", serif',
                      fontSize: '20px',
                      fontWeight: '600',
                      color: '#002147'
                    }}>
                      {new Date(date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </h3>
                    <div className="flex-1 h-px bg-gray-200"></div>
                  </div>
                  
                  {/* Events for this date */}
                  <div className="ml-6 space-y-3">
                    <AnimatePresence>
                      {dayEvents
                        .sort((a, b) => a.start_time.localeCompare(b.start_time))
                        .map((event) => (
                          <motion.div
                            key={event.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className={`flex items-center gap-3 p-4 rounded-xl transition-all duration-300 hover:scale-[1.01] ${styles.liquidGlassCard}`}
                            style={{
                              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.2) 100%)',
                              backdropFilter: 'blur(20px) saturate(1.8)',
                              WebkitBackdropFilter: 'blur(20px) saturate(1.8)',
                              border: '1px solid rgba(255, 255, 255, 0.35)',
                              boxShadow: '0 4px 12px rgba(31, 38, 135, 0.08), inset 0 1px 1px rgba(255, 255, 255, 0.6)'
                            }}
                          >
                            <div className="w-2 h-2 bg-wedding-gold rounded-full"></div>
                            
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 style={{
                                  fontFamily: '"Montserrat", sans-serif',
                                  fontSize: '16px',
                                  fontWeight: '600',
                                  color: '#002147'
                                }}>{event.title}</h4>
                                <Badge className={EVENT_TYPE_COLORS[event.event_type]}>
                                  {event.event_type}
                                </Badge>
                                {!event.is_public && (
                                  <Badge variant="outline" className="text-xs">
                                    Private
                                  </Badge>
                                )}
                              </div>
                              
                              <div className="flex items-center gap-4 flex-wrap" style={{
                                fontFamily: '"Montserrat", sans-serif',
                                fontSize: '14px',
                                color: 'rgba(0, 0, 0, 0.6)'
                              }}>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {event.start_time}
                                  {event.end_time && ` - ${event.end_time}`}
                                </span>
                                {event.location && (
                                  <span className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    {event.location}
                                  </span>
                                )}
                                {event.max_attendees && (
                                  <span className="flex items-center gap-1">
                                    <Users className="w-3 h-3" />
                                    Max {event.max_attendees}
                                  </span>
                                )}
                              </div>
                              
                              {event.description && (
                                <p className="mt-1 line-clamp-2" style={{
                                  fontFamily: '"Montserrat", sans-serif',
                                  fontSize: '14px',
                                  color: 'rgba(0, 0, 0, 0.5)'
                                }}>
                                  {event.description}
                                </p>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleEdit(event)}
                                className={`rounded-full transition-all duration-200 hover:scale-110 ${styles.actionButton}`}
                                style={{
                                  width: '36px',
                                  height: '36px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0.25) 100%)',
                                  backdropFilter: 'blur(15px) saturate(1.5)',
                                  WebkitBackdropFilter: 'blur(15px) saturate(1.5)',
                                  border: '1px solid rgba(255, 255, 255, 0.4)',
                                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.06)'
                                }}
                              >
                                <Edit3 className="w-4 h-4" style={{ color: 'rgba(0, 0, 0, 0.7)' }} />
                              </button>
                              <button
                                onClick={() => handleDelete(event.id)}
                                className={`rounded-full transition-all duration-200 hover:scale-110 ${styles.actionButton}`}
                                style={{
                                  width: '36px',
                                  height: '36px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(239, 68, 68, 0.15) 100%)',
                                  backdropFilter: 'blur(15px) saturate(1.5)',
                                  WebkitBackdropFilter: 'blur(15px) saturate(1.5)',
                                  border: '1px solid rgba(239, 68, 68, 0.3)',
                                  boxShadow: '0 2px 6px rgba(239, 68, 68, 0.15)'
                                }}
                              >
                                <Trash2 className="w-4 h-4" style={{ color: '#dc2626' }} />
                              </button>
                            </div>
                          </motion.div>
                        ))}
                    </AnimatePresence>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminEvents;