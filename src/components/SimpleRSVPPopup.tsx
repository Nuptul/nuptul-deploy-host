import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Heart, X, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { submitSimpleRSVP } from '@/utils/simpleRsvpService';
import styles from '@/components/dashboard/dashboard.module.css';

interface SimpleRSVPPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const SimpleRSVPPopup: React.FC<SimpleRSVPPopupProps> = ({ isOpen, onClose, onComplete }) => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleRSVPResponse = async (response: 'yes' | 'no' | 'maybe') => {
    if (!user?.id) {
      toast({
        title: "Authentication Required",
        description: "Please log in to submit your RSVP.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      const result = await submitSimpleRSVP({
        userId: user.id,
        attendance: response,
        firstName: profile?.first_name || '',
        lastName: profile?.last_name || '',
        email: profile?.email || user?.email || ''
      });

      if (result.success) {
        const messages = {
          yes: "Thank you! We can't wait to celebrate with you! 🎉",
          no: "Thank you for letting us know. We'll miss you on our special day! 💕",
          maybe: "Thank you for your response. We hope you can make it! 🤞"
        };

        toast({
          title: "RSVP Completed!",
          description: messages[response],
        });

        onComplete();
        onClose();
      } else {
        toast({
          title: "RSVP Error",
          description: result.error || "There was an issue submitting your RSVP. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('💥 RSVP error:', error);
      toast({
        title: "RSVP Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm modal-overlay transition-opacity duration-300 z-[9998]"
        onClick={onClose}
      />
      <div className="fixed inset-0 flex items-center justify-center p-4 z-[9999]">
        <div 
          className="w-full max-w-md modal-content"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 107, 107, 0.15) 0%, rgba(78, 205, 196, 0.1) 50%, rgba(155, 89, 182, 0.12) 100%)',
            backdropFilter: 'blur(40px) saturate(2)',
            WebkitBackdropFilter: 'blur(40px) saturate(2)',
            borderRadius: '24px',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            boxShadow: `
              0 20px 70px rgba(0, 0, 0, 0.15),
              inset 0 1px 1px rgba(255, 255, 255, 0.5),
              inset 0 -1px 1px rgba(0, 0, 0, 0.05)
            `
          }}
        >
          <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
              <div className="w-6" /> {/* Spacer */}
              <button
                onClick={onClose}
                className="rounded-full transition-all duration-200 hover:scale-110"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  width: '44px',
                  height: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                disabled={loading}
              >
                <X className="w-5 h-5" style={{ color: 'rgba(0, 0, 0, 0.6)' }} />
              </button>
            </div>

            {/* Content */}
            <div className="text-center space-y-6">
              <div 
                className="w-20 h-20 mx-auto rounded-2xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 45, 85, 0.15) 0%, rgba(255, 45, 85, 0.05) 100%)',
                  border: '1px solid rgba(255, 45, 85, 0.2)',
                  boxShadow: '0 8px 24px rgba(255, 45, 85, 0.15)'
                }}
              >
                <Heart className="w-10 h-10" style={{ color: '#FF2D55' }} />
              </div>
              
              <div className="space-y-2">
                <h2 style={{
                  fontFamily: '"Great Vibes", cursive',
                  fontSize: '32px',
                  fontWeight: '400',
                  color: '#000000'
                }}>
                  Tim & Kirsten
                </h2>
                <p style={{
                  fontFamily: '"Montserrat", sans-serif',
                  fontSize: '16px',
                  fontWeight: '600',
                  color: 'rgba(0, 0, 0, 0.8)'
                }}>
                  October 5, 2025 • 3:00 PM
                </p>
                <p style={{
                  fontFamily: '"Montserrat", sans-serif',
                  fontSize: '14px',
                  color: 'rgba(0, 0, 0, 0.6)'
                }}>
                  Ben Ean, Pokolbin
                </p>
              </div>

              <div className="space-y-4">
                <h3 style={{
                  fontFamily: '"Bodoni Moda", serif',
                  fontSize: '20px',
                  fontWeight: '600',
                  color: '#000000'
                }}>
                  Will you be attending?
                </h3>
                
