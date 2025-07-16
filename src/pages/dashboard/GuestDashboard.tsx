import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Heart, 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock,
  Utensils,
  Calendar,
  MessageSquare,
  Camera,
  Settings,
  Edit,
  Plus,
  MapPin,
  Phone,
  Mail,
  Star,
  Gift
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RSVPButtons } from '@/components/ui/RSVPButtons';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import RSVPIntegration from '@/components/guest/RSVPIntegration';
import { mapDatabaseToUI, getStatusDisplayText, getStatusColorClasses } from '@/utils/rsvpStatusMapping';

interface GuestStats {
  totalAccounts: number;
  confirmedRSVPs: number;
  declinedRSVPs: number;
  pendingRSVPs: number;
  dietaryRequests: number;
  responseRate: number;
}

interface GuestProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  rsvp_status: string | null;
  rsvp_responded_at: string | null;
  dietary_needs: string[];
  allergies: string[];
  plus_one_name: string | null;
  special_requests: string | null;
  phone: string | null;
}

const GuestDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState<GuestStats>({
    totalAccounts: 0,
    confirmedRSVPs: 0,
    declinedRSVPs: 0,
    pendingRSVPs: 0,
    dietaryRequests: 0,
    responseRate: 0
  });
  const [guestProfile, setGuestProfile] = useState<GuestProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRSVPEditor, setShowRSVPEditor] = useState(false);
  const [showQuickRSVP, setShowQuickRSVP] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load overall stats
      const { data: allProfiles } = await supabase
        .from('profiles')
        .select('rsvp_status, dietary_needs, allergies');

      if (allProfiles) {
        const stats: GuestStats = {
          totalAccounts: allProfiles.length,
          confirmedRSVPs: allProfiles.filter(p => 
            p.rsvp_status === 'confirmed' || p.rsvp_status === 'attending'
          ).length,
          declinedRSVPs: allProfiles.filter(p => 
            p.rsvp_status === 'declined' || p.rsvp_status === 'not_attending'
          ).length,
          pendingRSVPs: allProfiles.filter(p => 
            !p.rsvp_status || p.rsvp_status === 'pending'
          ).length,
          dietaryRequests: allProfiles.filter(p => 
            (p.dietary_needs && p.dietary_needs.length > 0) || 
            (p.allergies && p.allergies.length > 0)
          ).length,
          responseRate: Math.round(
            (allProfiles.filter(p => 
              p.rsvp_status && p.rsvp_status !== 'pending'
            ).length / allProfiles.length) * 100
          )
        };
        setStats(stats);
      }

      // Load current user's guest profile
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (profile) {
          setGuestProfile(profile);
        }
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickRSVP = async (status: 'attending' | 'not_attending') => {
    if (!guestProfile) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          rsvp_status: status,
          rsvp_responded_at: new Date().toISOString()
        })
        .eq('id', guestProfile.id);

      if (error) throw error;

      toast.success(
        status === 'attending' 
          ? 'RSVP confirmed! We\'re excited to celebrate with you!' 
          : 'Thank you for your response.'
      );

      setShowQuickRSVP(false);
      loadDashboardData();
    } catch (error) {
      console.error('Error updating RSVP:', error);
      toast.error('Failed to update RSVP');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen px-5 pt-12 pb-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-wedding-navy mx-auto"></div>
          <p className="text-[#7a736b] mt-4">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const overviewCards = [
    {
      title: 'Total Guests',
      value: stats.totalAccounts,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      trend: '+2 this week'
    },
    {
      title: 'RSVP Yes',
      value: stats.confirmedRSVPs,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      trend: `${Math.round((stats.confirmedRSVPs / stats.totalAccounts) * 100)}% confirmed`
    },
    {
      title: 'RSVP No',
      value: stats.declinedRSVPs,
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      trend: `${Math.round((stats.declinedRSVPs / stats.totalAccounts) * 100)}% declined`
    },
    {
      title: 'Dietary Needs',
      value: stats.dietaryRequests,
      icon: Utensils,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      trend: `${Math.round((stats.dietaryRequests / stats.totalAccounts) * 100)}% have needs`
    }
  ];

  const quickLinks = [
    {
      title: 'Event Timeline',
      description: 'View wedding schedule and venues',
      icon: Calendar,
      color: 'text-purple-600',
      onClick: () => navigate('/')
    },
    {
      title: 'Photo Gallery',
      description: 'View and share wedding photos',
      icon: Camera,
      color: 'text-pink-600',
      onClick: () => navigate('/gallery')
    },
    {
      title: 'Guest Chat',
      description: 'Connect with other guests',
      icon: MessageSquare,
      color: 'text-green-600',
      onClick: () => navigate('/social')
    },
    {
      title: 'Accommodation',
      description: 'Find nearby hotels',
      icon: MapPin,
      color: 'text-blue-600',
      onClick: () => navigate('/accommodation')
    }
  ];

  return (
    <div className="min-h-screen px-5 pt-12 pb-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/')}
          className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-[#7a736b]" />
        </button>
        <div>
          <h1 className="text-2xl font-semibold text-[#2d3f51] flex items-center gap-2">
            <Heart className="w-6 h-6 text-wedding-gold" />
            Guest Dashboard
          </h1>
          <p className="text-sm text-[#7a736b]">
            {guestProfile?.first_name 
              ? `Welcome, ${guestProfile.first_name}!` 
              : 'Welcome to your wedding dashboard'
            }
          </p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {overviewCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <GlassCard className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-10 h-10 rounded-xl ${card.bgColor} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${card.color}`} />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-[#2d3f51]">{card.value}</div>
                    <div className="text-xs text-[#7a736b]">{card.title}</div>
                  </div>
                </div>
                <div className="text-xs text-[#7a736b]">{card.trend}</div>
              </GlassCard>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Your RSVP Status */}
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-[#2d3f51] flex items-center gap-2">
              <Heart className="w-5 h-5 text-wedding-gold" />
              Your RSVP
            </h3>
            {guestProfile?.rsvp_responded_at && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowRSVPEditor(true)}
                className="text-wedding-navy border-wedding-navy"
              >
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </Button>
            )}
          </div>

          {!guestProfile?.rsvp_responded_at ? (
            <div className="space-y-4">
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-5 h-5 text-yellow-600" />
                  <span className="font-medium text-yellow-800">Response Needed</span>
                </div>
                <p className="text-sm text-yellow-700 mb-3">
                  Please let us know if you'll be attending our special day!
                </p>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setShowQuickRSVP(true)}
                    className="bg-green-600 hover:bg-green-700 text-white"
                    size="sm"
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Quick RSVP
                  </Button>
                  <Button
                    onClick={() => navigate('/rsvp')}
                    variant="outline"
                    size="sm"
                    className="border-wedding-navy text-wedding-navy"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Full RSVP Form
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className={`p-4 rounded-lg ${getStatusColorClasses(guestProfile.rsvp_status).bg} border ${getStatusColorClasses(guestProfile.rsvp_status).border}`}>
                <div className="flex items-center gap-2 mb-2">
                  {(guestProfile.rsvp_status === 'confirmed' || guestProfile.rsvp_status === 'attending') ? (
                    <CheckCircle className={`w-5 h-5 ${getStatusColorClasses(guestProfile.rsvp_status).icon}`} />
                  ) : (
                    <XCircle className={`w-5 h-5 ${getStatusColorClasses(guestProfile.rsvp_status).icon}`} />
                  )}
                  <span className={`font-medium ${getStatusColorClasses(guestProfile.rsvp_status).text}`}>
                    {getStatusDisplayText(guestProfile.rsvp_status)}
                  </span>
                </div>
                <p className={`text-sm ${getStatusColorClasses(guestProfile.rsvp_status).text}`}>
                  Responded on {new Date(guestProfile.rsvp_responded_at).toLocaleDateString()}
                </p>
                
                {guestProfile.plus_one_name && (
                  <p className="text-sm text-gray-600 mt-2">
                    Plus one: {guestProfile.plus_one_name}
                  </p>
                )}
                
                {(guestProfile.dietary_needs?.length > 0 || guestProfile.allergies?.length > 0) && (
                  <div className="mt-3">
                    <p className="text-sm font-medium mb-1">Dietary requirements:</p>
                    <div className="flex flex-wrap gap-1">
                      {guestProfile.dietary_needs?.map((need, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {need}
                        </Badge>
                      ))}
                      {guestProfile.allergies?.map((allergy, index) => (
                        <Badge key={index} variant="outline" className="text-xs bg-red-50 text-red-700">
                          {allergy} allergy
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </GlassCard>

        {/* Contact Information */}
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-[#2d3f51] mb-4 flex items-center gap-2">
            <Phone className="w-5 h-5" />
            Contact Info
          </h3>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-[#7a736b]" />
              <span className="text-sm">{guestProfile?.email || 'No email on file'}</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-[#7a736b]" />
              <span className="text-sm">{guestProfile?.phone || 'No phone on file'}</span>
            </div>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowRSVPEditor(true)}
            className="mt-4 text-wedding-navy border-wedding-navy"
          >
            <Edit className="w-4 h-4 mr-1" />
            Update Information
          </Button>
        </GlassCard>
      </div>

      {/* Quick Links */}
      <GlassCard className="p-6 mb-6">
        <h3 className="text-lg font-semibold text-[#2d3f51] mb-4 flex items-center gap-2">
          <Star className="w-5 h-5 text-wedding-gold" />
          Quick Links
        </h3>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {quickLinks.map((link, index) => {
            const Icon = link.icon;
            return (
              <button
                key={index}
                onClick={link.onClick}
                className="p-4 bg-white/20 rounded-lg hover:bg-white/30 transition-colors text-left"
              >
                <Icon className={`w-6 h-6 ${link.color} mb-2`} />
                <div className="text-sm font-medium text-[#2d3f51] mb-1">{link.title}</div>
                <div className="text-xs text-[#7a736b]">{link.description}</div>
              </button>
            );
          })}
        </div>
      </GlassCard>

      {/* Response Rate Progress */}
      <GlassCard className="p-6">
        <h3 className="text-lg font-semibold text-[#2d3f51] mb-4">
          Overall Response Rate
        </h3>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-[#7a736b]">Guests Responded</span>
            <span className="text-sm font-medium text-[#2d3f51]">
              {stats.confirmedRSVPs + stats.declinedRSVPs} of {stats.totalAccounts} ({stats.responseRate}%)
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-green-500 to-wedding-gold h-3 rounded-full transition-all duration-500"
              style={{ width: `${stats.responseRate}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-[#7a736b]">
            <span>{stats.confirmedRSVPs} Yes</span>
            <span>{stats.pendingRSVPs} Pending</span>
            <span>{stats.declinedRSVPs} No</span>
          </div>
        </div>
      </GlassCard>

      {/* Quick RSVP Modal */}
      <AnimatePresence>
        {showQuickRSVP && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowQuickRSVP(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 max-w-md w-full"
            >
              <h3 className="text-xl font-semibold text-[#2d3f51] mb-4 text-center">
                Quick RSVP Response
              </h3>
              <p className="text-[#7a736b] text-center mb-6">
                Will you be attending our wedding?
              </p>
              
              <RSVPButtons
                value={guestProfile?.rsvp_status === 'attending' ? 'attending' : 
                        guestProfile?.rsvp_status === 'not_attending' ? 'not_attending' : 'pending'}
                onChange={(value) => handleQuickRSVP(value)}
                size="large"
                className="mb-4"
              />
              
              <div className="text-center space-y-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowQuickRSVP(false);
                    navigate('/rsvp');
                  }}
                  className="w-full border-wedding-navy text-wedding-navy"
                >
                  Need to add dietary info? Use full form
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setShowQuickRSVP(false)}
                  className="w-full"
                >
                  Cancel
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* RSVP Editor Modal */}
      <AnimatePresence>
        {showRSVPEditor && guestProfile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowRSVPEditor(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl max-w-4xl max-h-[90vh] overflow-y-auto w-full"
            >
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-[#2d3f51]">
                    Edit Your RSVP
                  </h3>
                  <Button
                    variant="ghost"
                    onClick={() => setShowRSVPEditor(false)}
                  >
                    ✕
                  </Button>
                </div>
              </div>
              <div className="p-6">
                <RSVPIntegration
                  guestId={guestProfile.id}
                  onRSVPSubmitted={() => {
                    setShowRSVPEditor(false);
                    loadDashboardData();
                  }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GuestDashboard;