import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  MoreHorizontal, 
  Reply, 
  Edit, 
  Trash2, 
  Copy,
  Heart,
  Smile,
  ThumbsUp,
  Check,
  CheckCheck
} from 'lucide-react';
import { format, isToday, isYesterday } from 'date-fns';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface MessageReaction {
  emoji: string;
  user_id: string;
  user_name: string;
}

interface MessageBubbleProps {
  message: {
    id: string;
    content: string;
    message_type: 'text' | 'image' | 'video' | 'audio' | 'file';
    media_url?: string;
    created_at: string;
    sender_profile?: {
      display_name: string;
      avatar_url?: string;
      first_name: string;
      last_name: string;
    };
    reactions?: MessageReaction[];
    read_by?: string[];
  };
  isOwn: boolean;
  onAddReaction?: (messageId: string, emoji: string) => void;
  onReply?: (messageId: string) => void;
  onEdit?: (messageId: string) => void;
  onDelete?: (messageId: string) => void;
  className?: string;
}

const QUICK_REACTIONS = ['❤️', '👍', '😊', '😂', '😢', '😮'];

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwn,
  onAddReaction,
  onReply,
  onEdit,
  onDelete,
  className
}) => {
  const [showReactions, setShowReactions] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    
    if (isToday(date)) {
      return format(date, 'HH:mm');
    } else if (isYesterday(date)) {
      return `Yesterday ${format(date, 'HH:mm')}`;
    } else {
      return format(date, 'MMM d, HH:mm');
    }
  };

  const getSenderName = () => {
    if (!message.sender_profile) return 'Unknown User';
    
    return message.sender_profile.display_name || 
           `${message.sender_profile.first_name} ${message.sender_profile.last_name}`.trim() ||
           'Unknown User';
  };

  const getSenderAvatar = () => {
    if (message.sender_profile?.avatar_url) {
      return message.sender_profile.avatar_url;
    }
    return null;
  };

  const getReactionCounts = () => {
    if (!message.reactions) return {};
    
    const counts: Record<string, number> = {};
    message.reactions.forEach(reaction => {
      counts[reaction.emoji] = (counts[reaction.emoji] || 0) + 1;
    });
    
    return counts;
  };

  const hasUserReacted = (emoji: string) => {
    if (!message.reactions) return false;
    return message.reactions.some(reaction => 
      reaction.emoji === emoji && reaction.user_id === 'current-user-id' // TODO: Get actual user ID
    );
  };

  const handleReaction = (emoji: string) => {
    onAddReaction?.(message.id, emoji);
    setShowReactions(false);
  };

  const copyMessage = () => {
    navigator.clipboard.writeText(message.content);
    setShowActions(false);
  };

  const renderMessageContent = () => {
    switch (message.message_type) {
      case 'image':
        return (
          <div className="space-y-2">
            {message.media_url && (
              <img
                src={message.media_url}
                alt="Shared image"
                className="max-w-xs rounded-lg shadow-md"
              />
            )}
            {message.content && (
              <p className="text-sm">{message.content}</p>
            )}
          </div>
        );
      
      case 'video':
        return (
          <div className="space-y-2">
            {message.media_url && (
              <video
                src={message.media_url}
                controls
                className="max-w-xs rounded-lg shadow-md"
              />
            )}
            {message.content && (
              <p className="text-sm">{message.content}</p>
            )}
          </div>
        );
      
      case 'audio':
        return (
          <div className="space-y-2">
            {message.media_url && (
              <audio src={message.media_url} controls className="w-full max-w-xs" />
            )}
            {message.content && (
              <p className="text-sm">{message.content}</p>
            )}
          </div>
        );
      
      case 'file':
        return (
          <div className="space-y-2">
            {message.media_url && (
              <a
                href={message.media_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
                  <span className="text-white text-xs font-bold">📎</span>
                </div>
                <span className="text-sm font-medium">Download File</span>
              </a>
            )}
            {message.content && (
              <p className="text-sm">{message.content}</p>
            )}
          </div>
        );
      
      default:
        return <p className="text-sm whitespace-pre-wrap">{message.content}</p>;
    }
  };

  const reactionCounts = getReactionCounts();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={cn(
        'flex space-x-3 group',
        isOwn ? 'flex-row-reverse space-x-reverse' : '',
        className
      )}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Avatar */}
      {!isOwn && (
        <div className="flex-shrink-0">
          {getSenderAvatar() ? (
            <img
              src={getSenderAvatar()}
              alt={getSenderName()}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-wedding-navy flex items-center justify-center">
              <span className="text-white text-xs font-medium">
                {getSenderName()[0]?.toUpperCase()}
              </span>
            </div>
          )}
        </div>
      )}

      <div className={cn('flex-1 max-w-xs lg:max-w-md', isOwn ? 'flex flex-col items-end' : '')}>
        {/* Sender name for non-own messages */}
        {!isOwn && (
          <div className="text-xs text-muted-foreground mb-1 font-medium">
            {getSenderName()}
          </div>
        )}

        {/* Message bubble */}
        <div className="relative">
          <div
            className={cn(
              'px-4 py-2 rounded-2xl shadow-sm relative',
              isOwn 
                ? 'bg-wedding-navy text-white rounded-br-md' 
                : 'bg-white border border-gray-200 rounded-bl-md'
            )}
          >
            {renderMessageContent()}
            
            {/* Message actions */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: showActions ? 1 : 0, scale: showActions ? 1 : 0.8 }}
              className={cn(
                'absolute top-1/2 transform -translate-y-1/2 flex items-center space-x-1',
                isOwn ? '-left-20' : '-right-20'
              )}
            >
              {/* Quick reaction button */}
              <motion.div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-8 h-8 p-0 bg-white border shadow-md hover:bg-gray-50"
                  onClick={() => setShowReactions(!showReactions)}
                >
                  <Smile className="w-4 h-4 text-gray-600" />
                </Button>
                
                {/* Quick reactions popup */}
                {showReactions && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: 10 }}
                    className={cn(
                      'absolute z-50 bg-white border rounded-lg shadow-lg p-2 flex space-x-1',
                      isOwn ? 'bottom-full right-0 mb-2' : 'bottom-full left-0 mb-2'
                    )}
                  >
                    {QUICK_REACTIONS.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => handleReaction(emoji)}
                        className="hover:bg-gray-100 rounded p-1 transition-colors"
                      >
                        <span className="text-lg">{emoji}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </motion.div>

              {/* More actions menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-8 h-8 p-0 bg-white border shadow-md hover:bg-gray-50"
                  >
                    <MoreHorizontal className="w-4 h-4 text-gray-600" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align={isOwn ? 'end' : 'start'}>
                  <DropdownMenuItem onClick={() => onReply?.(message.id)}>
                    <Reply className="w-4 h-4 mr-2" />
                    Reply
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={copyMessage}>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </DropdownMenuItem>
                  {isOwn && (
                    <>
                      <DropdownMenuItem onClick={() => onEdit?.(message.id)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => onDelete?.(message.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </motion.div>
          </div>

          {/* Reactions */}
          {Object.keys(reactionCounts).length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {Object.entries(reactionCounts).map(([emoji, count]) => (
                <button
                  key={emoji}
                  onClick={() => handleReaction(emoji)}
                  className={cn(
                    'inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs transition-colors',
                    hasUserReacted(emoji)
                      ? 'bg-blue-100 text-blue-800 border border-blue-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  )}
                >
                  <span>{emoji}</span>
                  <span>{count}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Message metadata */}
        <div className={cn(
          'flex items-center space-x-2 mt-1 text-xs text-muted-foreground',
          isOwn ? 'justify-end' : ''
        )}>
          <span>{formatMessageTime(message.created_at)}</span>
          
          {/* Read receipts for own messages */}
          {isOwn && (
            <div className="flex items-center">
              {message.read_by && message.read_by.length > 0 ? (
                <CheckCheck className="w-3 h-3 text-blue-500" />
              ) : (
                <Check className="w-3 h-3" />
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default MessageBubble;