import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Download, 
  Upload,
  CheckCircle, 
  Clock, 
  XCircle, 
  Users, 
  Search, 
  Filter,
  Mail,
  Phone,
  Calendar,
  AlertTriangle,
  Edit3,
  MessageSquare,
  Eye,
  Trash2,
  UserPlus,
  RefreshCw,
  BarChart3
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
import { GuestManager } from '@/utils/guestManagement';

interface Guest {
  id: string;
  first_name: string | null;
  last_name: string | null;
  display_name: string | null;
  email: string;
  phone: string | null;
  rsvp_status: 'pending' | 'confirmed' | 'declined';
  rsvp_responded_at: string | null;
  rsvp_deadline: string | null;
  plus_one_name: string | null;
  plus_one_email: string | null;
  dietary_needs: string[] | null;
  allergies: string[] | null;
  special_requests: string | null;
  table_assignment: string | null;
  contact_details: any | null;
  invitation_sent_at: string | null;
  created_at: string;
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

const AdminRSVPs: React.FC = () => {
  const navigate = useNavigate();
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showOverdueOnly, setShowOverdueOnly] = useState(false);
  const [selectedGuests, setSelectedGuests] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [rsvpStats, setRsvpStats] = useState({
    total: 0,
    confirmed: 0,
    pending: 0,
    declined: 0,
    responseRate: 0,
    overdue: 0
  });

  useEffect(() => {
    fetchRSVPs();
  }, []);

  const fetchRSVPs = async () => {
    try {
      setLoading(true);
      const guestData = await GuestManager.getAllGuests({ includeArchived: false });
      setGuests(guestData);
      
      // Calculate stats
      const stats = await GuestManager.getGuestStats();
      setRsvpStats({
        total: stats.total,
        confirmed: stats.confirmed,
        pending: stats.pending,
        declined: stats.declined,
        responseRate: Math.round((stats.confirmed + stats.declined) / stats.total * 100) || 0,
        overdue: guestData.filter(g => 
          g.rsvp_deadline && 
          new Date(g.rsvp_deadline) < new Date() && 
          g.rsvp_status === 'pending'
        ).length
      });
    } catch (error) {
      console.error('Error fetching RSVPs:', error);
      toast.error('Failed to load RSVP data');
    } finally {
      setLoading(false);
    }
  };

