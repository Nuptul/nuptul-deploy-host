import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Send, 
  Image, 
  Video, 
  MapPin, 
  Smile, 
  X, 
  Play,
  Users,
  Calendar,
  Gift,
  Camera,
  Mic,
  FileText,
  Heart,
  BarChart3,
  AtSign
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getLiquidGlassStyle } from '@/utils/styleHelpers';
import styles from '@/components/dashboard/dashboard.module.css';
import PollCreator from '@/components/social/PollCreator';
import MentionAutocomplete from '@/components/social/MentionAutocomplete';

interface MediaFile {
  id: string;
  file: File;
  type: 'image' | 'video' | 'audio';
  preview: string;
  size: number;
}

interface ComposerBarProps {
  onPost?: (content: string, media: File[], location?: string, tags?: string[], poll?: any) => void;
  placeholder?: string;
  maxLength?: number;
  className?: string;
}

const ComposerBar: React.FC<ComposerBarProps> = ({
  onPost,
  placeholder = "What's happening with your wedding planning?",
  maxLength = 280,
  className = ''
}) => {
  const { profile } = useAuth();
  const [content, setContent] = useState('');
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [location, setLocation] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showLocationInput, setShowLocationInput] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showPollCreator, setShowPollCreator] = useState(false);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionSearch, setMentionSearch] = useState('');
  const [poll, setPoll] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Wedding-themed emoji categories
  const weddingEmojis = {
    hearts: ['💍', '💕', '💖', '💗', '💘', '💝', '💞', '💟', '❤️', '🧡', '💛', '💚', '💙', '💜', '🤍', '🖤'],
    celebration: ['🎉', '🥳', '🎊', '✨', '🎈', '🎆', '🎇', '🌟', '⭐', '💫', '🎁', '🎀', '🌸', '🌺', '🌻', '🌹'],
    wedding: ['👰', '🤵', '💒', '⛪', '🕊️', '🦋', '🌿', '🍾', '🥂', '🍰', '💐', '💒', '👑', '💎', '🎭', '🎼']
  };

  const popularEmojis = [
    ...weddingEmojis.hearts.slice(0, 5),
    ...weddingEmojis.celebration.slice(0, 5),
    ...weddingEmojis.wedding.slice(0, 6)
  ];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    const files = Array.from(event.target.files || []);
    
    files.forEach((file) => {
      if (mediaFiles.length >= 10) return; // Max 10 media files
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const newMedia: MediaFile = {
          id: Math.random().toString(36).substr(2, 9),
          file,
          type: file.type.startsWith('video/') ? 'video' : 'image',
          preview: e.target?.result as string,
          size: file.size
        };
        
        setMediaFiles(prev => [...prev, newMedia]);
      };
      reader.readAsDataURL(file);
    });
    
    // Reset input
    event.target.value = '';
  };

  const removeMedia = (id: string) => {
    setMediaFiles(prev => prev.filter(media => media.id !== id));
  };

  const handleEmojiClick = (emoji: string) => {
    setContent(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const handlePost = () => {
    if (!content.trim() && mediaFiles.length === 0 && !poll) return;
    
    const tags = extractHashtags(content);
    onPost?.(content, mediaFiles.map(m => m.file), location || undefined, tags, poll);
    
    // Reset form
    setContent('');
    setMediaFiles([]);
    setLocation('');
    setPoll(null);
    setIsExpanded(false);
    setShowLocationInput(false);
  };

  const extractHashtags = (text: string): string[] => {
    const hashtags = text.match(/#\w+/g) || [];
    return hashtags.map(tag => tag.slice(1)); // Remove # symbol
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getRemainingChars = () => maxLength - content.length;
  const isNearLimit = getRemainingChars() <= 20;
  const isOverLimit = getRemainingChars() < 0;

  return (
    <div 
      className={`relative rounded-2xl overflow-hidden ${className}`}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-wedding-pearl/80 to-white/90 backdrop-blur-2xl" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/10" />
      <div className="relative glass-card-enhanced transition-all duration-300 hover:shadow-xl">
      <div className="p-6">
        {/* Main Composer */}
        <div className="flex items-start gap-3">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-wedding-gold to-amber-400 rounded-full blur opacity-0 group-hover:opacity-60 transition-opacity" />
            <Avatar className="relative w-10 h-10 ring-2 ring-white shadow-lg group-hover:shadow-xl transition-all duration-200 group-hover:scale-105">
              <AvatarImage src={profile?.avatar_url} alt={profile?.first_name || 'User'} />
              <AvatarFallback className="bg-gradient-to-br from-wedding-gold to-yellow-500 text-white font-bold">
                {profile?.first_name ? profile.first_name[0] : 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full ring-2 ring-white" />
          </div>

          <div className="flex-1 space-y-3">
            {/* Text Input */}
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => {
                  const newContent = e.target.value;
                  setContent(newContent);
                  
                  // Check for @ mentions
                  const cursorPosition = e.target.selectionStart;
                  const textBeforeCursor = newContent.slice(0, cursorPosition);
                  const mentionMatch = textBeforeCursor.match(/@(\w*)$/);
                  
                  if (mentionMatch) {
                    setShowMentions(true);
                    setMentionSearch(mentionMatch[1] || '');
                  } else {
                    setShowMentions(false);
                  }
                }}
                placeholder={placeholder}
                className={`w-full min-h-[60px] resize-none border-0 bg-transparent focus:outline-none transition-all duration-300 ${
                  isExpanded ? 'min-h-[120px]' : ''
                }`}
                style={{
                  fontFamily: '"Montserrat", sans-serif',
                  fontSize: '16px',
                  color: '#000000',
                  lineHeight: '1.6',
                  textShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                }}
                onFocus={() => setIsExpanded(true)}
                maxLength={maxLength + 50} // Allow slight overflow for better UX
              />
              
              {/* Character Counter */}
              {isExpanded && (
                <div className="absolute bottom-2 right-2">
                  <Badge 
                    variant={isOverLimit ? 'destructive' : isNearLimit ? 'secondary' : 'outline'}
                    className="text-xs"
                  >
                    {getRemainingChars()}
                  </Badge>
                </div>
              )}
              
              {/* Mention Autocomplete */}
              {showMentions && (
                <MentionAutocomplete
                  search={mentionSearch}
                  onSelect={(user) => {
                    const cursorPosition = textareaRef.current?.selectionStart || 0;
                    const textBeforeCursor = content.slice(0, cursorPosition);
                    const textAfterCursor = content.slice(cursorPosition);
                    const beforeMention = textBeforeCursor.replace(/@\w*$/, '');
                    const newContent = `${beforeMention}@${user.display_name} ${textAfterCursor}`;
                    setContent(newContent);
                    setShowMentions(false);
                    
                    // Reset cursor position
                    setTimeout(() => {
                      if (textareaRef.current) {
                        const newPosition = beforeMention.length + user.display_name.length + 2;
                        textareaRef.current.setSelectionRange(newPosition, newPosition);
                        textareaRef.current.focus();
                      }
                    }, 0);
                  }}
                  onClose={() => setShowMentions(false)}
                />
              )}
            </div>

            {/* Location Input */}
            {showLocationInput && (
              <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
                <MapPin className="w-4 h-4 text-blue-600" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Add a location..."
                  className="flex-1 bg-transparent border-0 outline-none text-sm"
                />
                <button
                  onClick={() => setShowLocationInput(false)}
                  className={`rounded-lg transition-all duration-200 hover:scale-105 ${styles.actionButton}`}
                  style={{
                    minWidth: '24px',
                    minHeight: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.05) 100%)',
                    backdropFilter: 'blur(20px) saturate(1.8)',
                    WebkitBackdropFilter: 'blur(20px) saturate(1.8)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    boxShadow: '0 2px 8px rgba(239, 68, 68, 0.08), inset 0 1px 1px rgba(255, 255, 255, 0.7)'
                  }}
                >
                  <X className="w-3 h-3" style={{ color: '#dc2626' }} />
                </button>
              </div>
            )}

            {/* Media Preview */}
            {mediaFiles.length > 0 && (
              <div className={`grid gap-2 ${
                mediaFiles.length === 1 ? 'grid-cols-1' :
                mediaFiles.length === 2 ? 'grid-cols-2' :
                mediaFiles.length <= 4 ? 'grid-cols-2' :
                mediaFiles.length <= 6 ? 'grid-cols-3' :
                'grid-cols-4'
              }`}>
                {mediaFiles.map((media) => (
                  <div key={media.id} className="relative group">
                    <div className="relative rounded-lg overflow-hidden bg-gray-100">
                      {media.type === 'image' ? (
                        <img
                          src={media.preview}
                          alt="Preview"
                          className="w-full h-32 object-cover"
                        />
                      ) : (
                        <div className="relative">
                          <video
                            src={media.preview}
                            className="w-full h-32 object-cover"
                            muted
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                            <Play className="w-8 h-8 text-white" />
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Remove button */}
                    <button
                      onClick={() => removeMedia(media.id)}
                      className={`absolute -top-2 -right-2 rounded-full transition-all duration-200 hover:scale-105 opacity-0 group-hover:opacity-100 ${styles.actionButton}`}
                      style={{
                        minWidth: '24px',
                        minHeight: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.9) 0%, rgba(220, 38, 38, 0.8) 100%)',
                        backdropFilter: 'blur(20px) saturate(1.8)',
                        WebkitBackdropFilter: 'blur(20px) saturate(1.8)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        boxShadow: '0 2px 8px rgba(239, 68, 68, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.7)'
                      }}
                    >
                      <X className="w-3 h-3" style={{ color: '#ffffff' }} />
                    </button>
                    
                    {/* File info */}
                    <div className="absolute bottom-1 left-1 right-1">
                      <Badge variant="secondary" className="text-xs bg-black/50 text-white">
                        {formatFileSize(media.size)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Emoji Picker */}
            {showEmojiPicker && (
              <div className="absolute bottom-full left-0 mb-2 bg-white/95 backdrop-blur-md rounded-lg shadow-2xl border border-white/50 p-4 z-50 w-80">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm">Wedding Emojis</h3>
                    <button
                      onClick={() => setShowEmojiPicker(false)}
                      className={`rounded-lg transition-all duration-200 hover:scale-105 ${styles.actionButton}`}
                      style={{
                        minWidth: '24px',
                        minHeight: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.05) 100%)',
                        backdropFilter: 'blur(20px) saturate(1.8)',
                        WebkitBackdropFilter: 'blur(20px) saturate(1.8)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        boxShadow: '0 2px 8px rgba(239, 68, 68, 0.08), inset 0 1px 1px rgba(255, 255, 255, 0.7)'
                      }}
                    >
                      <X className="w-3 h-3" style={{ color: '#dc2626' }} />
                    </button>
                  </div>
                  
                  {/* Popular */}
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Popular</p>
                    <div className="grid grid-cols-8 gap-1">
                      {popularEmojis.map((emoji, index) => (
                        <Button
                          key={index}
                          variant="ghost"
                          size="sm"
                          className="w-8 h-8 p-0 text-lg hover:bg-blue-50 emoji-button"
                          onClick={() => handleEmojiClick(emoji)}
                        >
                          {emoji}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Categories */}
                  {Object.entries(weddingEmojis).map(([category, emojis]) => (
                    <div key={category}>
                      <p className="text-xs text-muted-foreground mb-2 capitalize">{category}</p>
                      <div className="grid grid-cols-8 gap-1">
                        {emojis.map((emoji, index) => (
                          <Button
                            key={index}
                            variant="ghost"
                            size="sm"
                            className="w-8 h-8 p-0 text-lg hover:bg-blue-50 emoji-button"
                            onClick={() => handleEmojiClick(emoji)}
                          >
                            {emoji}
                          </Button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-200/30">
              <div className="flex items-center gap-2">
                {/* Image Upload */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className={`rounded-lg transition-all duration-200 hover:scale-105 ${styles.actionButton}`}
                  style={{
                    minWidth: '44px',
                    minHeight: '44px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.05) 100%)',
                    backdropFilter: 'blur(20px) saturate(1.8)',
                    WebkitBackdropFilter: 'blur(20px) saturate(1.8)',
                    border: '1px solid rgba(59, 130, 246, 0.2)',
                    boxShadow: '0 2px 8px rgba(59, 130, 246, 0.08), inset 0 1px 1px rgba(255, 255, 255, 0.7)',
                    opacity: mediaFiles.length >= 10 ? 0.5 : 1,
                    cursor: mediaFiles.length >= 10 ? 'not-allowed' : 'pointer'
                  }}
                  disabled={mediaFiles.length >= 10}
                  aria-label="Add photos"
                >
                  <Image className="w-4 h-4" style={{ color: '#3b82f6' }} />
                </button>

                {/* Video Upload */}
                <button
                  onClick={() => videoInputRef.current?.click()}
                  className={`rounded-lg transition-all duration-200 hover:scale-105 ${styles.actionButton}`}
                  style={{
                    minWidth: '44px',
                    minHeight: '44px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.1) 0%, rgba(126, 34, 206, 0.05) 100%)',
                    backdropFilter: 'blur(20px) saturate(1.8)',
                    WebkitBackdropFilter: 'blur(20px) saturate(1.8)',
                    border: '1px solid rgba(147, 51, 234, 0.2)',
                    boxShadow: '0 2px 8px rgba(147, 51, 234, 0.08), inset 0 1px 1px rgba(255, 255, 255, 0.7)',
                    opacity: mediaFiles.length >= 10 ? 0.5 : 1,
                    cursor: mediaFiles.length >= 10 ? 'not-allowed' : 'pointer'
                  }}
                  disabled={mediaFiles.length >= 10}
                  aria-label="Add video"
                >
                  <Video className="w-4 h-4" style={{ color: '#9333ea' }} />
                </button>

                {/* Emoji Picker */}
                <button
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className={`rounded-lg transition-all duration-200 hover:scale-105 ${styles.actionButton}`}
                  style={{
                    minWidth: '44px',
                    minHeight: '44px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, rgba(255, 193, 7, 0.1) 0%, rgba(255, 235, 59, 0.05) 100%)',
                    backdropFilter: 'blur(20px) saturate(1.8)',
                    WebkitBackdropFilter: 'blur(20px) saturate(1.8)',
                    border: '1px solid rgba(255, 193, 7, 0.2)',
                    boxShadow: '0 2px 8px rgba(255, 193, 7, 0.08), inset 0 1px 1px rgba(255, 255, 255, 0.7)'
                  }}
                  aria-label="Add emoji"
                >
                  <Smile className="w-4 h-4" style={{ color: '#ffc107' }} />
                </button>

                {/* Location */}
                <button
                  onClick={() => setShowLocationInput(!showLocationInput)}
                  className={`rounded-lg transition-all duration-200 hover:scale-105 ${styles.actionButton}`}
                  style={{
                    minWidth: '44px',
                    minHeight: '44px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(21, 128, 61, 0.05) 100%)',
                    backdropFilter: 'blur(20px) saturate(1.8)',
                    WebkitBackdropFilter: 'blur(20px) saturate(1.8)',
                    border: '1px solid rgba(34, 197, 94, 0.2)',
                    boxShadow: '0 2px 8px rgba(34, 197, 94, 0.08), inset 0 1px 1px rgba(255, 255, 255, 0.7)'
                  }}
                  aria-label="Add location"
                >
                  <MapPin className="w-4 h-4" style={{ color: '#22c55e' }} />
                </button>
                
                {/* Poll */}
                <button
                  onClick={() => setShowPollCreator(true)}
                  className={`rounded-lg transition-all duration-200 hover:scale-105 ${styles.actionButton}`}
                  style={{
                    minWidth: '44px',
                    minHeight: '44px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(147, 51, 234, 0.05) 100%)',
                    backdropFilter: 'blur(20px) saturate(1.8)',
                    WebkitBackdropFilter: 'blur(20px) saturate(1.8)',
                    border: '1px solid rgba(168, 85, 247, 0.2)',
                    boxShadow: '0 2px 8px rgba(168, 85, 247, 0.08), inset 0 1px 1px rgba(255, 255, 255, 0.7)'
                  }}
                  aria-label="Create poll"
                >
                  <BarChart3 className="w-4 h-4" style={{ color: '#a855f7' }} />
                </button>

                {/* Wedding-specific actions */}
                <div className="hidden lg:flex items-center gap-2 ml-3 pl-3 border-l border-gray-200/30">
                  <button
                    className={`rounded-lg transition-all duration-200 hover:scale-105 ${styles.actionButton}`}
                    style={{
                      minWidth: '44px',
                      minHeight: '44px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'linear-gradient(135deg, rgba(219, 39, 119, 0.1) 0%, rgba(190, 24, 93, 0.05) 100%)',
                      backdropFilter: 'blur(20px) saturate(1.8)',
                      WebkitBackdropFilter: 'blur(20px) saturate(1.8)',
                      border: '1px solid rgba(219, 39, 119, 0.2)',
                      boxShadow: '0 2px 8px rgba(219, 39, 119, 0.08), inset 0 1px 1px rgba(255, 255, 255, 0.7)'
                    }}
                    aria-label="Tag wedding vendors"
                  >
                    <Users className="w-4 h-4" style={{ color: '#db2777' }} />
                  </button>
                  
                  <button
                    className={`rounded-lg transition-all duration-200 hover:scale-105 ${styles.actionButton}`}
                    style={{
                      minWidth: '44px',
                      minHeight: '44px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(79, 70, 229, 0.05) 100%)',
                      backdropFilter: 'blur(20px) saturate(1.8)',
                      WebkitBackdropFilter: 'blur(20px) saturate(1.8)',
                      border: '1px solid rgba(99, 102, 241, 0.2)',
                      boxShadow: '0 2px 8px rgba(99, 102, 241, 0.08), inset 0 1px 1px rgba(255, 255, 255, 0.7)'
                    }}
                    aria-label="Add to timeline"
                  >
                    <Calendar className="w-4 h-4" style={{ color: '#6366f1' }} />
                  </button>
                  
                  <button
                    className={`rounded-lg transition-all duration-200 hover:scale-105 ${styles.actionButton}`}
                    style={{
                      minWidth: '44px',
                      minHeight: '44px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.1) 0%, rgba(234, 88, 12, 0.05) 100%)',
                      backdropFilter: 'blur(20px) saturate(1.8)',
                      WebkitBackdropFilter: 'blur(20px) saturate(1.8)',
                      border: '1px solid rgba(249, 115, 22, 0.2)',
                      boxShadow: '0 2px 8px rgba(249, 115, 22, 0.08), inset 0 1px 1px rgba(255, 255, 255, 0.7)'
                    }}
                    aria-label="Wedding registry item"
                  >
                    <Gift className="w-4 h-4" style={{ color: '#f97316' }} />
                  </button>
                </div>
              </div>

              {/* Post Button */}
              <button
                onClick={handlePost}
                disabled={(!content.trim() && mediaFiles.length === 0) || isOverLimit}
                className={`rounded-lg transition-all duration-200 hover:scale-105 flex items-center gap-2 ${styles.actionButton}`}
                style={{
                  minWidth: '100px',
                  minHeight: '44px',
                  padding: '0 20px',
                  background: (!content.trim() && mediaFiles.length === 0) || isOverLimit
                    ? 'linear-gradient(135deg, rgba(156, 163, 175, 0.1) 0%, rgba(107, 114, 128, 0.05) 100%)'
                    : 'linear-gradient(135deg, rgba(255, 215, 0, 0.2) 0%, rgba(255, 193, 7, 0.15) 100%)',
                  backdropFilter: 'blur(20px) saturate(1.8)',
                  WebkitBackdropFilter: 'blur(20px) saturate(1.8)',
                  border: (!content.trim() && mediaFiles.length === 0) || isOverLimit
                    ? '1px solid rgba(156, 163, 175, 0.2)'
                    : '1px solid rgba(255, 215, 0, 0.3)',
                  boxShadow: (!content.trim() && mediaFiles.length === 0) || isOverLimit
                    ? '0 2px 8px rgba(156, 163, 175, 0.08), inset 0 1px 1px rgba(255, 255, 255, 0.7)'
                    : '0 4px 16px rgba(255, 215, 0, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.7)',
                  opacity: (!content.trim() && mediaFiles.length === 0) || isOverLimit ? 0.5 : 1,
                  cursor: (!content.trim() && mediaFiles.length === 0) || isOverLimit ? 'not-allowed' : 'pointer'
                }}
              >
                <Send className="w-4 h-4" style={{ 
                  color: (!content.trim() && mediaFiles.length === 0) || isOverLimit ? '#9ca3af' : '#ffd700' 
                }} />
                <span 
                  className="hidden sm:inline"
                  style={{
                    fontFamily: '"Montserrat", sans-serif',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: (!content.trim() && mediaFiles.length === 0) || isOverLimit ? '#9ca3af' : '#ffd700'
                  }}
                >
                  Post
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Hidden file inputs */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFileSelect(e, 'image')}
        />
        <input
          ref={videoInputRef}
          type="file"
          accept="video/*"
          multiple
          className="hidden"
          onChange={(e) => handleFileSelect(e, 'video')}
        />
      </div>
    </div>
      
      {/* Poll Creator Modal */}
      <PollCreator
        isOpen={showPollCreator}
        onClose={() => setShowPollCreator(false)}
        onCreatePoll={(pollData) => {
          setPoll(pollData);
          setShowPollCreator(false);
        }}
      />
    </div>
  );
};

export default ComposerBar;