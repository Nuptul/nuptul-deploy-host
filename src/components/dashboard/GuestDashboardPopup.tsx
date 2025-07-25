import React, { useState, useEffect } from 'react';
import { X, Calendar, MapPin, Camera, Gift, MessageSquare, Clock, Heart, Users, Bell, User, Plane, Utensils, Music, Car, Sparkles, HelpCircle, Bus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

import { useWeddingEvents } from '@/hooks/useWeddingData';
import { supabase } from '@/integrations/supabase/client';
import '@/styles/dashboard-enhancements.css';
import '@/styles/dashboard-animations.css';

interface GuestDashboardPopupProps {
  onClose?: () => void;
}

const GuestDashboardPopup: React.FC<GuestDashboardPopupProps> = ({ onClose }) => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const { events, loading: eventsLoading } = useWeddingEvents();
  
  const [daysUntilWedding, setDaysUntilWedding] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [weddingEvents, setWeddingEvents] = useState<any[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  useEffect(() => {
    // Calculate days until wedding (Ben & Ean's wedding - October 5, 2025)
    const updateCountdown = () => {
      const weddingDate = new Date('2025-10-05T15:00:00'); // 3 PM ceremony time
      const now = new Date();
      const diffTime = weddingDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setDaysUntilWedding(Math.max(0, diffDays));
      setCurrentTime(now);
    };

    // Initial calculation
    updateCountdown();

    // Update countdown every minute for accuracy
    const countdownTimer = setInterval(updateCountdown, 60000);

    // Load wedding events from database
    loadWeddingEvents();

    return () => clearInterval(countdownTimer);
  }, []);

  const loadWeddingEvents = async () => {
    try {
      setLoadingEvents(true);
      // Force fresh data fetch
      const { data, error } = await supabase
        .from('wedding_events')
        .select('*')
        .order('start_time', { ascending: true })
        .eq('is_active', true); // Only get active events
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        console.log('Loaded wedding events from database:', data);
        setWeddingEvents(data);
      } else {
        // Fallback events if none in database
        setWeddingEvents([
          {
            id: 1,
            title: 'Guest Arrival',
            start_time: '2025-10-05T14:30:00+11:00',
            location: 'Ben Ean',
            description: 'Please arrive by 2:30 PM',
            event_type: 'arrival'
          },
          {
            id: 2,
            title: 'Wedding Ceremony',
            start_time: '2025-10-05T15:00:00+11:00',
            location: 'Garden Terrace Lawn, Ben Ean',
            description: 'Join us as we say "I do"',
            event_type: 'ceremony'
          },
          {
            id: 3,
            title: 'Cocktail Hour',
            start_time: '2025-10-05T16:00:00+11:00',
            location: 'Ben Ean',
            description: 'Drinks and canapés after ceremony',
            event_type: 'cocktails'
          },
          {
            id: 4,
            title: 'Wedding Reception',
            start_time: '2025-10-05T17:00:00+11:00',
            location: 'Ben Ean',
            description: 'Dinner, dancing & celebration',
            event_type: 'reception'
          },
          {
            id: 5,
            title: 'Reception Concludes',
            start_time: '2025-10-06T00:00:00+11:00',
            location: 'Ben Ean',
            description: 'End of formal celebrations',
            event_type: 'end'
          }
        ]);
      }
    } catch (error) {
      console.error('Error loading wedding events:', error);
      // Use fallback events on error
      setWeddingEvents([
        {
          id: 1,
          title: 'Guest Arrival',
          start_time: '2025-10-05T14:30:00+11:00',
          location: 'Ben Ean',
          description: 'Please arrive by 2:30 PM',
          event_type: 'arrival'
        },
        {
          id: 2,
          title: 'Wedding Ceremony',
          start_time: '2025-10-05T15:00:00+11:00',
          location: 'Garden Terrace Lawn, Ben Ean',
          description: 'Join us as we say "I do"',
          event_type: 'ceremony'
        },
        {
          id: 3,
          title: 'Cocktail Hour',
          start_time: '2025-10-05T16:00:00+11:00',
          location: 'Ben Ean',
          description: 'Drinks and canapés after ceremony',
          event_type: 'cocktails'
        },
        {
          id: 4,
          title: 'Wedding Reception',
          start_time: '2025-10-05T17:00:00+11:00',
          location: 'Ben Ean',
          description: 'Dinner, dancing & celebration',
          event_type: 'reception'
        },
        {
          id: 5,
          title: 'Reception Concludes',
          start_time: '2025-10-06T00:00:00+11:00',
          location: 'Ben Ean',
          description: 'End of formal celebrations',
          event_type: 'end'
        }
      ]);
    } finally {
      setLoadingEvents(false);
    }
  };

  const handleNavigation = (path: string, external = false) => {
    if (onClose) onClose();
    
    if (external) {
      window.open(path, '_blank', 'noopener,noreferrer');
    } else {
      navigate(path);
    }
  };
  
  const handleActionClick = (action: any) => {
    if (action.disabled) {
      return; // Do nothing for disabled actions
    }
    if (action.onClick) {
      action.onClick();
    } else {
      handleNavigation(action.path, action.external);
    }
  };


  
  const quickStats = [
    {
      label: 'Days to Go',
      value: daysUntilWedding,
      icon: Calendar,
      color: 'text-[#0066CC]',
      bgColor: 'bg-[#0066CC]/10',
      subtitle: 'Until the big day',
      isCountdown: true
    },
    {
      label: 'Your Party',
      value: profile?.plus_one_name ? '2 guests' : user ? '1 guest' : 'Login to see',
      icon: Users,
      color: 'text-[#0066CC]',
      bgColor: 'bg-[#0066CC]/10',
      subtitle: profile?.plus_one_name ? `You + ${profile.plus_one_name}` : 'Just you'
    },
    {
      label: 'Events',
      value: weddingEvents?.length || '4',
      icon: Bell,
      color: 'text-[#0066CC]',
      bgColor: 'bg-[#0066CC]/10',
      subtitle: 'Wedding activities'
    }
  ];

  const guestActions = [
    {
      icon: Bus,
      title: 'Transportation',
      subtitle: 'Shuttle service booking',
      path: '/transport',
      color: 'text-orange-600'
    },
    {
      icon: Gift,
      title: 'Gift Registry',
      subtitle: 'View wedding registry',
      path: 'https://mygiftregistry.com.au/id/tim-and-kirsten/',
      color: 'text-rose-600',
      external: true
    }
  ];

  // Format time from ISO string
  const formatEventTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-AU', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true,
      timeZone: 'Australia/Sydney'
    });
  };

  return (
    <div className="w-full h-full flex flex-col max-h-[90vh] overflow-hidden">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="relative w-full h-full max-h-[90vh] overflow-hidden rounded-3xl transition-all duration-500"
        style={{
          background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.95) 0%, rgba(249, 250, 251, 0.9) 100%)',
          backdropFilter: 'blur(120px) saturate(2)',
          WebkitBackdropFilter: 'blur(120px) saturate(2)',
          border: '1px solid rgba(255, 255, 255, 0.5)',
          boxShadow: '0 30px 60px -15px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.5) inset, 0 20px 40px -20px rgba(59, 130, 246, 0.15)',
        }}>
        
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full filter blur-3xl opacity-10 animate-blob bg-blue-400 mix-blend-multiply"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full filter blur-3xl opacity-10 animate-blob animation-delay-2000 bg-purple-400 mix-blend-multiply"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full filter blur-3xl opacity-10 animate-blob animation-delay-4000 bg-pink-400 mix-blend-multiply"></div>
        </div>
        
        {/* Enhanced Header */}
        <div className="relative overflow-hidden border-b border-gray-200/50">
          {/* Animated gradient background */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-pink-600/5" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/20" />
          
          <div className="relative flex items-center justify-between p-6">
            <div className="flex items-center space-x-4">
              <motion.div 
                initial={{ rotate: -180, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="relative"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl blur-xl opacity-50"></div>
                <div className="relative p-4 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 shadow-2xl">
                  <Heart className="w-7 h-7 text-white" />
                </div>
              </motion.div>
              <div>
                <motion.h2 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent"
                >
                  Guest Dashboard
                </motion.h2>
                <motion.p 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-sm mt-1 flex items-center gap-2 text-gray-600"
                >
                  <span className="font-medium text-gray-700">
                    Welcome, {profile?.first_name || 'Guest'}
                  </span>
                  <span className="text-gray-400">•</span>
                  <span>Tim & Kirsten's Wedding</span>
                </motion.p>
              </div>
            </div>
            {onClose && (
              <motion.button
                whileHover={{ scale: 1.05, rotate: 90 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="relative p-3 rounded-2xl backdrop-blur-xl border transition-all duration-300 group bg-white/50 border-gray-200/50 hover:bg-white/80 hover:border-gray-300/50 hover:shadow-lg"
              >
                <X className="w-5 h-5 transition-colors duration-300 text-gray-600 group-hover:text-gray-900" />
              </motion.button>
            )}
          </div>
        </div>

        {/* Enhanced Content with Custom Scrollbar */}
        <div className="p-6 space-y-8 overflow-y-auto max-h-[calc(90vh-100px)] scrollbar-thin scrollbar-thumb-blue-500/20 scrollbar-track-transparent hover:scrollbar-thumb-blue-500/30">
          
          {/* Hero Countdown Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="relative overflow-hidden rounded-2xl"
            style={{
              background: 'linear-gradient(145deg, rgba(59, 130, 246, 0.05) 0%, rgba(147, 51, 234, 0.05) 100%)',
              backdropFilter: 'blur(40px) saturate(1.8)',
              WebkitBackdropFilter: 'blur(40px) saturate(1.8)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1), inset 0 1px 1px rgba(255, 255, 255, 0.5)'
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5" />
            <div className="relative p-8 text-center">
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                className="inline-block"
              >
                <div className="text-7xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  {daysUntilWedding}
                </div>
                <div className="text-xl font-semibold text-gray-700 mb-1">Days Until</div>
                <div className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  Tim & Kirsten's Wedding
                </div>
                <div className="text-sm text-gray-500 mt-2">October 5, 2025 • Hunter Valley</div>
              </motion.div>
            </div>
          </motion.div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            {quickStats.map((stat, index) => {
              const Icon = stat.icon;
              const isCountdown = stat.isCountdown;

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  className="relative group"
                >
                  <div className={`relative overflow-hidden rounded-2xl transition-all duration-500 shadow-lg hover:shadow-2xl hover:-translate-y-1 ${
                    isCountdown
                      ? 'bg-gradient-to-br from-[#0066CC]/10 via-white/95 to-[#0066CC]/5 border-2 border-[#0066CC]/20 hover:border-[#0066CC]/40'
                      : 'bg-white/90 border border-gray-200/50 hover:border-[#0066CC]/30'
                  }`}
                    style={{
                      backdropFilter: 'blur(30px) saturate(1.8)',
                      WebkitBackdropFilter: 'blur(30px) saturate(1.8)',
                    }}
                  >
                    {/* Enhanced shimmer effect for countdown */}
                    <div className={`absolute inset-0 ${
                      isCountdown
                        ? 'bg-gradient-to-r from-transparent via-[#0066CC]/15 to-transparent'
                        : 'bg-gradient-to-r from-transparent via-blue-500/10 to-transparent'
                    } -translate-x-full group-hover:translate-x-full transition-transform duration-700`} />

                    {/* Special countdown glow */}
                    {isCountdown && (
                      <div className="absolute inset-0 bg-gradient-to-br from-[#0066CC]/5 via-transparent to-[#0066CC]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    )}

                    <div className="relative p-6 text-center">
                      <div className="relative inline-flex items-center justify-center w-16 h-16 mx-auto mb-4">
                        <div className={`absolute inset-0 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
                          isCountdown
                            ? 'bg-gradient-to-br from-[#0066CC]/30 to-[#0066CC]/10'
                            : 'bg-gradient-to-br from-blue-500/20 to-purple-500/20'
                        }`}></div>
                        <div className={`relative flex items-center justify-center w-full h-full rounded-2xl border shadow-lg group-hover:shadow-xl transition-all duration-500 transform group-hover:scale-110 ${
                          isCountdown
                            ? 'bg-gradient-to-br from-[#0066CC]/10 to-white border-[#0066CC]/30 group-hover:border-[#0066CC]/50'
                            : 'bg-gradient-to-br from-white to-gray-50 border-gray-200 group-hover:border-[#0066CC]/30'
                        }`}>
                          <Icon className={`w-8 h-8 ${stat.color} transition-all duration-300 group-hover:scale-110 ${
                            isCountdown ? 'drop-shadow-sm' : ''
                          }`} />
                        </div>
                      </div>

                      {/* Enhanced countdown value display */}
                      <div className={`${
                        isCountdown
                          ? 'text-3xl font-bold bg-gradient-to-r from-[#0066CC] to-[#0066CC]/80 bg-clip-text text-transparent mb-2'
                          : `text-2xl font-bold ${stat.color} mb-1`
                      }`}>
                        {isCountdown && (
                          <motion.span
                            key={stat.value}
                            initial={{ scale: 1.1, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.3 }}
                          >
                            {stat.value}
                          </motion.span>
                        )}
                        {!isCountdown && stat.value}
                      </div>

                      <div className={`text-sm font-semibold mb-1 ${
                        isCountdown ? 'text-[#0066CC]/80' : 'text-gray-700'
                      }`}>{stat.label}</div>
                      <div className={`text-xs ${
                        isCountdown ? 'text-[#0066CC]/60' : 'text-gray-500'
                      }`}>{stat.subtitle}</div>

                      {/* Special countdown pulse indicator */}
                      {isCountdown && (
                        <div className="absolute top-3 right-3">
                          <div className="w-2 h-2 bg-[#0066CC] rounded-full animate-pulse"></div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Guest Actions - Admin Style */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-xl">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Guest Actions</h3>
                  <p className="text-sm text-gray-500">Quick access to wedding features</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {guestActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <motion.button
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleNavigation(action.path, action.external)}
                    className="relative text-left rounded-2xl transition-all duration-500 group overflow-hidden bg-white/90 border border-gray-200/50 hover:border-blue-400/50 shadow-lg hover:shadow-2xl hover:-translate-y-1"
                    style={{
                      padding: '24px',
                      minHeight: '150px',
                      background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.9) 0%, rgba(249, 250, 251, 0.8) 100%)',
                      backdropFilter: 'blur(30px) saturate(1.8)',
                      WebkitBackdropFilter: 'blur(30px) saturate(1.8)',
                    }}
                  >
                    {/* Enhanced hover effect overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />

                    <div className="relative h-full flex flex-col">
                      <div className="relative inline-flex items-center justify-center w-16 h-16 mx-auto mb-4">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="relative flex items-center justify-center w-full h-full rounded-2xl border shadow-lg group-hover:shadow-xl transition-all duration-500 transform group-hover:scale-110 bg-gradient-to-br from-white to-gray-50 border-gray-200 group-hover:border-blue-300">
                          <Icon className={`w-8 h-8 ${action.color} transition-all duration-300 group-hover:scale-110`} />
                        </div>
                      </div>

                      <div className="space-y-1 text-center flex-1">
                        <div className="font-bold text-sm leading-tight text-gray-900">
                          {action.title}
                        </div>
                        <div className="text-xs leading-relaxed line-clamp-2 text-gray-600">
                          {action.subtitle}
                        </div>
                      </div>

                      {/* Urgent indicator */}
                      {action.urgent && (
                        <div className="absolute top-3 right-3 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                      )}

                      {/* Arrow indicator */}
                      <div className="absolute top-3 right-3 transform translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500 text-blue-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Wedding Timeline - Enhanced Admin Style */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-xl">
                  <Clock className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Wedding Day Timeline</h3>
                  <p className="text-sm text-gray-500">October 5, 2025 Schedule</p>
                </div>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-2xl bg-white/90 border border-gray-200/50 shadow-lg" style={{
              backdropFilter: 'blur(30px) saturate(1.8)',
              WebkitBackdropFilter: 'blur(30px) saturate(1.8)',
            }}>
              <div className="p-6 space-y-4">
                {loadingEvents ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-500 mt-2">Loading events...</p>
                  </div>
                ) : (
                  // Filter to show only October 5th events
                  weddingEvents
                    .filter(event => {
                      const eventDate = new Date(event.start_time);
                      return eventDate.getDate() === 5 && eventDate.getMonth() === 9; // October is month 9 (0-indexed)
                    })
                    .map((event, index, filteredEvents) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="relative flex items-start gap-4 p-4 rounded-xl bg-gradient-to-r from-blue-50/50 to-purple-50/50 border border-gray-200/50 hover:shadow-md transition-all duration-300"
                    >
                      {/* Timeline connector */}
                      {index < filteredEvents.length - 1 && (
                        <div className="absolute left-[58px] top-[60px] w-0.5 h-[calc(100%+8px)] bg-gradient-to-b from-blue-300 to-purple-300 opacity-30"></div>
                      )}
                      
                      {/* Time badge */}
                      <div className="shrink-0">
                        <div className="bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-xl px-4 py-2 font-semibold text-sm shadow-lg min-w-[100px] text-center">
                          {formatEventTime(event.start_time)}
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-800 mb-1">{event.title}</h4>
                        <p className="text-sm text-gray-600 mb-1 flex items-center">
                          <MapPin className="w-3 h-3 mr-1" />
                          {event.location}
                        </p>
                        <p className="text-xs text-gray-500">{event.description}</p>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default GuestDashboardPopup;