  const updateRSVPStatus = async (guestId: string, newStatus: 'pending' | 'confirmed' | 'declined') => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          rsvp_status: newStatus,
          rsvp_responded_at: newStatus !== 'pending' ? new Date().toISOString() : null
        })
        .eq('id', guestId);

      if (error) throw error;

      // Log the change
      await supabase
        .from('rsvp_history')
        .insert([{
          guest_id: guestId,
          new_status: newStatus,
          change_method: 'admin_update',
          change_reason: 'Admin manual update'
        }]);

      toast.success('RSVP status updated successfully');
      fetchRSVPs();
    } catch (error) {
      console.error('Error updating RSVP status:', error);
      toast.error('Failed to update RSVP status');
    }
  };

  const sendReminder = async (guestId: string) => {
    try {
      const guest = guests.find(g => g.id === guestId);
      if (!guest) return;

      // Log communication
      await supabase
        .from('guest_communications')
        .insert([{
          guest_id: guestId,
          communication_type: 'email',
          subject: 'RSVP Reminder',
          content: `RSVP reminder sent to ${guest.email}`,
          direction: 'outbound',
          status: 'sent'
        }]);

      toast.success('RSVP reminder sent successfully');
    } catch (error) {
      console.error('Error sending reminder:', error);
      toast.error('Failed to send reminder');
    }
  };

  const bulkSendReminders = async () => {
    try {
      const pendingGuests = selectedGuests.length > 0 
        ? guests.filter(g => selectedGuests.includes(g.id) && g.rsvp_status === 'pending')
        : guests.filter(g => g.rsvp_status === 'pending');

      for (const guest of pendingGuests) {
        await sendReminder(guest.id);
      }

      toast.success(`Sent reminders to ${pendingGuests.length} guests`);
      setSelectedGuests([]);
    } catch (error) {
      console.error('Error sending bulk reminders:', error);
      toast.error('Failed to send bulk reminders');
    }
  };

  const exportRSVPData = () => {
    try {
      const csvData = GuestManager.exportToCSV(guests);
      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `wedding-rsvps-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success('RSVP data exported successfully');
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Failed to export data');
    }
  };

  const filteredGuests = guests.filter(guest => {
    const matchesSearch = 
      guest.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guest.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${guest.first_name || ''} ${guest.last_name || ''}`.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || guest.rsvp_status === statusFilter;
    
    const matchesOverdue = !showOverdueOnly || (
      guest.rsvp_deadline &&
      new Date(guest.rsvp_deadline) < new Date() &&
      guest.rsvp_status === 'pending'
    );
    
    return matchesSearch && matchesStatus && matchesOverdue;
  });

  const stats = [
    { 
      label: 'Total Invites', 
      value: rsvpStats.total, 
      icon: Users, 
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    { 
      label: 'Confirmed', 
      value: rsvpStats.confirmed, 
      icon: CheckCircle, 
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    { 
      label: 'Pending', 
      value: rsvpStats.pending, 
      icon: Clock, 
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    { 
      label: 'Response Rate', 
      value: `${rsvpStats.responseRate}%`, 
      icon: BarChart3, 
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
            className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-[#7a736b]" />
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-[#2d3f51]">RSVP Management</h1>
            <p className="text-sm text-[#7a736b]">
              Track and manage wedding RSVPs
              {rsvpStats.overdue > 0 && (
                <span className="ml-2 text-orange-600 font-medium">
                  • {rsvpStats.overdue} overdue
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => fetchRSVPs()}
            variant="outline"
            size="sm"
            className="border-wedding-navy text-wedding-navy hover:bg-wedding-navy hover:text-white"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button 
            onClick={exportRSVPData}
            variant="outline"
            className="border-wedding-navy text-wedding-navy hover:bg-wedding-navy hover:text-white"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
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

      {/* Quick Actions */}
      {rsvpStats.pending > 0 && (
        <GlassCard className="p-4 mb-6 border-orange-200 bg-orange-50/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              <div>
                <div className="font-medium text-orange-800">
                  {rsvpStats.pending} pending RSVPs
                </div>
                <div className="text-sm text-orange-600">
                  {rsvpStats.overdue > 0 && `${rsvpStats.overdue} are overdue`}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={bulkSendReminders}
                size="sm"
                className="bg-orange-600 hover:bg-orange-700 text-white"
              >
                <Mail className="w-4 h-4 mr-2" />
                Send Reminders
              </Button>
              <Button
                onClick={() => setShowOverdueOnly(!showOverdueOnly)}
                variant="outline"
                size="sm"
                className={showOverdueOnly ? 'bg-orange-100 border-orange-300' : ''}
              >
                <Eye className="w-4 h-4 mr-2" />
                {showOverdueOnly ? 'Show All' : 'Show Overdue'}
              </Button>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Filters */}
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
          
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#7a736b]" />
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
          </div>
        </div>
      </GlassCard>

      {/* Bulk Actions */}
      {selectedGuests.length > 0 && (
        <GlassCard className="p-4 mb-6 border-blue-200 bg-blue-50/50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-blue-800">
              {selectedGuests.length} guest(s) selected
            </div>
            <div className="flex gap-2">
              <Button
                onClick={bulkSendReminders}
                size="sm"
                variant="outline"
                className="border-blue-300 text-blue-700 hover:bg-blue-100"
              >
                <Mail className="w-4 h-4 mr-2" />
                Send Reminders
              </Button>
              <Button
                onClick={() => setSelectedGuests([])}
                size="sm"
                variant="ghost"
              >
                Clear Selection
              </Button>
            </div>
          </div>
        </GlassCard>
      )}

      {/* RSVP List */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[#2d3f51]">
            RSVPs ({filteredGuests.length})
          </h2>
          
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
        </div>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2d3f51] mx-auto"></div>
          </div>
        ) : filteredGuests.length === 0 ? (
          <div className="text-center py-8 text-[#7a736b]">
            {searchTerm || statusFilter !== 'all' || showOverdueOnly ? 
              'No RSVPs found matching your criteria.' : 
              'No RSVPs to display.'
            }
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {filteredGuests.map((guest) => {
                const StatusIcon = RSVP_STATUS_ICONS[guest.rsvp_status];
                const isSelected = selectedGuests.includes(guest.id);
                const isOverdue = guest.rsvp_deadline && 
                  new Date(guest.rsvp_deadline) < new Date() && 
                  guest.rsvp_status === 'pending';
                
                return (
                  <motion.div
                    key={guest.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`relative flex items-center justify-between p-4 rounded-lg transition-all ${
                      isSelected 
                        ? 'bg-blue-50 border-2 border-blue-200' 
                        : isOverdue 
                          ? 'bg-orange-50 border border-orange-200'
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
                      <div className="w-10 h-10 rounded-full bg-[#2d3f51] flex items-center justify-center">
                        <span className="text-white font-medium">
                          {guest.display_name?.[0] || guest.first_name?.[0] || guest.email[0].toUpperCase()}
                        </span>
                      </div>
                      
                      <div className="flex-1">
                        <div className="font-medium text-[#2d3f51] flex items-center gap-2">
                          {guest.display_name || `${guest.first_name || ''} ${guest.last_name || ''}`.trim() || 'Unnamed Guest'}
                          {guest.plus_one_name && (
                            <Badge variant="outline" className="text-xs">
                              +1: {guest.plus_one_name}
                            </Badge>
                          )}
                          {isOverdue && (
                            <Badge className="bg-orange-100 text-orange-800 text-xs">
                              OVERDUE
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
                          {guest.rsvp_responded_at && (
                            <span className="flex items-center gap-1 text-green-600">
                              <Calendar className="w-3 h-3" />
                              {new Date(guest.rsvp_responded_at).toLocaleDateString()}
                            </span>
                          )}
                          {guest.rsvp_deadline && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              Due: {new Date(guest.rsvp_deadline).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {/* RSVP Status Selector */}
                      <Select 
                        value={guest.rsvp_status} 
                        onValueChange={(value: 'pending' | 'confirmed' | 'declined') => 
                          updateRSVPStatus(guest.id, value)
                        }
                      >
                        <SelectTrigger className="w-[120px] h-8">
                          <div className="flex items-center gap-1">
                            <StatusIcon className="w-3 h-3" />
                            <span className="capitalize text-xs">{guest.rsvp_status}</span>
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">
                            <div className="flex items-center gap-2">
                              <Clock className="w-3 h-3" />
                              Pending
                            </div>
                          </SelectItem>
                          <SelectItem value="confirmed">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-3 h-3" />
                              Confirmed
                            </div>
                          </SelectItem>
                          <SelectItem value="declined">
                            <div className="flex items-center gap-2">
                              <XCircle className="w-3 h-3" />
                              Declined
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      
                      {(guest.dietary_needs?.length || guest.allergies?.length) && (
                        <Badge variant="outline" className="text-orange-600 border-orange-200">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Dietary
                        </Badge>
                      )}
                      
                      <div className="flex items-center gap-1">
                        {/* Send Reminder */}
                        {guest.rsvp_status === 'pending' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => sendReminder(guest.id)}
                            className="w-8 h-8 p-0 text-blue-600"
                            title="Send reminder"
                          >
                            <Mail className="w-4 h-4" />
                          </Button>
                        )}
                        
                        {/* View Details */}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="w-8 h-8 p-0"
                          title="View details"
                        >
                          <Eye className="w-4 h-4" />
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
    </div>
  );
};

export default AdminRSVPs;