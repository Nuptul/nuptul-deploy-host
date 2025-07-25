import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Copy, 
  Facebook, 
  Twitter, 
  Mail, 
  MessageSquare,
  Link,
  Check,
  Share2,
  Instagram,
  Linkedin
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import styles from '@/components/dashboard/dashboard.module.css';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
  postContent?: string;
  postAuthor?: string;
  onShare?: (platform: string, comment?: string) => void;
}

const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  postId,
  postContent,
  postAuthor,
  onShare
}) => {
  const [comment, setComment] = useState('');
  const [copied, setCopied] = useState(false);
  
  const postUrl = `${window.location.origin}/social#post-${postId}`;
  const shareText = postContent ? `"${postContent.slice(0, 100)}${postContent.length > 100 ? '...' : ''}" - ${postAuthor}` : '';

  const shareOptions = [
    {
      id: 'copy',
      name: 'Copy Link',
      icon: Copy,
      color: '#6b7280',
      action: () => {
        navigator.clipboard.writeText(postUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast.success('Link copied to clipboard!');
      }
    },
    {
      id: 'internal',
      name: 'Share in App',
      icon: Share2,
      color: '#007AFF',
      action: () => {
        onShare?.('internal', comment);
        toast.success('Post shared!');
        onClose();
      }
    },
    {
      id: 'facebook',
      name: 'Facebook',
      icon: Facebook,
      color: '#1877f2',
      action: () => {
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`,
          '_blank',
          'width=600,height=400'
        );
        onShare?.('facebook');
      }
    },
    {
      id: 'twitter',
      name: 'Twitter',
      icon: Twitter,
      color: '#1da1f2',
      action: () => {
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(postUrl)}`,
          '_blank',
          'width=600,height=400'
        );
        onShare?.('twitter');
      }
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      icon: MessageSquare,
      color: '#25d366',
      action: () => {
        window.open(
          `https://wa.me/?text=${encodeURIComponent(`${shareText} ${postUrl}`)}`,
          '_blank'
        );
        onShare?.('whatsapp');
      }
    },
    {
      id: 'email',
      name: 'Email',
      icon: Mail,
      color: '#ea4335',
      action: () => {
        window.location.href = `mailto:?subject=Check out this wedding post&body=${encodeURIComponent(`${shareText}\n\n${postUrl}`)}`;
        onShare?.('email');
      }
    }
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className={`w-full max-w-md ${styles.liquidGlassCard}`}
          style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%)',
            backdropFilter: 'blur(30px) saturate(1.5)',
            WebkitBackdropFilter: 'blur(30px) saturate(1.5)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '20px',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.5)'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'rgba(0, 0, 0, 0.1)' }}>
            <h2 className="text-xl font-semibold" style={{
              fontFamily: '"Bodoni Moda", serif',
              color: '#000000'
            }}>
              Share Post
            </h2>
            <button
              onClick={onClose}
              className="rounded-full p-2 hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" style={{ color: '#6b7280' }} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            {/* Add comment for internal share */}
            <div>
              <label className="text-sm font-medium mb-2 block" style={{
                fontFamily: '"Montserrat", sans-serif',
                color: 'rgba(0, 0, 0, 0.8)'
              }}>
                Add a comment (optional)
              </label>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Say something about this post..."
                className="resize-none"
                rows={3}
                style={{
                  fontFamily: '"Montserrat", sans-serif',
                  background: 'rgba(255, 255, 255, 0.5)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  border: '1px solid rgba(0, 0, 0, 0.1)'
                }}
              />
            </div>

            {/* Share options */}
            <div className="grid grid-cols-3 gap-3">
              {shareOptions.map((option) => (
                <motion.button
                  key={option.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={option.action}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl transition-all duration-200"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.6) 100%)',
                    backdropFilter: 'blur(20px) saturate(1.5)',
                    WebkitBackdropFilter: 'blur(20px) saturate(1.5)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05), inset 0 1px 1px rgba(255, 255, 255, 0.5)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = `linear-gradient(135deg, ${option.color}20 0%, ${option.color}10 100%)`;
                    e.currentTarget.style.borderColor = `${option.color}40`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.6) 100%)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                  }}
                >
                  {option.id === 'copy' && copied ? (
                    <Check className="w-6 h-6" style={{ color: '#10b981' }} />
                  ) : (
                    <option.icon className="w-6 h-6" style={{ color: option.color }} />
                  )}
                  <span className="text-xs font-medium" style={{
                    fontFamily: '"Montserrat", sans-serif',
                    color: 'rgba(0, 0, 0, 0.8)'
                  }}>
                    {option.id === 'copy' && copied ? 'Copied!' : option.name}
                  </span>
                </motion.button>
              ))}
            </div>

            {/* Post URL preview */}
            <div className="p-3 rounded-lg flex items-center gap-2" style={{
              background: 'rgba(0, 0, 0, 0.03)',
              border: '1px solid rgba(0, 0, 0, 0.1)'
            }}>
              <Link className="w-4 h-4" style={{ color: '#6b7280' }} />
              <span className="flex-1 text-sm truncate" style={{
                fontFamily: '"Montserrat", sans-serif',
                color: 'rgba(0, 0, 0, 0.6)'
              }}>
                {postUrl}
              </span>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-6 border-t" style={{ borderColor: 'rgba(0, 0, 0, 0.1)' }}>
            <Button
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ShareModal;