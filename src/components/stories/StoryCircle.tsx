import React from 'react';
import { Plus, User } from 'lucide-react';

interface StoryCircleProps {
  story?: {
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
  };
  isCreateNew?: boolean;
  isOwn?: boolean;
  onClick: () => void;
}

const StoryCircle: React.FC<StoryCircleProps> = ({ 
  story, 
  isCreateNew = false,
  isOwn = false,
  onClick 
}) => {
  const getDisplayName = () => {
    if (!story?.profiles) return 'You';
    return story.profiles.display_name || 
           `${story.profiles.first_name || ''} ${story.profiles.last_name || ''}`.trim() || 
           'Guest';
  };

  const renderContent = () => {
    if (isCreateNew) {
      return (
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#e8e0d7] to-[#f5ede4] flex items-center justify-center">
          <Plus className="w-6 h-6 text-[#2d3f51]" />
        </div>
      );
    }

    if (!story) return null;

    const backgroundImage = story.media_thumbnail || story.media_url;
    const isTextStory = story.media_type === 'text';

    return (
      <div 
        className="w-16 h-16 rounded-full overflow-hidden flex items-center justify-center"
        style={{ 
          background: isTextStory
            ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            : backgroundImage 
              ? `url(${backgroundImage})` 
              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        {isTextStory && (
          <div className="text-white text-xs font-semibold text-center p-1">
            Story
          </div>
        )}
        {!backgroundImage && !isTextStory && (
          <User className="w-8 h-8 text-white" />
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center space-y-2 cursor-pointer" onClick={onClick}>
      {/* Story Circle with Gradient Border */}
      <div className={`relative p-1 rounded-full ${
        isCreateNew 
          ? 'bg-transparent' 
          : 'bg-gradient-to-r from-[#667eea] to-[#764ba2]'
      }`}>
        {renderContent()}
        
        {/* Unread Indicator */}
        {!isCreateNew && !isOwn && (
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#667eea] rounded-full border-2 border-white flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
        )}
      </div>
      
      {/* Story Label */}
      <div className="text-xs text-center max-w-[70px]">
        <div className="text-[#2d3f51] font-medium truncate">
          {isCreateNew ? 'Your Story' : getDisplayName()}
        </div>
        {!isCreateNew && story && (
          <div className="text-[#7a736b] text-[10px]">
            Story
          </div>
        )}
      </div>
    </div>
  );
};

export default StoryCircle;