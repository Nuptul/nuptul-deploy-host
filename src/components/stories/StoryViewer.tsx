import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, Eye, Heart, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Story {
  id: string;
  user_id: string;
  media_url: string;
  media_thumbnail?: string;
  media_type: string;
  profiles?: {
    first_name?: string;
    last_name?: string;
    display_name?: string;
    avatar_url?: string;
  };
  created_at: string;
  duration?: number;
  view_count?: number;
}

interface StoryViewerProps {
  stories: Story[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onViewStory: (storyId: string) => void;
  currentUserId?: string;
}

const StoryViewer: React.FC<StoryViewerProps> = ({
  stories,
  currentIndex,
  isOpen,
  onClose,
  onNext,
  onPrevious,
  onViewStory,
  currentUserId
}) => {
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showReactionInput, setShowReactionInput] = useState(false);
  const [reactionText, setReactionText] = useState('');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const pressTimerRef = useRef<NodeJS.Timeout | null>(null);

  const currentStory = stories[currentIndex];
  const isOwn = currentStory?.user_id === currentUserId;
  
  // Story duration: 7s for photos, actual duration for videos, 5s for text
  const storyDuration = currentStory ? (
    currentStory.media_type === 'video' ? (currentStory.duration || 15) * 1000 : 7000
  ) : 7000;

  useEffect(() => {
    if (!isOpen || isPaused) return;

    // Mark story as viewed
    if (currentStory && !isOwn) {
      onViewStory(currentStory.id);
    }

    setProgress(0);
    
    const startTime = Date.now();
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = (elapsed / storyDuration) * 100;
      
      if (newProgress >= 100) {
        if (currentIndex < stories.length - 1) {
          onNext();
        } else {
          onClose();
        }
      } else {
        setProgress(newProgress);
      }
    }, 50);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [currentIndex, isOpen, isPaused, storyDuration, onNext, onClose, currentStory, isOwn, onViewStory]);

  const handleMouseDown = () => {
    setIsPaused(true);
    pressTimerRef.current = setTimeout(() => {
      setIsPaused(true);
    }, 100);
  };

  const handleMouseUp = () => {
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
    }
    setIsPaused(false);
  };

  const handleLeftTap = () => {
    if (currentIndex > 0) {
      onPrevious();
    }
  };

  const handleRightTap = () => {
    if (currentIndex < stories.length - 1) {
      onNext();
    } else {
      onClose();
    }
  };

  const getDisplayName = () => {
    if (!currentStory?.profiles) return 'Guest';
    return currentStory.profiles.display_name || 
           `${currentStory.profiles.first_name || ''} ${currentStory.profiles.last_name || ''}`.trim() || 
           'Guest';
  };

  const getTimeAgo = () => {
    if (!currentStory) return '';
    const hours = Math.floor((Date.now() - new Date(currentStory.created_at).getTime()) / (1000 * 60 * 60));
    return `${hours}h`;
  };

  const renderStoryContent = () => {
    if (!currentStory) return null;

    const { media_type, media_url } = currentStory;

    if (media_type === 'video') {
      return (
        <video
          src={media_url}
          className="w-full h-full object-cover"
          autoPlay
          muted
          playsInline
        />
      );
    }

    return (
      <img
        src={media_url}
        alt="Story"
        className="w-full h-full object-cover"
      />
    );
  };

  if (!isOpen || !currentStory) return null;

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      {/* Progress Bars */}
      <div className="absolute top-4 left-4 right-4 flex space-x-1 z-10">
        {stories.map((_, index) => (
          <div key={index} className="flex-1 h-1 bg-white/30 rounded">
            <div 
              className="h-full bg-white rounded transition-all duration-100"
              style={{ 
                width: index < currentIndex ? '100%' : 
                       index === currentIndex ? `${progress}%` : '0%'
              }}
            />
          </div>
        ))}
      </div>

      {/* Story Header */}
      <div className="absolute top-8 left-4 right-4 flex items-center justify-between z-10 mt-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#667eea] to-[#764ba2] flex items-center justify-center">
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
              <span className="text-white text-xs font-bold">
                {getDisplayName().charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
          <div>
            <div className="text-white font-semibold text-sm">{getDisplayName()}</div>
            <div className="text-white/70 text-xs">{getTimeAgo()}</div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {isOwn && (
            <div className="flex items-center space-x-1 text-white/70">
              <Eye className="w-4 h-4" />
              <span className="text-xs">{currentStory.view_count}</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white hover:bg-white/20 p-1"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Navigation Areas */}
      <div className="absolute inset-0 flex">
        {/* Left tap area */}
        <div 
          className="flex-1 flex items-center justify-start pl-4"
          onClick={handleLeftTap}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleMouseDown}
          onTouchEnd={handleMouseUp}
        >
          {currentIndex > 0 && (
            <ChevronLeft className="w-8 h-8 text-white/50" />
          )}
        </div>

        {/* Story content */}
        <div className="flex-[2] relative">
          {renderStoryContent()}
        </div>

        {/* Right tap area */}
        <div 
          className="flex-1 flex items-center justify-end pr-4"
          onClick={handleRightTap}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleMouseDown}
          onTouchEnd={handleMouseUp}
        >
          {currentIndex < stories.length - 1 && (
            <ChevronRight className="w-8 h-8 text-white/50" />
          )}
        </div>
      </div>

      {/* Bottom Actions */}
      {!isOwn && (
        <div className="absolute bottom-4 left-4 right-4 z-10">
          {showReactionInput ? (
            <div className="flex items-center space-x-2 bg-black/50 rounded-full p-2">
              <input
                type="text"
                placeholder="Send a message..."
                value={reactionText}
                onChange={(e) => setReactionText(e.target.value)}
                className="flex-1 bg-transparent text-white placeholder-white/70 outline-none px-3 py-2"
                autoFocus
              />
              <Button
                size="sm"
                className="bg-[#667eea] hover:bg-[#667eea]/90 rounded-full p-2"
                onClick={() => {
                  // Handle sending reaction/message
                  setReactionText('');
                  setShowReactionInput(false);
                }}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20 rounded-full"
                onClick={() => setShowReactionInput(true)}
              >
                Send Message
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20 rounded-full p-2"
              >
                <Heart className="w-5 h-5" />
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Pause indicator */}
      {isPaused && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-black/50 rounded-full p-3">
            <div className="flex space-x-1">
              <div className="w-2 h-6 bg-white rounded"></div>
              <div className="w-2 h-6 bg-white rounded"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoryViewer;