import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSocialPostsV2 } from '@/hooks/useSocialPostsV2';
import { useWeddingStories } from '@/hooks/useWeddingStories';
import { useNavigate } from 'react-router-dom';
import SocialHeader from './SocialHeader';
import StoriesStrip from './StoriesStrip';
import FeedCard from './FeedCard';
import ComposerBar from './ComposerBar';
import CallFab from './CallFab';
import InstantMessengerCard from '@/components/social/InstantMessengerCard';
import ContactPickerModal from '@/components/social/ContactPickerModal';
import SearchPopup from '@/components/social/SearchPopup';
import WhosComing from '@/components/social/WhosComing';
import ShareModal from '@/components/social/ShareModal';
import PollCreator from '@/components/social/PollCreator';
import HashtagChip from '@/components/social/HashtagChip';
import { openMessenger } from '@/utils/messengerUtils';
import { Contact, openStoryCreator, openNotificationsPanel } from '@/utils/socialUtils';
import { toast } from 'sonner';
import { getLiquidGlassStyle, stylePresets } from '@/utils/styleHelpers';
import styles from '@/components/dashboard/dashboard.module.css';
import { Card } from '@/components/ui/card';
import { Camera, Plus, MessageSquare, Clock, Users as UsersIcon } from 'lucide-react';

interface SocialPageProps {
  isPopup?: boolean;
  onClose?: () => void;
}

