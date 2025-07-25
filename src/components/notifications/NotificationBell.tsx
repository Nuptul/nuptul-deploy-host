import React, { useState, useEffect } from 'react';
import { IconBell, IconCheck, IconTrash, IconX, IconMessage } from '@tabler/icons-react';
import { useNotifications } from '@/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import InstantMessenger from '@/components/chat/InstantMessenger';

const NotificationBell: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMessenger, setShowMessenger] = useState(false);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    clearAll
  } = useNotifications();

  // Fetch unread message count
  useEffect(() => {
    if (user?.id) {
      fetchUnreadMessageCount();

      // Set up real-time subscription for new messages
      const channel = supabase
        .channel('instant-message-notifications')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages'
        }, () => {
          fetchUnreadMessageCount();
        })
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'chat_messages'
        }, () => {
          fetchUnreadMessageCount();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user?.id]);

  const fetchUnreadMessageCount = async () => {
    if (!user?.id) return;

    try {
      // Count unread messages in chats where user is a participant
      const { data: chats, error: chatsError } = await supabase
        .from('chats')
        .select('id')
        .contains('participant_ids', [user.id]);

      if (chatsError) throw chatsError;

      if (chats && chats.length > 0) {
        const chatIds = chats.map(chat => chat.id);

        const { count, error: messagesError } = await supabase
          .from('chat_messages')
          .select('*', { count: 'exact', head: true })
          .in('chat_id', chatIds)
          .neq('sender_id', user.id)
          .eq('is_read', false);

        if (messagesError) throw messagesError;

        setUnreadMessageCount(count || 0);
      }
    } catch (error) {
      console.error('Error fetching unread message count:', error);
    }
  };

  const handleNotificationClick = (notification: any) => {
    markAsRead(notification.id);

    // Navigate based on notification type
    if (notification.metadata?.link) {
      navigate(notification.metadata.link);
    } else if (notification.type === 'message' || notification.type === 'instant_message') {
      // Open instant messenger instead of navigating to social
      setShowMessenger(true);
      setShowDropdown(false);
      return;
    } else if (notification.type === 'social_post' && notification.metadata?.post_id) {
      navigate(`/social#post-${notification.metadata.post_id}`);
    }

    setShowDropdown(false);
  };

  const handleMessengerClick = () => {
    setShowMessenger(true);
    setShowDropdown(false);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'message':
      case 'instant_message':
        return '💬';
      case 'social_post':
        return '📱';
      case 'rsvp_reminder':
        return '📅';
      case 'event_update':
        return '🎉';
      case 'system':
        return '⚙️';
      default:
        return '🔔';
    }
  };

  // Calculate total unread count (notifications + instant messages)
  const totalUnreadCount = unreadCount + unreadMessageCount;

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative rounded-xl transition-all duration-200"
        style={{
          width: '44px',
          height: '44px',
          background: totalUnreadCount > 0
            ? 'linear-gradient(135deg, rgba(255, 59, 48, 0.2) 0%, rgba(255, 107, 107, 0.15) 100%)'
            : 'linear-gradient(135deg, rgba(69, 183, 209, 0.15) 0%, rgba(78, 205, 196, 0.1) 100%)',
          backdropFilter: 'blur(20px) saturate(1.5)',
          WebkitBackdropFilter: 'blur(20px) saturate(1.5)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1), inset 0 1px 1px rgba(255, 255, 255, 0.3)'
        }}
      >
        <IconBell 
          size={22} 
          stroke={1.5} 
          style={{ 
            color: totalUnreadCount > 0 ? '#FF3B30' : 'rgba(0, 0, 0, 0.6)',
            transition: 'color 0.3s ease'
          }} 
        />
        {totalUnreadCount > 0 && (
          <div
            className="absolute -top-1 -right-1 rounded-full flex items-center justify-center"
            style={{
              width: '20px',
              height: '20px',
              background: totalUnreadCount > 5 ? '#FF3B30' : '#34C759',
              border: '2px solid white',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
            }}
          >
            <span className="text-xs text-white font-bold" style={{ fontFamily: '"Montserrat", sans-serif' }}>
              {totalUnreadCount > 9 ? '9+' : totalUnreadCount}
            </span>
          </div>
        )}
      </button>

      {showDropdown && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setShowDropdown(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-80 max-h-[500px] bg-white rounded-xl shadow-2xl z-50 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-gray-100 bg-gray-50">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                <div className="flex items-center gap-2">
                  {/* Instant Messenger Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMessengerClick();
                    }}
                    className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1 px-2 py-1 rounded-md hover:bg-blue-50 transition-colors"
                    title="Open Instant Messenger"
                  >
                    <IconMessage className="w-4 h-4" />
                    Messages
                    {unreadMessageCount > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                        {unreadMessageCount > 9 ? '9+' : unreadMessageCount}
                      </span>
                    )}
                  </button>

                  {unreadCount > 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        markAllAsRead();
                      }}
                      className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                      <IconCheck className="w-4 h-4" />
                      Mark all read
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        clearAll();
                      }}
                      className="text-sm text-red-600 hover:text-red-700"
                    >
                      <IconTrash className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Notifications List */}
            <div className="overflow-y-auto max-h-[400px]">
              {loading ? (
                <div className="p-8 text-center text-gray-500">
                  Loading notifications...
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Bell className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No notifications yet</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                        !notification.read ? 'bg-blue-50/50' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-2xl flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <p className={`font-medium text-gray-900 ${
                                !notification.read ? 'font-semibold' : ''
                              }`}>
                                {notification.title}
                              </p>
                              <p className="text-sm text-gray-600 mt-0.5">
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                {formatDistanceToNow(new Date(notification.created_at), { 
                                  addSuffix: true 
                                })}
                              </p>
                            </div>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-2" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Instant Messenger Component */}
      {showMessenger && (
        <InstantMessenger
          isMinimized={false}
          onMinimize={() => setShowMessenger(false)}
          onClose={() => setShowMessenger(false)}
          className="fixed bottom-4 right-4 z-50"
          isMobile={false}
          isCenter={false}
          isDashboardActive={false}
        />
      )}
    </div>
  );
};

export default NotificationBell;