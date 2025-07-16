import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  MessageSquare, 
  Mail, 
  Phone, 
  MessageCircle, 
  Send, 
  Eye, 
  EyeOff,
  Calendar, 
  User, 
  Search, 
  Filter,
  RefreshCw,
  Download,
  Reply,
  Archive,
  Star,
  StarOff,
  MoreHorizontal,
  AlertCircle,
  CheckCircle,
  Clock,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
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

interface GuestCommunication {
  id: string;
  guest_id: string;
  communication_type: 'email' | 'phone' | 'text' | 'in_person' | 'mail';
  subject: string | null;
  content: string;
  direction: 'inbound' | 'outbound';
  status: 'draft' | 'sent' | 'delivered' | 'read' | 'failed' | 'bounced';
  sent_by: string | null;
  created_at: string;
  scheduled_for: string | null;
  delivered_at: string | null;
  read_at: string | null;
  profiles?: {
    display_name: string | null;
    first_name: string | null;
    last_name: string | null;
    email: string;
  };
}

interface MessageFormData {
  guest_id: string;
  communication_type: 'email' | 'phone' | 'text';
  subject: string;
  content: string;
  scheduled_for: string;
}

const COMMUNICATION_TYPE_COLORS = {
  email: 'bg-blue-100 text-blue-800 border-blue-200',
  phone: 'bg-green-100 text-green-800 border-green-200',
  text: 'bg-purple-100 text-purple-800 border-purple-200',
  in_person: 'bg-orange-100 text-orange-800 border-orange-200',
  mail: 'bg-gray-100 text-gray-800 border-gray-200'
} as const;

const COMMUNICATION_STATUS_COLORS = {
  draft: 'bg-gray-100 text-gray-800',
  sent: 'bg-blue-100 text-blue-800',
  delivered: 'bg-green-100 text-green-800',
  read: 'bg-purple-100 text-purple-800',
  failed: 'bg-red-100 text-red-800',
  bounced: 'bg-red-100 text-red-800'
} as const;

const COMMUNICATION_TYPE_ICONS = {
  email: Mail,
  phone: Phone,
  text: MessageCircle,
  in_person: User,
  mail: Mail
} as const;

