import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Plus, 
  Users, 
  MessageCircle,
  MoreHorizontal,
  Pin,
  Archive,
  Trash2,
  VideoIcon,
  PhoneIcon
} from 'lucide-react';
import { format, isToday, isYesterday, formatDistanceToNow } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { getLiquidGlassStyle, stylePresets } from '@/utils/styleHelpers';
import styles from '@/components/dashboard/dashboard.module.css';

interface ChatMessage {
  id: string;
  content: string;
  message_type: 'text' | 'image' | 'video' | 'audio' | 'file';
  created_at: string;
  sender_id: string;
}

interface ChatThread {
  id: string;
  name?: string;
  type: 'direct' | 'group';
  participants: Array<{
    user_id: string;
    display_name: string;
    avatar_url?: string;
    is_online: boolean;
  }>;
  last_message?: ChatMessage;
  unread_count: number;
  is_pinned: boolean;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

interface ThreadListProps {
  selectedThreadId?: string;
  onThreadSelect: (thread: ChatThread) => void;
  onStartVideoCall?: (threadId: string) => void;
  onStartAudioCall?: (threadId: string) => void;
  className?: string;
}

const ThreadList: React.FC<ThreadListProps> = ({
  selectedThreadId,
  onThreadSelect,
  onStartVideoCall,
  onStartAudioCall,
  className
}) => {
  const { user } = useAuth();
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewChatDialog, setShowNewChatDialog] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<Array<{
    id: string;
    display_name: string;
    avatar_url?: string;
    is_online: boolean;
  }>>([]);

  useEffect(() => {
    loadThreads();
    loadAvailableUsers();
    setupRealtimeSubscription();
  }, []);

