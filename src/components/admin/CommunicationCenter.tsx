import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, Users, Bell, Megaphone, Mail, Heart, Reply, Trash2, Filter, Search, Calendar, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface EnhancedMessage {
  id: string;
  content: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  user_id: string;
  profiles: {
    first_name?: string;
    last_name?: string;
    email: string;
    display_name?: string;
  };
  message_likes: { id: string; user_id: string }[];
  is_announcement?: boolean;
  announcement_type?: 'general' | 'urgent' | 'reminder';
  target_audience?: 'all' | 'guests' | 'rsvp_confirmed';
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'general' | 'urgent' | 'reminder';
  target_audience: 'all' | 'guests' | 'rsvp_confirmed';
  created_at: string;
  is_active: boolean;
}

const CommunicationCenter: React.FC = () => {
  const [messages, setMessages] = useState<EnhancedMessage[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    content: '',
    type: 'general' as const,
    target_audience: 'all' as const
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showAnnouncementDialog, setShowAnnouncementDialog] = useState(false);
  const [realTimeStats, setRealTimeStats] = useState({
    lastUpdated: new Date(),
    totalMessages: 0,
    activeAnnouncements: 0,
    engagementRate: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    loadMessages();
    loadAnnouncements();
    setupRealTimeUpdates();
  }, []);

  const setupRealTimeUpdates = () => {
    const channel = supabase
      .channel('communication-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          
          setRealTimeStats(prev => ({
            ...prev,
            lastUpdated: new Date()
          }));
          loadMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const loadMessages = async () => {
    try {
      const { data: messagesData, error: messagesError } = await (supabase as any)
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (messagesError) throw messagesError;

      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, first_name, last_name, email, display_name');

      if (profilesError) throw profilesError;

      const { data: likesData, error: likesError } = await (supabase as any)
        .from('message_likes')
        .select('*');

      if (likesError) throw likesError;

      // Combine the data
      const enhancedMessages: EnhancedMessage[] = (messagesData as any)?.map((message: any) => ({
        ...message,
        profiles: (profilesData as any)?.find((p: any) => p.user_id === message.user_id) || {
          first_name: '',
          last_name: '',
          email: 'unknown@email.com',
          display_name: ''
        },
        message_likes: (likesData as any)?.filter((like: any) => like.message_id === message.id) || []
      })) || [];

      setMessages(enhancedMessages);
      
      // Update stats
      setRealTimeStats(prev => ({
        ...prev,
        totalMessages: enhancedMessages.length,
        engagementRate: enhancedMessages.length > 0 
          ? Math.round((enhancedMessages.reduce((sum, m) => sum + (m.message_likes?.length || 0), 0) / enhancedMessages.length) * 100) / 100
          : 0
      }));
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const loadAnnouncements = () => {
    // Mock announcements for Sprint 4 - would be loaded from database
    const mockAnnouncements: Announcement[] = [
      {
        id: '1',
        title: 'Wedding Day Schedule Update',
        content: 'The ceremony will now start at 3:30 PM instead of 3:00 PM. Please plan accordingly!',
        type: 'urgent',
        target_audience: 'all',
        created_at: new Date().toISOString(),
        is_active: true
      },
      {
        id: '2',
        title: 'RSVP Reminder',
        content: 'Don\'t forget to RSVP by March 15th. We\'re excited to celebrate with you!',
        type: 'reminder',
        target_audience: 'guests',
        created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        is_active: true
      }
    ];
    setAnnouncements(mockAnnouncements);
    setRealTimeStats(prev => ({
      ...prev,
      activeAnnouncements: mockAnnouncements.filter(a => a.is_active).length
    }));
  };

  const filteredMessages = messages.filter(message => {
    const matchesSearch = message.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${message.profiles.first_name} ${message.profiles.last_name}`.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterType === 'all' ||
      (filterType === 'public' && message.is_public) ||
      (filterType === 'private' && !message.is_public) ||
      (filterType === 'announcements' && message.is_announcement);
    
    return matchesSearch && matchesFilter;
  });

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await (supabase as any)
        .from('messages')
        .insert({
          content: newMessage,
          is_public: true,
          user_id: user.id
        });

      if (error) throw error;

      toast({
        title: "Message Sent",
        description: "Your message has been posted to the community feed",
      });

      setNewMessage('');
      loadMessages();
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
    }
  };

  const createAnnouncement = async () => {
    if (!newAnnouncement.title.trim() || !newAnnouncement.content.trim()) return;

    try {
      // Mock announcement creation - would integrate with database
      const announcement: Announcement = {
        id: Date.now().toString(),
        ...newAnnouncement,
        created_at: new Date().toISOString(),
        is_active: true
      };

      setAnnouncements(prev => [announcement, ...prev]);
      
      toast({
        title: "Announcement Created",
        description: `Announcement sent to ${newAnnouncement.target_audience === 'all' ? 'all users' : 'selected audience'}`,
      });

      setNewAnnouncement({
        title: '',
        content: '',
        type: 'general',
        target_audience: 'all'
      });
      setShowAnnouncementDialog(false);
    } catch (error) {
      console.error('Error creating announcement:', error);
      toast({
        title: "Error",
        description: "Failed to create announcement",
        variant: "destructive"
      });
    }
  };

  const deleteMessage = async (messageId: string) => {
    try {
    const { error } = await (supabase as any)
      .from('messages')
      .delete()
      .eq('id', messageId);

      if (error) throw error;

      toast({
        title: "Message Deleted",
        description: "Message has been removed from the feed",
      });

      loadMessages();
    } catch (error) {
      console.error('Error deleting message:', error);
      toast({
        title: "Error",
        description: "Failed to delete message",
        variant: "destructive"
      });
    }
  };

  const getAnnouncementColor = (type: string) => {
    switch (type) {
      case 'urgent': return 'bg-glass-pink';
      case 'reminder': return 'bg-glass-blue';
      default: return 'bg-glass-green';
    }
  };

  return (
    <div className="space-y-4">
      {/* Communication Header */}
      <div className="glass-card p-4 bg-gradient-to-r from-wedding-navy/10 to-wedding-gold/10 border border-wedding-navy/20">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-wedding-navy flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Communication Center
          </h3>
          <div className="text-xs text-muted-foreground">
            Last updated: {realTimeStats.lastUpdated.toLocaleTimeString()}
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="neu-card p-3 text-center hover:shadow-lg transition-shadow cursor-pointer group">
            <MessageSquare className="w-5 h-5 mx-auto text-glass-blue mb-2" />
            <div className="text-lg font-bold text-wedding-navy group-hover:text-glass-blue transition-colors">
              {realTimeStats.totalMessages}
            </div>
            <div className="text-xs text-muted-foreground">Community Messages</div>
          </div>
          
          <div className="neu-card p-3 text-center hover:shadow-lg transition-shadow cursor-pointer group">
            <Megaphone className="w-5 h-5 mx-auto text-glass-purple mb-2" />
            <div className="text-lg font-bold text-wedding-navy group-hover:text-glass-purple transition-colors">
              {realTimeStats.activeAnnouncements}
            </div>
            <div className="text-xs text-muted-foreground">Active Announcements</div>
          </div>
          
          <div className="neu-card p-3 text-center hover:shadow-lg transition-shadow cursor-pointer group">
            <Heart className="w-5 h-5 mx-auto text-glass-pink mb-2" />
            <div className="text-lg font-bold text-wedding-navy group-hover:text-glass-pink transition-colors">
              {realTimeStats.engagementRate}
            </div>
            <div className="text-xs text-muted-foreground">Avg Engagement</div>
          </div>
        </div>
      </div>

      {/* Communication Tabs */}
      <Tabs defaultValue="messages" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="messages" className="text-xs">Community</TabsTrigger>
          <TabsTrigger value="announcements" className="text-xs">Announcements</TabsTrigger>
          <TabsTrigger value="mass-notify" className="text-xs">Mass Notify</TabsTrigger>
          <TabsTrigger value="admin-posts" className="text-xs">Admin Posts</TabsTrigger>
        </TabsList>

        <TabsContent value="messages" className="space-y-3">
          {/* Search and Filters */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
              <Input
                placeholder="Search messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="glass-secondary border-0 pl-10"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="private">Private</SelectItem>
                <SelectItem value="announcements">Announcements</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Messages List */}
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {filteredMessages.slice(0, 10).map((message) => (
              <div key={message.id} className="glass-card p-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1 min-w-0">
                    <MessageSquare className="w-4 h-4 flex-shrink-0 mt-1 text-glass-blue" />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-wedding-navy">
                          {message.profiles.first_name && message.profiles.last_name
                            ? `${message.profiles.first_name} ${message.profiles.last_name}`
                            : message.profiles.email
                          }
                        </span>
                        <Badge variant={message.is_public ? 'outline' : 'secondary'} className="text-xs">
                          {message.is_public ? 'Public' : 'Private'}
                        </Badge>
                        {message.is_announcement && (
                          <Badge variant="default" className="text-xs">
                            Announcement
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-2">
                        {message.content}
                      </p>
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(message.created_at).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          {message.message_likes?.length || 0}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-1">
                    <Button size="sm" variant="outline" className="text-xs px-2 py-1">
                      <Reply className="w-3 h-3" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => deleteMessage(message.id)}
                      className="text-xs px-2 py-1"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            
            {filteredMessages.length > 10 && (
              <div className="text-center text-xs text-muted-foreground">
                Showing 10 of {filteredMessages.length} messages
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="announcements" className="space-y-3">
          {/* Announcements Actions */}
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-medium text-wedding-navy">Active Announcements</h4>
            <Dialog open={showAnnouncementDialog} onOpenChange={setShowAnnouncementDialog}>
              <DialogTrigger asChild>
                <Button size="sm" className="text-xs">
                  <Megaphone className="w-3 h-3 mr-1" />
                  New Announcement
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Announcement</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="Announcement title"
                    value={newAnnouncement.title}
                    onChange={(e) => setNewAnnouncement(prev => ({ ...prev, title: e.target.value }))}
                  />
                  <Textarea
                    placeholder="Announcement content"
                    value={newAnnouncement.content}
                    onChange={(e) => setNewAnnouncement(prev => ({ ...prev, content: e.target.value }))}
                    rows={4}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Select 
                      value={newAnnouncement.type} 
                      onValueChange={(value: any) => setNewAnnouncement(prev => ({ ...prev, type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                        <SelectItem value="reminder">Reminder</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select 
                      value={newAnnouncement.target_audience} 
                      onValueChange={(value: any) => setNewAnnouncement(prev => ({ ...prev, target_audience: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Users</SelectItem>
                        <SelectItem value="guests">Guests Only</SelectItem>
                        <SelectItem value="rsvp_confirmed">RSVP Confirmed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex space-x-2">
                    <Button onClick={createAnnouncement} className="flex-1">
                      Create Announcement
                    </Button>
                    <Button variant="outline" onClick={() => setShowAnnouncementDialog(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Announcements List */}
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {announcements.map((announcement) => (
              <div key={announcement.id} className="glass-card p-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h5 className="text-sm font-medium text-wedding-navy">{announcement.title}</h5>
                      <Badge className={`text-xs ${getAnnouncementColor(announcement.type)}`}>
                        {announcement.type}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {announcement.target_audience}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {announcement.content}
                    </p>
                    <div className="text-xs text-muted-foreground">
                      Created: {new Date(announcement.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="mass-notify" className="space-y-3">
          {/* Mass Notification Center */}
          <div className="glass-card p-4 space-y-4">
            <h4 className="text-sm font-medium text-wedding-navy flex items-center gap-2">
              <Megaphone className="w-4 h-4" />
              Mass Notification System
            </h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-muted-foreground">Notification Type</label>
                <Select defaultValue="email">
                  <SelectTrigger className="glass-secondary border-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email Notification</SelectItem>
                    <SelectItem value="push">Push Notification</SelectItem>
                    <SelectItem value="sms">SMS Alert</SelectItem>
                    <SelectItem value="all">All Channels</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-xs text-muted-foreground">Target Audience</label>
                <Select defaultValue="all">
                  <SelectTrigger className="glass-secondary border-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Guests</SelectItem>
                    <SelectItem value="confirmed">RSVP Confirmed</SelectItem>
                    <SelectItem value="pending">Pending RSVPs</SelectItem>
                    <SelectItem value="declined">Declined RSVPs</SelectItem>
                    <SelectItem value="accommodations">Need Accommodation</SelectItem>
                    <SelectItem value="dietary">Dietary Restrictions</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <label className="text-xs text-muted-foreground">Subject Line</label>
              <Input 
                placeholder="Enter notification subject..."
                className="glass-secondary border-0"
              />
            </div>
            
            <div>
              <label className="text-xs text-muted-foreground">Message Content</label>
              <Textarea
                placeholder="Compose your mass notification message..."
                rows={4}
                className="glass-secondary border-0"
              />
            </div>
            
            <div className="flex gap-2">
              <Button className="flex-1">
                <Send className="w-4 h-4 mr-2" />
                Send Notification
              </Button>
              <Button variant="outline">
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
            </div>
          </div>
          
          {/* Quick Mass Actions */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              className="p-3 min-h-[60px] flex-col gap-2 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: 'linear-gradient(135deg, #007AFF 0%, #0051D5 100%)',
                backdropFilter: 'blur(20px) saturate(1.8)',
                WebkitBackdropFilter: 'blur(20px) saturate(1.8)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#FFFFFF',
                fontWeight: '600',
                borderRadius: '12px',
                boxShadow: '0 8px 24px rgba(0, 122, 255, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.4)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #0051D5 0%, #003D9D 100%)';
                e.currentTarget.style.boxShadow = '0 12px 32px rgba(0, 122, 255, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #007AFF 0%, #0051D5 100%)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 122, 255, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.4)';
              }}
            >
              <Mail className="w-5 h-5" />
              <div className="text-xs text-center">
                <div className="font-medium">RSVP Reminder</div>
                <div className="opacity-80">Send to pending guests</div>
              </div>
            </Button>
            <Button
              className="p-3 min-h-[60px] flex-col gap-2 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: 'linear-gradient(135deg, #007AFF 0%, #0051D5 100%)',
                backdropFilter: 'blur(20px) saturate(1.8)',
                WebkitBackdropFilter: 'blur(20px) saturate(1.8)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#FFFFFF',
                fontWeight: '600',
                borderRadius: '12px',
                boxShadow: '0 8px 24px rgba(0, 122, 255, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.4)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #0051D5 0%, #003D9D 100%)';
                e.currentTarget.style.boxShadow = '0 12px 32px rgba(0, 122, 255, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #007AFF 0%, #0051D5 100%)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 122, 255, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.4)';
              }}
            >
              <Bell className="w-5 h-5" />
              <div className="text-xs text-center">
                <div className="font-medium">Event Update</div>
                <div className="opacity-80">Notify confirmed guests</div>
              </div>
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="admin-posts" className="space-y-3">
          {/* Admin Social Posts & Support */}
          <div className="glass-card p-4 space-y-4">
            <h4 className="text-sm font-medium text-wedding-navy flex items-center gap-2">
              <Users className="w-4 h-4" />
              Admin Posts & Support
            </h4>
            
            <div className="grid grid-cols-2 gap-2">
              <Button
                className="justify-start text-xs min-h-[44px] px-3 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: 'linear-gradient(135deg, #007AFF 0%, #0051D5 100%)',
                  backdropFilter: 'blur(20px) saturate(1.8)',
                  WebkitBackdropFilter: 'blur(20px) saturate(1.8)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#FFFFFF',
                  fontWeight: '600',
                  borderRadius: '12px',
                  boxShadow: '0 8px 24px rgba(0, 122, 255, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.4)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #0051D5 0%, #003D9D 100%)';
                  e.currentTarget.style.boxShadow = '0 12px 32px rgba(0, 122, 255, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #007AFF 0%, #0051D5 100%)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 122, 255, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.4)';
                }}
              >
                <Heart className="w-3 h-3 mr-1" />
                Wedding Update
              </Button>
              <Button
                className="justify-start text-xs min-h-[44px] px-3 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: 'linear-gradient(135deg, #007AFF 0%, #0051D5 100%)',
                  backdropFilter: 'blur(20px) saturate(1.8)',
                  WebkitBackdropFilter: 'blur(20px) saturate(1.8)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#FFFFFF',
                  fontWeight: '600',
                  borderRadius: '12px',
                  boxShadow: '0 8px 24px rgba(0, 122, 255, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.4)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #0051D5 0%, #003D9D 100%)';
                  e.currentTarget.style.boxShadow = '0 12px 32px rgba(0, 122, 255, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #007AFF 0%, #0051D5 100%)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 122, 255, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.4)';
                }}
              >
                <MessageSquare className="w-3 h-3 mr-1" />
                Support Message
              </Button>
            </div>
            
            <Textarea
              placeholder="Compose an admin post or support message for the community..."
              rows={4}
              className="glass-secondary border-0"
            />
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <input type="checkbox" id="pin-post" className="rounded" />
                <label htmlFor="pin-post" className="text-xs text-muted-foreground">Pin to top</label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="special-style" className="rounded" />
                <label htmlFor="special-style" className="text-xs text-muted-foreground">Special styling</label>
              </div>
            </div>
            
            <Button>
              <Send className="w-4 h-4 mr-2" />
              Post to Community
            </Button>
          </div>
          
          {/* Support Templates */}
          <div className="space-y-2">
            <h5 className="text-xs font-medium text-wedding-navy">Quick Support Templates</h5>
            <div className="grid grid-cols-1 gap-2">
              <Button variant="outline" className="glass-card p-2 justify-start text-xs">
                "Thanks for your RSVP! We're excited to celebrate with you."
              </Button>
              <Button variant="outline" className="glass-card p-2 justify-start text-xs">
                "If you have any questions about accommodations, please let us know."
              </Button>
              <Button variant="outline" className="glass-card p-2 justify-start text-xs">
                "Don't forget to check out our venue photos in the gallery!"
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Communication Summary */}
      <div className="glass-card p-3 space-y-2">
        <h4 className="text-sm font-medium text-wedding-navy">Communication Summary</h4>
        <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
          <div className="space-y-1">
            <div>Total Messages: {realTimeStats.totalMessages}</div>
            <div>Active Announcements: {realTimeStats.activeAnnouncements}</div>
            <div>Average Engagement: {realTimeStats.engagementRate} likes/message</div>
          </div>
          <div className="space-y-1">
            <div>Last Update: {realTimeStats.lastUpdated.toLocaleTimeString()}</div>
            <div>Community Health: Active</div>
            <div>Response Rate: High</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunicationCenter;