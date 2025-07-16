import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  Download, 
  Upload,
  CheckCircle,
  Clock,
  XCircle,
  Archive,
  UserCheck,
  UserX,
  MessageSquare,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Settings,
  RefreshCw,
  AlertTriangle,
  Heart,
  Star,
  Eye,
  EyeOff
} from 'lucide-react';
import GlassCard from '@/components/GlassCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
import { useAuth } from '@/hooks/useAuth';
import SupabaseTest from '@/components/debug/SupabaseTest';

interface Guest {
  id: string;
  user_id?: string; // Linked user account ID
  first_name: string | null;
  last_name: string | null;
  display_name: string | null;
  email: string;
  phone: string | null;
  rsvp_status: 'pending' | 'confirmed' | 'declined';
  rsvp_responded_at: string | null;
  plus_one_name: string | null;
  plus_one_email: string | null;
  dietary_needs: string[] | null;
  allergies: string[] | null;
  contact_details: {
    address?: string;
    emergency_contact?: string;
    relationship?: string;
  } | null;
  table_assignment: string | null;
  invitation_sent_at: string | null;
  rsvp_deadline: string | null;
  special_requests: string | null;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
  user_roles?: { role: string }[];
}

interface RSVPResponse {
  guest_id: string;
  rsvp_status: 'confirmed' | 'declined';
  plus_one_name?: string;
  dietary_needs?: string[];
  allergies?: string[];
  special_requests?: string;
  new_guests?: {
    first_name: string;
    last_name: string;
    email: string;
    relationship: string;
  }[];
}

const RSVP_STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  confirmed: 'bg-green-100 text-green-800 border-green-200',
  declined: 'bg-red-100 text-red-800 border-red-200'
} as const;

const RSVP_STATUS_ICONS = {
  pending: Clock,
  confirmed: CheckCircle,
  declined: XCircle
} as const;

