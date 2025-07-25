import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, ChevronLeft, ChevronRight, Camera, Video } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { usePresence } from '@/hooks/usePresence';
import { getLiquidGlassStyle } from '@/utils/styleHelpers';
import styles from '@/components/dashboard/dashboard.module.css';

interface Story {
  id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  media_url: string;
  media_type: 'image' | 'video';
  caption?: string;
  created_at: string;
  expires_at: string;
  view_count: number;
  is_viewed: boolean;
}

interface StoriesStripProps {
  stories?: Story[];
  onAddStory?: () => void;
  onViewStory?: (story: Story) => void;
  className?: string;
}

const StoriesStrip: React.FC<StoriesStripProps> = ({
  stories = [],
  onAddStory,
  onViewStory,
  className = ''
}) => {
  const { profile } = useAuth();
  const { onlineUsers } = usePresence();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Use only real stories from Supabase
  const allStories = stories;

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  const scrollTo = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 200;
      const newScrollLeft = direction === 'left' 
        ? scrollRef.current.scrollLeft - scrollAmount
        : scrollRef.current.scrollLeft + scrollAmount;
      
      scrollRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  const isUserOnline = (userId: string) => {
    return onlineUsers.some(user => user.user_id === userId);
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours === 1) return '1h ago';
    return `${diffInHours}h ago`;
  };

  return (
    <div className={`w-full rounded-2xl overflow-hidden ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-r from-white/80 via-wedding-pearl/70 to-white/80 backdrop-blur-2xl" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/10" />
      <div className="relative glass-card-enhanced transition-all duration-300 hover:shadow-xl" style={{
        borderRadius: '16px',
        overflow: 'hidden'
      }}>
      <div className="p-4">
        <div className="relative">
          {/* Left scroll button */}
          {canScrollLeft && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 p-0 rounded-full bg-white/80 hover:bg-white/90 shadow-md"
              onClick={() => scrollTo('left')}
              aria-label="Scroll stories left"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}

          {/* Stories container */}
          <div
            ref={scrollRef}
            className="flex gap-3 overflow-x-auto scrollbar-hide pb-2"
            onScroll={handleScroll}
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {/* Add Story Button */}
            <div className="flex flex-col items-center gap-2 min-w-[72px]">
              <button
                className="w-16 h-16 rounded-full border-2 border-dashed transition-all duration-300 hover:scale-110 hover:rotate-12 group relative overflow-hidden"
                style={{
                  borderColor: 'rgba(255, 215, 0, 0.6)',
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 100%)',
                  boxShadow: '0 4px 16px rgba(255, 215, 0, 0.15), 0 0 40px rgba(255, 215, 0, 0.1) inset'
                }}
                onClick={onAddStory}
                aria-label="Add your story"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-wedding-gold/0 via-wedding-gold/20 to-wedding-gold/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-shimmer" />
                <div className="flex flex-col items-center gap-1">
                  <Plus className="h-6 w-6 group-hover:scale-110 transition-transform duration-300" style={{ color: '#ffd700' }} />
                </div>
              </button>
              <span style={{
                fontFamily: '"Montserrat", sans-serif',
                fontSize: '12px',
                fontWeight: '500',
                color: 'rgba(0, 0, 0, 0.6)'
              }}>
                Your Story
              </span>
            </div>

            {/* Story items */}
            {allStories.map((story) => (
              <div key={story.id} className="flex flex-col items-center gap-2 min-w-[72px]">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-16 h-16 p-0 rounded-full hover:scale-105 transition-transform"
                  onClick={() => onViewStory?.(story)}
                  aria-label={`View ${story.user_name}'s story`}
                >
                  <div className="relative">
                    {/* Story ring */}
                    <div className={`w-16 h-16 rounded-full p-0.5 shadow-lg ${
                      story.is_viewed 
                        ? 'bg-gradient-to-tr from-gray-300 to-gray-400' 
                        : 'bg-gradient-to-tr from-wedding-gold via-pink-500 to-purple-500 animate-pulse'
                    }`}>
                      <div className="w-full h-full rounded-full p-0.5 bg-white">
                        <Avatar className="w-full h-full">
                          <AvatarImage src={story.user_avatar} alt={story.user_name} />
                          <AvatarFallback className="text-sm">
                            {story.user_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                    </div>

                    {/* Online indicator */}
                    {isUserOnline(story.user_id) && (
                      <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
                    )}

                    {/* Media type indicator */}
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-5 h-5 bg-white rounded-full border border-gray-200 flex items-center justify-center">
                      {story.media_type === 'video' ? (
                        <Video className="h-3 w-3 text-blue-500" />
                      ) : (
                        <Camera className="h-3 w-3 text-gray-600" />
                      )}
                    </div>
                  </div>
                </Button>
                
                <div className="text-center">
                  <span className="text-xs font-medium text-muted-foreground leading-tight block">
                    {story.user_name.split(' ')[0]}
                  </span>
                  <span className="text-xs text-muted-foreground/70">
                    {getTimeAgo(story.created_at)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Right scroll button */}
          {canScrollRight && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 p-0 rounded-full bg-white/80 hover:bg-white/90 shadow-md"
              onClick={() => scrollTo('right')}
              aria-label="Scroll stories right"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Story count */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-wedding-gold/20">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <span className="text-wedding-gold">📸</span>
            {allStories.length} active stories
          </span>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            {allStories.filter(s => !s.is_viewed).length > 0 && (
              <span className="w-2 h-2 bg-wedding-gold rounded-full animate-pulse" />
            )}
            {allStories.filter(s => !s.is_viewed).length} new
          </span>
        </div>
      </div>
    </div>
  </div>
  );
};

export default StoriesStrip;