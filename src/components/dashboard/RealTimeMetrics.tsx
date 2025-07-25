import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  CheckCircle, 
  Clock, 
  Calendar,
  TrendingUp,
  TrendingDown,
  Activity,
  MessageSquare,
  Camera,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface MetricCardProps {
  title: string;
  value: number;
  previousValue?: number;
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
  format?: 'number' | 'percentage';
  suffix?: string;
  isDarkMode?: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  previousValue, 
  icon: Icon, 
  color, 
  bgColor,
  format = 'number',
  suffix = '',
  isDarkMode = false
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const [trend, setTrend] = useState<'up' | 'down' | 'neutral'>('neutral');
  const [trendPercentage, setTrendPercentage] = useState(0);

  useEffect(() => {
    // Animate the counter
    const duration = 1000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  useEffect(() => {
    if (previousValue !== undefined && previousValue !== 0) {
      const change = ((value - previousValue) / previousValue) * 100;
      setTrendPercentage(Math.abs(change));
      
      if (change > 0) {
        setTrend('up');
      } else if (change < 0) {
        setTrend('down');
      } else {
        setTrend('neutral');
      }
    }
  }, [value, previousValue]);

  const formatValue = (val: number) => {
    if (format === 'percentage') {
      return `${val}%`;
    }
    return val.toLocaleString();
  };

  const getTrendColor = () => {
    if (isDarkMode) {
      switch (trend) {
        case 'up': return 'text-green-400';
        case 'down': return 'text-red-400';
        default: return 'text-gray-400';
      }
    } else {
      switch (trend) {
        case 'up': return 'text-green-600';
        case 'down': return 'text-red-600';
        default: return 'text-gray-500';
      }
    }
  };

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Activity;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className={`relative overflow-hidden p-5 rounded-2xl backdrop-blur-xl shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-500 min-h-[120px] flex flex-col justify-between group ${
        isDarkMode 
          ? 'bg-gray-800/80 border border-gray-700/50' 
          : 'bg-white/80 border border-gray-200/50'
      }`}
      style={{
        backdropFilter: 'blur(20px) saturate(1.5)',
        WebkitBackdropFilter: 'blur(20px) saturate(1.5)',
      }}
    >
      {/* Gradient background effect */}
      <div className={`absolute inset-0 bg-gradient-to-br from-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
        isDarkMode 
          ? 'via-blue-500/10 to-purple-500/10' 
          : 'via-blue-50/20 to-purple-50/20'
      }`} />
      
      <div className="relative">
        <div className="flex items-start justify-between mb-3">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 ${
            isDarkMode 
              ? bgColor.replace('bg-', 'bg-').replace('-50', '-900/30')
              : bgColor
          }`}>
            <Icon className={`w-6 h-6 ${
              isDarkMode 
                ? color.replace('-600', '-400')
                : color
            }`} />
          </div>
          {trend !== 'neutral' && (
            <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold ${getTrendColor()} ${
              isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
            }`}>
              {trend === 'up' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
              {trendPercentage.toFixed(1)}%
            </div>
          )}
        </div>
        
        <div className="space-y-1">
          <motion.div
            className={`text-2xl sm:text-3xl font-bold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}
            key={displayValue}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            {formatValue(displayValue)}
          </motion.div>
          <div className={`text-sm font-medium ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            {title}
            {suffix && <span className={`text-xs ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>{suffix}</span>}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

interface RealTimeMetricsProps {
  refreshInterval?: number;
  isDarkMode?: boolean;
}

export const RealTimeMetrics: React.FC<RealTimeMetricsProps> = ({ 
  refreshInterval = 30000, // 30 seconds
  isDarkMode = false
}) => {
  const [metrics, setMetrics] = useState({
    totalGuests: 0,
    confirmedRSVPs: 0,
    pendingRSVPs: 0,
    responseRate: 0,
    totalEvents: 0,
    recentMessages: 0,
    photoUploads: 0,
    todayActivity: 0
  });

  const [previousMetrics, setPreviousMetrics] = useState(metrics);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchMetrics = async () => {
    try {
      // Store previous values for trend calculation
      setPreviousMetrics(metrics);

      // Fetch guest statistics
      const { data: guests } = await supabase
        .from('guest_list')
        .select('*');

      const totalGuests = guests?.length || 0;
      const confirmedRSVPs = guests?.filter(g => g.rsvp_status === 'confirmed').length || 0;
      const pendingRSVPs = guests?.filter(g => g.rsvp_status === 'pending').length || 0;
      const responseRate = totalGuests > 0 ? Math.round((confirmedRSVPs / totalGuests) * 100) : 0;

      // Fetch event statistics
      const { data: events } = await supabase
        .from('events')
        .select('*');

      const totalEvents = events?.length || 0;

      // Fetch communication statistics
      const { data: messages } = await supabase
        .from('guest_communications')
        .select('*')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      const recentMessages = messages?.length || 0;

      // Fetch photo statistics
      const { data: photos } = await supabase
        .from('gallery_photos')
        .select('*')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      const photoUploads = photos?.length || 0;

      // Calculate today's activity
      const today = new Date().toISOString().split('T')[0];
      const todayMessages = messages?.filter(m => m.created_at.startsWith(today)).length || 0;
      const todayPhotos = photos?.filter(p => p.created_at.startsWith(today)).length || 0;
      const todayRSVPs = guests?.filter(g => 
        g.updated_at && g.updated_at.startsWith(today) && g.rsvp_status === 'confirmed'
      ).length || 0;

      const todayActivity = todayMessages + todayPhotos + todayRSVPs;

      setMetrics({
        totalGuests,
        confirmedRSVPs,
        pendingRSVPs,
        responseRate,
        totalEvents,
        recentMessages,
        photoUploads,
        todayActivity
      });

      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching real-time metrics:', error);
    }
  };

  useEffect(() => {
    fetchMetrics();
    
    const interval = setInterval(fetchMetrics, refreshInterval);
    
    return () => clearInterval(interval);
  }, [refreshInterval]);

  // Set up real-time subscriptions
  useEffect(() => {
    const guestSubscription = supabase
      .channel('guest_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'guest_list' },
        () => fetchMetrics()
      )
      .subscribe();

    const messageSubscription = supabase
      .channel('message_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'guest_communications' },
        () => fetchMetrics()
      )
      .subscribe();

    const photoSubscription = supabase
      .channel('photo_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'gallery_photos' },
        () => fetchMetrics()
      )
      .subscribe();

    return () => {
      guestSubscription.unsubscribe();
      messageSubscription.unsubscribe();
      photoSubscription.unsubscribe();
    };
  }, []);

  const metricCards = [
    {
      title: 'Total Guests',
      value: metrics.totalGuests,
      previousValue: previousMetrics.totalGuests,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Confirmed RSVPs',
      value: metrics.confirmedRSVPs,
      previousValue: previousMetrics.confirmedRSVPs,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Response Rate',
      value: metrics.responseRate,
      previousValue: previousMetrics.responseRate,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      format: 'percentage' as const
    },
    {
      title: 'Pending RSVPs',
      value: metrics.pendingRSVPs,
      previousValue: previousMetrics.pendingRSVPs,
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'Total Events',
      value: metrics.totalEvents,
      previousValue: previousMetrics.totalEvents,
      icon: Calendar,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50'
    },
    {
      title: 'Recent Messages',
      value: metrics.recentMessages,
      previousValue: previousMetrics.recentMessages,
      icon: MessageSquare,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50'
    },
    {
      title: 'Photo Uploads',
      value: metrics.photoUploads,
      previousValue: previousMetrics.photoUploads,
      icon: Camera,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      suffix: ' this week'
    },
    {
      title: 'Today\'s Activity',
      value: metrics.todayActivity,
      previousValue: previousMetrics.todayActivity,
      icon: Activity,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <AnimatePresence>
        {metricCards.map((metric, index) => (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <MetricCard {...metric} isDarkMode={isDarkMode} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
