import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Heart, 
  MessageCircle, 
  Share, 
  MoreHorizontal, 
  MapPin,
  Clock,
  Play,
  Volume2,
  VolumeX,
  Send,
  Smile,
  Camera,
  Video
} from 'lucide-react';
import { usePresence } from '@/hooks/usePresence';
import { formatDistanceToNow } from 'date-fns';
import { getLiquidGlassStyle } from '@/utils/styleHelpers';
import styles from '@/components/dashboard/dashboard.module.css';

interface Reaction {
  emoji: string;
  count: number;
  users: string[];
  hasReacted: boolean;
}

interface Comment {
  id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  content: string;
  created_at: string;
  reply_to?: string;
}

interface MediaAttachment {
  id: string;
  type: 'image' | 'video' | 'audio';
  url: string;
  thumbnail_url?: string;
  duration?: number; // for video/audio
  size?: number;
  alt_text?: string;
}

interface FeedPost {
  id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  content: string;
  created_at: string;
  location?: string;
  media_attachments: MediaAttachment[];
  reactions: Reaction[];
  comments: Comment[];
  comment_count: number;
  share_count: number;
  is_wedding_related: boolean;
  tags: string[];
}

interface FeedCardProps {
  post: FeedPost;
  onLike?: (postId: string, emoji: string) => void;
  onComment?: (postId: string, content: string, replyTo?: string) => void;
  onShare?: (postId: string) => void;
  onUserClick?: (userId: string) => void;
  className?: string;
}

