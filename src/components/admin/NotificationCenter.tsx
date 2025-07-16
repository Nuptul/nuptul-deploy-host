import React, { useState, useEffect } from 'react';
import { Bell, AlertCircle, Info, CheckCircle, X, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Notification {
  id: string;
  type: 'info' | 'warning' | 'success' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

const NotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [settings, setSettings] = useState({
    newRSVP: true,
    photoApproval: true,
    newMessage: true,
    systemAlerts: true,
    emailNotifications: true,
    pushNotifications: false,
  });
  const { toast } = useToast();

  // Mock notifications - in real app, these would come from database
  useEffect(() => {
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'info',
        title: 'New RSVP Received',
        message: 'John Smith has confirmed attendance for 2 guests',
        timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        read: false
      },
      {
        id: '2',
        type: 'warning',
        title: 'Photo Pending Approval',
        message: '3 photos are waiting for moderation',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        read: false
      },
      {
        id: '3',
        type: 'success',
        title: 'Gift Purchased',
        message: 'Wedding registry item "Kitchen Set" was purchased',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        read: true
      },
      {
        id: '4',
        type: 'info',
        title: 'New Message',
        message: 'You have 2 new messages from guests',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        read: true
      },
      {
        id: '5',
        type: 'error',
        title: 'System Alert',
        message: 'Storage usage is at 85% capacity',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        read: false
      }
    ];
    setNotifications(mockNotifications);
  }, []);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return CheckCircle;
      case 'warning': return AlertCircle;
      case 'error': return AlertCircle;
      default: return Info;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success': return 'glass-green';
      case 'warning': return 'glass-pink';
      case 'error': return 'glass-pink';
      default: return 'glass-blue';
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const formatTimestamp = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffMinutes < 60) {
      return `${diffMinutes}m ago`;
    } else if (diffMinutes < 1440) {
      return `${Math.floor(diffMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffMinutes / 1440)}d ago`;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const updateSetting = async (key: string, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    
    // In real app, save to database
    toast({
      title: "Settings Updated",
      description: "Notification preferences saved",
    });
  };

  return (
    <div className="space-y-4 h-full overflow-y-auto" style={{ maxHeight: '580px' }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Bell className="w-4 h-4 text-glass-blue" />
          <h4 className="text-sm font-medium text-wedding-navy">Notifications</h4>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="text-xs">
              {unreadCount}
            </Badge>
          )}
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))}
          className="text-xs"
        >
          Mark All Read
        </Button>
      </div>

      {/* Notifications List */}
      <div className="space-y-2">
        {notifications.slice(0, 6).map((notification) => {
          const Icon = getNotificationIcon(notification.type);
          const color = getNotificationColor(notification.type);
          
          return (
            <div 
              key={notification.id} 
              className={`glass-card p-3 relative ${!notification.read ? 'border-l-2 border-glass-blue' : ''}`}
            >
              <div className="flex items-start space-x-3">
                <Icon className={`w-4 h-4 text-${color} flex-shrink-0 mt-0.5`} />
                
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-wedding-navy truncate">
                      {notification.title}
                    </div>
                    <div className="flex items-center space-x-1 flex-shrink-0">
                      <span className="text-xs text-muted-foreground">
                        {formatTimestamp(notification.timestamp)}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => dismissNotification(notification.id)}
                        className="w-4 h-4 p-0 hover:bg-transparent"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    {notification.message}
                  </div>
                  
                  {!notification.read && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => markAsRead(notification.id)}
                      className="text-xs px-0 py-0 h-auto text-glass-blue hover:bg-transparent"
                    >
                      Mark as read
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Notification Settings */}
      <div className="glass-card p-4 space-y-3">
        <div className="flex items-center space-x-2">
          <Settings className="w-4 h-4 text-glass-purple" />
          <h5 className="text-sm font-medium text-wedding-navy">Preferences</h5>
        </div>
        
        <div className="space-y-3">
          {[
            { key: 'newRSVP', label: 'New RSVPs', desc: 'Guest confirmations' },
            { key: 'photoApproval', label: 'Photo Approvals', desc: 'Pending photo reviews' },
            { key: 'newMessage', label: 'New Messages', desc: 'Guest communications' },
            { key: 'systemAlerts', label: 'System Alerts', desc: 'Important system updates' },
          ].map((setting) => (
            <div key={setting.key} className="flex items-center justify-between">
              <div className="flex-1">
                <div className="text-sm font-medium text-wedding-navy">
                  {setting.label}
                </div>
                <div className="text-xs text-muted-foreground">
                  {setting.desc}
                </div>
              </div>
              <Switch
                checked={settings[setting.key as keyof typeof settings]}
                onCheckedChange={(checked) => updateSetting(setting.key, checked)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-2">
        <Button size="sm" variant="outline" className="text-xs">
          <Bell className="w-3 h-3 mr-1" />
          Test Alert
        </Button>
        <Button size="sm" variant="outline" className="text-xs">
          <Settings className="w-3 h-3 mr-1" />
          All Settings
        </Button>
      </div>
    </div>
  );
};

export default NotificationCenter;