const CentralGuestList: React.FC = () => {
  const { user } = useAuth();
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showArchived, setShowArchived] = useState(false);
  const [showLinkedOnly, setShowLinkedOnly] = useState(false);
  const [isProcessingRSVP, setIsProcessingRSVP] = useState(false);
  const [selectedGuests, setSelectedGuests] = useState<string[]>([]);

  useEffect(() => {
    fetchGuests();
  }, [showArchived]);

  const fetchGuests = useCallback(async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('guest_list')
        .select(`
          id,
          name,
          mobile_number,
          email_address,
          guest_of,
          relationship_to_couple,
          table_number,
          dietary_requirements,
          rsvp_status,
          confirmed_attendance,
          plus_one_invited,
          plus_one_name,
          matched_user_id,
          notes,
          created_at,
          updated_at
        `)
        .order('name', { ascending: true });

      if (error) throw error;

      // Map guest_list data to Guest interface for compatibility
      const guestData: Guest[] = data?.map(guest => ({
        id: guest.id,
        user_id: guest.matched_user_id,
        first_name: guest.name?.split(' ')[0] || null,
        last_name: guest.name?.split(' ').slice(1).join(' ') || null,
        display_name: guest.name,
        email: guest.email_address || '',
        phone: guest.mobile_number,
        rsvp_status: guest.confirmed_attendance ? 'confirmed' : (guest.rsvp_status === 'declined' ? 'declined' : 'pending'),
        rsvp_responded_at: guest.rsvp_status ? guest.updated_at : null,
        plus_one_name: guest.plus_one_name,
        plus_one_email: null,
        dietary_needs: guest.dietary_requirements ? [guest.dietary_requirements] : null,
        allergies: null,
        contact_details: {
          relationship: guest.relationship_to_couple
        },
        table_assignment: guest.table_number?.toString() || null,
        invitation_sent_at: null,
        rsvp_deadline: null,
        special_requests: guest.notes,
        is_archived: false,
        created_at: guest.created_at,
        updated_at: guest.updated_at,
        user_roles: []
      })) || [];

      setGuests(guestData);
    } catch (error) {
      console.error('Error fetching guests:', error);
      toast.error('Failed to load guests');
    } finally {
      setLoading(false);
    }
  }, [showArchived]);

  const processRSVPResponse = async (response: RSVPResponse) => {
    try {
      setIsProcessingRSVP(true);
      
      // Update main guest RSVP status
      const { error: updateError } = await supabase
        .from('guest_list')
        .update({
          rsvp_status: response.rsvp_status,
          confirmed_attendance: response.rsvp_status === 'confirmed',
          plus_one_name: response.plus_one_name,
          dietary_requirements: response.dietary_needs?.[0] || null,
          notes: response.special_requests,
          updated_at: new Date().toISOString()
        })
        .eq('id', response.guest_id);

      if (updateError) throw updateError;

      // Add new guests if any (when someone RSVPs and brings additional people)
      if (response.new_guests && response.new_guests.length > 0) {
        const newGuestInserts = response.new_guests.map(newGuest => ({
          first_name: newGuest.first_name,
          last_name: newGuest.last_name,
          email: newGuest.email,
          rsvp_status: 'confirmed',
          rsvp_responded_at: new Date().toISOString(),
          contact_details: { relationship: newGuest.relationship }
        }));

        const { error: insertError } = await supabase
          .from('profiles')
          .insert(newGuestInserts);

        if (insertError) throw insertError;
        
        toast.success(`Added ${response.new_guests.length} new guest(s) from RSVP response`);
      }

      // Archive guest if they declined (optional cleanup)
      if (response.rsvp_status === 'declined') {
        await archiveGuest(response.guest_id);
      }

      await fetchGuests();
      toast.success('RSVP response processed successfully');
    } catch (error) {
      console.error('Error processing RSVP:', error);
      toast.error('Failed to process RSVP response');
    } finally {
      setIsProcessingRSVP(false);
    }
  };

  const linkGuestToUser = async (guestId: string, userId?: string) => {
    try {
      const targetUserId = userId || user?.id;
      if (!targetUserId) {
        toast.error('No user account to link to');
        return;
      }

      const { error } = await supabase
        .from('guest_list')
        .update({ matched_user_id: targetUserId })
        .eq('id', guestId);

      if (error) throw error;

      await fetchGuests();
      toast.success('Guest linked to user account');
    } catch (error) {
      console.error('Error linking guest to user:', error);
      toast.error('Failed to link guest to user account');
    }
  };

  const unlinkGuestFromUser = async (guestId: string) => {
    try {
      const { error } = await supabase
        .from('guest_list')
        .update({ matched_user_id: null })
        .eq('id', guestId);

      if (error) throw error;

      await fetchGuests();
      toast.success('Guest unlinked from user account');
    } catch (error) {
      console.error('Error unlinking guest:', error);
      toast.error('Failed to unlink guest');
    }
  };

  const archiveGuest = async (guestId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          is_archived: true,
          archived_at: new Date().toISOString()
        })
        .eq('id', guestId);

      if (error) throw error;

      if (!showArchived) {
        setGuests(prev => prev.filter(guest => guest.id !== guestId));
      }
      
      toast.success('Guest archived successfully');
    } catch (error) {
      console.error('Error archiving guest:', error);
      toast.error('Failed to archive guest');
    }
  };

  const restoreGuest = async (guestId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          is_archived: false,
          archived_at: null
        })
        .eq('id', guestId);

      if (error) throw error;

      await fetchGuests();
      toast.success('Guest restored successfully');
    } catch (error) {
      console.error('Error restoring guest:', error);
      toast.error('Failed to restore guest');
    }
  };

  const bulkArchiveSelected = async () => {
    if (selectedGuests.length === 0) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          is_archived: true,
          archived_at: new Date().toISOString()
        })
        .in('id', selectedGuests);

      if (error) throw error;

      setSelectedGuests([]);
      await fetchGuests();
      toast.success(`Archived ${selectedGuests.length} guest(s)`);
    } catch (error) {
      console.error('Error bulk archiving:', error);
      toast.error('Failed to archive selected guests');
    }
  };

  const syncGuestAccounts = async () => {
    try {
      setLoading(true);
      
      // Refresh the guest list data
      await fetchGuests();
      toast.success('Guest list refreshed');
    } catch (error) {
      console.error('Error syncing guest accounts:', error);
      toast.error('Failed to sync guest accounts');
    } finally {
      setLoading(false);
    }
  };

  const filteredGuests = guests.filter(guest => {
    const matchesSearch = 
      guest.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guest.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${guest.first_name || ''} ${guest.last_name || ''}`.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || guest.rsvp_status === statusFilter;
    const matchesLinked = !showLinkedOnly || guest.user_id !== null;
    
    return matchesSearch && matchesStatus && matchesLinked;
  });

  const stats = [
    { 
      label: 'Total Guests', 
      value: guests.length, 
      icon: Users, 
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    { 
      label: 'Linked Accounts', 
      value: guests.filter(g => g.user_id).length, 
      icon: UserCheck, 
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    { 
      label: 'Confirmed RSVPs', 
      value: guests.filter(g => g.rsvp_status === 'confirmed').length, 
      icon: CheckCircle, 
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    { 
      label: 'Pending RSVPs', 
      value: guests.filter(g => g.rsvp_status === 'pending').length, 
      icon: Clock, 
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    }
  ];

  return (
    <div className="min-h-screen px-5 pt-12 pb-6">
      {/* Debug Test */}
      <SupabaseTest />
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-[#2d3f51] flex items-center gap-2">
            <Heart className="w-6 h-6 text-wedding-gold" />
            Central Guest List
          </h1>
          <p className="text-sm text-[#7a736b]">
            The heart of your wedding - where every guest account and RSVP connects
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={syncGuestAccounts}
            className="border-wedding-navy text-wedding-navy hover:bg-wedding-navy hover:text-white"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Sync Accounts
          </Button>
          {selectedGuests.length > 0 && (
            <Button 
              variant="outline" 
              onClick={bulkArchiveSelected}
              className="border-orange-500 text-orange-600 hover:bg-orange-500 hover:text-white"
            >
              <Archive className="w-4 h-4 mr-2" />
              Archive Selected ({selectedGuests.length})
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <GlassCard key={index} className="p-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div>
                  <div className="text-xl font-semibold text-[#2d3f51]">{stat.value}</div>
                  <div className="text-xs text-[#7a736b]">{stat.label}</div>
                </div>
              </div>
            </GlassCard>
          );
        })}
      </div>

      {/* Filters & Controls */}
      <GlassCard className="p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-[#7a736b]" />
            <Input
              placeholder="Search guests by name, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="declined">Declined</SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              variant={showLinkedOnly ? "default" : "outline"}
              size="sm"
              onClick={() => setShowLinkedOnly(!showLinkedOnly)}
              className="text-xs"
            >
              <UserCheck className="w-3 h-3 mr-1" />
              Linked Only
            </Button>
            
            <Button
              variant={showArchived ? "default" : "outline"}
              size="sm"
              onClick={() => setShowArchived(!showArchived)}
              className="text-xs"
            >
              {showArchived ? <EyeOff className="w-3 h-3 mr-1" /> : <Eye className="w-3 h-3 mr-1" />}
              {showArchived ? "Hide Archived" : "Show Archived"}
            </Button>
          </div>
        </div>
      </GlassCard>

      {/* Guest List */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[#2d3f51]">
            Guests ({filteredGuests.length})
            {showArchived && (
              <Badge variant="outline" className="ml-2 text-orange-600 border-orange-200">
                Including Archived
              </Badge>
            )}
          </h2>
          
          {filteredGuests.length > 0 && (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (selectedGuests.length === filteredGuests.length) {
                    setSelectedGuests([]);
                  } else {
                    setSelectedGuests(filteredGuests.map(g => g.id));
                  }
                }}
              >
                {selectedGuests.length === filteredGuests.length ? 'Deselect All' : 'Select All'}
              </Button>
            </div>
          )}
        </div>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2d3f51] mx-auto"></div>
          </div>
        ) : filteredGuests.length === 0 ? (
          <div className="text-center py-8 text-[#7a736b]">
            {searchTerm || statusFilter !== 'all' || showLinkedOnly ? 
              'No guests found matching your criteria.' : 
              'No guests found. Use "Sync Accounts" to populate from user accounts.'
            }
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {filteredGuests.map((guest) => {
                const StatusIcon = RSVP_STATUS_ICONS[guest.rsvp_status];
                const isSelected = selectedGuests.includes(guest.id);
                
                return (
                  <motion.div
                    key={guest.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`relative flex items-center justify-between p-4 rounded-lg transition-all ${
                      isSelected 
                        ? 'bg-blue-50 border-2 border-blue-200' 
                        : guest.is_archived 
                          ? 'bg-gray-50 border border-gray-200 opacity-60'
                          : 'bg-white/20 hover:bg-white/30 border border-transparent'
                    }`}
                  >
                    {/* Selection Checkbox */}
                    <div className="absolute left-2 top-2">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedGuests(prev => [...prev, guest.id]);
                          } else {
                            setSelectedGuests(prev => prev.filter(id => id !== guest.id));
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                    </div>
                    
                    <div className="flex items-center gap-3 ml-8 flex-1">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-[#2d3f51] flex items-center justify-center">
                          <span className="text-white font-medium">
                            {guest.display_name?.[0] || guest.first_name?.[0] || guest.email[0].toUpperCase()}
                          </span>
                        </div>
                        
                        {/* User Link Indicator */}
                        {guest.user_id && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center">
                            <UserCheck className="w-2 h-2 text-white" />
                          </div>
                        )}
                        
                        {/* Archive Indicator */}
                        {guest.is_archived && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center">
                            <Archive className="w-2 h-2 text-white" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="font-medium text-[#2d3f51] flex items-center gap-2">
                          {guest.display_name || `${guest.first_name || ''} ${guest.last_name || ''}`.trim() || 'Unnamed Guest'}
                          {guest.plus_one_name && (
                            <Badge variant="outline" className="text-xs">
                              +1: {guest.plus_one_name}
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-[#7a736b] flex items-center gap-4 flex-wrap">
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {guest.email}
                          </span>
                          {guest.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {guest.phone}
                            </span>
                          )}
                          {guest.contact_details?.relationship && (
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {guest.contact_details.relationship}
                            </span>
                          )}
                          {guest.rsvp_responded_at && (
                            <span className="flex items-center gap-1 text-green-600">
                              <Calendar className="w-3 h-3" />
                              Responded {new Date(guest.rsvp_responded_at).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Badge className={RSVP_STATUS_COLORS[guest.rsvp_status]}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {guest.rsvp_status.charAt(0).toUpperCase() + guest.rsvp_status.slice(1)}
                      </Badge>
                      
                      {(guest.dietary_needs?.length || guest.allergies?.length) && (
                        <Badge variant="outline" className="text-orange-600 border-orange-200">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Dietary
                        </Badge>
                      )}
                      
                      {guest.table_assignment && (
                        <Badge variant="outline" className="text-blue-600 border-blue-200">
                          Table {guest.table_assignment}
                        </Badge>
                      )}
                      
                      <div className="flex items-center gap-1">
                        {/* Link/Unlink User Account */}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => guest.user_id ? unlinkGuestFromUser(guest.id) : linkGuestToUser(guest.id)}
                          className={`w-8 h-8 p-0 ${guest.user_id ? 'text-purple-600' : 'text-gray-400'}`}
                          title={guest.user_id ? 'Unlink from user account' : 'Link to user account'}
                        >
                          <UserCheck className="w-4 h-4" />
                        </Button>
                        
                        {/* Archive/Restore */}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => guest.is_archived ? restoreGuest(guest.id) : archiveGuest(guest.id)}
                          className={`w-8 h-8 p-0 ${guest.is_archived ? 'text-green-600' : 'text-orange-600'}`}
                          title={guest.is_archived ? 'Restore guest' : 'Archive guest'}
                        >
                          {guest.is_archived ? <RefreshCw className="w-4 h-4" /> : <Archive className="w-4 h-4" />}
                        </Button>
                        
                        {/* Settings */}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="w-8 h-8 p-0"
                          title="Guest settings"
                        >
                          <Settings className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </GlassCard>
      
      {/* RSVP Processing Status */}
      {isProcessingRSVP && (
        <div className="fixed bottom-4 right-4 z-50">
          <GlassCard className="p-4 flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-wedding-navy"></div>
            <span className="text-sm text-[#2d3f51]">Processing RSVP response...</span>
          </GlassCard>
        </div>
      )}
    </div>
  );
};

export default CentralGuestList;