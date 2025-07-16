import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  RSVPStats, 
  RSVPFilters, 
  RSVPList, 
  SeatingPlan, 
  RSVPSummary,
  type EnhancedRSVP,
  type RSVPEvent,
  type SeatingTable,
  type RealTimeStats
} from './rsvp-management';
import type { RSVPStats as RSVPStatsType } from './rsvp-management/types';

interface RSVPManagementProps {
  rsvps: EnhancedRSVP[];
  onRefresh: () => void;
}

const RSVPManagement: React.FC<RSVPManagementProps> = ({ rsvps, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedEvent, setSelectedEvent] = useState('all');
  const [showSeatingPlan, setShowSeatingPlan] = useState(false);
  const [showReminderDialog, setShowReminderDialog] = useState(false);
  const [events, setEvents] = useState<RSVPEvent[]>([]);
  const [seatingTables, setSeatingTables] = useState<SeatingTable[]>([]);
  const [realTimeStats, setRealTimeStats] = useState<RealTimeStats>({
    lastUpdated: new Date(),
    totalCapacity: 0,
    confirmedGuests: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    loadEvents();
    loadSeatingTables();
    setupRealTimeUpdates();
  }, []);

  const loadEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('wedding_events')
        .select('*')
        .order('event_date');

      if (error) throw error;
      
      const eventsWithDeadlines = (data || []).map(event => {
        const eventData = event as any;
        const eventDate = eventData.event_date || eventData.date || new Date().toISOString();
        return {
          id: eventData.id,
          title: eventData.title || eventData.name || 'Untitled Event',
          event_date: eventDate,
          description: eventData.description || '',
          location: eventData.location || '',
          venue_name: eventData.venue_name || '',
          is_main_event: eventData.is_main_event || false,
          dress_code: eventData.dress_code || '',
          notes: eventData.notes || '',
          created_at: eventData.created_at || new Date().toISOString(),
          updated_at: eventData.updated_at || new Date().toISOString(),
          address: eventData.address || '',
          rsvp_deadline: new Date(new Date(eventDate).getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          max_capacity: 150 // Mock capacity
        };
      }) as RSVPEvent[];
      
      setEvents(eventsWithDeadlines);
    } catch (error) {
      console.error('Error loading events:', error);
    }
  };

  const loadSeatingTables = () => {
    // Mock seating tables for Sprint 3 - would be loaded from database
    const mockTables: SeatingTable[] = Array.from({ length: 15 }, (_, i) => ({
      id: `table-${i + 1}`,
      table_number: i + 1,
      capacity: i === 0 ? 12 : 8, // Head table has more capacity
      assigned_guests: Math.floor(Math.random() * (i === 0 ? 12 : 8)),
      special_requirements: i === 0 ? 'Head table' : i < 3 ? 'Close to dance floor' : undefined
    }));
    setSeatingTables(mockTables);
  };

  const setupRealTimeUpdates = () => {
    const channel = supabase
      .channel('rsvp-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rsvps'
        },
        (payload) => {
          
          setRealTimeStats(prev => ({
            ...prev,
            lastUpdated: new Date()
          }));
          onRefresh();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const filteredRSVPs = rsvps.filter(rsvp => {
    const matchesSearch = rsvp.profiles.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${rsvp.profiles.first_name} ${rsvp.profiles.last_name}`.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || rsvp.status === filterStatus;
    const matchesEvent = selectedEvent === 'all' || rsvp.event_id === selectedEvent;
    
    return matchesSearch && matchesStatus && matchesEvent;
  });

  const enhancedStats: RSVPStatsType = {
    total: rsvps.length,
    attending: rsvps.filter(r => r.status === 'attending').length,
    declined: rsvps.filter(r => r.status === 'declined').length,
    pending: rsvps.filter(r => r.status === 'pending').length,
    maybe: rsvps.filter(r => r.status === 'maybe').length,
    totalGuests: rsvps.filter(r => r.status === 'attending').reduce((sum, r) => sum + (r.guest_count || 1), 0),
    registeredUsers: rsvps.filter(r => r.profiles.first_name && r.profiles.last_name && r.status === 'attending').length,
    unregisteredGuests: rsvps.filter(r => (!r.profiles.first_name || !r.profiles.last_name) && r.status === 'attending').length,
    dietaryRestrictions: rsvps.filter(r => r.dietary_restrictions).length,
    plusOnes: rsvps.filter(r => r.plus_one_name && r.status === 'attending').length,
    needAccommodation: rsvps.filter(r => r.accommodation_needed && r.status === 'attending').length,
    needTransportation: rsvps.filter(r => r.transportation_needed && r.status === 'attending').length,
    responseRate: rsvps.length > 0 ? Math.round(((rsvps.filter(r => r.status !== 'pending').length) / rsvps.length) * 100) : 0,
    capacityUsed: 0 // Will be calculated based on venue capacity
  };

  // Calculate capacity usage
  const totalCapacity = events.reduce((sum, event) => sum + (event.max_capacity || 0), 0);
  enhancedStats.capacityUsed = totalCapacity > 0 ? Math.round((enhancedStats.totalGuests / totalCapacity) * 100) : 0;

  const sendRSVPReminders = async () => {
    try {
      const pendingRSVPs = rsvps.filter(r => r.status === 'pending');
      
      // Mock reminder sending - would integrate with email service
      toast({
        title: "Reminders Sent",
        description: `RSVP reminders sent to ${pendingRSVPs.length} guests`,
      });
      
      setShowReminderDialog(false);
    } catch (error) {
      console.error('Error sending reminders:', error);
      toast({
        title: "Error",
        description: "Failed to send reminders",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Real-time Enhanced Stats */}
      <RSVPStats stats={enhancedStats} />

      {/* Enhanced Actions and Filters */}
      <RSVPFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        selectedEvent={selectedEvent}
        setSelectedEvent={setSelectedEvent}
        events={events}
        pendingCount={enhancedStats.pending}
        onSendReminders={sendRSVPReminders}
        showReminderDialog={showReminderDialog}
        setShowReminderDialog={setShowReminderDialog}
      />

      {/* Seating Plan Toggle */}
      <SeatingPlan
        showSeatingPlan={showSeatingPlan}
        setShowSeatingPlan={setShowSeatingPlan}
        seatingTables={seatingTables}
        realTimeStats={realTimeStats}
      />

      {/* Enhanced RSVP List */}
      <RSVPList rsvps={filteredRSVPs} />

      {/* Enhanced Summary */}
      <RSVPSummary stats={enhancedStats} events={events} />
    </div>
  );
};

export default RSVPManagement;