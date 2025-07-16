import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  X, 
  Send, 
  Search,
  MessageCircle,
  Phone,
  Video,
  MoreVertical,
  ArrowLeft,
  Smile,
  Paperclip
} from 'lucide-react';
import { useMessages } from '@/hooks/useMessages';
import { formatDistanceToNow } from 'date-fns';

interface MessagesPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const MessagesPopup: React.FC<MessagesPopupProps> = ({
  isOpen,
  onClose
}) => {
  const { 
    chats, 
    messages, 
    unreadCount, 
    loading, 
    fetchMessages, 
    sendMessage, 
    markChatAsRead 
  } = useMessages();
  
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const handleChatSelect = async (chatId: string) => {
    setSelectedChat(chatId);
    await fetchMessages(chatId);
    await markChatAsRead(chatId);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;
    
    await sendMessage(selectedChat, newMessage.trim());
    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const filteredChats = chats.filter(chat =>
    searchQuery === '' || 
    chat.last_message?.sender_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-20">
      <Card className="w-full max-w-4xl mx-4 max-h-[80vh] overflow-hidden">
        <div className="flex h-full">
          {/* Chat List */}
          <div className={`${selectedChat ? 'hidden md:block' : 'block'} w-full md:w-80 border-r`}>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg">Messages</CardTitle>
                  {unreadCount > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      {unreadCount}
                    </Badge>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="w-8 h-8 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>

            <CardContent className="p-0 max-h-96 overflow-y-auto">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-wedding-gold mx-auto"></div>
                  <p className="text-muted-foreground mt-2 text-sm">Loading chats...</p>
                </div>
              ) : filteredChats.length === 0 ? (
                <div className="text-center py-8 px-4">
                  <MessageCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No conversations yet</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Start a conversation with your wedding party
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredChats.map((chat) => (
                    <Button
                      key={chat.id}
                      variant="ghost"
                      onClick={() => handleChatSelect(chat.id)}
                      className={`w-full h-auto p-4 justify-start hover:bg-blue-50 ${
                        selectedChat === chat.id ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3 w-full">
                        <div className="relative">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={chat.last_message?.sender_avatar} alt={chat.last_message?.sender_name} />
                            <AvatarFallback>
                              {chat.last_message?.sender_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          {chat.unread_count > 0 && (
                            <Badge 
                              variant="destructive" 
                              className="absolute -top-2 -right-2 w-5 h-5 text-xs p-0 flex items-center justify-center"
                            >
                              {chat.unread_count}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex-1 text-left">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-sm">{chat.last_message?.sender_name}</h4>
                            <span className="text-xs text-muted-foreground">
                              {chat.last_message && formatDistanceToNow(new Date(chat.last_message.created_at), { addSuffix: true })}
                            </span>
                          </div>
                          <p className={`text-sm text-muted-foreground line-clamp-1 ${
                            chat.unread_count > 0 ? 'font-medium text-foreground' : ''
                          }`}>
                            {chat.last_message?.content}
                          </p>
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              )}
            </CardContent>
          </div>

          {/* Chat View */}
          {selectedChat ? (
            <div className="flex-1 flex flex-col">
              {/* Chat Header */}
              <div className="border-b p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedChat(null)}
                      className="md:hidden w-8 h-8 p-0"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </Button>
                    
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={chats.find(c => c.id === selectedChat)?.last_message?.sender_avatar} />
                      <AvatarFallback>
                        {chats.find(c => c.id === selectedChat)?.last_message?.sender_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div>
                      <h3 className="font-medium">
                        {chats.find(c => c.id === selectedChat)?.last_message?.sender_name}
                      </h3>
                      <p className="text-xs text-muted-foreground">Online now</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
                      <Phone className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
                      <Video className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 p-4 overflow-y-auto max-h-64">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender_name === 'You' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.sender_name === 'You'
                          ? 'bg-wedding-gold text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}>
                        <p className="text-sm">{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          message.sender_name === 'You' ? 'text-white/70' : 'text-gray-500'
                        }`}>
                          {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Message Input */}
              <div className="border-t p-4">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
                    <Paperclip className="w-4 h-4" />
                  </Button>
                  
                  <div className="flex-1 relative">
                    <Input
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="pr-10"
                    />
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 w-8 h-8 p-0"
                    >
                      <Smile className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <Button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    size="sm"
                    className="bg-wedding-gold hover:bg-wedding-gold/90"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="hidden md:flex flex-1 items-center justify-center">
              <div className="text-center">
                <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">Select a conversation</h3>
                <p className="text-muted-foreground">Choose a chat to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default MessagesPopup;