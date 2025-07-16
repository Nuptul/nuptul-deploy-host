import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  Eye, 
  Clock, 
  Smartphone, 
  Monitor,
  Globe,
  Activity,
  AlertCircle,
  CheckCircle,
  Download
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface AnalyticsData {
  userEngagement: {
    totalUsers: number;
    activeUsers: number;
    newUsers: number;
    returnRate: number;
  };
  contentPerformance: {
    totalPosts: number;
    totalPhotos: number;
    totalReactions: number;
    topContent: Array<{
      id: string;
      title: string;
      views: number;
      reactions: number;
    }>;
  };
  deviceMetrics: {
    mobile: number;
    desktop: number;
    tablet: number;
  };
  performanceMetrics: {
    avgLoadTime: number;
    bounceRate: number;
    pageViews: number;
    sessionDuration: number;
  };
  realTimeStats: {
    activeNow: number;
    todayVisits: number;
    recentActions: Array<{
      type: string;
      user: string;
      timestamp: string;
    }>;
  };
}

export const AdvancedAnalytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | '90d'>('7d');

  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      // In a real app, this would fetch from analytics API
      // For demo, using simulated data
      const mockData: AnalyticsData = {
        userEngagement: {
          totalUsers: 245,
          activeUsers: 189,
          newUsers: 34,
          returnRate: 77.2
        },
        contentPerformance: {
          totalPosts: 156,
          totalPhotos: 432,
          totalReactions: 1203,
          topContent: [
            { id: '1', title: 'Wedding Ceremony Photos', views: 89, reactions: 45 },
            { id: '2', title: 'Reception Highlights', views: 76, reactions: 38 },
            { id: '3', title: 'Venue Tour', views: 65, reactions: 29 }
          ]
        },
        deviceMetrics: {
          mobile: 68,
          desktop: 25,
          tablet: 7
        },
        performanceMetrics: {
          avgLoadTime: 1.2,
          bounceRate: 23.5,
          pageViews: 2847,
          sessionDuration: 4.8
        },
        realTimeStats: {
          activeNow: 12,
          todayVisits: 67,
          recentActions: [
            { type: 'photo_like', user: 'Emma S.', timestamp: '2 min ago' },
            { type: 'rsvp_submit', user: 'John D.', timestamp: '5 min ago' },
            { type: 'post_react', user: 'Sarah M.', timestamp: '8 min ago' }
          ]
        }
      };

      setAnalytics(mockData);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportAnalytics = () => {
    if (!analytics) return;
    
    const csvData = `Date,Total Users,Active Users,New Users,Return Rate
${new Date().toLocaleDateString()},${analytics.userEngagement.totalUsers},${analytics.userEngagement.activeUsers},${analytics.userEngagement.newUsers},${analytics.userEngagement.returnRate}%`;
    
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wedding-analytics-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="glass-card">
              <CardContent className="p-6">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-8 bg-muted rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  const deviceData = [
    { name: 'Mobile', value: analytics.deviceMetrics.mobile, color: '#8B5CF6' },
    { name: 'Desktop', value: analytics.deviceMetrics.desktop, color: '#06B6D4' },
    { name: 'Tablet', value: analytics.deviceMetrics.tablet, color: '#10B981' }
  ];

  const engagementData = [
    { name: 'Mon', users: 45, sessions: 89 },
    { name: 'Tue', users: 52, sessions: 102 },
    { name: 'Wed', users: 48, sessions: 95 },
    { name: 'Thu', users: 61, sessions: 118 },
    { name: 'Fri', users: 55, sessions: 108 },
    { name: 'Sat', users: 67, sessions: 134 },
    { name: 'Sun', users: 43, sessions: 87 }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-wedding-navy">Advanced Analytics</h2>
          <p className="text-muted-foreground">Comprehensive insights and performance metrics</p>
        </div>
        <div className="flex space-x-2">
          <div className="flex bg-muted rounded-lg p-1">
            {(['24h', '7d', '30d', '90d'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  timeRange === range
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
          <Button onClick={exportAnalytics} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{analytics.userEngagement.totalUsers}</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +12% from last week
                </p>
              </div>
              <Users className="w-8 h-8 text-wedding-navy/60" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold">{analytics.userEngagement.activeUsers}</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <Activity className="w-3 h-3 mr-1" />
                  {analytics.realTimeStats.activeNow} online now
                </p>
              </div>
              <Eye className="w-8 h-8 text-wedding-navy/60" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Load Time</p>
                <p className="text-2xl font-bold">{analytics.performanceMetrics.avgLoadTime}s</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Excellent
                </p>
              </div>
              <Clock className="w-8 h-8 text-wedding-navy/60" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Return Rate</p>
                <p className="text-2xl font-bold">{analytics.userEngagement.returnRate}%</p>
                <Progress value={analytics.userEngagement.returnRate} className="mt-2" />
              </div>
              <TrendingUp className="w-8 h-8 text-wedding-navy/60" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="engagement" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="devices">Devices</TabsTrigger>
          <TabsTrigger value="realtime">Real-time</TabsTrigger>
        </TabsList>

        <TabsContent value="engagement" className="space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>User Engagement Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={engagementData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="users" stackId="1" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="sessions" stackId="1" stroke="#06B6D4" fill="#06B6D4" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Content Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold">{analytics.contentPerformance.totalPosts}</p>
                    <p className="text-xs text-muted-foreground">Posts</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{analytics.contentPerformance.totalPhotos}</p>
                    <p className="text-xs text-muted-foreground">Photos</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{analytics.contentPerformance.totalReactions}</p>
                    <p className="text-xs text-muted-foreground">Reactions</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Top Content</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.contentPerformance.topContent.map((content, index) => (
                    <div key={content.id} className="flex items-center justify-between p-2 rounded glass-card">
                      <div className="flex items-center space-x-3">
                        <Badge variant="secondary">{index + 1}</Badge>
                        <span className="text-sm font-medium">{content.title}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {content.views} views • {content.reactions} reactions
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="devices" className="space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Device Usage Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col lg:flex-row items-center space-y-4 lg:space-y-0 lg:space-x-8">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={deviceData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {deviceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2">
                  {deviceData.map((device, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: device.color }}
                      />
                      <span className="text-sm">{device.name}: {device.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="realtime" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Live Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Active Now</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      {analytics.realTimeStats.activeNow} users
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Today's Visits</span>
                    <Badge variant="outline">{analytics.realTimeStats.todayVisits}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.realTimeStats.recentActions.map((action, index) => (
                    <div key={index} className="flex items-center space-x-3 text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="font-medium">{action.user}</span>
                      <span className="text-muted-foreground">{action.type.replace('_', ' ')}</span>
                      <span className="text-xs text-muted-foreground ml-auto">{action.timestamp}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};