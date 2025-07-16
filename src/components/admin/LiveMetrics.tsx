import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Calendar, 
  DollarSign, 
  MessageCircle,
  Camera,
  CheckCircle,
  Clock,
  AlertTriangle,
  Activity,
  BarChart3,
  PieChart,
  Target,
  Heart,
  Gift,
  MapPin
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, PieChart as RechartsPieChart, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface MetricCard {
  title: string;
  value: number | string;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  icon: React.ElementType;
  color: string;
  bgColor: string;
  description?: string;
}

interface ChartData {
  name: string;
  value: number;
  date?: string;
  guests?: number;
  confirmed?: number;
  pending?: number;
  declined?: number;
}

interface LiveMetricsProps {
  className?: string;
}

const LiveMetrics: React.FC<LiveMetricsProps> = ({ className }) => {
  const [metrics, setMetrics] = useState<MetricCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [rsvpData, setRsvpData] = useState<ChartData[]>([]);
  const [budgetData, setBudgetData] = useState<ChartData[]>([]);
  const [activityData, setActivityData] = useState<ChartData[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    loadMetrics();
    const interval = setInterval(loadMetrics, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      
      // In a real app, these would be actual database queries
      // For now, using dynamic mock data that changes over time
      const baseTime = Date.now();
      const randomVariation = () => Math.random() * 0.1 - 0.05; // ±5% variation

      const guestCount = 42 + Math.floor(Math.random() * 8);
      const confirmedCount = 35 + Math.floor(Math.random() * 5);
      const pendingCount = guestCount - confirmedCount - 2;

      const mockMetrics: MetricCard[] = [
        {
          title: 'Total Guests',
          value: guestCount,
          change: Math.floor(Math.random() * 3),
          changeType: 'increase',
          icon: Users,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          description: 'Invited guests'
        },
        {
          title: 'RSVP Confirmed',
          value: confirmedCount,
          change: Math.floor(Math.random() * 2),
          changeType: 'increase',
          icon: CheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          description: 'Confirmed attendees'
        },
        {
          title: 'Pending Responses',
          value: pendingCount,
          change: -Math.floor(Math.random() * 2),
          changeType: 'decrease',
          icon: Clock,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          description: 'Awaiting response'
        },
        {
          title: 'Budget Spent',
          value: `$${(15750 + Math.random() * 500).toFixed(0)}`,
          change: 2.3,
          changeType: 'increase',
          icon: DollarSign,
          color: 'text-purple-600',
          bgColor: 'bg-purple-50',
          description: 'Of $25,000 budget'
        },
        {
          title: 'Days Remaining',
          value: Math.ceil((new Date('2025-08-15').getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
          icon: Calendar,
          color: 'text-pink-600',
          bgColor: 'bg-pink-50',
          description: 'Until the big day'
        },
        {
          title: 'Photos Uploaded',
          value: 127 + Math.floor(Math.random() * 10),
          change: Math.floor(Math.random() * 5),
          changeType: 'increase',
          icon: Camera,
          color: 'text-indigo-600',
          bgColor: 'bg-indigo-50',
          description: 'Shared memories'
        },
        {
          title: 'Messages Today',
          value: 24 + Math.floor(Math.random() * 8),
          change: Math.floor(Math.random() * 3),
          changeType: 'increase',
          icon: MessageCircle,
          color: 'text-cyan-600',
          bgColor: 'bg-cyan-50',
          description: 'Group conversations'
        },
        {
          title: 'Tasks Completed',
          value: '87%',
          change: 5,
          changeType: 'increase',
          icon: Target,
          color: 'text-emerald-600',
          bgColor: 'bg-emerald-50',
          description: 'Planning progress'
        }
      ];

      // Generate RSVP trend data
      const rsvpTrendData: ChartData[] = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        rsvpTrendData.push({
          name: date.toLocaleDateString('en-US', { weekday: 'short' }),
          date: date.toISOString().split('T')[0],
          confirmed: confirmedCount - Math.floor(Math.random() * i * 2),
          pending: pendingCount + Math.floor(Math.random() * i),
          declined: 2 + Math.floor(Math.random() * 2)
        });
      }

      // Generate budget breakdown data
      const budgetBreakdown: ChartData[] = [
        { name: 'Venue', value: 8500, color: '#8884d8' },
        { name: 'Catering', value: 4200, color: '#82ca9d' },
        { name: 'Photography', value: 2100, color: '#ffc658' },
        { name: 'Flowers', value: 800, color: '#ff7c7c' },
        { name: 'Music', value: 600, color: '#8dd1e1' },
        { name: 'Other', value: 800, color: '#d084d0' }
      ];

      // Generate activity data
      const activityTrendData: ChartData[] = [];
      for (let i = 23; i >= 0; i--) {
        const hour = (new Date().getHours() - i + 24) % 24;
        activityTrendData.push({
          name: `${hour}:00`,
          value: Math.floor(Math.random() * 20) + 5
        });
      }

      setMetrics(mockMetrics);
      setRsvpData(rsvpTrendData);
      setBudgetData(budgetBreakdown);
      setActivityData(activityTrendData);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error loading metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (changeType?: string) => {
    switch (changeType) {
      case 'increase':
        return <TrendingUp className="w-3 h-3 text-green-500" />;
      case 'decrease':
        return <TrendingDown className="w-3 h-3 text-red-500" />;
      default:
        return <Activity className="w-3 h-3 text-gray-400" />;
    }
  };

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1', '#d084d0'];

  if (loading && metrics.length === 0) {
    return (
      <div className={cn('p-6', className)}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-wedding-navy"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6 p-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-wedding-navy">Live Metrics</h2>
          <p className="text-sm text-muted-foreground">
            Real-time wedding planning insights
          </p>
        </div>
        <div className="text-right">
          <Badge variant="secondary" className="bg-green-100 text-green-700">
            <Activity className="w-3 h-3 mr-1" />
            Live
          </Badge>
          <p className="text-xs text-muted-foreground mt-1">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <motion.div
              key={metric.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className={`w-10 h-10 rounded-lg ${metric.bgColor} flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 ${metric.color}`} />
                    </div>
                    {metric.change !== undefined && (
                      <div className="flex items-center space-x-1 text-xs">
                        {getTrendIcon(metric.changeType)}
                        <span className={cn(
                          'font-medium',
                          metric.changeType === 'increase' ? 'text-green-600' :
                          metric.changeType === 'decrease' ? 'text-red-600' :
                          'text-gray-500'
                        )}>
                          {metric.changeType === 'increase' ? '+' : ''}{metric.change}
                          {typeof metric.change === 'number' && metric.change % 1 !== 0 ? '%' : ''}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="mt-3">
                    <div className="text-2xl font-bold text-wedding-navy">
                      {metric.value}
                    </div>
                    <div className="text-sm font-medium text-gray-700">
                      {metric.title}
                    </div>
                    {metric.description && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {metric.description}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* RSVP Trend Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="w-5 h-5 mr-2" />
                RSVP Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={rsvpData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="confirmed" 
                    stackId="1" 
                    stroke="#10b981" 
                    fill="#10b981" 
                    fillOpacity={0.8} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="pending" 
                    stackId="1" 
                    stroke="#f59e0b" 
                    fill="#f59e0b" 
                    fillOpacity={0.8} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="declined" 
                    stackId="1" 
                    stroke="#ef4444" 
                    fill="#ef4444" 
                    fillOpacity={0.8} 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Budget Breakdown Chart */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <PieChart className="w-5 h-5 mr-2" />
                Budget Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={budgetData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {budgetData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `$${value}`} />
                  <Legend />
                </RechartsPieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Activity Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              24-Hour Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  dot={{ fill: '#8884d8', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Response Rate</p>
                  <p className="text-2xl font-bold text-wedding-navy">89%</p>
                </div>
                <Heart className="w-8 h-8 text-pink-500" />
              </div>
              <Progress value={89} className="mt-3" />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Gift Registry</p>
                  <p className="text-2xl font-bold text-wedding-navy">76%</p>
                </div>
                <Gift className="w-8 h-8 text-blue-500" />
              </div>
              <Progress value={76} className="mt-3" />
              <p className="text-xs text-muted-foreground mt-2">
                23 of 30 items purchased
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Planning Progress</p>
                  <p className="text-2xl font-bold text-wedding-navy">87%</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <Progress value={87} className="mt-3" />
              <p className="text-xs text-muted-foreground mt-2">
                3 tasks remaining
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default LiveMetrics;