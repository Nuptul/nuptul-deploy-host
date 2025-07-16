import React, { useState, useEffect } from 'react';
import { Heart, Laugh, AlertCircle, Frown, Zap, ThumbsUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { HapticFeedback } from '@/components/mobile/HapticFeedback';

const REACTIONS = {
  like: { icon: ThumbsUp, color: 'text-blue-500', emoji: '👍' },
  love: { icon: Heart, color: 'text-red-500', emoji: '❤️' },
  laugh: { icon: Laugh, color: 'text-yellow-500', emoji: '😂' },
  wow: { icon: AlertCircle, color: 'text-purple-500', emoji: '😮' },
  sad: { icon: Frown, color: 'text-gray-500', emoji: '😢' },
  angry: { icon: Zap, color: 'text-red-600', emoji: '😠' }
};

interface LiveReaction {
  id: string;
  type: keyof typeof REACTIONS;
  x: number;
  y: number;
  timestamp: number;
}

interface LiveReactionsProps {
  postId?: string;
  photoId?: string;
  className?: string;
}

export const LiveReactions: React.FC<LiveReactionsProps> = ({
  postId,
  photoId,
  className = ''
}) => {
  const [reactions, setReactions] = useState<LiveReaction[]>([]);
  const [isReactionPickerOpen, setIsReactionPickerOpen] = useState(false);
  const [reactionCounts, setReactionCounts] = useState<Record<string, number>>({});
  const { user } = useAuth();

  const addReaction = async (type: keyof typeof REACTIONS, event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Add visual reaction
    const newReaction: LiveReaction = {
      id: Date.now().toString(),
      type,
      x,
      y,
      timestamp: Date.now()
    };

    setReactions(prev => [...prev, newReaction]);
    HapticFeedback.impact('medium');

    // Remove after animation
    setTimeout(() => {
      setReactions(prev => prev.filter(r => r.id !== newReaction.id));
    }, 2000);

    // Save to database
    if (postId && user) {
      await (supabase as any)
        .from('post_reactions')
        .upsert({
          post_id: postId,
          user_id: user.id,
          reaction_type: type
        });
    } else if (photoId && user) {
      await (supabase as any)
        .from('photo_likes')
        .upsert({
          photo_id: photoId,
          user_id: user.id
        });
    }

    setIsReactionPickerOpen(false);
  };

  const handleQuickLike = (event: React.MouseEvent) => {
    addReaction('like', event);
  };

  useEffect(() => {
    if (!postId && !photoId) return;

    const channel = supabase
      .channel(`reactions-${postId || photoId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: postId ? 'post_reactions' : 'photo_likes',
        filter: postId ? `post_id=eq.${postId}` : `photo_id=eq.${photoId}`
      }, (payload) => {
        // Update reaction counts in real-time
        if (payload.eventType === 'INSERT') {
          const reactionType = payload.new.reaction_type || 'like';
          setReactionCounts(prev => ({
            ...prev,
            [reactionType]: (prev[reactionType] || 0) + 1
          }));
        } else if (payload.eventType === 'DELETE') {
          const reactionType = payload.old.reaction_type || 'like';
          setReactionCounts(prev => ({
            ...prev,
            [reactionType]: Math.max(0, (prev[reactionType] || 0) - 1)
          }));
        }
      })
      .subscribe();

    // Load initial counts
    const loadReactionCounts = async () => {
      if (postId) {
        const { data } = await (supabase as any)
          .from('post_reactions')
          .select('reaction_type')
          .eq('post_id', postId);
        
        const counts: Record<string, number> = {};
        data?.forEach((reaction: any) => {
          counts[reaction.reaction_type] = (counts[reaction.reaction_type] || 0) + 1;
        });
        setReactionCounts(counts);
      } else if (photoId) {
        const { count } = await (supabase as any)
          .from('photo_likes')
          .select('*', { count: 'exact', head: true })
          .eq('photo_id', photoId);
        
        setReactionCounts({ like: count || 0 });
      }
    };

    loadReactionCounts();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [postId, photoId]);

  return (
    <div className={`relative ${className}`}>
      {/* Live Reactions Overlay */}
      {reactions.map((reaction) => {
        const ReactionIcon = REACTIONS[reaction.type].icon;
        return (
          <div
            key={reaction.id}
            className="absolute pointer-events-none z-20 animate-bounce"
            style={{
              left: reaction.x,
              top: reaction.y,
              animation: 'float-up 2s ease-out forwards'
            }}
          >
            <div className="text-2xl animate-pulse">
              {REACTIONS[reaction.type].emoji}
            </div>
          </div>
        );
      })}

      {/* Reaction Controls */}
      <div className="flex items-center space-x-2">
        {/* Quick Like Button */}
        <button
          onClick={handleQuickLike}
          className="flex items-center space-x-1 px-3 py-1.5 rounded-full glass-card hover:scale-105 transition-all duration-200"
        >
          <Heart className="w-4 h-4 text-red-500" />
          {reactionCounts.like > 0 && (
            <span className="text-xs font-medium">{reactionCounts.like}</span>
          )}
        </button>

        {/* Reaction Picker Toggle */}
        <button
          onClick={() => setIsReactionPickerOpen(!isReactionPickerOpen)}
          className="p-1.5 rounded-full glass-card hover:scale-105 transition-all duration-200"
        >
          <span className="text-lg">😊</span>
        </button>

        {/* Reaction Counts Display */}
        {Object.entries(reactionCounts).filter(([, count]) => count > 0).map(([type, count]) => (
          <div key={type} className="flex items-center space-x-1 text-xs">
            <span>{REACTIONS[type as keyof typeof REACTIONS]?.emoji}</span>
            <span className="font-medium">{count}</span>
          </div>
        ))}
      </div>

      {/* Reaction Picker */}
      {isReactionPickerOpen && (
        <div className="absolute bottom-full left-0 mb-2 p-2 glass-card rounded-lg flex space-x-2 z-30">
          {Object.entries(REACTIONS).map(([type, { emoji, color }]) => (
            <button
              key={type}
              onClick={(e) => addReaction(type as keyof typeof REACTIONS, e)}
              className="p-2 rounded-full hover:scale-125 transition-all duration-200 hover:bg-white/10"
            >
              <span className="text-xl">{emoji}</span>
            </button>
          ))}
        </div>
      )}

      {/* CSS for floating animation - moved to index.css */}
    </div>
  );
};