const FeedCard: React.FC<FeedCardProps> = ({
  post,
  onLike,
  onComment,
  onShare,
  onUserClick,
  className = ''
}) => {
  const { onlineUsers } = usePresence();
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);
  const [mutedVideos, setMutedVideos] = useState<Set<string>>(new Set());
  const [showReactionPicker, setShowReactionPicker] = useState(false);

  const isUserOnline = (userId: string) => {
    return onlineUsers.some(user => user.user_id === userId);
  };

  const getTimeAgo = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  const handleReaction = (emoji: string) => {
    onLike?.(post.id, emoji);
    setShowReactionPicker(false);
  };

  const handleComment = () => {
    if (newComment.trim()) {
      onComment?.(post.id, newComment.trim());
      setNewComment('');
    }
  };

  const toggleVideoPlay = (mediaId: string) => {
    setPlayingVideo(playingVideo === mediaId ? null : mediaId);
  };

  const toggleVideoMute = (mediaId: string) => {
    const newMuted = new Set(mutedVideos);
    if (newMuted.has(mediaId)) {
      newMuted.delete(mediaId);
    } else {
      newMuted.add(mediaId);
    }
    setMutedVideos(newMuted);
  };

  const popularReactions = ['❤️', '😍', '🎉', '💍', '👏', '😂'];

  return (
    <div className={`w-full rounded-2xl overflow-hidden ${styles.liquidGlassCard} ${className}`} style={{
      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0.25) 100%)',
      backdropFilter: 'blur(25px) saturate(1.8)',
      WebkitBackdropFilter: 'blur(25px) saturate(1.8)',
      border: '1px solid rgba(255, 255, 255, 0.4)',
      boxShadow: '0 8px 32px rgba(31, 38, 135, 0.12), inset 0 1px 1px rgba(255, 255, 255, 0.6)'
    }}>
      {/* Post Header */}
      <div className="pb-3 px-4 pt-4" style={{
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.3)'
      }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar 
                className="w-10 h-10 cursor-pointer hover:ring-2 hover:ring-wedding-gold transition-all"
                onClick={() => onUserClick?.(post.user_id)}
              >
                <AvatarImage src={post.user_avatar} alt={post.user_name} />
                <AvatarFallback className="bg-gradient-to-br from-wedding-gold to-yellow-500 text-white font-bold">
                  {post.user_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              {isUserOnline(post.user_id) && (
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span 
                  className="cursor-pointer hover:underline"
                  onClick={() => onUserClick?.(post.user_id)}
                  style={{
                    fontFamily: '"Montserrat", sans-serif',
                    fontWeight: '600',
                    fontSize: '15px',
                    color: '#000000'
                  }}
                >
                  {post.user_name}
                </span>
                {post.is_wedding_related && (
                  <Badge variant="secondary" className="text-xs bg-gradient-to-r from-wedding-gold/20 to-yellow-400/20 text-wedding-gold border border-wedding-gold/30">
                    💍 Wedding
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span>{getTimeAgo(post.created_at)}</span>
                {post.location && (
                  <>
                    <span>•</span>
                    <MapPin className="w-3 h-3" />
                    <span>{post.location}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            className="w-8 h-8 p-0 rounded-full"
            aria-label="More options"
          >
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="px-4 pb-4 space-y-4">
        {/* Post Content */}
        {post.content && (
          <div className="leading-relaxed">
            <p style={{
              fontFamily: '"Montserrat", sans-serif',
              fontSize: '14px',
              color: '#000000'
            }}>{post.content}</p>
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {post.tags.map((tag, index) => (
                  <span key={index} className="text-blue-600 hover:underline cursor-pointer">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Media Attachments */}
        {post.media_attachments && post.media_attachments.length > 0 && (
          <div className={`grid gap-2 ${
            post.media_attachments.length === 1 ? 'grid-cols-1' :
            post.media_attachments.length === 2 ? 'grid-cols-2' :
            'grid-cols-2 md:grid-cols-3'
          }`}>
            {post.media_attachments.map((media, index) => (
              <div key={media.id} className="relative rounded-lg overflow-hidden bg-gray-100">
                {media.type === 'image' && (
                  <img
                    src={media.url}
                    alt={media.alt_text || `Image ${index + 1}`}
                    className="w-full h-48 object-cover hover:scale-105 transition-transform cursor-pointer"
                  />
                )}
                
                {media.type === 'video' && (
                  <div className="relative">
                    <video
                      src={media.url}
                      poster={media.thumbnail_url}
                      className="w-full h-48 object-cover"
                      muted={mutedVideos.has(media.id)}
                      autoPlay={playingVideo === media.id}
                      loop
                    />
                    
                    {/* Video controls overlay */}
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-12 h-12 rounded-full bg-black/50 text-white hover:bg-black/70"
                        onClick={() => toggleVideoPlay(media.id)}
                        aria-label={playingVideo === media.id ? 'Pause video' : 'Play video'}
                      >
                        <Play className="w-6 h-6" />
                      </Button>
                    </div>
                    
                    {/* Mute button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute bottom-2 right-2 w-8 h-8 p-0 rounded-full bg-black/50 text-white hover:bg-black/70"
                      onClick={() => toggleVideoMute(media.id)}
                      aria-label={mutedVideos.has(media.id) ? 'Unmute video' : 'Mute video'}
                    >
                      {mutedVideos.has(media.id) ? (
                        <VolumeX className="w-4 h-4" />
                      ) : (
                        <Volume2 className="w-4 h-4" />
                      )}
                    </Button>
                    
                    {/* Video duration */}
                    {media.duration && (
                      <Badge 
                        variant="secondary" 
                        className="absolute bottom-2 left-2 bg-black/50 text-white"
                      >
                        {Math.floor(media.duration / 60)}:{(media.duration % 60).toString().padStart(2, '0')}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Reactions Bar */}
        <div className="flex items-center justify-between pt-3 border-t border-wedding-gold/20">
          <div className="flex items-center gap-4">
            {/* Like/Reaction Button */}
            <div className="relative">
              <button
                className={`rounded-lg transition-all duration-200 hover:scale-105 flex items-center gap-2 ${styles.actionButton}`}
                style={{
                  minWidth: '80px',
                  minHeight: '44px',
                  padding: '0 16px',
                  background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.05) 100%)',
                  backdropFilter: 'blur(20px) saturate(1.8)',
                  WebkitBackdropFilter: 'blur(20px) saturate(1.8)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  boxShadow: '0 2px 8px rgba(239, 68, 68, 0.08), inset 0 1px 1px rgba(255, 255, 255, 0.7)'
                }}
                onClick={() => setShowReactionPicker(!showReactionPicker)}
                onMouseLeave={() => setTimeout(() => setShowReactionPicker(false), 200)}
              >
                <Heart className={`w-4 h-4 ${
                  post.reactions.some(r => r.hasReacted) 
                    ? 'fill-red-500 text-red-500' 
                    : ''
                }`} style={{ color: post.reactions.some(r => r.hasReacted) ? '#ef4444' : '#dc2626' }} />
                <span style={{
                  fontFamily: '"Montserrat", sans-serif',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#dc2626'
                }}>
                  {post.reactions.reduce((acc, r) => acc + r.count, 0) || 'Like'}
                </span>
              </button>
              
              {/* Reaction Picker */}
              {showReactionPicker && (
                <div className="absolute bottom-full left-0 mb-2 flex items-center gap-1 bg-white/95 backdrop-blur-md rounded-full shadow-2xl border border-white/50 p-2 z-10">
                  {popularReactions.map((emoji) => (
                    <Button
                      key={emoji}
                      variant="ghost"
                      size="sm"
                      className="w-10 h-10 p-0 text-lg hover:scale-125 transition-transform"
                      onClick={() => handleReaction(emoji)}
                    >
                      {emoji}
                    </Button>
                  ))}
                </div>
              )}
            </div>

            {/* Comment Button */}
            <button
              className={`rounded-lg transition-all duration-200 hover:scale-105 flex items-center gap-2 ${styles.actionButton}`}
              style={{
                minWidth: '100px',
                minHeight: '44px',
                padding: '0 16px',
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.05) 100%)',
                backdropFilter: 'blur(20px) saturate(1.8)',
                WebkitBackdropFilter: 'blur(20px) saturate(1.8)',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                boxShadow: '0 2px 8px rgba(59, 130, 246, 0.08), inset 0 1px 1px rgba(255, 255, 255, 0.7)'
              }}
              onClick={() => setShowComments(!showComments)}
            >
              <MessageCircle className="w-4 h-4" style={{ color: '#3b82f6' }} />
              <span style={{
                fontFamily: '"Montserrat", sans-serif',
                fontSize: '14px',
                fontWeight: '500',
                color: '#3b82f6'
              }}>
                {post.comment_count || 'Comment'}
              </span>
            </button>

            {/* Share Button */}
            <button
              className={`rounded-lg transition-all duration-200 hover:scale-105 flex items-center gap-2 ${styles.actionButton}`}
              style={{
                minWidth: '80px',
                minHeight: '44px',
                padding: '0 16px',
                background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(21, 128, 61, 0.05) 100%)',
                backdropFilter: 'blur(20px) saturate(1.8)',
                WebkitBackdropFilter: 'blur(20px) saturate(1.8)',
                border: '1px solid rgba(34, 197, 94, 0.2)',
                boxShadow: '0 2px 8px rgba(34, 197, 94, 0.08), inset 0 1px 1px rgba(255, 255, 255, 0.7)'
              }}
              onClick={() => onShare?.(post.id)}
            >
              <Share className="w-4 h-4" style={{ color: '#22c55e' }} />
              <span style={{
                fontFamily: '"Montserrat", sans-serif',
                fontSize: '14px',
                fontWeight: '500',
                color: '#22c55e'
              }}>
                {post.share_count || 'Share'}
              </span>
            </button>
          </div>

          {/* Reaction Summary */}
          {post.reactions && post.reactions.length > 0 && (
            <div className="flex items-center gap-1">
              {post.reactions.slice(0, 3).map((reaction, index) => (
                <span key={index} className="text-sm">
                  {reaction.emoji}
                </span>
              ))}
              <span className="text-xs text-muted-foreground ml-1">
                {post.reactions.reduce((acc, r) => acc + r.count, 0)}
              </span>
            </div>
          )}
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="space-y-3 pt-3 border-t border-wedding-gold/20">
            {/* Comment Input */}
            <div className="flex items-start gap-3">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="text-xs bg-gradient-to-br from-wedding-gold to-yellow-500 text-white font-semibold">
                  U
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <Textarea
                  placeholder="Write a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="min-h-[60px] resize-none"
                />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      className={`rounded-lg transition-all duration-200 hover:scale-105 ${styles.actionButton}`}
                      style={{
                        minWidth: '32px',
                        minHeight: '32px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'linear-gradient(135deg, rgba(255, 193, 7, 0.1) 0%, rgba(255, 235, 59, 0.05) 100%)',
                        backdropFilter: 'blur(20px) saturate(1.8)',
                        WebkitBackdropFilter: 'blur(20px) saturate(1.8)',
                        border: '1px solid rgba(255, 193, 7, 0.2)',
                        boxShadow: '0 2px 8px rgba(255, 193, 7, 0.08), inset 0 1px 1px rgba(255, 255, 255, 0.7)'
                      }}
                    >
                      <Smile className="w-4 h-4" style={{ color: '#ffc107' }} />
                    </button>
                    <button
                      className={`rounded-lg transition-all duration-200 hover:scale-105 ${styles.actionButton}`}
                      style={{
                        minWidth: '32px',
                        minHeight: '32px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'linear-gradient(135deg, rgba(156, 39, 176, 0.1) 0%, rgba(142, 36, 170, 0.05) 100%)',
                        backdropFilter: 'blur(20px) saturate(1.8)',
                        WebkitBackdropFilter: 'blur(20px) saturate(1.8)',
                        border: '1px solid rgba(156, 39, 176, 0.2)',
                        boxShadow: '0 2px 8px rgba(156, 39, 176, 0.08), inset 0 1px 1px rgba(255, 255, 255, 0.7)'
                      }}
                    >
                      <Camera className="w-4 h-4" style={{ color: '#9c27b0' }} />
                    </button>
                  </div>
                  <button
                    onClick={handleComment}
                    disabled={!newComment.trim()}
                    className={`rounded-lg transition-all duration-200 hover:scale-105 flex items-center gap-2 ${styles.actionButton}`}
                    style={{
                      minWidth: '80px',
                      minHeight: '44px',
                      padding: '0 16px',
                      background: !newComment.trim() 
                        ? 'linear-gradient(135deg, rgba(156, 163, 175, 0.1) 0%, rgba(107, 114, 128, 0.05) 100%)'
                        : 'linear-gradient(135deg, rgba(255, 215, 0, 0.15) 0%, rgba(255, 193, 7, 0.1) 100%)',
                      backdropFilter: 'blur(20px) saturate(1.8)',
                      WebkitBackdropFilter: 'blur(20px) saturate(1.8)',
                      border: !newComment.trim() 
                        ? '1px solid rgba(156, 163, 175, 0.2)'
                        : '1px solid rgba(255, 215, 0, 0.3)',
                      boxShadow: !newComment.trim() 
                        ? '0 2px 8px rgba(156, 163, 175, 0.08), inset 0 1px 1px rgba(255, 255, 255, 0.7)'
                        : '0 2px 8px rgba(255, 215, 0, 0.15), inset 0 1px 1px rgba(255, 255, 255, 0.7)',
                      opacity: !newComment.trim() ? 0.5 : 1,
                      cursor: !newComment.trim() ? 'not-allowed' : 'pointer'
                    }}
                  >
                    <Send className="w-4 h-4" style={{ color: !newComment.trim() ? '#9ca3af' : '#ffd700' }} />
                    <span style={{
                      fontFamily: '"Montserrat", sans-serif',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: !newComment.trim() ? '#9ca3af' : '#ffd700'
                    }}>
                      Post
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Existing Comments */}
            {post.comments.map((comment) => (
              <div key={comment.id} className="flex items-start gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={comment.user_avatar} alt={comment.user_name} />
                  <AvatarFallback className="text-xs">
                    {comment.user_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="bg-gradient-to-r from-gray-50/80 to-white/50 backdrop-blur-sm rounded-lg p-3 border border-white/30">
                    <div className="flex items-center gap-2 mb-1">
                      <span style={{
                        fontFamily: '"Montserrat", sans-serif',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#000000'
                      }}>
                        {comment.user_name}
                      </span>
                      <span style={{
                        fontFamily: '"Montserrat", sans-serif',
                        fontSize: '12px',
                        fontWeight: '400',
                        color: 'rgba(0, 0, 0, 0.6)'
                      }}>
                        {getTimeAgo(comment.created_at)}
                      </span>
                    </div>
                    <p style={{
                      fontFamily: '"Montserrat", sans-serif',
                      fontSize: '14px',
                      color: '#000000'
                    }}>
                      {comment.content}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 mt-1 ml-3">
                    <button
                      className={`rounded transition-all duration-200 hover:scale-105 text-xs ${styles.actionButton}`}
                      style={{
                        minWidth: '50px',
                        minHeight: '24px',
                        padding: '0 8px',
                        background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, rgba(220, 38, 38, 0.03) 100%)',
                        backdropFilter: 'blur(15px) saturate(1.5)',
                        WebkitBackdropFilter: 'blur(15px) saturate(1.5)',
                        border: '1px solid rgba(239, 68, 68, 0.1)',
                        boxShadow: '0 1px 4px rgba(239, 68, 68, 0.05), inset 0 1px 1px rgba(255, 255, 255, 0.5)',
                        fontFamily: '"Montserrat", sans-serif',
                        fontSize: '12px',
                        fontWeight: '500',
                        color: '#dc2626'
                      }}
                    >
                      Like
                    </button>
                    <button
                      className={`rounded transition-all duration-200 hover:scale-105 text-xs ${styles.actionButton}`}
                      style={{
                        minWidth: '50px',
                        minHeight: '24px',
                        padding: '0 8px',
                        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(37, 99, 235, 0.03) 100%)',
                        backdropFilter: 'blur(15px) saturate(1.5)',
                        WebkitBackdropFilter: 'blur(15px) saturate(1.5)',
                        border: '1px solid rgba(59, 130, 246, 0.1)',
                        boxShadow: '0 1px 4px rgba(59, 130, 246, 0.05), inset 0 1px 1px rgba(255, 255, 255, 0.5)',
                        fontFamily: '"Montserrat", sans-serif',
                        fontSize: '12px',
                        fontWeight: '500',
                        color: '#3b82f6'
                      }}
                    >
                      Reply
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedCard;