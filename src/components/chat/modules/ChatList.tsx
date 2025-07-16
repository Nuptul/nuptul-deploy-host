import React from 'react';
import { MessageCircle } from 'lucide-react';

interface User {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'away' | 'offline';
  lastSeen: string;
}

interface Message {
  id: string;
  senderId: string;
  content?: string;
  timestamp: Date;
  type: 'text' | 'image' | 'video' | 'audio' | 'file' | 'call';
  mediaUrl?: string;
  mediaThumbnail?: string;
  mediaType?: string;
  callDuration?: number;
  callType?: 'audio' | 'video';
  reactions?: { emoji: string; userId: string }[];
  isRead?: boolean;
}

interface Chat {
  id: string;
  participants: User[];
  lastMessage?: Message;
  unreadCount: number;
  isActive: boolean;
  isTyping?: boolean;
}

interface ChatListProps {
  chats: Chat[];
  chatsLoading: boolean;
  onlineUsers: User[];
  currentUserId?: string;
  onChatSelect: (chatId: string) => void;
  onUserSelect: (userId: string) => void;
}

export const ChatList: React.FC<ChatListProps> = ({
  chats,
  chatsLoading,
  onlineUsers,
  currentUserId,
  onChatSelect,
  onUserSelect,
}) => {
  return (
    <>
      {/* Online Users */}
      {onlineUsers.length > 0 && (
        <div className="border-b border-gray-200 pb-3">
          <h3 className="text-sm font-medium text-gray-700 mb-2 px-3">Online</h3>
          <div className="flex space-x-2 px-3 overflow-x-auto">
            {onlineUsers.slice(0, 8).map((user) => (
              <button
                key={user.id}
                onClick={() => onUserSelect(user.id)}
                className="flex flex-col items-center space-y-1 min-w-0 flex-shrink-0"
              >
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-sm">
                    {user.avatar}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                </div>
                <span className="text-xs text-gray-600 truncate max-w-[50px]">
                  {user.name.split(' ')[0]}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chat List */}
      <div className="divide-y divide-gray-200">
        {chatsLoading ? (
          <div className="p-4 text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#1877f2] mx-auto"></div>
          </div>
        ) : chats.length === 0 ? (
          <div className="p-8 text-center">
            <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No conversations yet</p>
            <p className="text-xs text-gray-400 mt-1">Start a chat with someone above</p>
          </div>
        ) : (
          chats.map(chat => {
            const otherParticipant = chat.participants.find(p => p.id !== currentUserId);
            const displayName = chat.participants.length > 2 
              ? 'Group Chat' 
              : otherParticipant?.name || 'Unknown';
            
            return (
              <button
                key={chat.id}
                onClick={() => onChatSelect(chat.id)}
                className="w-full p-3 text-left hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-lg">
                      {otherParticipant?.avatar || '👤'}
                    </div>
                    {otherParticipant?.status === 'online' && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900 truncate">{displayName}</h4>
                      {chat.lastMessage && (
                        <span className="text-xs text-gray-500">
                          {chat.lastMessage.timestamp.toLocaleTimeString('en-US', { 
                            hour: 'numeric', 
                            minute: '2-digit' 
                          })}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-500 truncate">
                        {chat.lastMessage?.content || 'No messages yet'}
                      </p>
                      {chat.unreadCount > 0 && (
                        <span className="bg-[#1877f2] text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                          {chat.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </>
  );
};