const AdminMessages: React.FC = () => {
  const navigate = useNavigate();
  const [communications, setCommunications] = useState<GuestCommunication[]>([]);
  const [guests, setGuests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [directionFilter, setDirectionFilter] = useState<string>('all');
  const [showComposeDialog, setShowComposeDialog] = useState(false);
  const [selectedCommunication, setSelectedCommunication] = useState<GuestCommunication | null>(null);
  const [formData, setFormData] = useState<MessageFormData>({
    guest_id: '',
    communication_type: 'email',
    subject: '',
    content: '',
    scheduled_for: ''
  });

  useEffect(() => {
    fetchCommunications();
    fetchGuests();
  }, []);

  const fetchCommunications = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('guest_communications')
        .select(`
          *,
          profiles (
            display_name,
            first_name,
            last_name,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCommunications(data || []);
    } catch (error) {
      console.error('Error fetching communications:', error);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const fetchGuests = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, display_name, first_name, last_name, email')
        .order('first_name', { ascending: true });

      if (error) throw error;
      setGuests(data || []);
    } catch (error) {
      console.error('Error fetching guests:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const messageData = {
        guest_id: formData.guest_id,
        communication_type: formData.communication_type,
        subject: formData.subject || null,
        content: formData.content,
        direction: 'outbound' as const,
        status: formData.scheduled_for ? 'draft' as const : 'sent' as const,
        scheduled_for: formData.scheduled_for || null,
        delivered_at: formData.scheduled_for ? null : new Date().toISOString(),
        created_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('guest_communications')
        .insert([messageData]);

      if (error) throw error;

      toast.success(formData.scheduled_for ? 'Message scheduled successfully' : 'Message sent successfully');
      setShowComposeDialog(false);
      resetForm();
      fetchCommunications();
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const markAsRead = async (communicationId: string) => {
    try {
      const { error } = await supabase
        .from('guest_communications')
        .update({ 
          status: 'read',
          read_at: new Date().toISOString()
        })
        .eq('id', communicationId);

      if (error) throw error;
      fetchCommunications();
    } catch (error) {
      console.error('Error marking as read:', error);
      toast.error('Failed to update message status');
    }
  };

  const deleteCommunication = async (communicationId: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return;

    try {
      const { error } = await supabase
        .from('guest_communications')
        .delete()
        .eq('id', communicationId);

      if (error) throw error;
      
      toast.success('Message deleted successfully');
      fetchCommunications();
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error('Failed to delete message');
    }
  };

  const resetForm = () => {
    setFormData({
      guest_id: '',
      communication_type: 'email',
      subject: '',
      content: '',
      scheduled_for: ''
    });
  };

  const exportCommunications = () => {
    try {
      const headers = ['Date', 'Guest', 'Type', 'Direction', 'Subject', 'Content', 'Status'];
      const rows = communications.map(comm => [
        new Date(comm.created_at).toLocaleDateString(),
        comm.profiles ? `${comm.profiles.first_name || ''} ${comm.profiles.last_name || ''}`.trim() || comm.profiles.display_name || comm.profiles.email : 'Unknown',
        comm.communication_type,
        comm.direction,
        comm.subject || '',
        comm.content.substring(0, 100) + (comm.content.length > 100 ? '...' : ''),
        comm.status
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `guest-communications-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success('Communications exported successfully');
    } catch (error) {
      console.error('Error exporting communications:', error);
      toast.error('Failed to export communications');
    }
  };

  const filteredCommunications = communications.filter(comm => {
    const matchesSearch = 
      comm.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comm.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comm.profiles?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${comm.profiles?.first_name || ''} ${comm.profiles?.last_name || ''}`.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'all' || comm.communication_type === typeFilter;
    const matchesStatus = statusFilter === 'all' || comm.status === statusFilter;
    const matchesDirection = directionFilter === 'all' || comm.direction === directionFilter;
    
    return matchesSearch && matchesType && matchesStatus && matchesDirection;
  });

  const stats = [
    { 
      label: 'Total Messages', 
      value: communications.length, 
      icon: MessageSquare, 
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    { 
      label: 'Sent Today', 
      value: communications.filter(c => 
        new Date(c.created_at).toDateString() === new Date().toDateString() && 
        c.direction === 'outbound'
      ).length, 
      icon: Send, 
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    { 
      label: 'Unread', 
      value: communications.filter(c => 
        c.direction === 'inbound' && c.status !== 'read'
      ).length, 
      icon: Eye, 
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    { 
      label: 'Failed/Bounced', 
      value: communications.filter(c => 
        c.status === 'failed' || c.status === 'bounced'
      ).length, 
      icon: AlertCircle, 
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    }
  ];

  const getGuestName = (communication: GuestCommunication) => {
    const profile = communication.profiles;
    if (profile?.display_name) return profile.display_name;
    if (profile?.first_name || profile?.last_name) {
      return `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
    }
    return profile?.email || 'Unknown Guest';
  };

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
            <h1 className="text-2xl font-semibold text-[#2d3f51]">Guest Communications</h1>
            <p className="text-sm text-[#7a736b]">Manage messages and communications with guests</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => fetchCommunications()}
            variant="outline"
            size="sm"
            className="border-wedding-navy text-wedding-navy hover:bg-wedding-navy hover:text-white"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button
            onClick={exportCommunications}
            variant="outline"
            className="border-wedding-navy text-wedding-navy hover:bg-wedding-navy hover:text-white"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Dialog open={showComposeDialog} onOpenChange={setShowComposeDialog}>
            <DialogTrigger asChild>
              <Button 
                onClick={resetForm}
                className="bg-wedding-navy hover:bg-wedding-navy/90"
              >
                <Send className="w-4 h-4 mr-2" />
                Compose
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-popup max-w-2xl">
              <DialogHeader>
                <DialogTitle>Compose Message</DialogTitle>
                <DialogDescription>
                  Send a message to a guest or schedule it for later.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSendMessage} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="guest_id">Recipient</Label>
                    <Select value={formData.guest_id} onValueChange={(value) => setFormData({...formData, guest_id: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a guest" />
                      </SelectTrigger>
                      <SelectContent>
                        {guests.map((guest) => (
                          <SelectItem key={guest.id} value={guest.id}>
                            {guest.display_name || `${guest.first_name || ''} ${guest.last_name || ''}`.trim() || guest.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="communication_type">Type</Label>
                    <Select value={formData.communication_type} onValueChange={(value: any) => setFormData({...formData, communication_type: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="text">Text Message</SelectItem>
                        <SelectItem value="phone">Phone Call Log</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {formData.communication_type === 'email' && (
                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => setFormData({...formData, subject: e.target.value})}
                      placeholder="Email subject"
                    />
                  </div>
                )}
                
                <div>
                  <Label htmlFor="content">Message</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData({...formData, content: e.target.value})}
                    placeholder="Your message content..."
                    rows={6}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="scheduled_for">Schedule for later (Optional)</Label>
                  <Input
                    id="scheduled_for"
                    type="datetime-local"
                    value={formData.scheduled_for}
                    onChange={(e) => setFormData({...formData, scheduled_for: e.target.value})}
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowComposeDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-wedding-navy hover:bg-wedding-navy/90">
                    {formData.scheduled_for ? 'Schedule Message' : 'Send Message'}
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

      {/* Filters */}
      <GlassCard className="p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-[#7a736b]" />
            <Input
              placeholder="Search messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-4 h-4 text-[#7a736b]" />
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="phone">Phone</SelectItem>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="in_person">In Person</SelectItem>
                <SelectItem value="mail">Mail</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={directionFilter} onValueChange={setDirectionFilter}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Directions</SelectItem>
                <SelectItem value="outbound">Sent</SelectItem>
                <SelectItem value="inbound">Received</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="read">Read</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </GlassCard>

      {/* Communications List */}
      <GlassCard className="p-6">
        <h2 className="text-lg font-semibold text-[#2d3f51] mb-4">
          Messages ({filteredCommunications.length})
        </h2>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2d3f51] mx-auto"></div>
          </div>
        ) : filteredCommunications.length === 0 ? (
          <div className="text-center py-8 text-[#7a736b]">
            {searchTerm || typeFilter !== 'all' || statusFilter !== 'all' || directionFilter !== 'all' ? 
              'No messages found matching your criteria.' : 
              'No messages yet. Click "Compose" to send your first message.'
            }
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {filteredCommunications.map((communication) => {
                const TypeIcon = COMMUNICATION_TYPE_ICONS[communication.communication_type];
                
                return (
                  <motion.div
                    key={communication.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`flex items-start gap-3 p-4 rounded-lg transition-all ${
                      communication.direction === 'inbound' && communication.status !== 'read'
                        ? 'bg-blue-50 border border-blue-200'
                        : 'bg-white/20 hover:bg-white/30 border border-transparent'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      communication.direction === 'outbound' 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-blue-100 text-blue-600'
                    }`}>
                      <TypeIcon className="w-5 h-5" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-[#2d3f51]">
                          {getGuestName(communication)}
                        </span>
                        <Badge className={COMMUNICATION_TYPE_COLORS[communication.communication_type]}>
                          {communication.communication_type}
                        </Badge>
                        <Badge className={COMMUNICATION_STATUS_COLORS[communication.status]}>
                          {communication.status}
                        </Badge>
                        {communication.direction === 'outbound' && (
                          <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                            Sent
                          </Badge>
                        )}
                        {communication.direction === 'inbound' && (
                          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                            Received
                          </Badge>
                        )}
                      </div>
                      
                      {communication.subject && (
                        <h4 className="font-medium text-[#2d3f51] mb-1">
                          {communication.subject}
                        </h4>
                      )}
                      
                      <p className="text-sm text-[#7a736b] line-clamp-2 mb-2">
                        {communication.content}
                      </p>
                      
                      <div className="flex items-center gap-4 text-xs text-[#7a736b]">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(communication.created_at).toLocaleDateString()} at {new Date(communication.created_at).toLocaleTimeString()}
                        </span>
                        {communication.delivered_at && (
                          <span className="flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Delivered {new Date(communication.delivered_at).toLocaleDateString()}
                          </span>
                        )}
                        {communication.read_at && (
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            Read {new Date(communication.read_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      {communication.direction === 'inbound' && communication.status !== 'read' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => markAsRead(communication.id)}
                          className="w-8 h-8 p-0 text-blue-600"
                          title="Mark as read"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      )}
                      
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedCommunication(communication)}
                        className="w-8 h-8 p-0"
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteCommunication(communication.id)}
                        className="w-8 h-8 p-0 text-red-600 hover:bg-red-50"
                        title="Delete message"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </GlassCard>

      {/* Message Detail Dialog */}
      {selectedCommunication && (
        <Dialog open={!!selectedCommunication} onOpenChange={() => setSelectedCommunication(null)}>
          <DialogContent className="glass-popup max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Message Details
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>From/To</Label>
                  <p className="text-sm">{getGuestName(selectedCommunication)}</p>
                </div>
                <div>
                  <Label>Type</Label>
                  <Badge className={COMMUNICATION_TYPE_COLORS[selectedCommunication.communication_type]}>
                    {selectedCommunication.communication_type}
                  </Badge>
                </div>
              </div>
              
              {selectedCommunication.subject && (
                <div>
                  <Label>Subject</Label>
                  <p className="text-sm">{selectedCommunication.subject}</p>
                </div>
              )}
              
              <div>
                <Label>Content</Label>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm whitespace-pre-wrap">{selectedCommunication.content}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-xs text-[#7a736b]">
                <div>
                  <Label>Created</Label>
                  <p>{new Date(selectedCommunication.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <Label>Status</Label>
                  <Badge className={COMMUNICATION_STATUS_COLORS[selectedCommunication.status]}>
                    {selectedCommunication.status}
                  </Badge>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default AdminMessages;