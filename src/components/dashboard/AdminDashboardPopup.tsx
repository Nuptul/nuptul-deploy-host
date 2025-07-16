import React, { useState, useEffect } from 'react';
import { X, Users, Calendar, MessageSquare, Camera, CheckCircle, Clock, UserPlus, TrendingUp, Heart, Palette, Activity, Bus, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { getLiquidGlassStyle, stylePresets } from '@/utils/styleHelpers';
import styles from './dashboard.module.css';
// Temporarily disabled for emergency recovery
// import { AuthGuard } from '@/components/security/AuthGuard';

interface AdminDashboardPopupProps {
  onClose?: () => void;
}

interface AdminStats {
  totalGuests: number;
  confirmedRSVPs: number;
  pendingRSVPs: number;
  totalEvents: number;
  recentMessages: number;
  photoUploads: number;
}

const AdminDashboardPopup: React.FC<AdminDashboardPopupProps> = ({ onClose }) => {
  const { user, profile } = useAuth();
  
  const [stats, setStats] = useState<AdminStats>({
    totalGuests: 0,
    confirmedRSVPs: 0,
    pendingRSVPs: 0,
    totalEvents: 0,
    recentMessages: 0,
    photoUploads: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState<Array<{
    type: string;
    message: string;
    time: string;
    icon: any;
  }>>([]);

  useEffect(() => {
    loadAdminStats();
    loadRecentActivity();
  }, []);

  const loadAdminStats = async () => {
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
      // Get counts from both profiles and guest_list tables
      // Get total registered users
      const { count: registeredUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      
      // Get total guest list entries
      const { count: guestListTotal } = await supabase
        .from('guest_list')
        .select('*', { count: 'exact', head: true });
      
      // Get RSVP counts from profiles (registered users)
      const { data: profileRsvpData } = await supabase
        .from('profiles')
        .select('rsvp_status');
      
      // Get RSVP counts from guest_list
      const { data: guestListRsvpData } = await supabase
        .from('guest_list')
        .select('rsvp_status');
      
      // Combine RSVP counts
      const profileConfirmed = profileRsvpData?.filter(p => p.rsvp_status === 'attending').length || 0;
      const guestListConfirmed = guestListRsvpData?.filter(g => g.rsvp_status === 'attending').length || 0;
      const totalConfirmed = profileConfirmed + guestListConfirmed;
      
      const profilePending = profileRsvpData?.filter(p => p.rsvp_status === 'pending' || !p.rsvp_status).length || 0;
      const guestListPending = guestListRsvpData?.filter(g => g.rsvp_status === 'pending' || !g.rsvp_status).length || 0;
      const totalPending = profilePending + guestListPending;
      
      // Use the larger of the two totals for total guests
      const totalGuests = Math.max(registeredUsers || 0, guestListTotal || 0);
      
      // Get total events count
      const { count: totalEvents } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true });
      
      // Get recent messages count (last 24 hours)
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const { count: recentMessages } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', yesterday.toISOString());
      
      // Get photo uploads count
      const { count: photoUploads } = await supabase
        .from('photos')
        .select('*', { count: 'exact', head: true });
      
      setStats({
        totalGuests,
        confirmedRSVPs: totalConfirmed,
        pendingRSVPs: totalPending,
        totalEvents: totalEvents || 0,
        recentMessages: recentMessages || 0,
        photoUploads: photoUploads || 0
      });
    } catch (error) {
      console.error('Error loading admin stats:', error);
      // Set default values on error
      setStats({
        totalGuests: 0,
        confirmedRSVPs: 0,
        pendingRSVPs: 0,
        totalEvents: 0,
        recentMessages: 0,
        photoUploads: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const loadRecentActivity = async () => {
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      const activities = [];
      
      // Get recent RSVPs (last 7 days)
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      const { data: recentRSVPs } = await supabase
        .from('profiles')
        .select('full_name, updated_at, rsvp_status')
        .gte('updated_at', weekAgo.toISOString())
        .not('rsvp_status', 'is', null)
        .order('updated_at', { ascending: false })
        .limit(5);
      
      if (recentRSVPs) {
        recentRSVPs.forEach(rsvp => {
          const timeAgo = getTimeAgo(new Date(rsvp.updated_at));
          activities.push({
            type: 'rsvp',
            message: `${rsvp.full_name || 'Guest'} RSVP'd as ${rsvp.rsvp_status === 'attending' ? 'attending' : 'not attending'}`,
            time: timeAgo,
            icon: UserPlus
          });
        });
      }
      
      // Get recent messages
      const { data: recentMessages } = await supabase
        .from('messages')
        .select('content, created_at, sender_id')
        .gte('created_at', weekAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(3);
      
      if (recentMessages && recentMessages.length > 0) {
        activities.push({
          type: 'message',
          message: `${recentMessages.length} new messages in guest chat`,
          time: getTimeAgo(new Date(recentMessages[0].created_at)),
          icon: MessageSquare
        });
      }
      
      // Get recent photo uploads
      const { data: recentPhotos } = await supabase
        .from('photos')
        .select('created_at')
        .gte('created_at', weekAgo.toISOString())
        .order('created_at', { ascending: false });
      
      if (recentPhotos && recentPhotos.length > 0) {
        activities.push({
          type: 'photo',
          message: `${recentPhotos.length} new photos uploaded`,
          time: getTimeAgo(new Date(recentPhotos[0].created_at)),
          icon: Camera
        });
      }
      
      // Get recent event updates
      const { data: recentEvents } = await supabase
        .from('events')
        .select('title, updated_at')
        .gte('updated_at', weekAgo.toISOString())
        .order('updated_at', { ascending: false })
        .limit(3);
      
      if (recentEvents) {
        recentEvents.forEach(event => {
          activities.push({
            type: 'event',
            message: `Timeline updated for ${event.title}`,
            time: getTimeAgo(new Date(event.updated_at)),
            icon: Calendar
          });
        });
      }
      
      // Sort activities by most recent and take top 4
      setRecentActivity(activities.slice(0, 4));
    } catch (error) {
      console.error('Error loading recent activity:', error);
    }
  };
  
  const getTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  const quickStats = [
    {
      label: 'Total Guests',
      value: stats.totalGuests,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      label: 'Confirmed',
      value: stats.confirmedRSVPs,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      label: 'Pending',
      value: stats.pendingRSVPs,
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      label: 'Events',
      value: stats.totalEvents,
      icon: Calendar,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ];

  const quickActions = [
    { 
      icon: Heart, 
      title: 'User & Guest Management', 
      subtitle: 'Manage users, roles, and guest list',
      href: '/dashboard/users',
      color: 'text-wedding-gold',
      primary: true
    },
    { 
      icon: Users, 
      title: 'Manage RSVPs', 
      subtitle: 'View and manage guest responses',
      href: '/dashboard/rsvps',
      color: 'text-blue-600'
    },
    { 
      icon: Calendar, 
      title: 'Event Timeline', 
      subtitle: 'Update wedding schedule',
      href: '/dashboard/events',
      color: 'text-purple-600'
    },
    { 
      icon: MessageSquare, 
      title: 'Communication', 
      subtitle: 'Mass notifications & messaging',
      href: '/dashboard/messages',
      color: 'text-green-600'
    },
    { 
      icon: Camera, 
      title: 'Photo Gallery', 
      subtitle: 'Manage uploaded photos',
      href: '/dashboard/photos',
      color: 'text-pink-600'
    },
    { 
      icon: Palette, 
      title: 'Content Management', 
      subtitle: 'Edit site content and themes',
      href: '/dashboard/content',
      color: 'text-rose-600'
    },
    { 
      icon: Bus, 
      title: 'Bus Booking', 
      subtitle: 'Manage shuttle services',
      href: '/dashboard/bus-booking',
      color: 'text-indigo-600'
    },
    { 
      icon: Settings, 
      title: 'System Management', 
      subtitle: 'Admin actions & maintenance',
      href: '/dashboard/system',
      color: 'text-gray-600'
    }
  ];


  if (loading) {
    return (
      <div className={`p-6 m-4 max-w-md mx-auto rounded-3xl ${styles.liquidGlassCard}`}>
        <div className="flex items-center justify-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2" style={{ borderColor: 'rgba(255, 182, 193, 0.8)' }}></div>
          <span style={{ fontFamily: '"Montserrat", sans-serif', color: '#000000' }}>Loading admin dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    // Temporarily disabled AuthGuard for emergency recovery
    <React.Fragment>
      <div className="w-full h-full flex flex-col max-h-[90vh] overflow-hidden">
        <div className={`w-full h-full max-h-[90vh] overflow-hidden rounded-3xl ${styles.liquidGlassContainer}`} style={{
          background: 'linear-gradient(135deg, rgba(173, 216, 230, 0.35) 0%, rgba(221, 160, 221, 0.3) 25%, rgba(255, 182, 193, 0.25) 50%, rgba(255, 218, 185, 0.3) 75%, rgba(176, 224, 230, 0.35) 100%)',
          backdropFilter: 'blur(35px) saturate(1.8)',
          WebkitBackdropFilter: 'blur(35px) saturate(1.8)',
          border: '1px solid rgba(255, 255, 255, 0.6)',
          boxShadow: '0 20px 50px rgba(31, 38, 135, 0.15), inset 0 1px 1px rgba(255, 255, 255, 0.8)',
          borderRadius: '24px',
        }}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-4" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.3)' }}>
          <div className="flex items-center space-x-3">
            <div>
              <h2 style={{
                fontSize: '24px',
                fontFamily: '"Bodoni Moda", serif',
                fontWeight: '600',
                color: '#000000'
              }}>Admin Dashboard</h2>
              <p style={{
                fontSize: '14px',
                fontFamily: '"Montserrat", sans-serif',
                color: 'rgba(0, 0, 0, 0.6)'
              }}>
                Welcome back, {profile?.first_name || 'Admin'}
              </p>
            </div>
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
          
          {/* Quick Stats */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 style={{
                fontFamily: '"Bodoni Moda", serif',
                fontSize: '18px',
                fontWeight: '600',
                color: '#000000',
                display: 'flex',
                alignItems: 'center'
              }}>
                <TrendingUp className="w-4 h-4 mr-2" />
                Live Statistics
              </h3>
              <button
                onClick={() => {
                  loadAdminStats();
                  loadRecentActivity();
                }}
                className={`rounded-lg transition-all duration-200 hover:scale-105 flex items-center gap-1 ${styles.actionButton}`}
                style={{
                  minWidth: '80px',
                  minHeight: '32px',
                  padding: '0 12px',
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0.25) 100%)',
                  backdropFilter: 'blur(20px) saturate(1.8)',
                  WebkitBackdropFilter: 'blur(20px) saturate(1.8)',
                  border: '1px solid rgba(255, 255, 255, 0.4)',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08), inset 0 1px 1px rgba(255, 255, 255, 0.7)',
                  fontFamily: '"Montserrat", sans-serif',
                  fontSize: '12px',
                  fontWeight: '500',
                  color: '#000000'
                }}
              >
                <Clock className="w-3 h-3" />
                Refresh
              </button>
            </div>
              <div className="grid grid-cols-2 gap-3">
                {quickStats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <div 
                      key={index} 
                      className={`rounded-xl p-3 text-center ${styles.liquidGlassCard}`}
                      style={{
                        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.3) 100%)',
                        backdropFilter: 'blur(20px) saturate(1.6)',
                        WebkitBackdropFilter: 'blur(20px) saturate(1.6)',
                        border: '1px solid rgba(255, 255, 255, 0.5)',
                        boxShadow: '0 4px 16px rgba(31, 38, 135, 0.08), inset 0 1px 1px rgba(255, 255, 255, 0.8)'
                      }}
                    >
                      <Icon className={`w-6 h-6 ${stat.color} mx-auto mb-1`} />
                      <div 
                        className={`text-lg font-bold ${stat.color}`}
                        style={{
                          fontFamily: '"Bodoni Moda", serif',
                          fontSize: '20px',
                          fontWeight: '600'
                        }}
                      >
                        {stat.value}
                      </div>
                      <div 
                        className="text-xs"
                        style={{
                          fontFamily: '"Montserrat", sans-serif',
                          fontSize: '12px',
                          fontWeight: '500',
                          color: 'rgba(0, 0, 0, 0.6)'
                        }}
                      >
                        {stat.label}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Actions */}
            <div>
              <h3 style={{
                fontFamily: '"Bodoni Moda", serif',
                fontSize: '18px',
                fontWeight: '600',
                color: '#000000',
                marginBottom: '12px'
              }}>
                Quick Actions
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {quickActions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={index}
                      className={`rounded-xl p-3 text-left hover:scale-105 transition-all duration-200 ${styles.liquidGlassButton}`}
                      style={{
                        background: action.primary 
                          ? 'linear-gradient(135deg, rgba(255, 215, 0, 0.2) 0%, rgba(255, 193, 7, 0.15) 100%)'
                          : 'linear-gradient(135deg, rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0.25) 100%)',
                        backdropFilter: 'blur(20px) saturate(1.8)',
                        WebkitBackdropFilter: 'blur(20px) saturate(1.8)',
                        border: action.primary 
                          ? '1px solid rgba(255, 215, 0, 0.3)'
                          : '1px solid rgba(255, 255, 255, 0.4)',
                        boxShadow: action.primary 
                          ? '0 4px 16px rgba(255, 215, 0, 0.15), inset 0 1px 1px rgba(255, 255, 255, 0.7)'
                          : '0 4px 16px rgba(31, 38, 135, 0.08), inset 0 1px 1px rgba(255, 255, 255, 0.7)'
                      }}
                      onClick={() => {
                        // Handle action
                        if (action.action) {
                          action.action();
                        } else if (action.href) {
                          // Handle navigation to href
                          window.location.href = action.href;
                          if (onClose) onClose();
                        }
                      }}
                    >
                      <Icon className={`w-5 h-5 ${action.color} mb-2`} />
                      <div 
                        className={`font-medium text-sm`}
                        style={{
                          fontFamily: '"Montserrat", sans-serif',
                          fontSize: '14px',
                          fontWeight: '600',
                          color: action.primary ? '#ffd700' : '#000000'
                        }}
                      >
                        {action.title}
                        {action.primary && (
                          <span 
                            className="ml-2 px-2 py-1 rounded-full text-xs"
                            style={{
                              background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.3) 0%, rgba(255, 193, 7, 0.2) 100%)',
                              color: '#ffd700',
                              fontWeight: '600'
                            }}
                          >
                            CENTRAL
                          </span>
                        )}
                      </div>
                      <div 
                        className="text-xs"
                        style={{
                          fontFamily: '"Montserrat", sans-serif',
                          fontSize: '12px',
                          color: 'rgba(0, 0, 0, 0.6)'
                        }}
                      >
                        {action.subtitle}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Recent Activity */}
            <div>
              <h3 style={{
                fontFamily: '"Bodoni Moda", serif',
                fontSize: '18px',
                fontWeight: '600',
                color: '#000000',
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center'
              }}>
                <Activity className="w-4 h-4 mr-2" />
                Recent Activity
              </h3>
              <div className="space-y-2">
                {recentActivity.length > 0 ? (
                  recentActivity.map((activity, index) => {
                    const Icon = activity.icon;
                    return (
                      <div 
                        key={index} 
                        className={`rounded-xl p-3 flex items-start space-x-3 ${styles.liquidGlassCard}`}
                        style={{
                          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.2) 100%)',
                          backdropFilter: 'blur(20px) saturate(1.6)',
                          WebkitBackdropFilter: 'blur(20px) saturate(1.6)',
                          border: '1px solid rgba(255, 255, 255, 0.4)',
                          boxShadow: '0 2px 8px rgba(31, 38, 135, 0.06), inset 0 1px 1px rgba(255, 255, 255, 0.7)'
                        }}
                      >
                        <Icon className="w-4 h-4 text-wedding-navy mt-1" />
                        <div className="flex-1">
                          <div 
                            className="text-sm"
                            style={{
                              fontFamily: '"Montserrat", sans-serif',
                              fontSize: '14px',
                              fontWeight: '500',
                              color: '#000000'
                            }}
                          >
                            {activity.message}
                          </div>
                          <div 
                            className="text-xs"
                            style={{
                              fontFamily: '"Montserrat", sans-serif',
                              fontSize: '12px',
                              color: 'rgba(0, 0, 0, 0.6)'
                            }}
                          >
                            {activity.time}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div 
                    className={`rounded-xl p-3 text-center ${styles.liquidGlassCard}`}
                    style={{
                      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.2) 100%)',
                      backdropFilter: 'blur(20px) saturate(1.6)',
                      WebkitBackdropFilter: 'blur(20px) saturate(1.6)',
                      border: '1px solid rgba(255, 255, 255, 0.4)',
                      boxShadow: '0 2px 8px rgba(31, 38, 135, 0.06), inset 0 1px 1px rgba(255, 255, 255, 0.7)',
                      fontFamily: '"Montserrat", sans-serif',
                      fontSize: '14px',
                      color: 'rgba(0, 0, 0, 0.6)'
                    }}
                  >
                    No recent activity in the last 7 days
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export default AdminDashboardPopup;