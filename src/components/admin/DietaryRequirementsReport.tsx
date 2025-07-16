import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Download, Search, Filter, AlertTriangle, Users, Utensils } from 'lucide-react';
import GlassCard from '@/components/GlassCard';
import { Badge } from '@/components/ui/badge';

interface DietaryRequirement {
  id: string;
  rsvp_id: string;
  dietary_option_id?: string;
  custom_requirement?: string;
  severity?: string;
  notes?: string;
  created_at: string;
  rsvp: {
    id: string;
    status: string;
    guest_count: number;
    event_id: string;
    profiles: {
      first_name?: string;
      last_name?: string;
      email: string;
      mobile?: string;
    };
    wedding_events: {
      title: string;
      event_date: string;
    };
  };
}

const DIETARY_OPTION_NAMES: Record<string, string> = {
  vegetarian: 'Vegetarian',
  vegan: 'Vegan',
  gluten_free: 'Gluten-Free',
  dairy_free: 'Dairy-Free',
  nut_allergy: 'Nut Allergy',
  shellfish_allergy: 'Shellfish Allergy',
  halal: 'Halal',
  kosher: 'Kosher',
  low_sodium: 'Low Sodium',
  diabetic: 'Diabetic-Friendly'
};

const DietaryRequirementsReport: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [requirements, setRequirements] = useState<DietaryRequirement[]>([]);
  const [filteredRequirements, setFilteredRequirements] = useState<DietaryRequirement[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [eventFilter, setEventFilter] = useState('all');
  const [events, setEvents] = useState<Array<{id: string; title: string}>>([]);
  const [stats, setStats] = useState({
    totalWithRequirements: 0,
    totalGuests: 0,
    allergyCount: 0,
    severeAllergyCount: 0,
    dietaryPreferences: {} as Record<string, number>
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterRequirements();
  }, [requirements, searchTerm, statusFilter, severityFilter, eventFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch dietary requirements with related data
      const { data: requirementsData, error: reqError } = await (supabase as any)
        .from('dietary_requirements')
        .select(`
          *,
          rsvp:rsvps (
            id,
            status,
            guest_count,
            event_id,
            profiles (
              first_name,
              last_name,
              email,
              mobile
            ),
            wedding_events (
              title,
              event_date
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (reqError) throw reqError;

      // Fetch events for filter
      const { data: eventsData, error: eventsError } = await (supabase as any)
        .from('wedding_events')
        .select('id, title')
        .order('event_date', { ascending: true });

      if (eventsError) throw eventsError;

      setRequirements(requirementsData as any || []);
      setEvents(eventsData as any || []);
      calculateStats(requirementsData as any || []);
    } catch (error) {
      console.error('Error fetching dietary requirements:', error);
      toast({
        title: "Error",
        description: "Failed to load dietary requirements",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data: DietaryRequirement[]) => {
    const stats = {
      totalWithRequirements: new Set(data.map(r => r.rsvp_id)).size,
      totalGuests: data.reduce((sum, r) => sum + (r.rsvp.guest_count || 1), 0),
      allergyCount: data.filter(r => r.severity).length,
      severeAllergyCount: data.filter(r => r.severity === 'severe').length,
      dietaryPreferences: {} as Record<string, number>
    };

    // Count dietary preferences
    data.forEach(req => {
      if (req.dietary_option_id) {
        const optionName = DIETARY_OPTION_NAMES[req.dietary_option_id] || req.dietary_option_id;
        stats.dietaryPreferences[optionName] = (stats.dietaryPreferences[optionName] || 0) + 1;
      }
    });

    setStats(stats);
  };

  const filterRequirements = () => {
    let filtered = [...requirements];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(req =>
        req.rsvp.profiles.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.rsvp.profiles.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.rsvp.profiles.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.custom_requirement?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(req => req.rsvp.status === statusFilter);
    }

    // Severity filter
    if (severityFilter !== 'all') {
      if (severityFilter === 'none') {
        filtered = filtered.filter(req => !req.severity);
      } else {
        filtered = filtered.filter(req => req.severity === severityFilter);
      }
    }

    // Event filter
    if (eventFilter !== 'all') {
      filtered = filtered.filter(req => req.rsvp.event_id === eventFilter);
    }

    setFilteredRequirements(filtered);
  };

  const exportToCSV = () => {
    const csvData = filteredRequirements.map(req => ({
      'Guest Name': `${req.rsvp.profiles.first_name || ''} ${req.rsvp.profiles.last_name || ''}`.trim(),
      'Email': req.rsvp.profiles.email,
      'Mobile': req.rsvp.profiles.mobile || '',
      'Event': req.rsvp.wedding_events.title,
      'Guest Count': req.rsvp.guest_count,
      'RSVP Status': req.rsvp.status,
      'Dietary Requirement': req.dietary_option_id ? DIETARY_OPTION_NAMES[req.dietary_option_id] : 'Custom',
      'Custom Requirement': req.custom_requirement || '',
      'Severity': req.severity || 'None',
      'Notes': req.notes || '',
      'Created': new Date(req.created_at).toLocaleDateString()
    }));

    const csv = [
      Object.keys(csvData[0] || {}).join(','),
      ...csvData.map(row => Object.values(row).map(val => `"${val}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dietary-requirements-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case 'severe': return 'bg-red-100 text-red-800';
      case 'moderate': return 'bg-yellow-100 text-yellow-800';
      case 'mild': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <GlassCard className="p-4">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-wedding-navy" />
            <div>
              <div className="text-2xl font-bold text-wedding-navy">{stats.totalWithRequirements}</div>
              <div className="text-sm text-muted-foreground">Guests with Requirements</div>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="flex items-center gap-3">
            <Utensils className="w-8 h-8 text-wedding-navy" />
            <div>
              <div className="text-2xl font-bold text-wedding-navy">{stats.totalGuests}</div>
              <div className="text-sm text-muted-foreground">Total Guests Affected</div>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-yellow-600" />
            <div>
              <div className="text-2xl font-bold text-yellow-600">{stats.allergyCount}</div>
              <div className="text-sm text-muted-foreground">Allergies Reported</div>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-red-600" />
            <div>
              <div className="text-2xl font-bold text-red-600">{stats.severeAllergyCount}</div>
              <div className="text-sm text-muted-foreground">Severe Allergies</div>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Filters and Search */}
      <GlassCard className="p-6">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              <Input
                placeholder="Search guests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="attending">Attending</SelectItem>
                <SelectItem value="not_attending">Not Attending</SelectItem>
                <SelectItem value="maybe">Maybe</SelectItem>
              </SelectContent>
            </Select>

            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="severe">Severe</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="mild">Mild</SelectItem>
                <SelectItem value="none">No Severity</SelectItem>
              </SelectContent>
            </Select>

            <Select value={eventFilter} onValueChange={setEventFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Event" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                {events.map(event => (
                  <SelectItem key={event.id} value={event.id}>{event.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button onClick={exportToCSV} className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        </div>
      </GlassCard>

      {/* Requirements List */}
      <GlassCard className="p-6">
        <h3 className="text-lg font-semibold text-wedding-navy mb-4">
          Dietary Requirements ({filteredRequirements.length})
        </h3>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-wedding-navy mx-auto"></div>
          </div>
        ) : filteredRequirements.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No dietary requirements found matching your filters.
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRequirements.map((req) => (
              <div key={req.id} className="p-4 rounded-lg bg-secondary/30 border border-border/20">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-wedding-navy">
                        {req.rsvp.profiles.first_name} {req.rsvp.profiles.last_name}
                      </h4>
                      <Badge variant="outline" className="text-xs">
                        {req.rsvp.guest_count} guest{req.rsvp.guest_count !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                    
                    <div className="text-sm text-muted-foreground mb-2">
                      {req.rsvp.profiles.email}
                      {req.rsvp.profiles.mobile && ` • ${req.rsvp.profiles.mobile}`}
                    </div>
                    
                    <div className="text-sm text-muted-foreground mb-3">
                      {req.rsvp.wedding_events.title} • {new Date(req.rsvp.wedding_events.event_date).toLocaleDateString()}
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Requirement:</span>
                        <Badge variant="secondary">
                          {req.dietary_option_id ? DIETARY_OPTION_NAMES[req.dietary_option_id] : 'Custom'}
                        </Badge>
                      </div>
                      
                      {req.custom_requirement && (
                        <div className="text-sm">
                          <span className="font-medium">Details:</span> {req.custom_requirement}
                        </div>
                      )}
                      
                      {req.notes && (
                        <div className="text-sm">
                          <span className="font-medium">Notes:</span> {req.notes}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant={req.rsvp.status === 'attending' ? 'default' : 'secondary'}>
                      {req.rsvp.status}
                    </Badge>
                    
                    {req.severity && (
                      <Badge className={getSeverityColor(req.severity)}>
                        {req.severity} severity
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>

      {/* Dietary Preferences Summary */}
      {Object.keys(stats.dietaryPreferences).length > 0 && (
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-wedding-navy mb-4">
            Dietary Preferences Summary
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(stats.dietaryPreferences).map(([preference, count]) => (
              <div key={preference} className="text-center p-3 rounded-lg bg-secondary/30">
                <div className="text-2xl font-bold text-wedding-navy">{count}</div>
                <div className="text-sm text-muted-foreground">{preference}</div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
};

export default DietaryRequirementsReport;