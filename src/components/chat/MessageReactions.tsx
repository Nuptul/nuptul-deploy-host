import React, { useState } from 'react';
import { Heart, Smile, Laugh, Star, Frown, ThumbsUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useMessageReactions } from '@/hooks/useMessageReactions';

interface MessageReactionsProps {
  messageId: string;
  className?: string;
}

const reactionEmojis = {
  like: { icon: ThumbsUp, emoji: '👍', label: 'Like' },
  love: { icon: Heart, emoji: '❤️', label: 'Love' },
  laugh: { icon: Laugh, emoji: '😂', label: 'Laugh' },
  wow: { icon: Star, emoji: '😮', label: 'Wow' },
  sad: { icon: Frown, emoji: '😢', label: 'Sad' },
  angry: { icon: Frown, emoji: '😠', label: 'Angry' }
};

const MessageReactions: React.FC<MessageReactionsProps> = ({ 
  messageId, 
  className = '' 
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const { reactions, addReaction, getReactionCounts, getUserReaction } = useMessageReactions(messageId);
  
  const reactionCounts = getReactionCounts();
  const userReaction = getUserReaction();
  const hasReactions = Object.keys(reactionCounts).length > 0;

  const handleReactionClick = async (reactionType: keyof typeof reactionEmojis) => {
    await addReaction(reactionType);
    setShowPicker(false);
  };

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      {/* Existing reactions */}
      {hasReactions && (
        <div className="flex items-center space-x-1">
          {Object.entries(reactionCounts).map(([type, count]) => {
            const reactionInfo = reactionEmojis[type as keyof typeof reactionEmojis];
            const isUserReaction = userReaction === type;
            
            return (
              <Button
                key={type}
                variant="ghost"
                size="sm"
                onClick={() => handleReactionClick(type as keyof typeof reactionEmojis)}
                className={`h-6 px-2 text-xs glass-secondary hover:glass-primary transition-all ${
                  isUserReaction ? 'ring-1 ring-primary bg-primary/10' : ''
                }`}
              >
                <span className="mr-1">{reactionInfo.emoji}</span>
                <span className="text-xs">{count}</span>
              </Button>
            );
          })}
        </div>
      )}

      {/* Add reaction button */}
      <Popover open={showPicker} onOpenChange={setShowPicker}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground glass-secondary hover:glass-primary"
          >
            <Smile className="w-3 h-3" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2 glass-primary" side="top">
          <div className="flex space-x-1">
            {Object.entries(reactionEmojis).map(([type, info]) => (
              <Button
                key={type}
                variant="ghost"
                size="sm"
                onClick={() => handleReactionClick(type as keyof typeof reactionEmojis)}
                className="h-8 w-8 p-0 hover:scale-110 transition-transform glass-secondary hover:glass-primary"
                title={info.label}
              >
                <span className="text-lg">{info.emoji}</span>
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default MessageReactions;
