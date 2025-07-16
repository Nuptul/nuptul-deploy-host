import React, { useState, useEffect } from 'react';
import { Bell, MessageSquare, AlertTriangle, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import CommunicationCenter from './admin/CommunicationCenter';
import NotificationCenter from './admin/NotificationCenter';

interface NotificationBellProps {
  className?: string;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeTab, setActiveTab] = useState<'messages' | 'alerts'>('messages');
  const { userRole } = useAuth();

  useEffect(() => {
    if (userRole?.role === 'admin' || userRole?.role === 'couple') {
      fetchUnreadCount();
      
      // Set up real-time subscription for new messages
      const channel = supabase
        .channel('notification-updates')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        }, () => {
          fetchUnreadCount();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [userRole]);

  const fetchUnreadCount = async () => {
    try {
      // Count unread messages - for simplicity, we'll count all recent messages
      const { count: messageCount } = await (supabase as any)
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      setUnreadCount(messageCount || 0);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  // Don't render for regular guests
  if (userRole?.role !== 'admin' && userRole?.role !== 'couple') {
    return null;
  }

  return (
    <>
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`glass-button relative p-2 rounded-full ${className}`}
        title="Notifications"
      >
        <Bell className="w-5 h-5 text-wedding-navy" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-glass-pink text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Popup */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40 bg-black/20"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Popup */}
          <div className="fixed top-16 right-4 z-50 w-80 max-w-[calc(100vw-2rem)] max-h-[70vh] glass-card border shadow-lg">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-glass-border/50">
              <h3 className="font-semibold text-wedding-navy">Notifications</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="glass-button w-8 h-8 rounded-full flex items-center justify-center"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-glass-border/50">
              <button
                onClick={() => setActiveTab('messages')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium transition-colors ${
                  activeTab === 'messages'
                    ? 'text-wedding-navy border-b-2 border-wedding-navy'
                    : 'text-muted-foreground hover:text-wedding-navy'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                Messages
              </button>
              <button
                onClick={() => setActiveTab('alerts')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium transition-colors ${
                  activeTab === 'alerts'
                    ? 'text-wedding-navy border-b-2 border-wedding-navy'
                    : 'text-muted-foreground hover:text-wedding-navy'
                }`}
              >
                <AlertTriangle className="w-4 h-4" />
                Alerts
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-96">
              {activeTab === 'messages' ? (
                <div className="p-2">
                  <CommunicationCenter />
                </div>
              ) : (
                <div className="p-2">
                  <NotificationCenter />
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default NotificationBell;