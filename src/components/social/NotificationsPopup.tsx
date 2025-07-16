import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  X, 
  Heart, 
  MessageCircle, 
  Users, 
  Calendar, 
  MapPin,
  Bell,
  Check,
  CheckCheck
} from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';

interface NotificationsPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onNotificationClick: (notification: any) => void;
}

const NotificationsPopup: React.FC<NotificationsPopupProps> = ({
  isOpen,
  onClose,
  onNotificationClick
}) => {
  const { 
    notifications, 
    unreadCount, 
    loading, 
    markAsRead, 
    markAllAsRead 
  } = useNotifications();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like': return <Heart className="w-4 h-4 text-red-500" />;
      case 'comment': return <MessageCircle className="w-4 h-4 text-blue-500" />;
      case 'follow': return <Users className="w-4 h-4 text-green-500" />;
      case 'wedding_update': return <Calendar className="w-4 h-4 text-purple-500" />;
      case 'message': return <MessageCircle className="w-4 h-4 text-blue-500" />;
      default: return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'like': return 'bg-red-50 border-red-200';
      case 'comment': return 'bg-blue-50 border-blue-200';
      case 'follow': return 'bg-green-50 border-green-200';
      case 'wedding_update': return 'bg-purple-50 border-purple-200';
      case 'message': return 'bg-blue-50 border-blue-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const handleNotificationClick = (notification: any) => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
    onNotificationClick(notification);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-20">
      <Card className="w-full max-w-md mx-4 max-h-[80vh] overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">Notifications</CardTitle>
              {unreadCount > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {unreadCount}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  className="text-xs"
                >
                  <CheckCheck className="w-3 h-3 mr-1" />
                  Mark all read
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="w-8 h-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="max-h-96 overflow-y-auto p-0">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-wedding-gold mx-auto"></div>
              <p className="text-muted-foreground mt-2 text-sm">Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-8 px-4">
              <Bell className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">No notifications yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                You'll see notifications about likes, comments, and wedding updates here
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {notifications.map((notification) => (
                <Button
                  key={notification.id}
                  variant="ghost"
                  onClick={() => handleNotificationClick(notification)}
                  className={`w-full h-auto p-4 justify-start hover:bg-blue-50 border-l-2 ${
                    notification.is_read 
                      ? 'border-transparent opacity-70' 
                      : 'border-wedding-gold bg-blue-50/50'
                  }`}
                >
                  <div className="flex items-start gap-3 w-full">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      getNotificationColor(notification.type)
                    }`}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 text-left">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium text-sm">{notification.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                          </p>
                        </div>
                        {!notification.is_read && (
                          <div className="w-2 h-2 bg-wedding-gold rounded-full ml-2 mt-1 flex-shrink-0" />
                        )}
                      </div>
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          )}
        </CardContent>

        {notifications.length > 0 && (
          <div className="border-t p-4">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => {
                // Navigate to full notifications page
                
              }}
            >
              View All Notifications
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default NotificationsPopup;