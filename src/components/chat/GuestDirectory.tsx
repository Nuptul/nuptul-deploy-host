import React, { useState } from 'react';
import { Search, MessageCircle, Users, Wifi, WifiOff, Clock } from 'lucide-react';
import { useUserPresence } from '@/hooks/useUserPresence';
import { useDirectChats } from '@/hooks/useDirectChats';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface GuestDirectoryProps {
  onStartChat: (userId: string) => void;
}

const GuestDirectory: React.FC<GuestDirectoryProps> = ({ onStartChat }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { 
    allUsers, 
    loading, 
    getUserStatus, 
    getOnlineUsersCount, 
    getUsersByStatus,
    getUserDisplayName 
  } = useUserPresence();
  const { createDirectChat } = useDirectChats();
  const { user } = useAuth();

  const filteredUsers = allUsers.filter(u => {
    if (u.user_id === user?.id) return false; // Don't show current user
    const displayName = getUserDisplayName(u.user_id).toLowerCase();
    return displayName.includes(searchQuery.toLowerCase());
  });

  const handleStartChat = async (userId: string) => {
    try {
      const chatId = await createDirectChat([userId]);
      onStartChat(chatId);
    } catch (error) {
      console.error('Error starting chat:', error);
    }
  };

  const getStatusIcon = (status: 'online' | 'away' | 'offline') => {
    switch (status) {
      case 'online':
        return <Wifi className="w-3 h-3 text-green-500" />;
      case 'away':
        return <Clock className="w-3 h-3 text-yellow-500" />;
      default:
        return <WifiOff className="w-3 h-3 text-gray-400" />;
    }
  };

  const getStatusColor = (status: 'online' | 'away' | 'offline') => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'away':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-400';
    }
  };

  const UserCard = ({ userPresence }: { userPresence: any }) => {
    const status = getUserStatus(userPresence.user_id);
    const displayName = getUserDisplayName(userPresence.user_id);
    
    return (
      <Card className="glass-secondary hover:glass-primary transition-all duration-300">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={userPresence.profile?.avatar_url} />
                  <AvatarFallback className="text-xs">
                    {displayName.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${getStatusColor(status)}`} />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">{displayName}</p>
                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  {getStatusIcon(status)}
                  <span className="capitalize">{status}</span>
                </div>
              </div>
            </div>
            
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleStartChat(userPresence.user_id)}
              className="glass-secondary hover:glass-primary"
            >
              <MessageCircle className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="text-muted-foreground mt-2">Loading guest directory...</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b bg-background/50 backdrop-blur">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Wedding Guests</h2>
          </div>
          <Badge variant="secondary" className="glass-secondary">
            {getOnlineUsersCount()} online
          </Badge>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search guests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 glass-secondary"
          />
        </div>
      </div>

      {/* Guest List */}
      <div className="flex-1 overflow-hidden">
        <Tabs defaultValue="all" className="h-full flex flex-col">
          <TabsList className="mx-4 mt-4 glass-secondary">
            <TabsTrigger value="all">All ({filteredUsers.length})</TabsTrigger>
            <TabsTrigger value="online">
              Online ({getUsersByStatus('online').filter(u => u.user_id !== user?.id).length})
            </TabsTrigger>
            <TabsTrigger value="offline">
              Offline ({getUsersByStatus('offline').filter(u => u.user_id !== user?.id).length})
            </TabsTrigger>
          </TabsList>
          
          <div className="flex-1 overflow-auto px-4 pb-4">
            <TabsContent value="all" className="mt-4 space-y-2">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((userPresence) => (
                  <UserCard key={userPresence.user_id} userPresence={userPresence} />
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No guests found</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="online" className="mt-4 space-y-2">
              {getUsersByStatus('online')
                .filter(u => u.user_id !== user?.id && getUserDisplayName(u.user_id).toLowerCase().includes(searchQuery.toLowerCase()))
                .map((userPresence) => (
                  <UserCard key={userPresence.user_id} userPresence={userPresence} />
                ))}
            </TabsContent>
            
            <TabsContent value="offline" className="mt-4 space-y-2">
              {getUsersByStatus('offline')
                .filter(u => u.user_id !== user?.id && getUserDisplayName(u.user_id).toLowerCase().includes(searchQuery.toLowerCase()))
                .map((userPresence) => (
                  <UserCard key={userPresence.user_id} userPresence={userPresence} />
                ))}
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default GuestDirectory;