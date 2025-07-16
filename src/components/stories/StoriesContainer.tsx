import React, { useState } from 'react';
import StoryCircle from './StoryCircle';
import StoryViewer from './StoryViewer';
import StoryCreator from './StoryCreator';
import { useStories } from '@/hooks/useStories';
import { useAuth } from '@/hooks/useAuth';

const StoriesContainer: React.FC = () => {
  const { stories, loading, createStory, viewStory } = useStories();
  const { user } = useAuth();
  const [showCreator, setShowCreator] = useState(false);
  const [showViewer, setShowViewer] = useState(false);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [viewingUserStories, setViewingUserStories] = useState<any[]>([]);

  // Group stories by user
  const storiesByUser = stories.reduce((acc, story) => {
    const userId = story.user_id;
    if (!acc[userId]) {
      acc[userId] = [];
    }
    acc[userId].push(story);
    return acc;
  }, {} as Record<string, typeof stories>);

  // Get user's own stories
  const userStories = stories.filter(story => story.user_id === user?.id);
  const hasUserStories = userStories.length > 0;

  // Convert to array for display
  const userStoriesArray = Object.entries(storiesByUser).map(([userId, userStories]) => ({
    userId,
    stories: userStories,
    latestStory: userStories[0] // Most recent story
  }));

  const handleStoryClick = (userId: string) => {
    const userStoriesData = storiesByUser[userId] || [];
    setViewingUserStories(userStoriesData);
    setCurrentStoryIndex(0);
    setShowViewer(true);
  };

  const handleCreateStory = async (storyData: any) => {
    await createStory(storyData);
  };

  const handleNextStory = () => {
    if (currentStoryIndex < viewingUserStories.length - 1) {
      setCurrentStoryIndex(prev => prev + 1);
    } else {
      // Move to next user's stories or close
      setShowViewer(false);
    }
  };

  const handlePreviousStory = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(prev => prev - 1);
    }
  };

  const getDisplayName = (story: any) => {
    if (!story?.profiles) return 'Guest';
    return story.profiles.display_name || 
           `${story.profiles.first_name || ''} ${story.profiles.last_name || ''}`.trim() || 
           'Guest';
  };

  if (loading) {
    return (
      <div className="flex space-x-4 p-4 overflow-x-auto">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="flex flex-col items-center space-y-2 flex-shrink-0">
            <div className="w-16 h-16 rounded-full bg-gray-200 animate-pulse"></div>
            <div className="w-12 h-3 bg-gray-200 rounded animate-pulse"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="flex space-x-4 p-4 overflow-x-auto">
        {/* Your Story / Add Story Button */}
        <StoryCircle
          isCreateNew={!hasUserStories}
          isOwn={hasUserStories}
          story={hasUserStories ? userStories[0] : undefined}
          onClick={() => {
            if (hasUserStories) {
              handleStoryClick(user?.id || '');
            } else {
              setShowCreator(true);
            }
          }}
        />

        {/* Other Users' Stories */}
        {userStoriesArray
          .filter(({ userId }) => userId !== user?.id)
          .map(({ userId, latestStory }) => (
            <StoryCircle
              key={userId}
              story={{
                ...latestStory,
                profiles: latestStory.profiles
              }}
              onClick={() => handleStoryClick(userId)}
            />
          ))}
      </div>

      {/* Story Creator Modal */}
      <StoryCreator
        isOpen={showCreator}
        onClose={() => setShowCreator(false)}
        onCreateStory={handleCreateStory}
      />

      {/* Story Viewer Modal */}
      <StoryViewer
        isOpen={showViewer}
        stories={viewingUserStories}
        currentIndex={currentStoryIndex}
        onClose={() => setShowViewer(false)}
        onNext={handleNextStory}
        onPrevious={handlePreviousStory}
        onViewStory={viewStory}
        currentUserId={user?.id}
      />
    </>
  );
};

export default StoriesContainer;
