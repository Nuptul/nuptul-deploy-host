import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Users, 
  Calendar, 
  MessageSquare, 
  Camera,
  CheckCircle,
  Clock,
  XCircle,
  Download,
  RefreshCw,
  Eye,
  Heart,
  MapPin,
  Utensils,
  AlertTriangle
} from 'lucide-react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { GuestManager } from '@/utils/guestManagement';

interface AnalyticsData {
  guestStats: {
    total: number;
    confirmed: number;
    pending: number;
    declined: number;
    withDietaryNeeds: number;
    withPlusOnes: number;
    responseRate: number;
    linkedAccounts: number;
  };
  eventStats: {
    totalEvents: number;
    publicEvents: number;
    thisWeek: number;
    uniqueVenues: number;
  };
  communicationStats: {
    totalMessages: number;
    sentToday: number;
    unread: number;
    failedMessages: number;
  };
  photoStats: {
    totalPhotos: number;
    pending: number;
    approved: number;
    rejected: number;
  };
  dailyActivity: {
    date: string;
    rsvps: number;
    messages: number;
    photos: number;
  }[];
  topLocations: {
    location: string;
    count: number;
  }[];
  dietaryRequirements: {
    requirement: string;
    count: number;
  }[];
}

const AdminAnalytics: React.FC = () => {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      // Get guest statistics
      const guestStats = await GuestManager.getGuestStats();

      // Get event statistics
      const { data: events } = await supabase
        .from('wedding_events')
        .select('*');

      const eventStats = {
        totalEvents: events?.length || 0,
        publicEvents: events?.filter(e => e.is_public).length || 0,
        thisWeek: events?.filter(e => {
          const eventDate = new Date(e.date);
          const today = new Date();
          const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
          return eventDate >= today && eventDate <= weekFromNow;
        }).length || 0,
        uniqueVenues: new Set(events?.map(e => e.location).filter(Boolean)).size
      };

      // Get communication statistics
      const { data: communications } = await supabase
        .from('guest_communications')
        .select('*');

      const communicationStats = {
        totalMessages: communications?.length || 0,
        sentToday: communications?.filter(c => 
          new Date(c.created_at).toDateString() === new Date().toDateString() && 
          c.direction === 'outbound'
        ).length || 0,
        unread: communications?.filter(c => 
          c.direction === 'inbound' && c.status !== 'read'
        ).length || 0,
        failedMessages: communications?.filter(c => 
          c.status === 'failed' || c.status === 'bounced'
        ).length || 0
      };

      // Get photo statistics
      const { data: photos } = await supabase
        .from('gallery_photos')
        .select('*');

      const photoStats = {
        totalPhotos: photos?.length || 0,
        pending: photos?.filter(p => p.is_published === null).length || 0,
        approved: photos?.filter(p => p.is_published === true).length || 0,
        rejected: photos?.filter(p => p.is_published === false).length || 0
      };

      // Calculate daily activity for the last 30 days
      const dailyActivity = [];
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);

      for (let i = 0; i < 30; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);
        const dateString = currentDate.toISOString().split('T')[0];

        const dayRsvps = communications?.filter(c => 
          c.created_at.startsWith(dateString) && 
          c.content.toLowerCase().includes('rsvp')
        ).length || 0;

        const dayMessages = communications?.filter(c => 
          c.created_at.startsWith(dateString)
        ).length || 0;

        const dayPhotos = photos?.filter(p => 
          p.created_at.startsWith(dateString)
        ).length || 0;

        dailyActivity.push({
          date: dateString,
          rsvps: dayRsvps,
          messages: dayMessages,
          photos: dayPhotos
        });
      }

      // Get top locations from events
      const locationCounts = {};
      events?.forEach(event => {
        if (event.location) {
          locationCounts[event.location] = (locationCounts[event.location] || 0) + 1;
        }
      });
      const topLocations = Object.entries(locationCounts)
        .map(([location, count]) => ({ location, count: count as number }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Get dietary requirements from guests
      const { data: guests } = await supabase
        .from('profiles')
        .select('dietary_needs, allergies');

      const dietaryMap = {};
      guests?.forEach(guest => {
        guest.dietary_needs?.forEach(need => {
          dietaryMap[need] = (dietaryMap[need] || 0) + 1;
        });
        guest.allergies?.forEach(allergy => {
          dietaryMap[`Allergy: ${allergy}`] = (dietaryMap[`Allergy: ${allergy}`] || 0) + 1;
        });
      });
      const dietaryRequirements = Object.entries(dietaryMap)
        .map(([requirement, count]) => ({ requirement, count: count as number }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      setAnalytics({
        guestStats,
        eventStats,
        communicationStats,
        photoStats,
        dailyActivity,
        topLocations,
        dietaryRequirements
      });

    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const exportAnalytics = () => {
    if (!analytics) return;

    try {
      const data = {
        generatedAt: new Date().toISOString(),
        timeRange,
        summary: {
          totalGuests: analytics.guestStats.total,
          confirmedRsvps: analytics.guestStats.confirmed,
          responseRate: `${analytics.guestStats.responseRate}%`,
          totalEvents: analytics.eventStats.totalEvents,
          totalMessages: analytics.communicationStats.totalMessages,
          totalPhotos: analytics.photoStats.totalPhotos
        },
        guestAnalytics: analytics.guestStats,
        eventAnalytics: analytics.eventStats,
        communicationAnalytics: analytics.communicationStats,
        photoAnalytics: analytics.photoStats,
        topLocations: analytics.topLocations,
        dietaryRequirements: analytics.dietaryRequirements
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `wedding-analytics-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success('Analytics exported successfully');
    } catch (error) {
      console.error('Error exporting analytics:', error);
      toast.error('Failed to export analytics');
    }
  };

  if (loading || !analytics) {
    return (
      <div className="min-h-screen px-5 pt-12 pb-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-wedding-navy mx-auto"></div>
          <p className="text-[#7a736b] mt-4">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const overviewCards = [
    {
      title: 'Total Guests',
      value: analytics.guestStats.total,
      change: '+12%',
      trend: 'up',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'RSVP Response Rate',
      value: `${analytics.guestStats.responseRate}%`,
      change: '+5%',
      trend: 'up',
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Messages Sent',
      value: analytics.communicationStats.totalMessages,
      change: '+23%',
      trend: 'up',
      icon: MessageSquare,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Photos Uploaded',
      value: analytics.photoStats.totalPhotos,
      change: '+8%',
      trend: 'up',
      icon: Camera,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ];

  const rsvpBreakdown = [
    {
      label: 'Confirmed',
      value: analytics.guestStats.confirmed,
      percentage: Math.round((analytics.guestStats.confirmed / analytics.guestStats.total) * 100),
      color: 'bg-green-500'
    },
    {
      label: 'Pending',
      value: analytics.guestStats.pending,
      percentage: Math.round((analytics.guestStats.pending / analytics.guestStats.total) * 100),
      color: 'bg-yellow-500'
    },
    {
      label: 'Declined',
      value: analytics.guestStats.declined,
      percentage: Math.round((analytics.guestStats.declined / analytics.guestStats.total) * 100),
      color: 'bg-red-500'
    }
  ];

  return (
    <div className="min-h-screen px-5 pt-12 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-[#7a736b]" />
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-[#2d3f51]">Wedding Analytics</h1>
            <p className="text-sm text-[#7a736b]">Insights and statistics for your wedding planning</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={() => fetchAnalytics()}
            variant="outline"
            size="sm"
            className="border-wedding-navy text-wedding-navy hover:bg-wedding-navy hover:text-white"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button
            onClick={exportAnalytics}
            variant="outline"
            className="border-wedding-navy text-wedding-navy hover:bg-wedding-navy hover:text-white"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {overviewCards.map((card, index) => {
          const Icon = card.icon;
          const TrendIcon = card.trend === 'up' ? TrendingUp : TrendingDown;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <GlassCard className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-10 h-10 rounded-xl ${card.bgColor} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${card.color}`} />
                  </div>
                  <div className={`flex items-center gap-1 text-xs ${
                    card.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    <TrendIcon className="w-3 h-3" />
                    {card.change}
                  </div>
                </div>
                <div className="text-2xl font-bold text-[#2d3f51] mb-1">{card.value}</div>
                <div className="text-sm text-[#7a736b]">{card.title}</div>
              </GlassCard>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* RSVP Breakdown */}
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-[#2d3f51] mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            RSVP Breakdown
          </h3>
          <div className="space-y-4">
            {rsvpBreakdown.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[#7a736b]">{item.label}</span>
                  <span className="text-sm font-medium text-[#2d3f51]">
                    {item.value} ({item.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${item.color}`}
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Communication Stats */}
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-[#2d3f51] mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Communication Overview
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-blue-600" />
                <span className="text-sm">Total Messages</span>
              </div>
              <span className="font-semibold text-blue-600">{analytics.communicationStats.totalMessages}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm">Sent Today</span>
              </div>
              <span className="font-semibold text-green-600">{analytics.communicationStats.sentToday}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-orange-600" />
                <span className="text-sm">Unread</span>
              </div>
              <span className="font-semibold text-orange-600">{analytics.communicationStats.unread}</span>
            </div>
            {analytics.communicationStats.failedMessages > 0 && (
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <span className="text-sm">Failed/Bounced</span>
                </div>
                <span className="font-semibold text-red-600">{analytics.communicationStats.failedMessages}</span>
              </div>
            )}
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Top Locations */}
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-[#2d3f51] mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Popular Venues
          </h3>
          {analytics.topLocations.length === 0 ? (
            <p className="text-sm text-[#7a736b]">No venue data available</p>
          ) : (
            <div className="space-y-3">
              {analytics.topLocations.map((location, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-wedding-navy rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {index + 1}
                    </div>
                    <span className="text-sm">{location.location}</span>
                  </div>
                  <Badge variant="outline">{location.count} events</Badge>
                </div>
              ))}
            </div>
          )}
        </GlassCard>

        {/* Dietary Requirements */}
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-[#2d3f51] mb-4 flex items-center gap-2">
            <Utensils className="w-5 h-5" />
            Dietary Requirements
          </h3>
          {analytics.dietaryRequirements.length === 0 ? (
            <p className="text-sm text-[#7a736b]">No dietary requirements reported</p>
          ) : (
            <div className="space-y-2">
              {analytics.dietaryRequirements.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-[#7a736b]">{item.requirement}</span>
                  <Badge variant="outline" className="text-xs">{item.count}</Badge>
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-[#2d3f51] mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Event Statistics
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-[#7a736b]">Total Events</span>
              <span className="font-semibold">{analytics.eventStats.totalEvents}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-[#7a736b]">Public Events</span>
              <span className="font-semibold">{analytics.eventStats.publicEvents}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-[#7a736b]">This Week</span>
              <span className="font-semibold">{analytics.eventStats.thisWeek}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-[#7a736b]">Unique Venues</span>
              <span className="font-semibold">{analytics.eventStats.uniqueVenues}</span>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-[#2d3f51] mb-4 flex items-center gap-2">
            <Camera className="w-5 h-5" />
            Photo Statistics
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-[#7a736b]">Total Photos</span>
              <span className="font-semibold">{analytics.photoStats.totalPhotos}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-[#7a736b]">Pending Review</span>
              <span className="font-semibold text-yellow-600">{analytics.photoStats.pending}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-[#7a736b]">Approved</span>
              <span className="font-semibold text-green-600">{analytics.photoStats.approved}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-[#7a736b]">Rejected</span>
              <span className="font-semibold text-red-600">{analytics.photoStats.rejected}</span>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-[#2d3f51] mb-4 flex items-center gap-2">
            <Heart className="w-5 h-5" />
            Guest Insights
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-[#7a736b]">Linked Accounts</span>
              <span className="font-semibold">{analytics.guestStats.linkedAccounts}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-[#7a736b]">With Plus Ones</span>
              <span className="font-semibold">{analytics.guestStats.withPlusOnes}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-[#7a736b]">Dietary Needs</span>
              <span className="font-semibold">{analytics.guestStats.withDietaryNeeds}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-[#7a736b]">Response Rate</span>
              <span className="font-semibold text-green-600">{analytics.guestStats.responseRate}%</span>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default AdminAnalytics;