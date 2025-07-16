import React, { useState, useEffect } from 'react';
import { X, Calendar, MapPin, Camera, Gift, MessageSquare, Clock, Heart, Users, CheckCircle, Bell, User, Plane, Utensils, Music, Car } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import GlassCard from '@/components/GlassCard';
import { GlareCard } from '@/ui/aceternity/glare-card';
import { TextGenerate } from '@/ui/aceternity/text-generate';
import FeatureFlag from '@/components/ui/FeatureFlag';
import AceternityErrorBoundary from '@/components/ui/AceternityErrorBoundary';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useRSVPStatus } from '@/hooks/useRSVPStatus';
import { useWeddingEvents } from '@/hooks/useWeddingData';
import { getLiquidGlassStyle, stylePresets } from '@/utils/styleHelpers';
import styles from './dashboard.module.css';

interface GuestDashboardPopupProps {
  onClose?: () => void;
}

const GuestDashboardPopup: React.FC<GuestDashboardPopupProps> = ({ onClose }) => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { needsRSVP, rsvpData, hasRSVPd } = useRSVPStatus();
  const { events, loading: eventsLoading } = useWeddingEvents();
  
  const [daysUntilWedding, setDaysUntilWedding] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Calculate days until wedding (Ben & Ean's wedding - October 5, 2025)
    const weddingDate = new Date('2025-10-05');
    const today = new Date();
    const diffTime = weddingDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    setDaysUntilWedding(Math.max(0, diffDays));
    
    // Update current time every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => clearInterval(timer);
  }, []);

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

  // Get RSVP status display
  const getRSVPStatus = () => {
    if (!user) return { text: 'Not logged in', color: 'text-gray-600', bgColor: 'bg-gray-50' };
    if (!hasRSVPd) return { text: 'Pending', color: 'text-orange-600', bgColor: 'bg-orange-50' };
    if (rsvpData?.status === 'attending') return { text: 'Attending', color: 'text-green-600', bgColor: 'bg-green-50' };
    return { text: 'Not Attending', color: 'text-red-600', bgColor: 'bg-red-50' };
  };
  
  const rsvpStatusInfo = getRSVPStatus();
  
  const quickStats = [
    {
      label: 'Days to Go',
      value: daysUntilWedding,
      icon: Calendar,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
      subtitle: 'Until the big day'
    },
    {
      label: 'RSVP Status',
      value: rsvpStatusInfo.text,
      icon: CheckCircle,
      color: rsvpStatusInfo.color,
      bgColor: rsvpStatusInfo.bgColor,
      subtitle: hasRSVPd ? 'You\'re all set!' : 'Action needed'
    },
    {
      label: 'Your Party',
      value: profile?.plus_one_name ? '2 guests' : user ? '1 guest' : 'Login to see',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      subtitle: profile?.plus_one_name ? `You + ${profile.plus_one_name}` : 'Just you'
    },
    {
      label: 'Events',
      value: events?.length || '4',
      icon: Bell,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      subtitle: 'Wedding activities'
    }
  ];

  const quickActions = [
    {
      icon: Calendar,
      title: 'RSVP',
      subtitle: needsRSVP ? 'Please respond!' : 'Update response',
      path: '/',
      color: needsRSVP ? 'text-red-600' : 'text-blue-600',
      urgent: needsRSVP,
      onClick: () => {
        if (onClose) onClose();
        // Trigger RSVP popup instead of navigation
        const event = new CustomEvent('openRSVP');
        window.dispatchEvent(event);
      }
    },
    {
      icon: MapPin,
      title: 'Venues',
      subtitle: 'View locations & directions',
      path: '/venue/ben-ean',
      color: 'text-green-600'
    },
    {
      icon: Gift,
      title: 'Gifts',
      subtitle: 'Honeymoon contribution (optional)',
      path: 'https://mygiftregistry.com.au/id/tim-and-kirsten/',
      color: 'text-purple-600',
      external: true,
      description: 'We are excited to have everyone we love gather together for an epic celebration - that is a gift on its own! There is no expectation for gifts from guests. If, however, you have the urge to give a gift, one option is to contribute towards honeymoon.'
    },
    {
      icon: Camera,
      title: 'Photo Gallery',
      subtitle: 'Share your memories',
      path: '/gallery',
      color: 'text-pink-600'
    },
    {
      icon: MessageSquare,
      title: 'Social Hub',
      subtitle: 'Chat & updates',
      path: '/social',
      color: 'text-indigo-600'
    },
    {
      icon: Plane,
      title: 'Travel & Stay',
      subtitle: 'Accommodation & transport',
      path: '/accommodation',
      color: 'text-teal-600'
    },
    {
      icon: Utensils,
      title: 'Coming Soon',
      subtitle: 'Menu & dietary information',
      path: '#',
      color: 'text-gray-500',
      disabled: true
    },
    {
      icon: Music,
      title: 'Coming Soon',
      subtitle: 'Entertainment & activities',
      path: '#',
      color: 'text-gray-500',
      disabled: true
    }
  ];

  // Use real events data or fallback to default
  const weddingSchedule = events?.length ? events.slice(0, 4) : [
    { 
      time: '3:00 PM', 
      title: 'Wedding Ceremony', 
      location: 'Ben Ean Pokolbin', 
      description: 'Join us as we say "I do"',
      type: 'ceremony'
    },
    { 
      time: '4:30 PM', 
      title: 'Cocktail Hour', 
      location: 'Gardens at Ben Ean', 
      description: 'Drinks and canapés',
      type: 'reception'
    },
    { 
      time: '6:00 PM', 
      title: 'Wedding Reception', 
      location: 'Ben Ean Function Centre', 
      description: 'Dinner, dancing & celebration',
      type: 'reception'
    },
    { 
      time: '11:00 PM', 
      title: 'After Party', 
      location: 'Prince of Mereweather', 
      description: 'Continue the celebration',
      type: 'afterparty'
    }
  ];

  const recentUpdates = [
    { 
      type: 'info', 
      title: 'Transportation Update', 
      message: 'Shuttle service from Newcastle CBD at 2:30 PM', 
      time: '2 hours ago',
      urgent: false,
      icon: Car
    },
    { 
      type: 'venue', 
      title: 'Venue Details Updated', 
      message: 'Ceremony location confirmed at Ben Ean Pokolbin', 
      time: '6 hours ago',
      urgent: false,
      icon: MapPin
    },
    { 
      type: 'reminder', 
      title: needsRSVP ? 'RSVP Required' : 'RSVP Confirmed', 
      message: needsRSVP ? 'Please confirm your attendance by September 15th' : 'Thank you for confirming your attendance!', 
      time: needsRSVP ? 'Action needed' : '3 days ago',
      urgent: needsRSVP,
      icon: Calendar
    },
    { 
      type: 'social', 
      title: 'Wedding Registry', 
      message: 'Our gift registry is now available on Myer', 
      time: '1 week ago',
      urgent: false,
      icon: Gift
    }
  ];

  // Allow guest dashboard even without authentication

  return (
    <div className="w-full h-full flex flex-col max-h-[90vh] overflow-hidden">
      {/* Main Glass Container with Liquid Glass Effect */}
      <div className={`w-full h-full max-h-[90vh] overflow-hidden rounded-3xl ${styles.liquidGlassContainer}`} style={{
        background: 'linear-gradient(135deg, rgba(173, 216, 230, 0.3) 0%, rgba(221, 160, 221, 0.25) 25%, rgba(255, 182, 193, 0.2) 50%, rgba(255, 218, 185, 0.25) 75%, rgba(176, 224, 230, 0.3) 100%)',
        backdropFilter: 'blur(35px) saturate(1.8)',
        WebkitBackdropFilter: 'blur(35px) saturate(1.8)',
        border: '1px solid rgba(255, 255, 255, 0.6)',
        boxShadow: '0 20px 50px rgba(31, 38, 135, 0.15), inset 0 1px 1px rgba(255, 255, 255, 0.8)',
        borderRadius: '24px',
      }}>
        
        {/* Header with Pastel Glass Design */}
        <div className="flex items-center justify-between p-6 rounded-t-3xl" style={{ 
          borderBottom: '1px solid rgba(255, 255, 255, 0.3)',
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%)'
        }}>
          <div className="relative">
            <h2 className="flex items-center" style={{
              fontSize: '26px',
              fontFamily: '"Bodoni Moda", serif',
              fontWeight: '600',
              color: '#000000'
            }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center mr-3" style={{
                background: 'linear-gradient(135deg, rgba(255, 182, 193, 0.8) 0%, rgba(255, 192, 203, 0.7) 100%)',
                boxShadow: '0 4px 12px rgba(255, 182, 193, 0.3)'
              }}>
                <Heart className="w-5 h-5" style={{ color: '#FFFFFF' }} />
              </div>
              Your Dashboard
            </h2>
            <p style={{
              fontSize: '14px',
              fontFamily: '"Montserrat", sans-serif',
              color: 'rgba(0, 0, 0, 0.6)',
              marginLeft: '52px'
            }}>Welcome, {profile?.first_name || user?.email || 'Guest'}!</p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="rounded-full min-h-[44px] min-w-[44px] flex items-center justify-center transition-all duration-200 hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0.25) 100%)',
                backdropFilter: 'blur(20px) saturate(1.8)',
                WebkitBackdropFilter: 'blur(20px) saturate(1.8)',
                border: '1px solid rgba(255, 255, 255, 0.4)',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08), inset 0 1px 1px rgba(255, 255, 255, 0.7)'
              }}
            >
              <X className="w-5 h-5" style={{ color: '#000000' }} />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-4 space-y-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          
          {/* Hero Countdown - Liquid Glass Design */}
          <div className={`rounded-2xl overflow-hidden ${styles.liquidGlassSubtle}`} style={{
            background: 'linear-gradient(135deg, rgba(255, 182, 193, 0.4) 0%, rgba(255, 218, 185, 0.35) 50%, rgba(173, 216, 230, 0.4) 100%)',
            backdropFilter: 'blur(30px) saturate(1.8)',
            WebkitBackdropFilter: 'blur(30px) saturate(1.8)',
            border: '1px solid rgba(255, 255, 255, 0.5)',
            boxShadow: '0 12px 40px rgba(255, 182, 193, 0.15), inset 0 1px 1px rgba(255, 255, 255, 0.8)',
            borderRadius: '16px',
          }}>
            <div className="p-8 text-center">
              {/* Countdown bubble */}
              <div className="inline-block rounded-3xl p-6 mb-4" style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0.4) 100%)',
                backdropFilter: 'blur(20px) saturate(1.8)',
                border: '1px solid rgba(255, 255, 255, 0.6)',
                boxShadow: 'inset 0 2px 4px rgba(255, 255, 255, 0.8), 0 4px 16px rgba(31, 38, 135, 0.08)'
              }}>
                <div style={{
                  fontSize: '48px',
                  fontFamily: '"Bodoni Moda", serif',
                  fontWeight: '700',
                  background: 'linear-gradient(135deg, #FF6B6B 0%, #9B59B6 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                }}>
                  {daysUntilWedding}
                </div>
              </div>
              
              <FeatureFlag 
                name="aceternity.text-generate" 
                fallback={
                  <div className="text-xl font-semibold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
                    Days Until Ben & Ean's Wedding
                  </div>
                }
              >
                <AceternityErrorBoundary 
                  componentName="TextGenerate (Wedding Countdown)"
                  fallback={
                    <div className="text-xl font-semibold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
                      Days Until Ben & Ean's Wedding
                    </div>
                  }
                >
                  <TextGenerate 
                    text="Days Until Ben & Ean's Wedding"
                    className="text-xl font-semibold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2"
                    wedding={true}
                    duration={1}
                    staggerDelay={0.05}
                  />
                </AceternityErrorBoundary>
              </FeatureFlag>
              <div className="text-sm text-gray-600/80 mb-3">October 5, 2025 • Hunter Valley</div>
              
              {/* Time pill */}
              <div className="inline-block bg-white/30 backdrop-blur-sm px-4 py-2 rounded-full border border-white/40 shadow-lg">
                <div className="text-xs font-medium text-gray-700">
                  {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            {quickStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <FeatureFlag 
                  key={index}
                  name="aceternity.glare-card" 
                  fallback={
                    <div key={index} className="relative group cursor-pointer">
                      <div className="bg-white/25 backdrop-blur-xl rounded-2xl border border-white/30 shadow-lg hover:shadow-2xl transition-all duration-300 group-hover:scale-105 overflow-hidden">
                        <div className={`absolute inset-0 ${stat.bgColor} opacity-20 rounded-2xl`}></div>
                        <div className="absolute inset-[1px] bg-gradient-to-br from-white/20 to-transparent rounded-2xl"></div>
                        <div className="relative p-5 text-center">
                          <div className="w-14 h-14 mx-auto mb-3 bg-white/40 backdrop-blur-lg rounded-2xl border border-white/50 shadow-inner flex items-center justify-center relative overflow-hidden">
                            <div className="absolute inset-2 bg-gradient-to-br from-white/30 to-transparent rounded-xl"></div>
                            <Icon className={`relative w-7 h-7 ${stat.color} drop-shadow-lg`} />
                          </div>
                          <div className={`text-2xl font-bold ${stat.color} mb-1 drop-shadow-lg`}>{stat.value}</div>
                          <div className="text-xs font-semibold text-gray-700/90 mb-1">{stat.label}</div>
                          <div className="text-xs text-gray-600/80">{stat.subtitle}</div>
                        </div>
                      </div>
                    </div>
                  }
                >
                  <AceternityErrorBoundary 
                    componentName={`GlareCard (${stat.label})`}
                    fallback={
                      <div key={index} className="relative group cursor-pointer">
                        <div className="bg-white/25 backdrop-blur-xl rounded-2xl border border-white/30 shadow-lg hover:shadow-2xl transition-all duration-300 group-hover:scale-105 overflow-hidden">
                          <div className={`absolute inset-0 ${stat.bgColor} opacity-20 rounded-2xl`}></div>
                          <div className="relative p-5 text-center">
                            <div className="w-14 h-14 mx-auto mb-3 bg-white/40 backdrop-blur-lg rounded-2xl border border-white/50 shadow-inner flex items-center justify-center">
                              <Icon className={`w-7 h-7 ${stat.color}`} />
                            </div>
                            <div className={`text-2xl font-bold ${stat.color} mb-1`}>{stat.value}</div>
                            <div className="text-xs font-semibold text-gray-700/90 mb-1">{stat.label}</div>
                            <div className="text-xs text-gray-600/80">{stat.subtitle}</div>
                          </div>
                        </div>
                      </div>
                    }
                  >
                    <GlareCard 
                      key={index}
                      className="group"
                      glareColor="rgba(255, 215, 0, 0.15)"
                      glareSize={300}
                      rotationRange={15}
                    >
                      <div className={`bg-white/25 backdrop-blur-xl rounded-2xl border border-white/30 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden ${styles.statCard}`}>
                        <div className={`absolute inset-0 ${stat.bgColor} opacity-20 rounded-2xl`}></div>
                        <div className="absolute inset-[1px] bg-gradient-to-br from-white/20 to-transparent rounded-2xl"></div>
                        <div className="relative p-5 text-center">
                          <div className="w-14 h-14 mx-auto mb-3 bg-white/40 backdrop-blur-lg rounded-2xl border border-white/50 shadow-inner flex items-center justify-center relative overflow-hidden">
                            <div className="absolute inset-2 bg-gradient-to-br from-white/30 to-transparent rounded-xl"></div>
                            <Icon className={`relative w-7 h-7 ${stat.color} drop-shadow-lg`} />
                          </div>
                          <div className={`text-2xl font-bold ${stat.color} mb-1 drop-shadow-lg`} style={{
                            fontFamily: '"Bodoni Moda", serif',
                            fontWeight: '700'
                          }}>{stat.value}</div>
                          <div className="text-xs font-semibold text-gray-700/90 mb-1" style={{
                            fontFamily: '"Montserrat", sans-serif',
                            fontWeight: '600'
                          }}>{stat.label}</div>
                          <div className="text-xs text-gray-600/80" style={{
                            fontFamily: '"Montserrat", sans-serif'
                          }}>{stat.subtitle}</div>
                        </div>
                      </div>
                    </GlareCard>
                  </AceternityErrorBoundary>
                </FeatureFlag>
              );
            })}
          </div>

          {/* Recent Updates - Enhanced */}
          <div className={`bg-white/20 backdrop-blur-xl rounded-2xl border border-white/30 shadow-2xl overflow-hidden ${styles.liquidGlassCard}`}>
            <div className="p-5 bg-white/10 border-b border-white/20 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10"></div>
              <h3 className="relative text-lg font-semibold flex items-center bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center mr-3 shadow-lg">
                  <Bell className="w-4 h-4 text-white" />
                </div>
                Latest Updates
              </h3>
            </div>
            <div className="p-5 space-y-4">
              {recentUpdates.map((update, index) => {
                const UpdateIcon = update.icon;
                return (
                  <div key={index} className={`flex items-start space-x-4 p-4 rounded-xl backdrop-blur-sm border transition-all duration-300 hover:shadow-lg group relative overflow-hidden ${
                    update.urgent 
                      ? 'bg-orange-50/60 border-orange-200/60 hover:bg-orange-100/80' 
                      : 'bg-white/20 border-white/30 hover:bg-white/30'
                  }`}>
                    {/* Inner glow */}
                    <div className="absolute inset-[1px] bg-gradient-to-br from-white/20 to-transparent rounded-xl"></div>
                    
                    {/* Icon container */}
                    <div className="relative w-10 h-10 bg-white/40 backdrop-blur-sm rounded-xl border border-white/50 shadow-inner flex items-center justify-center shrink-0">
                      <UpdateIcon className={`w-5 h-5 ${update.urgent ? 'text-orange-600' : 'text-gray-600'} drop-shadow-sm`} />
                    </div>
                    
                    <div className="relative flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-sm text-gray-800 truncate">{update.title}</h4>
                        {update.urgent && (
                          <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center shadow-lg shrink-0 ml-2">
                            <span className="text-white text-xs font-bold">!</span>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-gray-600/90 leading-relaxed mb-2">{update.message}</p>
                      <div className="inline-block bg-white/30 backdrop-blur-sm px-2 py-1 rounded-full border border-white/40">
                        <span className="text-xs text-gray-600 font-medium">{update.time}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Actions - Enhanced Neumorphic */}
          <div className={`bg-white/20 backdrop-blur-xl rounded-2xl border border-white/30 shadow-2xl overflow-hidden ${styles.liquidGlassCard}`}>
            <div className="p-5 bg-white/10 border-b border-white/20 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 to-purple-500/10"></div>
              <h3 className="relative text-lg font-semibold flex items-center bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center mr-3 shadow-lg">
                  <Heart className="w-4 h-4 text-white" />
                </div>
                Quick Actions
              </h3>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-2 gap-4">
                {quickActions.map((action, index) => {
                  const Icon = action.icon;
                  const isGifts = action.title === 'Gifts';
                  
                  return (
                    <div key={index} className="relative group">
                      <button
                        className={`w-full p-4 rounded-xl text-left transition-all duration-300 group-hover:scale-105 relative overflow-hidden ${styles.actionButton} ${
                          action.disabled 
                            ? 'bg-gray-100/50 cursor-not-allowed opacity-60' 
                            : action.urgent 
                              ? 'bg-red-50/60 border border-red-200/60 hover:bg-red-100/80 hover:shadow-xl' 
                              : 'bg-white/30 border border-white/40 hover:bg-white/40 hover:shadow-xl backdrop-blur-lg'
                        }`}
                        onClick={() => handleActionClick(action)}
                        disabled={action.disabled}
                      >
                        {/* Inner highlight */}
                        <div className="absolute inset-[1px] bg-gradient-to-br from-white/20 to-transparent rounded-xl"></div>
                        
                        <div className="relative">
                          <div className="flex items-center justify-between mb-3">
                            {/* Neumorphic icon container */}
                            <div className="w-10 h-10 bg-white/40 backdrop-blur-sm rounded-xl border border-white/50 shadow-inner flex items-center justify-center">
                              <Icon className={`w-5 h-5 ${action.color} drop-shadow-sm`} />
                            </div>
                            {action.urgent && (
                              <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
                                <span className="text-white text-xs font-bold">!</span>
                              </div>
                            )}
                          </div>
                          <div className="font-semibold text-sm text-gray-800 mb-1">{action.title}</div>
                          <div className="text-xs text-gray-600/90 leading-relaxed">{action.subtitle}</div>
                        </div>
                      </button>
                      
                      {/* Enhanced Gift description tooltip */}
                      {isGifts && action.description && (
                        <div className="absolute top-full left-0 right-0 mt-3 p-4 bg-white/95 backdrop-blur-xl rounded-xl border border-white/50 shadow-2xl text-xs text-gray-700 leading-relaxed z-20 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                          <div className="font-semibold mb-2 text-purple-700 flex items-center">
                            <Gift className="w-4 h-4 mr-2" />
                            Gift Information
                          </div>
                          <p className="text-gray-600">{action.description}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Wedding Timeline - Enhanced */}
          <div className={`bg-white/20 backdrop-blur-xl rounded-2xl border border-white/30 shadow-2xl overflow-hidden ${styles.liquidGlassCard}`}>
            <div className="p-5 bg-white/10 border-b border-white/20 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10"></div>
              <h3 className="relative text-lg font-semibold flex items-center bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center mr-3 shadow-lg">
                  <Clock className="w-4 h-4 text-white" />
                </div>
                Wedding Day Timeline
              </h3>
            </div>
            <div className="p-5 space-y-4">
              {weddingSchedule.map((event, index) => (
                <div key={index} className={`flex items-start space-x-5 p-4 rounded-xl bg-gradient-to-r from-purple-50/60 to-pink-50/60 backdrop-blur-sm border border-purple-200/50 shadow-lg hover:shadow-xl transition-all duration-300 group relative overflow-hidden ${styles.scheduleItem}`}>
                  {/* Connecting line for timeline effect */}
                  {index < weddingSchedule.length - 1 && (
                    <div className="absolute left-8 top-16 w-0.5 h-8 bg-gradient-to-b from-purple-300 to-pink-300 opacity-50"></div>
                  )}
                  
                  {/* Inner glow */}
                  <div className="absolute inset-[1px] bg-gradient-to-br from-white/20 to-transparent rounded-xl"></div>
                  
                  {/* Time badge */}
                  <div className="relative shrink-0">
                    <div className="bg-white/60 backdrop-blur-lg rounded-xl px-4 py-3 shadow-inner border border-white/50 relative overflow-hidden">
                      <div className="absolute inset-1 bg-gradient-to-br from-white/30 to-transparent rounded-lg"></div>
                      <div className="relative text-sm font-bold text-purple-700 text-center whitespace-nowrap">
                        {event.time}
                      </div>
                    </div>
                  </div>
                  
                  <div className="relative flex-1 min-w-0">
                    <div className="font-bold text-sm text-gray-800 mb-2">{event.title}</div>
                    <div className="text-xs text-gray-600/90 mb-2 flex items-center">
                      <div className="w-5 h-5 bg-white/40 rounded-full flex items-center justify-center mr-2 shadow-inner">
                        <MapPin className="w-3 h-3 text-purple-600" />
                      </div>
                      {event.location}
                    </div>
                    <div className="text-xs text-gray-600/80 leading-relaxed">{event.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RSVP Status Card - Final Enhanced */}
          <div className={`bg-white/20 backdrop-blur-xl rounded-2xl border shadow-2xl overflow-hidden relative ${styles.liquidGlassCard} ${
            needsRSVP ? 'border-orange-300/60 shadow-orange-500/25' : 'border-green-300/60 shadow-green-500/25'
          }`}>
            {/* Animated accent bar for urgent RSVP */}
            {needsRSVP && (
              <div className="h-1 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 animate-pulse"></div>
            )}
            
            <div className="p-5 bg-white/10 border-b border-white/20 relative">
              <div className={`absolute inset-0 ${needsRSVP ? 'bg-gradient-to-r from-orange-500/10 to-red-500/10' : 'bg-gradient-to-r from-green-500/10 to-emerald-500/10'}`}></div>
              <h3 className="relative text-lg font-semibold flex items-center bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                <div className={`w-8 h-8 rounded-full bg-gradient-to-br flex items-center justify-center mr-3 shadow-lg ${
                  needsRSVP ? 'from-orange-400 to-red-500' : 'from-green-400 to-emerald-500'
                }`}>
                  <User className="w-4 h-4 text-white" />
                </div>
                Your RSVP Status
              </h3>
            </div>
            
            <div className="p-5 space-y-5">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-gray-700">Status:</span>
                  <div className={`px-4 py-2 rounded-full text-xs font-bold backdrop-blur-sm border shadow-lg ${
                    needsRSVP 
                      ? "bg-orange-100/80 text-orange-700 border-orange-300/60" 
                      : hasRSVPd && rsvpData?.status === 'attending' 
                        ? "bg-green-100/80 text-green-700 border-green-300/60" 
                        : "bg-red-100/80 text-red-700 border-red-300/60"
                  }`}>
                    {needsRSVP ? 'Action Required' : hasRSVPd && rsvpData?.status === 'attending' ? 'Attending' : hasRSVPd ? 'Not Attending' : 'Pending'}
                  </div>
                </div>
                {user && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-gray-700">Party size:</span>
                    <div className="bg-white/40 backdrop-blur-sm px-3 py-2 rounded-full border border-white/50 shadow-lg">
                      <span className="text-sm text-gray-800 font-semibold">
                        {profile?.plus_one_name ? `2 guests (You + ${profile.plus_one_name})` : '1 guest (You)'}
                      </span>
                    </div>
                  </div>
                )}
                {!user && (
                  <div className="text-center p-4 bg-blue-100/60 backdrop-blur-sm rounded-xl border border-blue-300/60 shadow-lg">
                    <p className="text-sm text-blue-700 font-medium">Login to manage your RSVP</p>
                  </div>
                )}
              </div>
              
              <button
                className={`w-full py-4 px-6 rounded-xl font-semibold text-sm backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-2xl transform relative overflow-hidden ${
                  needsRSVP 
                    ? `bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-orange-500/50 ${styles.liquidGlassButton}` 
                    : `bg-white/40 hover:bg-white/50 border border-white/50 text-gray-800 shadow-lg ${styles.liquidGlassButton}`
                }`}
                onClick={() => {
                  if (onClose) onClose();
                  const event = new CustomEvent('openRSVP');
                  window.dispatchEvent(event);
                }}
              >
                {/* Button highlight effect */}
                <div className="absolute inset-[1px] bg-gradient-to-br from-white/20 to-transparent rounded-xl"></div>
                <span className="relative">
                  {needsRSVP ? 'Complete RSVP Now' : 'Update RSVP'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuestDashboardPopup;