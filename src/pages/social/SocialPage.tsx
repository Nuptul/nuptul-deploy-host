import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSocialPosts } from '@/hooks/useSocialPosts';
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
import { openMessenger } from '@/utils/messengerUtils';
import { Contact, openStoryCreator, openNotificationsPanel } from '@/utils/socialUtils';
import { toast } from 'sonner';
import { getLiquidGlassStyle, stylePresets } from '@/utils/styleHelpers';
import styles from '@/components/dashboard/dashboard.module.css';

interface SocialPageProps {
  isPopup?: boolean;
  onClose?: () => void;
}

const SocialPage: React.FC<SocialPageProps> = ({ isPopup = false, onClose }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { posts, loading: postsLoading, createPost, addReaction, loadMore } = useSocialPosts();
  const { stories, loading: storiesLoading, createStory } = useWeddingStories();
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  
  // Modal states
  const [showContactPicker, setShowContactPicker] = useState(false);
  const [contactPickerAction, setContactPickerAction] = useState<'video' | 'audio' | 'message'>('video');
  const [showSearch, setShowSearch] = useState(false);
  const [activeCall, setActiveCall] = useState<{ type: 'video' | 'audio'; contactId: string } | null>(null);

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
    media_attachments: post.media_url ? [{
      id: post.id,
      type: post.media_type?.includes('video') ? 'video' as const : 'image' as const,
      url: post.media_url,
      thumbnail_url: post.media_thumbnail,
      alt_text: 'User uploaded media'
    }] : [],
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

  const handlePost = async (content: string, media: File[], location?: string, tags?: string[]) => {
    if (!content.trim() && media.length === 0) return;
    
    // For now, handle single media file
    const mediaFile = media.length > 0 ? media[0] : undefined;
    await createPost(content, mediaFile);
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

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Please sign in to access Wedding Social</h2>
          <p className="text-gray-600">Connect with your wedding party and share special moments</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${isPopup ? 'h-full flex flex-col' : 'min-h-screen'} bg-gradient-to-br from-wedding-gold/5 via-purple-50/80 to-pink-50/80 relative overflow-hidden`}>
        {/* Luxury background pattern */}
        <div className="absolute inset-0 opacity-[0.02]">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000' fill-opacity='1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
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
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div 
            ref={scrollContainerRef}
            className="grid max-w-7xl w-full mx-auto px-4 lg:grid-cols-12 pb-8 pt-6 gap-8"
          >
            {/* Left Sidebar */}
            <aside className="hidden lg:block lg:col-span-3">
            <div className="sticky top-6 space-y-6">
              <div className={`p-6 rounded-2xl ${styles.liquidGlassCard}`} style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0.25) 100%)',
                backdropFilter: 'blur(25px) saturate(1.8)',
                WebkitBackdropFilter: 'blur(25px) saturate(1.8)',
                border: '1px solid rgba(255, 255, 255, 0.4)',
                boxShadow: '0 8px 32px rgba(31, 38, 135, 0.12), inset 0 1px 1px rgba(255, 255, 255, 0.6)'
              }}>
                <h3 style={{
                  fontFamily: '"Bodoni Moda", serif',
                  fontSize: '20px',
                  fontWeight: '600',
                  color: '#000000',
                  marginBottom: '16px'
                }}>Quick Actions</h3>
                <div className="space-y-3">
                  <button className="w-full text-left p-3 rounded-lg hover:bg-white/50 transition-colors flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-wedding-gold to-yellow-400 flex items-center justify-center">
                      <span className="text-white text-sm">📸</span>
                    </div>
                    <span style={{ fontFamily: '"Montserrat", sans-serif', fontSize: '14px', fontWeight: '500' }}>Share Photos</span>
                  </button>
                  <button className="w-full text-left p-3 rounded-lg hover:bg-white/50 transition-colors flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                      <span className="text-white text-sm">🎉</span>
                    </div>
                    <span style={{ fontFamily: '"Montserrat", sans-serif', fontSize: '14px', fontWeight: '500' }}>Add Story</span>
                  </button>
                  <button className="w-full text-left p-3 rounded-lg hover:bg-white/50 transition-colors flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                      <span className="text-white text-sm">💬</span>
                    </div>
                    <span style={{ fontFamily: '"Montserrat", sans-serif', fontSize: '14px', fontWeight: '500' }}>Group Chat</span>
                  </button>
                </div>
              </div>
              <div className={`p-6 rounded-2xl ${styles.liquidGlassCard}`} style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0.25) 100%)',
                backdropFilter: 'blur(25px) saturate(1.8)',
                WebkitBackdropFilter: 'blur(25px) saturate(1.8)',
                border: '1px solid rgba(255, 255, 255, 0.4)',
                boxShadow: '0 8px 32px rgba(31, 38, 135, 0.12), inset 0 1px 1px rgba(255, 255, 255, 0.6)'
              }}>
                <h3 className="flex items-center gap-2" style={{
                  fontFamily: '"Bodoni Moda", serif',
                  fontSize: '20px',
                  fontWeight: '600',
                  color: '#000000',
                  marginBottom: '16px'
                }}>
                  <span className="text-wedding-gold">💍</span>
                  Wedding Timeline
                </h3>
                <div className="space-y-3">
                  <div className={`p-3 rounded-lg ${styles.scheduleItem}`} style={{
                    background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 193, 7, 0.05) 100%)',
                    border: '1px solid rgba(255, 215, 0, 0.2)'
                  }}>
                    <div style={{ fontFamily: '"Montserrat", sans-serif', fontSize: '14px', fontWeight: '600', color: '#000000' }}>Ceremony</div>
                    <div style={{ fontFamily: '"Montserrat", sans-serif', fontSize: '12px', color: 'rgba(0, 0, 0, 0.6)' }}>3:00 PM - Main Chapel</div>
                  </div>
                  <div className={`p-3 rounded-lg ${styles.scheduleItem}`} style={{
                    background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.1) 0%, rgba(236, 72, 153, 0.05) 100%)',
                    border: '1px solid rgba(147, 51, 234, 0.2)'
                  }}>
                    <div style={{ fontFamily: '"Montserrat", sans-serif', fontSize: '14px', fontWeight: '600', color: '#000000' }}>Reception</div>
                    <div style={{ fontFamily: '"Montserrat", sans-serif', fontSize: '12px', color: 'rgba(0, 0, 0, 0.6)' }}>6:00 PM - Grand Ballroom</div>
                  </div>
                </div>
              </div>
            </div>
          </aside>

            {/* Main Content */}
            <main className="lg:col-span-6 space-y-6">
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
                  />
                ))}
              </div>
            )}
            </main>

            {/* Right Sidebar */}
            <aside className="hidden lg:block lg:col-span-3">
            <div className="sticky top-6 space-y-6">
              <div className={`p-6 rounded-2xl ${styles.liquidGlassCard}`} style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0.25) 100%)',
                backdropFilter: 'blur(25px) saturate(1.8)',
                WebkitBackdropFilter: 'blur(25px) saturate(1.8)',
                border: '1px solid rgba(255, 255, 255, 0.4)',
                boxShadow: '0 8px 32px rgba(31, 38, 135, 0.12), inset 0 1px 1px rgba(255, 255, 255, 0.6)'
              }}>
                <h3 className="flex items-center gap-2" style={{
                  fontFamily: '"Bodoni Moda", serif',
                  fontSize: '20px',
                  fontWeight: '600',
                  color: '#000000',
                  marginBottom: '16px'
                }}>
                  <span className="text-wedding-gold">👥</span>
                  Online Now
                </h3>
                <div className="space-y-3">
                  <div className="text-center py-8">
                    <div className="text-gray-500 text-sm">
                      <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-r from-gray-200 to-gray-300 flex items-center justify-center">
                        <span className="text-gray-400">👤</span>
                      </div>
                      Guests will appear here when online
                    </div>
                  </div>
                </div>
              </div>
              <div className={`p-6 rounded-2xl ${styles.liquidGlassCard}`} style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0.25) 100%)',
                backdropFilter: 'blur(25px) saturate(1.8)',
                WebkitBackdropFilter: 'blur(25px) saturate(1.8)',
                border: '1px solid rgba(255, 255, 255, 0.4)',
                boxShadow: '0 8px 32px rgba(31, 38, 135, 0.12), inset 0 1px 1px rgba(255, 255, 255, 0.6)'
              }}>
                <h3 className="flex items-center gap-2" style={{
                  fontFamily: '"Bodoni Moda", serif',
                  fontSize: '20px',
                  fontWeight: '600',
                  color: '#000000',
                  marginBottom: '16px'
                }}>
                  <span className="text-wedding-gold">📸</span>
                  Recent Photos
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <div className="aspect-square rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <span className="text-gray-400 text-2xl">📷</span>
                  </div>
                  <div className="aspect-square rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <span className="text-gray-400 text-2xl">📷</span>
                  </div>
                  <div className="aspect-square rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <span className="text-gray-400 text-2xl">📷</span>
                  </div>
                  <div className="aspect-square rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <span className="text-gray-400 text-2xl">📷</span>
                  </div>
                </div>
                <button className="w-full mt-3 p-2 hover:bg-white/50 rounded-lg transition-colors" style={{
                  fontFamily: '"Montserrat", sans-serif',
                  fontSize: '14px',
                  color: '#000000'
                }}>
                  View All Photos
                </button>
              </div>
              <div className={`p-6 rounded-2xl ${styles.liquidGlassCard}`} style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0.25) 100%)',
                backdropFilter: 'blur(25px) saturate(1.8)',
                WebkitBackdropFilter: 'blur(25px) saturate(1.8)',
                border: '1px solid rgba(255, 255, 255, 0.4)',
                boxShadow: '0 8px 32px rgba(31, 38, 135, 0.12), inset 0 1px 1px rgba(255, 255, 255, 0.6)'
              }}>
                <h3 className="flex items-center gap-2" style={{
                  fontFamily: '"Bodoni Moda", serif',
                  fontSize: '20px',
                  fontWeight: '600',
                  color: '#000000',
                  marginBottom: '16px'
                }}>
                  <span className="text-wedding-gold">💝</span>
                  Wedding Info
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span style={{ fontFamily: '"Montserrat", sans-serif', fontSize: '14px', color: 'rgba(0, 0, 0, 0.6)' }}>Date:</span>
                    <span style={{ fontFamily: '"Montserrat", sans-serif', fontSize: '14px', fontWeight: '600', color: '#000000' }}>October 5, 2025</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ fontFamily: '"Montserrat", sans-serif', fontSize: '14px', color: 'rgba(0, 0, 0, 0.6)' }}>Venue:</span>
                    <span style={{ fontFamily: '"Montserrat", sans-serif', fontSize: '14px', fontWeight: '600', color: '#000000' }}>Ben Ean Pokolbin</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ fontFamily: '"Montserrat", sans-serif', fontSize: '14px', color: 'rgba(0, 0, 0, 0.6)' }}>Guests:</span>
                    <span style={{ fontFamily: '"Montserrat", sans-serif', fontSize: '14px', fontWeight: '600', color: '#000000' }}>120 invited</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ fontFamily: '"Montserrat", sans-serif', fontSize: '14px', color: 'rgba(0, 0, 0, 0.6)' }}>RSVP:</span>
                    <span style={{ fontFamily: '"Montserrat", sans-serif', fontSize: '14px', fontWeight: '600', color: '#16a34a' }}>85 confirmed</span>
                  </div>
                </div>
              </div>
            </div>
            </aside>
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
      </div>
    );
};

export default SocialPage;