                <div className="space-y-3">
                  <button
                    onClick={() => handleRSVPResponse('yes')}
                    disabled={loading}
                    className="w-full py-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] group"
                    style={{
                      background: 'linear-gradient(135deg, rgba(52, 199, 89, 0.25) 0%, rgba(52, 199, 89, 0.15) 100%)',
                      backdropFilter: 'blur(20px) saturate(1.5)',
                      WebkitBackdropFilter: 'blur(20px) saturate(1.5)',
                      border: '1px solid rgba(52, 199, 89, 0.3)',
                      boxShadow: '0 4px 12px rgba(52, 199, 89, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.3)',
                      minHeight: '64px'
                    }}
                  >
                    <div className="flex items-center justify-center space-x-3">
                      <CheckCircle className="w-6 h-6 group-hover:scale-110 transition-transform" style={{ color: '#34C759' }} />
                      <div className="text-center">
                        <div style={{
                          fontFamily: '"Montserrat", sans-serif',
                          fontSize: '16px',
                          fontWeight: '600',
                          color: '#34C759'
                        }}>Yes, I'll be there!</div>
                        <div style={{
                          fontFamily: '"Montserrat", sans-serif',
                          fontSize: '14px',
                          color: '#34C759',
                          opacity: 0.8
                        }}>Can't wait to celebrate</div>
                      </div>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => handleRSVPResponse('maybe')}
                    disabled={loading}
                    className="w-full py-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] group"
                    style={{
                      background: 'linear-gradient(135deg, rgba(255, 149, 0, 0.15) 0%, rgba(255, 149, 0, 0.05) 100%)',
                      backdropFilter: 'blur(20px) saturate(1.5)',
                      WebkitBackdropFilter: 'blur(20px) saturate(1.5)',
                      border: '1px solid rgba(255, 149, 0, 0.25)',
                      boxShadow: '0 4px 12px rgba(255, 149, 0, 0.15), inset 0 1px 1px rgba(255, 255, 255, 0.3)',
                      minHeight: '64px'
                    }}
                  >
                    <div className="flex items-center justify-center space-x-3">
                      <AlertCircle className="w-6 h-6 group-hover:scale-110 transition-transform" style={{ color: '#FF9500' }} />
                      <div className="text-center">
                        <div style={{
                          fontFamily: '"Montserrat", sans-serif',
                          fontSize: '16px',
                          fontWeight: '600',
                          color: '#FF9500'
                        }}>Maybe</div>
                        <div style={{
                          fontFamily: '"Montserrat", sans-serif',
                          fontSize: '14px',
                          color: '#FF9500',
                          opacity: 0.8
                        }}>Still checking my schedule</div>
                      </div>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => handleRSVPResponse('no')}
                    disabled={loading}
                    className="w-full py-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] group"
                    style={{
                      background: 'linear-gradient(135deg, rgba(255, 59, 48, 0.15) 0%, rgba(255, 59, 48, 0.05) 100%)',
                      backdropFilter: 'blur(20px) saturate(1.5)',
                      WebkitBackdropFilter: 'blur(20px) saturate(1.5)',
                      border: '1px solid rgba(255, 59, 48, 0.25)',
                      boxShadow: '0 4px 12px rgba(255, 59, 48, 0.15), inset 0 1px 1px rgba(255, 255, 255, 0.3)',
                      minHeight: '64px'
                    }}
                  >
                    <div className="flex items-center justify-center space-x-3">
                      <XCircle className="w-6 h-6 group-hover:scale-110 transition-transform" style={{ color: '#FF3B30' }} />
                      <div className="text-center">
                        <div style={{
                          fontFamily: '"Montserrat", sans-serif',
                          fontSize: '16px',
                          fontWeight: '600',
                          color: '#FF3B30'
                        }}>Can't make it</div>
                        <div style={{
                          fontFamily: '"Montserrat", sans-serif',
                          fontSize: '14px',
                          color: '#FF3B30',
                          opacity: 0.8
                        }}>Wish I could be there</div>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {loading && (
                <div className="text-center">
                  <div className="inline-flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-wedding-gold border-t-transparent rounded-full animate-spin"></div>
                    <span style={{
                      fontFamily: '"Montserrat", sans-serif',
                      fontSize: '14px',
                      color: 'rgba(0, 0, 0, 0.6)'
                    }}>Submitting your RSVP...</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SimpleRSVPPopup;