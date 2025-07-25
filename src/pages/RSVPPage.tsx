import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Heart, Calendar, MapPin, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import RSVPForm from '@/components/guest/RSVPForm';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { GuestManager } from '@/utils/guestManagement';
import { toast } from 'sonner';
import { getLiquidGlassStyle, stylePresets } from '@/utils/styleHelpers';
import styles from '@/components/dashboard/dashboard.module.css';

const RSVPPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [guestRecord, setGuestRecord] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Get guest ID from URL params or use current user
  const guestId = searchParams.get('guest') || undefined;

  useEffect(() => {
    loadGuestData();
  }, [user, guestId]);

  const loadGuestData = async () => {
    try {
      setLoading(true);
      
      if (guestId) {
        // Load specific guest by ID
        const guests = await GuestManager.getAllGuests();
        const guest = guests.find(g => g.id === guestId);
        setGuestRecord(guest || null);
      } else if (user) {
        // Load current user's guest record
        const guest = await GuestManager.getGuestByUserId(user.id);
        setGuestRecord(guest);
      }
    } catch (error) {
      console.error('Error loading guest data:', error);
      toast.error('Failed to load guest information');
    } finally {
      setLoading(false);
    }
  };

  const handleRSVPSubmitted = async () => {
    // Show success message
    toast.success('Thank you for your RSVP response!');
    
    // Navigate back to home after a short delay to let the toast show
    setTimeout(() => {
      navigate('/');
    }, 1500);
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-16 pb-24 px-5">
        <div className="max-w-2xl mx-auto">
          <div 
            className="p-6 rounded-2xl"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0.25) 100%)',
              backdropFilter: 'blur(25px) saturate(1.8)',
              WebkitBackdropFilter: 'blur(25px) saturate(1.8)',
              border: '1px solid rgba(255, 255, 255, 0.4)',
              boxShadow: '0 8px 32px rgba(31, 38, 135, 0.12), inset 0 1px 1px rgba(255, 255, 255, 0.6)'
            }}
          >
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-wedding-navy mx-auto"></div>
              <p className="text-[#7a736b] mt-4">Loading RSVP form...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const weddingDetails = {
    date: 'October 5, 2025',
    time: '3:00 PM',
    ceremony: 'Ben Ean Winery, Hunter Valley',
    reception: 'Same Location',
    dress_code: 'Cocktail Attire'
  };

  return (
    <div className="min-h-screen pt-16 pb-24 px-5 bg-gradient-to-br from-blue-50 via-white to-cream-50">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate('/')}
              className="rounded-full transition-all duration-200 hover:scale-105"
              style={{
                minWidth: '44px',
                minHeight: '44px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0.25) 100%)',
                backdropFilter: 'blur(20px) saturate(1.8)',
                WebkitBackdropFilter: 'blur(20px) saturate(1.8)',
                border: '1px solid rgba(255, 255, 255, 0.4)',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08), inset 0 1px 1px rgba(255, 255, 255, 0.7)'
              }}
            >
              <ArrowLeft className="w-5 h-5" style={{ color: 'rgba(0, 0, 0, 0.7)' }} />
            </button>
            <div>
              <h1 className="flex items-center gap-2" style={{
                fontFamily: '"Bodoni Moda", serif',
                fontSize: '28px',
                fontWeight: '600',
                color: '#002147'
              }}>
                <Heart className="w-6 h-6 text-wedding-gold" />
                Wedding RSVP
              </h1>
              <p style={{
                fontFamily: '"Montserrat", sans-serif',
                fontSize: '14px',
                color: 'rgba(0, 0, 0, 0.6)'
              }}>
                {guestRecord?.display_name || guestRecord?.first_name 
                  ? `Welcome, ${guestRecord.display_name || guestRecord.first_name}!`
                  : 'Please respond to our wedding invitation'
                }
              </p>
            </div>
          </div>
        </motion.div>

        {/* Wedding Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div 
            className="p-6 rounded-2xl"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0.25) 100%)',
              backdropFilter: 'blur(25px) saturate(1.8)',
              WebkitBackdropFilter: 'blur(25px) saturate(1.8)',
              border: '1px solid rgba(255, 255, 255, 0.4)',
              boxShadow: '0 8px 32px rgba(31, 38, 135, 0.12), inset 0 1px 1px rgba(255, 255, 255, 0.6)'
            }}
          >
            <div className="text-center space-y-4">
              <h2 style={{
                fontFamily: '"Great Vibes", cursive',
                fontSize: '32px',
                fontWeight: '400',
                color: '#000000'
              }}>
                Tim & Kirsten
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2 justify-center md:justify-start">
                  <Calendar className="w-4 h-4 text-wedding-gold" />
                  <span style={{
                    fontFamily: '"Montserrat", sans-serif',
                    fontSize: '15px',
                    color: '#000000'
                  }}>{weddingDetails.date}</span>
                </div>
                <div className="flex items-center gap-2 justify-center md:justify-start">
                  <Clock className="w-4 h-4 text-wedding-gold" />
                  <span style={{
                    fontFamily: '"Montserrat", sans-serif',
                    fontSize: '15px',
                    color: '#000000'
                  }}>{weddingDetails.time}</span>
                </div>
                <div className="flex items-center gap-2 justify-center md:justify-start">
                  <MapPin className="w-4 h-4 text-wedding-gold" />
                  <span style={{
                    fontFamily: '"Montserrat", sans-serif',
                    fontSize: '15px',
                    color: '#000000'
                  }}>{weddingDetails.ceremony}</span>
                </div>
                <div className="flex items-center gap-2 justify-center md:justify-start">
                  <Heart className="w-4 h-4 text-wedding-gold" />
                  <span style={{
                    fontFamily: '"Montserrat", sans-serif',
                    fontSize: '15px',
                    color: '#000000'
                  }}>{weddingDetails.dress_code}</span>
                </div>
              </div>
              
            </div>
          </div>
        </motion.div>

        {/* RSVP Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {guestRecord ? (
            <RSVPForm
              guestId={guestRecord.id}
              onRSVPSubmitted={handleRSVPSubmitted}
              readonly={guestRecord.rsvp_responded_at !== null}
            />
          ) : (
            <div 
              className="p-6 rounded-2xl"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0.25) 100%)',
                backdropFilter: 'blur(25px) saturate(1.8)',
                WebkitBackdropFilter: 'blur(25px) saturate(1.8)',
                border: '1px solid rgba(255, 255, 255, 0.4)',
                boxShadow: '0 8px 32px rgba(31, 38, 135, 0.12), inset 0 1px 1px rgba(255, 255, 255, 0.6)'
              }}
            >
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
                  <Heart className="w-8 h-8 text-orange-600" />
                </div>
                <h3 style={{
                  fontFamily: '"Bodoni Moda", serif',
                  fontSize: '20px',
                  fontWeight: '600',
                  color: '#002147'
                }}>
                  Guest Record Not Found
                </h3>
                <p style={{
                  fontFamily: '"Montserrat", sans-serif',
                  fontSize: '15px',
                  color: 'rgba(0, 0, 0, 0.6)'
                }}>
                  We couldn't find your guest record. This could be because:
                </p>
                <ul className="text-left space-y-1" style={{
                  fontFamily: '"Montserrat", sans-serif',
                  fontSize: '14px',
                  color: 'rgba(0, 0, 0, 0.6)'
                }}>
                  <li>• You need to sign in to access your RSVP</li>
                  <li>• Your email address may not be in our guest list yet</li>
                  <li>• There may be a typo in the invitation link</li>
                </ul>
                <div className="space-y-2">
                  <button
                    onClick={() => navigate('/auth')}
                    className="rounded-lg transition-all duration-200 hover:scale-105 w-full"
                    style={{
                      minHeight: '44px',
                      padding: '0 24px',
                      background: 'linear-gradient(135deg, rgba(0, 33, 71, 0.9) 0%, rgba(0, 33, 71, 0.8) 100%)',
                      backdropFilter: 'blur(20px) saturate(1.8)',
                      WebkitBackdropFilter: 'blur(20px) saturate(1.8)',
                      border: '1px solid rgba(0, 33, 71, 0.3)',
                      boxShadow: '0 4px 16px rgba(0, 33, 71, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.3)',
                      fontFamily: '"Montserrat", sans-serif',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#ffffff'
                    }}
                  >
                    Sign In to RSVP
                  </button>
                  <button
                    onClick={() => navigate('/')}
                    className="rounded-lg transition-all duration-200 hover:scale-105 w-full"
                    style={{
                      minHeight: '44px',
                      padding: '0 24px',
                      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0.25) 100%)',
                      backdropFilter: 'blur(20px) saturate(1.8)',
                      WebkitBackdropFilter: 'blur(20px) saturate(1.8)',
                      border: '1px solid rgba(0, 33, 71, 0.3)',
                      boxShadow: '0 2px 8px rgba(0, 33, 71, 0.1), inset 0 1px 1px rgba(255, 255, 255, 0.7)',
                      fontFamily: '"Montserrat", sans-serif',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#002147'
                    }}
                  >
                    Back to Home
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 text-center"
        >
          <div 
            className="p-4 rounded-2xl"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0.25) 100%)',
              backdropFilter: 'blur(25px) saturate(1.8)',
              WebkitBackdropFilter: 'blur(25px) saturate(1.8)',
              border: '1px solid rgba(255, 255, 255, 0.4)',
              boxShadow: '0 8px 32px rgba(31, 38, 135, 0.12), inset 0 1px 1px rgba(255, 255, 255, 0.6)'
            }}
          >
            <p style={{
              fontFamily: '"Montserrat", sans-serif',
              fontSize: '14px',
              color: 'rgba(0, 0, 0, 0.6)'
            }}>
              Having trouble with your RSVP? Contact us at:
            </p>
            <div className="mt-2 space-y-1">
              <p style={{
                fontFamily: '"Montserrat", sans-serif',
                fontSize: '14px',
                color: '#000000'
              }}>
                <strong style={{ color: '#002147' }}>Tim:</strong>{' '}
                <a 
                  href="tel:0401372025" 
                  style={{
                    color: '#002147',
                    textDecoration: 'none',
                    fontWeight: '500'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                  onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                >
                  0401 372 025
                </a>
              </p>
              <p style={{
                fontFamily: '"Montserrat", sans-serif',
                fontSize: '14px',
                color: '#000000'
              }}>
                <strong style={{ color: '#002147' }}>Kirsten:</strong>{' '}
                <a 
                  href="tel:0402180915" 
                  style={{
                    color: '#002147',
                    textDecoration: 'none',
                    fontWeight: '500'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                  onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                >
                  0402 180 915
                </a>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default RSVPPage;