  const loadThreads = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual Supabase query when chat_threads table is available
      // For now, using mock data
      const mockThreads: ChatThread[] = [
        {
          id: '1',
          name: 'Wedding Planning Team',
          type: 'group',
          participants: [
            {
              user_id: '1',
              display_name: 'Sarah Johnson',
              avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b77c?w=150&h=150&fit=crop&crop=face',
              is_online: true
            },
            {
              user_id: '2',
              display_name: 'Mike Chen',
              avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
              is_online: false
            },
            {
              user_id: '3',
              display_name: 'Emma Wilson',
              avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
              is_online: true
            }
          ],
          last_message: {
            id: 'msg1',
            content: 'Great! The venue is confirmed for Saturday.',
            message_type: 'text',
            created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
            sender_id: '1'
          },
          unread_count: 2,
          is_pinned: true,
          is_archived: false,
          created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 5 * 60 * 1000).toISOString()
        },
        {
          id: '2',
          type: 'direct',
          participants: [
            {
              user_id: '4',
              display_name: 'James Miller',
              avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
              is_online: true
            }
          ],
          last_message: {
            id: 'msg2',
            content: 'Can we discuss the catering menu?',
            message_type: 'text',
            created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
            sender_id: '4'
          },
          unread_count: 0,
          is_pinned: false,
          is_archived: false,
          created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 15 * 60 * 1000).toISOString()
        },
        {
          id: '3',
          name: 'Bridal Party',
          type: 'group',
          participants: [
            {
              user_id: '5',
              display_name: 'Lisa Davis',
              avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
              is_online: false
            },
            {
              user_id: '6',
              display_name: 'Anna Rodriguez',
              is_online: true
            }
          ],
          last_message: {
            id: 'msg3',
            content: 'Don\'t forget the dress fitting tomorrow!',
            message_type: 'text',
            created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            sender_id: '5'
          },
          unread_count: 1,
          is_pinned: false,
          is_archived: false,
          created_at: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        }
      ];

      setThreads(mockThreads);
    } catch (error) {
      console.error('Error loading threads:', error);
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url, first_name, last_name')
        .neq('id', user?.id);

      if (error) throw error;

      const users = data?.map(profile => ({
        id: profile.id,
        display_name: profile.display_name || `${profile.first_name} ${profile.last_name}`,
        avatar_url: profile.avatar_url,
        is_online: Math.random() > 0.5 // Mock online status
      })) || [];

      setAvailableUsers(users);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const setupRealtimeSubscription = () => {
    // TODO: Implement real-time subscriptions for thread updates
    return () => {};
  };

  const filteredThreads = useMemo(() => {
    if (!searchTerm) return threads;
    
    return threads.filter(thread => {
      const threadName = getThreadName(thread).toLowerCase();
      const lastMessageContent = thread.last_message?.content.toLowerCase() || '';
      
      return threadName.includes(searchTerm.toLowerCase()) ||
             lastMessageContent.includes(searchTerm.toLowerCase());
    });
  }, [threads, searchTerm]);

  const sortedThreads = useMemo(() => {
    return [...filteredThreads].sort((a, b) => {
      // Pinned threads first
      if (a.is_pinned && !b.is_pinned) return -1;
      if (!a.is_pinned && b.is_pinned) return 1;
      
      // Then by last message time
      const aTime = a.last_message?.created_at || a.updated_at;
      const bTime = b.last_message?.created_at || b.updated_at;
      
      return new Date(bTime).getTime() - new Date(aTime).getTime();
    });
  }, [filteredThreads]);

  const getThreadName = (thread: ChatThread) => {
    if (thread.name) return thread.name;
    
    const otherParticipants = thread.participants.filter(p => p.user_id !== user?.id);
    if (otherParticipants.length === 1) {
      return otherParticipants[0].display_name;
    }
    
    return `Group Chat (${thread.participants.length})`;
  };

  const getLastMessagePreview = (thread: ChatThread) => {
    if (!thread.last_message) return 'No messages yet';
    
    const { content, message_type, sender_id } = thread.last_message;
    const isOwn = sender_id === user?.id;
    const prefix = isOwn ? 'You: ' : '';
    
    switch (message_type) {
      case 'image':
        return `${prefix}📷 Photo`;
      case 'video':
        return `${prefix}🎥 Video`;
      case 'audio':
        return `${prefix}🎵 Audio`;
      case 'file':
        return `${prefix}📎 File`;
      default:
        return `${prefix}${content}`;
    }
  };

  const formatLastMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    
    if (isToday(date)) {
      return format(date, 'HH:mm');
    } else if (isYesterday(date)) {
      return 'Yesterday';
    } else {
      return format(date, 'MMM d');
    }
  };

  const getOnlineParticipants = (thread: ChatThread) => {
    return thread.participants.filter(p => p.is_online && p.user_id !== user?.id);
  };

  const createNewChat = async (userId: string) => {
    // TODO: Implement chat creation
    console.log('Create new chat with user:', userId);
    setShowNewChatDialog(false);
  };

  const pinThread = async (threadId: string) => {
    // TODO: Implement thread pinning
    console.log('Pin thread:', threadId);
  };

  const archiveThread = async (threadId: string) => {
    // TODO: Implement thread archiving
    console.log('Archive thread:', threadId);
  };

  const deleteThread = async (threadId: string) => {
    // TODO: Implement thread deletion
    console.log('Delete thread:', threadId);
  };

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Header */}
      <div 
        className={`p-4 ${styles.liquidGlassCard}`}
        style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0.25) 100%)',
          backdropFilter: 'blur(25px) saturate(1.8)',
          WebkitBackdropFilter: 'blur(25px) saturate(1.8)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.4)',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08), inset 0 1px 1px rgba(255, 255, 255, 0.6)'
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 style={{
            fontFamily: '"Bodoni Moda", serif',
            fontSize: '24px',
            fontWeight: '600',
            color: '#002147'
          }}>Messages</h2>
          <Dialog open={showNewChatDialog} onOpenChange={setShowNewChatDialog}>
            <DialogTrigger asChild>
              <button
                className={`rounded-lg transition-all duration-200 hover:scale-105 flex items-center ${styles.actionButton}`}
                style={{
                  minHeight: '44px',
                  padding: '0 20px',
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
                <Plus className="w-4 h-4 mr-2" />
                New Chat
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Start New Conversation</DialogTitle>
                <DialogDescription>
                  Choose someone to start chatting with
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {availableUsers.map((user) => (
                  <div
                    key={user.id}
                    onClick={() => createNewChat(user.id)}
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <div className="relative">
                      {user.avatar_url ? (
                        <img
                          src={user.avatar_url}
                          alt={user.display_name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-wedding-navy flex items-center justify-center">
                          <span className="text-white font-medium">
                            {user.display_name[0]?.toUpperCase()}
                          </span>
                        </div>
                      )}
                      {user.is_online && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-wedding-navy">
                        {user.display_name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {user.is_online ? 'Online' : 'Offline'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-4 top-1/2 transform -translate-y-1/2" style={{ color: 'rgba(0, 0, 0, 0.5)' }} />
          <input
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl transition-all duration-200"
            style={{
              minHeight: '48px',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.2) 100%)',
              backdropFilter: 'blur(20px) saturate(2)',
              WebkitBackdropFilter: 'blur(20px) saturate(2)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.4), inset 0 -1px 1px rgba(0, 0, 0, 0.05)',
              color: '#000000',
              fontFamily: '"Montserrat", sans-serif',
              fontSize: '16px',
              outline: 'none'
            }}
          />
        </div>
      </div>

      {/* Thread List */}
      <div className="flex-1 overflow-y-auto" style={{
        background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0) 100%)'
      }}>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-wedding-navy"></div>
          </div>
        ) : sortedThreads.length === 0 ? (
          <div className="text-center py-8 px-4">
            <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {searchTerm ? 'No conversations found' : 'No conversations yet'}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {searchTerm ? 'Try a different search term' : 'Start a new chat to get started'}
            </p>
          </div>
        ) : (
          <div className="space-y-1 p-2">
            <AnimatePresence>
              {sortedThreads.map((thread) => (
                <motion.div
                  key={thread.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={cn(
                    `flex items-center space-x-3 p-3 rounded-xl cursor-pointer transition-all duration-200 group relative ${styles.liquidGlassCard}`,
                    selectedThreadId === thread.id && 'ring-2 ring-wedding-navy/30'
                  )}
                  style={{
                    background: selectedThreadId === thread.id 
                      ? 'linear-gradient(135deg, rgba(0, 33, 71, 0.1) 0%, rgba(0, 33, 71, 0.05) 100%)'
                      : 'linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.15) 100%)',
                    backdropFilter: 'blur(15px) saturate(1.5)',
                    WebkitBackdropFilter: 'blur(15px) saturate(1.5)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    boxShadow: selectedThreadId === thread.id
                      ? '0 4px 16px rgba(0, 33, 71, 0.15), inset 0 1px 1px rgba(255, 255, 255, 0.5)'
                      : '0 2px 8px rgba(0, 0, 0, 0.06), inset 0 1px 1px rgba(255, 255, 255, 0.5)'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedThreadId !== thread.id) {
                      e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0.25) 100%)';
                      e.currentTarget.style.transform = 'scale(1.02)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedThreadId !== thread.id) {
                      e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.15) 100%)';
                      e.currentTarget.style.transform = 'scale(1)';
                    }
                  }}
                  onClick={() => onThreadSelect(thread)}
                >
                  {/* Avatar(s) */}
                  <div className="relative flex-shrink-0">
                    {thread.type === 'direct' ? (
                      // Direct chat - single avatar
                      <div className="relative">
                        {thread.participants[0]?.avatar_url ? (
                          <img
                            src={thread.participants[0].avatar_url}
                            alt={getThreadName(thread)}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div 
                            className="w-12 h-12 rounded-full flex items-center justify-center"
                            style={{
                              background: 'linear-gradient(135deg, #002147 0%, #004080 100%)'
                            }}
                          >
                            <span className="text-white font-medium">
                              {getThreadName(thread)[0]?.toUpperCase()}
                            </span>
                          </div>
                        )}
                        {getOnlineParticipants(thread).length > 0 && (
                          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                        )}
                      </div>
                    ) : (
                      // Group chat - stacked avatars
                      <div className="flex -space-x-2">
                        {thread.participants.slice(0, 2).map((participant, index) => (
                          <div
                            key={participant.user_id}
                            className="relative w-10 h-10 rounded-full border-2 border-white"
                            style={{ zIndex: 10 - index }}
                          >
                            {participant.avatar_url ? (
                              <img
                                src={participant.avatar_url}
                                alt={participant.display_name}
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              <div 
                                className="w-full h-full rounded-full flex items-center justify-center"
                                style={{
                                  background: 'linear-gradient(135deg, #002147 0%, #004080 100%)'
                                }}
                              >
                                <span className="text-white text-xs font-medium">
                                  {participant.display_name[0]?.toUpperCase()}
                                </span>
                              </div>
                            )}
                          </div>
                        ))}
                        {getOnlineParticipants(thread).length > 0 && (
                          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Thread Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="truncate" style={{
                          fontFamily: '"Montserrat", sans-serif',
                          fontSize: '15px',
                          fontWeight: '600',
                          color: '#002147'
                        }}>
                          {getThreadName(thread)}
                        </h3>
                        {thread.is_pinned && (
                          <Pin className="w-3 h-3 text-yellow-500" />
                        )}
                        {thread.type === 'group' && (
                          <Users className="w-3 h-3 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex items-center space-x-1">
                        {thread.last_message && (
                          <span className="text-xs text-muted-foreground">
                            {formatLastMessageTime(thread.last_message.created_at)}
                          </span>
                        )}
                        {thread.unread_count > 0 && (
                          <div 
                            className="flex items-center justify-center min-w-[20px] h-5 rounded-full"
                            style={{
                              background: 'linear-gradient(135deg, #002147 0%, #004080 100%)',
                              padding: '0 6px',
                              fontSize: '11px',
                              fontWeight: '600',
                              color: '#ffffff',
                              fontFamily: '"Montserrat", sans-serif'
                            }}
                          >
                            {thread.unread_count > 99 ? '99+' : thread.unread_count}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <p className="truncate" style={{
                      fontFamily: '"Montserrat", sans-serif',
                      fontSize: '13px',
                      color: 'rgba(0, 0, 0, 0.6)'
                    }}>
                      {getLastMessagePreview(thread)}
                    </p>
                  </div>

                  {/* Quick Actions */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onStartVideoCall?.(thread.id);
                      }}
                      className="w-8 h-8 p-0"
                    >
                      <VideoIcon className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onStartAudioCall?.(thread.id);
                      }}
                      className="w-8 h-8 p-0"
                    >
                      <PhoneIcon className="w-4 h-4" />
                    </Button>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => e.stopPropagation()}
                          className="w-8 h-8 p-0"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => pinThread(thread.id)}>
                          <Pin className="w-4 h-4 mr-2" />
                          {thread.is_pinned ? 'Unpin' : 'Pin'}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => archiveThread(thread.id)}>
                          <Archive className="w-4 h-4 mr-2" />
                          Archive
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => deleteThread(thread.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default ThreadList;