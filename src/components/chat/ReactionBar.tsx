import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Smile, Heart, ThumbsUp, ThumbsDown, Laugh, Angry, Sad } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface Reaction {
  emoji: string;
  count: number;
  users: string[];
  hasReacted: boolean;
}

interface ReactionBarProps {
  messageId: string;
  reactions: Reaction[];
  onAddReaction: (messageId: string, emoji: string) => void;
  onRemoveReaction: (messageId: string, emoji: string) => void;
  className?: string;
  compact?: boolean;
  maxVisible?: number;
}

// Common emoji reactions
const QUICK_REACTIONS = [
  { emoji: '👍', icon: ThumbsUp, label: 'Like' },
  { emoji: '❤️', icon: Heart, label: 'Love' },
  { emoji: '😂', icon: Laugh, label: 'Laugh' },
  { emoji: '😮', icon: Smile, label: 'Wow' },
  { emoji: '😢', icon: Sad, label: 'Sad' },
  { emoji: '😡', icon: Angry, label: 'Angry' },
  { emoji: '👎', icon: ThumbsDown, label: 'Dislike' }
];

// Extended emoji picker
const EMOJI_CATEGORIES = {
  'Smileys': [
    '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃',
    '🫠', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚',
    '😙', '🥲', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭'
  ],
  'Emotions': [
    '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬',
    '🤥', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮'
  ],
  'Hearts': [
    '❤️', '🧡', '💛', '💚', '💙', '💜', '🤎', '🖤', '🤍', '💯',
    '💢', '💥', '💫', '💦', '💨', '🕳️', '💣', '💬', '👁️‍🗨️', '🗨️'
  ],
  'Hands': [
    '👍', '👎', '👊', '✊', '🤛', '🤜', '🤞', '✌️', '🤟', '🤘',
    '👌', '🤌', '🤏', '👈', '👉', '👆', '👇', '☝️', '✋', '🤚'
  ]
};

const ReactionBar: React.FC<ReactionBarProps> = ({
  messageId,
  reactions,
  onAddReaction,
  onRemoveReaction,
  className = '',
  compact = false,
  maxVisible = 5
}) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Smileys');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter reactions with counts > 0
  const activeReactions = reactions.filter(r => r.count > 0);
  const visibleReactions = compact ? activeReactions.slice(0, maxVisible) : activeReactions;
  const hiddenCount = activeReactions.length - visibleReactions.length;

  // Handle reaction toggle
  const handleReactionToggle = (emoji: string) => {
    const reaction = reactions.find(r => r.emoji === emoji);
    if (reaction?.hasReacted) {
      onRemoveReaction(messageId, emoji);
    } else {
      onAddReaction(messageId, emoji);
    }
  };

  // Handle emoji selection from picker
  const handleEmojiSelect = (emoji: string) => {
    onAddReaction(messageId, emoji);
    setShowEmojiPicker(false);
  };

  // Filter emojis based on search
  const getFilteredEmojis = (category: string) => {
    const emojis = EMOJI_CATEGORIES[category as keyof typeof EMOJI_CATEGORIES] || [];
    if (!searchQuery) return emojis;
    
    // Simple search - could be enhanced with emoji names/descriptions
    return emojis.filter(emoji => 
      emoji.includes(searchQuery.toLowerCase())
    );
  };

  // Don't render if no reactions and not allowing new ones
  if (activeReactions.length === 0 && compact) {
    return null;
  }

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {/* Existing reactions */}
      <AnimatePresence>
        {visibleReactions.map((reaction) => (
          <motion.div
            key={`${messageId}-${reaction.emoji}`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            layout
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleReactionToggle(reaction.emoji)}
              className={`
                h-6 px-2 py-0 rounded-full text-xs font-medium transition-all duration-200
                ${reaction.hasReacted 
                  ? 'bg-blue-100 text-blue-700 border border-blue-300 hover:bg-blue-200' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
              title={`${reaction.count} ${reaction.count === 1 ? 'reaction' : 'reactions'}`}
            >
              <span className="mr-1">{reaction.emoji}</span>
              <span>{reaction.count}</span>
            </Button>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Hidden reactions indicator */}
      {hiddenCount > 0 && (
        <Badge variant="secondary" className="h-6 px-2 text-xs">
          +{hiddenCount}
        </Badge>
      )}

      {/* Add reaction button */}
      <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            title="Add reaction"
          >
            <Plus className="w-3 h-3" />
          </Button>
        </PopoverTrigger>
        
        <PopoverContent className="w-80 p-0" side="top" align="start">
          <div className="border rounded-lg bg-white shadow-lg">
            {/* Quick reactions */}
            <div className="p-3 border-b">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Quick reactions</h4>
              <div className="flex gap-1">
                {QUICK_REACTIONS.map((reaction) => (
                  <Button
                    key={reaction.emoji}
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEmojiSelect(reaction.emoji)}
                    className="w-8 h-8 p-0 rounded-full text-lg hover:bg-gray-100"
                    title={reaction.label}
                  >
                    {reaction.emoji}
                  </Button>
                ))}
              </div>
            </div>

            {/* Emoji picker */}
            <div className="p-3">
              {/* Search */}
              <div className="mb-3">
                <input
                  type="text"
                  placeholder="Search emojis..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-2 py-1 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Category tabs */}
              <div className="flex gap-1 mb-3">
                {Object.keys(EMOJI_CATEGORIES).map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className="text-xs h-6 px-2"
                  >
                    {category}
                  </Button>
                ))}
              </div>

              {/* Emoji grid */}
              <div className="grid grid-cols-8 gap-1 max-h-32 overflow-y-auto">
                {getFilteredEmojis(selectedCategory).map((emoji) => (
                  <Button
                    key={emoji}
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEmojiSelect(emoji)}
                    className="w-8 h-8 p-0 text-lg hover:bg-gray-100 rounded-md"
                  >
                    {emoji}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default ReactionBar;