const SocialPage: React.FC<SocialPageProps> = ({ isPopup = false, onClose }) => {
  console.log('SocialPage v2 loaded with new features');
  console.log('Using enhanced social posts hook:', useSocialPostsV2);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { posts, loading: postsLoading, createPost, addReaction, sharePost, voteOnPoll, loadMore } = useSocialPostsV2();
  const { stories, loading: storiesLoading, createStory } = useWeddingStories();
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  
  // Modal states
  const [showContactPicker, setShowContactPicker] = useState(false);
  const [contactPickerAction, setContactPickerAction] = useState<'video' | 'audio' | 'message'>('video');
  const [showSearch, setShowSearch] = useState(false);
  const [activeCall, setActiveCall] = useState<{ type: 'video' | 'audio'; contactId: string } | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [sharePostId, setSharePostId] = useState<string | null>(null);
  const [sharePostContent, setSharePostContent] = useState<string>('');
  const [sharePostAuthor, setSharePostAuthor] = useState<string>('');

  // Transform Supabase posts to match FeedCard interface
  const transformedPosts = posts.map(post => ({
    id: post.id,
    user_id: post.user_id,
    user_name: post.profiles?.display_name || 
              `${post.profiles?.first_name || ''} ${post.profiles?.last_name || ''}`.trim() || 
              'Anonymous User',
    user_avatar: post.profiles?.avatar_url,
    content: post.content || '',
    created_at: post.created_at,
    location: post.location,
    tags: post.tags || [],
    share_count: post.share_count || 0,
    poll: post.poll,
    shared_post: post.shared_post,
    mentions: post.mentions || [],
    media_attachments: post.media_urls && post.media_urls.length > 0 ? post.media_urls.map((url, index) => ({
      id: `${post.id}-media-${index}`,
      type: post.media_types?.[index]?.includes('video') ? 'video' as const : 'image' as const,
      url: url,
      thumbnail_url: post.media_thumbnails?.[index],
      alt_text: 'User uploaded media'
    })) : [],
    reactions: Object.entries(post.reaction_counts).map(([emoji, count]) => ({
      emoji: emoji === 'like' ? '❤️' : 
             emoji === 'love' ? '😍' : 
             emoji === 'laugh' ? '😂' : 
             emoji === 'wow' ? '😲' : 
             emoji === 'sad' ? '😢' : 
             emoji === 'angry' ? '😠' : '❤️',
      count: count as number,
      hasReacted: post.user_reaction === emoji
    })),
    comment_count: post.comment_count,
    is_wedding_related: true, // All posts in wedding app are wedding related
  }));

  // Transform Supabase stories to match StoriesStrip interface
  const transformedStories = stories.map(story => ({
    id: story.id,
    user_id: story.user_id,
    user_name: story.profiles?.display_name || 
              `${story.profiles?.first_name || ''} ${story.profiles?.last_name || ''}`.trim() || 
              'Anonymous User',
    user_avatar: story.profiles?.avatar_url,
    media_url: story.media_url,
    media_type: story.media_type as 'image' | 'video',
    created_at: story.created_at,
    expires_at: story.expires_at,
    is_viewed: story.is_viewed
  }));

  const handlePost = async (content: string, media: File[], location?: string, tags?: string[], poll?: any) => {
    if (!content.trim() && media.length === 0 && !poll) return;
    
    await createPost(content, media, location, tags, poll);
  };

  const handleLike = async (postId: string, emoji: string) => {
    // Map emoji to reaction type
    const reactionType = emoji === '❤️' ? 'like' :
                        emoji === '😍' ? 'love' :
                        emoji === '😂' ? 'laugh' :
                        emoji === '😲' ? 'wow' :
                        emoji === '😢' ? 'sad' :
                        emoji === '😠' ? 'angry' : 'like';
    
    await addReaction(postId, reactionType);
  };

  const handleComment = async (postId: string, content: string) => {
    
  };

  const handleShare = async (postId: string) => {
    const post = posts.find(p => p.id === postId);
    if (post) {
      setSharePostId(postId);
      setSharePostContent(post.content || '');
      setSharePostAuthor(post.profiles?.display_name || 'Unknown');
      setShareModalOpen(true);
    }
  };

  const handleSharePost = async (platform: string, comment?: string) => {
    if (platform === 'internal' && sharePostId) {
      await sharePost(sharePostId, comment);
    }
  };

  const handleStartVideoCall = () => {
    setContactPickerAction('video');
    setShowContactPicker(true);
  };

  const handleStartAudioCall = () => {
    setContactPickerAction('audio');
    setShowContactPicker(true);
  };

  const handleAddStory = async () => {
    openStoryCreator(async (file) => {
      try {
        await createStory(file);
        toast.success('Story posted successfully! 🎉');
      } catch (error) {
        toast.error('Failed to post story');
        console.error('Story creation error:', error);
      }
    });
  };

  const handleViewStory = (story: any) => {
    // TODO: Implement story viewer modal
    toast.info(`Viewing ${story.user_name}'s story`);
  };

  const handleContactSelect = (contact: Contact, action: 'video' | 'audio' | 'message') => {
    if (action === 'message') {
      // Open messenger for this contact
      openMessenger({ 
        center: true, 
        minimized: false,
        targetUserId: contact.id 
      });
    } else {
      // Start call with this contact
      setActiveCall({ type: action, contactId: contact.id });
      toast.success(`Starting ${action} call with ${contact.name}...`);
    }
    setShowContactPicker(false);
  };

  const handleSearch = () => {
    setShowSearch(true);
  };

  const handleNotifications = () => {
    // Navigate to home page where notifications are shown
    navigate('/');
  };

  const handleSettings = () => {
    navigate('/settings');
  };

  const handleMessageClick = () => {
    setContactPickerAction('message');
    setShowContactPicker(true);
  };

  // Set up infinite scroll
  useEffect(() => {
    const scrollableElement = isPopup ? scrollContainerRef.current : window;
    if (!scrollableElement) return;

    const handleScroll = () => {
      if (postsLoading) return;
      let scrollCondition = false;

      if (isPopup && scrollContainerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
        // Trigger load more when 80% of the container is scrolled
        scrollCondition = scrollTop + clientHeight >= scrollHeight * 0.8;
      } else {
        scrollCondition = 
          window.innerHeight + document.documentElement.scrollTop >=
          document.documentElement.offsetHeight - 1000;
      }

      if (scrollCondition) {
        loadMore();
      }
    };

    scrollableElement.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      scrollableElement.removeEventListener('scroll', handleScroll);
    };
  }, [isPopup, loadMore, postsLoading]);

  // TEMPORARY: Comment out auth check to see UI changes
  // if (!user) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
  //       <div className="text-center p-8 rounded-2xl shadow-xl border"
  //            style={{
  //              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%)',
  //              backdropFilter: 'blur(30px) saturate(1.5)',
  //              WebkitBackdropFilter: 'blur(30px) saturate(1.5)',
  //              borderColor: 'rgba(0, 122, 255, 0.3)',
  //              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.1), inset 0 1px 1px rgba(255, 255, 255, 0.5)'
  //            }}>
  //         <h2 className="text-2xl font-semibold mb-4 text-[#2d3f51]" style={{ fontFamily: '"Montserrat", sans-serif' }}>
  //           Please sign in to access Wedding Social
  //         </h2>
  //         <p className="text-[#7a736b] mb-6">Connect with your wedding party and share special moments</p>
  //         <button
  //           onClick={() => navigate('/auth')}
  //           className="px-6 py-3 text-white rounded-lg transition-all duration-300 hover:scale-105"
  //           style={{
  //             background: 'linear-gradient(135deg, #007AFF 0%, #0066CC 100%)',
  //             boxShadow: '0 4px 12px rgba(0, 122, 255, 0.3)'
  //           }}
  //         >
  //           Sign In
  //         </button>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className={`${isPopup ? 'h-full flex flex-col' : 'min-h-screen'} bg-gradient-to-br from-wedding-pearl via-white to-wedding-pearl/30 relative overflow-hidden`}>
        {/* Version indicator - REMOVE IN PRODUCTION */}
        <div className="fixed top-0 left-0 bg-green-500 text-white px-3 py-1 text-xs font-bold z-[9999] rounded-br-lg">
          V2 Enhanced Social
        </div>
        {/* Enhanced background pattern matching wedding app design */}
        <div className="absolute inset-0 opacity-[0.03]">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23007AFF' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
        <SocialHeader
          isPopup={isPopup}
          onClose={onClose}
          onVideoCall={handleStartVideoCall}
          onAudioCall={handleStartAudioCall}
          onSearch={handleSearch}
          onNotifications={handleNotifications}
          onSettings={handleSettings}
          onMessage={handleMessageClick}
        />

        {isPopup ? (
          <div 
            ref={scrollContainerRef}
            className="flex-1 overflow-y-auto px-4 py-4"
            style={{ height: 'calc(100vh - 140px)' }}
          >
            <div className="max-w-3xl mx-auto space-y-6">
              <WhosComing className="mb-6" />
              <InstantMessengerCard className="mb-6" />
              <StoriesStrip
                stories={transformedStories}
                onAddStory={handleAddStory}
                onViewStory={handleViewStory}
              />
              <ComposerBar onPost={handlePost} className="mb-6" />
              
              {postsLoading && transformedPosts.length === 0 ? (
                <div className="text-center py-16">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-wedding-navy mx-auto"></div>
                  <p className="mt-4 text-muted-foreground">Loading posts...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {transformedPosts.map(post => (
                    <FeedCard 
                      key={post.id}
                      post={post}
                      onLike={(emoji) => handleLike(post.id, emoji)}
                      onComment={(content) => handleComment(post.id, content)}
                      onShare={() => handleShare(post.id)}
                      onVotePoll={voteOnPoll}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div 
            ref={scrollContainerRef}
            className="w-full px-4 pb-8 pt-6"
          >
            <div className="social-page-grid max-w-7xl mx-auto">
              {/* Left Sidebar */}
              <aside className="hidden lg:block">
                <div className="sticky top-6 space-y-6">
                  <Card className="glass-card-enhanced p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <span className="text-2xl">✨</span>
                      Quick Actions
                    </h3>
                    <div className="space-y-3">
                      <button className="w-full text-left p-3 rounded-lg hover:bg-white/50 transition-colors flex items-center gap-3 group">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-wedding-gold to-yellow-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Camera className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-sm font-medium">Share Photos</span>
                      </button>
                      <button className="w-full text-left p-3 rounded-lg hover:bg-white/50 transition-colors flex items-center gap-3 group">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Plus className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-sm font-medium">Add Story</span>
                      </button>
                      <button className="w-full text-left p-3 rounded-lg hover:bg-white/50 transition-colors flex items-center gap-3 group">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <MessageSquare className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-sm font-medium">Group Chat</span>
                      </button>
                    </div>
                  </Card>
                  <Card className="glass-card-enhanced p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <span className="text-2xl">💍</span>
                      Wedding Timeline
                    </h3>
                    <div className="space-y-3">
                      <div className="p-3 rounded-lg bg-wedding-gold/10 border border-wedding-gold/20">
                        <div className="font-semibold text-sm">Ceremony</div>
                        <div className="text-xs text-gray-600 flex items-center gap-1 mt-1">
                          <Clock className="w-3 h-3" />
                          3:00 PM - Main Chapel
                        </div>
                      </div>
                      <div className="p-3 rounded-lg bg-purple-100/50 border border-purple-200/50">
                        <div className="font-semibold text-sm">Reception</div>
                        <div className="text-xs text-gray-600 flex items-center gap-1 mt-1">
                          <Clock className="w-3 h-3" />
                          6:00 PM - Grand Ballroom
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              </aside>

              {/* Main Content */}
              <main className="space-y-6 min-w-0">
                <StoriesStrip 
                  stories={transformedStories}
                  onAddStory={handleAddStory}
                  onViewStory={handleViewStory}
                />
                <ComposerBar onPost={handlePost} />
                
                {postsLoading && transformedPosts.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-wedding-navy mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Loading posts...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {transformedPosts.map(post => (
                      <FeedCard 
                        key={post.id}
                        post={post}
                        onLike={(emoji) => handleLike(post.id, emoji)}
                        onComment={(content) => handleComment(post.id, content)}
                        onShare={() => handleShare(post.id)}
                        onVotePoll={voteOnPoll}
                      />
                    ))}
                  </div>
                )}
              </main>

              {/* Right Sidebar */}
              <aside className="hidden lg:block">
                <div className="sticky top-6 space-y-6">
                  <WhosComing />
                  <Card className="glass-card-enhanced p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <UsersIcon className="w-5 h-5 text-wedding-gold" />
                      Online Now
                    </h3>
                    <div className="space-y-3">
                      <div className="text-center py-8">
                        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
                          <UsersIcon className="w-6 h-6 text-gray-400" />
                        </div>
                        <p className="text-sm text-gray-500">
                          Guests will appear here when online
                        </p>
                      </div>
                    </div>
                  </Card>
                  <Card className="glass-card-enhanced p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Camera className="w-5 h-5 text-wedding-gold" />
                      Recent Photos
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="aspect-square rounded-lg bg-gray-100 flex items-center justify-center">
                        <Camera className="w-6 h-6 text-gray-400" />
                      </div>
                      <div className="aspect-square rounded-lg bg-gray-100 flex items-center justify-center">
                        <Camera className="w-6 h-6 text-gray-400" />
                      </div>
                      <div className="aspect-square rounded-lg bg-gray-100 flex items-center justify-center">
                        <Camera className="w-6 h-6 text-gray-400" />
                      </div>
                      <div className="aspect-square rounded-lg bg-gray-100 flex items-center justify-center">
                        <Camera className="w-6 h-6 text-gray-400" />
                      </div>
                    </div>
                    <button className="w-full mt-3 py-2 px-4 bg-wedding-gold hover:bg-wedding-gold/90 text-white rounded-lg transition-colors text-sm font-medium">
                      View All Photos
                    </button>
                  </Card>
                  <Card className="glass-card-enhanced p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-wedding-gold" />
                      Latest Activity
                    </h3>
                    <div className="space-y-3">
                      <div className="text-center py-8">
                        <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-sm text-gray-500">No recent activity</p>
                        <p className="text-xs text-gray-400 mt-1">Be the first to post!</p>
                      </div>
                    </div>
                  </Card>
                </div>
              </aside>
            </div>
          </div>
        )}

        {!isPopup && (
          <CallFab
            onStartVideoCall={handleStartVideoCall}
            onStartAudioCall={handleStartAudioCall}
          />
        )}

        {/* Contact Picker Modal */}
        <ContactPickerModal
          isOpen={showContactPicker}
          onClose={() => setShowContactPicker(false)}
          onSelectContact={handleContactSelect}
          action={contactPickerAction}
        />

        {/* Search Modal */}
        {showSearch && (
          <SearchPopup onClose={() => setShowSearch(false)} />
        )}

        {/* Active Call Overlay */}
        {activeCall && (
          <CallFab
            isVisible={true}
            onEndCall={() => setActiveCall(null)}
          />
        )}

        {/* Share Modal */}
        <ShareModal
          isOpen={shareModalOpen}
          onClose={() => setShareModalOpen(false)}
          postId={sharePostId || ''}
          postContent={sharePostContent}
          postAuthor={sharePostAuthor}
          onShare={handleSharePost}
        />
      </div>
    );
};

export default SocialPage;