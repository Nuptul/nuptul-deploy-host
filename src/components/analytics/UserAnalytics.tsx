import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Activity, 
  TrendingUp, 
  TrendingDown,
  Eye,
  Clock,
  MousePointer,
  Smartphone,
  Monitor,
  Globe,
  MapPin,
  Calendar,
  BarChart3,
  PieChart,
  LineChart
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UserMetrics {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  returningUsers: number;
  sessionDuration: number;
  pageViews: number;
  bounceRate: number;
  conversionRate: number;
}

interface DeviceData {
  mobile: number;
  desktop: number;
  tablet: number;
}

interface LocationData {
  country: string;
  users: number;
  percentage: number;
}

interface PageAnalytics {
  page: string;
  views: number;
  uniqueViews: number;
  avgTimeSpent: number;
  bounceRate: number;
}

interface UserBehavior {
  action: string;
  count: number;
  percentage: number;
  trend: 'up' | 'down' | 'stable';
}

export const UserAnalytics: React.FC = () => {
  const [metrics, setMetrics] = useState<UserMetrics>({
    totalUsers: 0,
    activeUsers: 0,
    newUsers: 0,
    returningUsers: 0,
    sessionDuration: 0,
    pageViews: 0,
    bounceRate: 0,
    conversionRate: 0
  });
  const [deviceData, setDeviceData] = useState<DeviceData>({
    mobile: 0,
    desktop: 0,
    tablet: 0
  });
  const [locationData, setLocationData] = useState<LocationData[]>([]);
  const [pageAnalytics, setPageAnalytics] = useState<PageAnalytics[]>([]);
  const [userBehavior, setUserBehavior] = useState<UserBehavior[]>([]);
  const [timeRange, setTimeRange] = useState('7d');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    
    try {
      // Fetch real user data from database
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Simulate analytics data based on real users
      const mockMetrics: UserMetrics = {
        totalUsers: totalUsers || 0,
        activeUsers: Math.floor((totalUsers || 0) * 0.6),
        newUsers: Math.floor((totalUsers || 0) * 0.3),
        returningUsers: Math.floor((totalUsers || 0) * 0.7),
        sessionDuration: Math.floor(Math.random() * 300) + 180, // 3-8 minutes
        pageViews: Math.floor((totalUsers || 0) * 2.5),
        bounceRate: Math.random() * 30 + 20, // 20-50%
        conversionRate: Math.random() * 15 + 5 // 5-20%
      };

      const mockDeviceData: DeviceData = {
        mobile: 65 + Math.floor(Math.random() * 10),
        desktop: 25 + Math.floor(Math.random() * 10),
        tablet: 10 + Math.floor(Math.random() * 5)
      };

      const mockLocationData: LocationData[] = [
        { country: 'United States', users: Math.floor((totalUsers || 0) * 0.4), percentage: 40 },
        { country: 'Australia', users: Math.floor((totalUsers || 0) * 0.3), percentage: 30 },
        { country: 'United Kingdom', users: Math.floor((totalUsers || 0) * 0.15), percentage: 15 },
        { country: 'Canada', users: Math.floor((totalUsers || 0) * 0.1), percentage: 10 },
        { country: 'Other', users: Math.floor((totalUsers || 0) * 0.05), percentage: 5 }
      ];

      const mockPageAnalytics: PageAnalytics[] = [
        {
          page: 'Home',
          views: Math.floor((totalUsers || 0) * 1.8),
          uniqueViews: Math.floor((totalUsers || 0) * 1.2),
          avgTimeSpent: 120,
          bounceRate: 25
        },
        {
          page: 'RSVP',
          views: Math.floor((totalUsers || 0) * 1.5),
          uniqueViews: Math.floor((totalUsers || 0) * 0.9),
          avgTimeSpent: 180,
          bounceRate: 15
        },
        {
          page: 'Gallery',
          views: Math.floor((totalUsers || 0) * 2.2),
          uniqueViews: Math.floor((totalUsers || 0) * 1.4),
          avgTimeSpent: 240,
          bounceRate: 20
        },
        {
          page: 'Social',
          views: Math.floor((totalUsers || 0) * 1.3),
          uniqueViews: Math.floor((totalUsers || 0) * 0.8),
          avgTimeSpent: 300,
          bounceRate: 30
        },
        {
          page: 'Gift Registry',
          views: Math.floor((totalUsers || 0) * 0.8),
          uniqueViews: Math.floor((totalUsers || 0) * 0.6),
          avgTimeSpent: 200,
          bounceRate: 35
        }
      ];

      const mockUserBehavior: UserBehavior[] = [
        { action: 'Photo Uploads', count: 45, percentage: 25, trend: 'up' },
        { action: 'RSVP Submissions', count: 38, percentage: 21, trend: 'up' },
        { action: 'Message Posts', count: 32, percentage: 18, trend: 'stable' },
        { action: 'Gift Purchases', count: 28, percentage: 16, trend: 'up' },
        { action: 'Profile Updates', count: 22, percentage: 12, trend: 'down' },
        { action: 'Social Shares', count: 15, percentage: 8, trend: 'stable' }
      ];

      setMetrics(mockMetrics);
      setDeviceData(mockDeviceData);
      setLocationData(mockLocationData);
      setPageAnalytics(mockPageAnalytics);
      setUserBehavior(mockUserBehavior);

    } catch (error) {
      console.error('Error loading analytics data:', error);
      toast({
        title: "Error",
        description: "Failed to load analytics data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-600" />;
      default: return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-wedding-navy flex items-center gap-2">
            <BarChart3 className="w-6 h-6" />
            User Analytics
          </h2>
          <p className="text-muted-foreground">Comprehensive user behavior and engagement analytics</p>
        </div>
        <div className="flex items-center space-x-2">
          <select
            className="p-2 border rounded-md"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <option value="1d">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
          <Button onClick={loadAnalyticsData} disabled={loading}>
            {loading ? 'Loading...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{metrics.totalUsers}</p>
                <p className="text-xs text-green-600">+{metrics.newUsers} new</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold">{metrics.activeUsers}</p>
                <p className="text-xs text-gray-600">{Math.round((metrics.activeUsers / metrics.totalUsers) * 100)}% of total</p>
              </div>
              <Activity className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Session</p>
                <p className="text-2xl font-bold">{formatDuration(metrics.sessionDuration)}</p>
                <p className="text-xs text-blue-600">+12% vs last period</p>
              </div>
              <Clock className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Page Views</p>
                <p className="text-2xl font-bold">{metrics.pageViews}</p>
                <p className="text-xs text-orange-600">{(metrics.pageViews / metrics.totalUsers).toFixed(1)} per user</p>
              </div>
              <Eye className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="behavior">Behavior</TabsTrigger>
          <TabsTrigger value="devices">Devices</TabsTrigger>
          <TabsTrigger value="geography">Geography</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Conversion Metrics */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Conversion Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">RSVP Conversion</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold">{metrics.conversionRate.toFixed(1)}%</span>
                      <TrendingUp className="w-4 h-4 text-green-600" />
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${metrics.conversionRate}%` }}
                    ></div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Bounce Rate</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold">{metrics.bounceRate.toFixed(1)}%</span>
                      <TrendingDown className="w-4 h-4 text-green-600" />
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-red-600 h-2 rounded-full" 
                      style={{ width: `${metrics.bounceRate}%` }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Page Analytics */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Top Pages
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {pageAnalytics.slice(0, 5).map((page, index) => (
                    <div key={page.page} className="flex justify-between items-center p-3 rounded-lg bg-muted/20">
                      <div>
                        <h4 className="font-medium">{page.page}</h4>
                        <p className="text-sm text-muted-foreground">
                          {page.views} views • {formatDuration(page.avgTimeSpent)} avg time
                        </p>
                      </div>
                      <Badge variant="outline">
                        #{index + 1}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="behavior">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MousePointer className="w-5 h-5" />
                User Behavior Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Top Actions</h3>
                  {userBehavior.map((behavior, index) => (
                    <div key={behavior.action} className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
                      <div className="flex items-center space-x-3">
                        {getTrendIcon(behavior.trend)}
                        <div>
                          <h4 className="font-medium">{behavior.action}</h4>
                          <p className="text-sm text-muted-foreground">{behavior.count} actions</p>
                        </div>
                      </div>
                      <Badge variant="outline">{behavior.percentage}%</Badge>
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Engagement Patterns</h3>
                  <div className="space-y-3">
                    <div className="p-4 rounded-lg bg-muted/20">
                      <h4 className="font-medium mb-2">Peak Activity Hours</h4>
                      <p className="text-sm text-muted-foreground">6:00 PM - 9:00 PM</p>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                      </div>
                    </div>

                    <div className="p-4 rounded-lg bg-muted/20">
                      <h4 className="font-medium mb-2">Most Active Day</h4>
                      <p className="text-sm text-muted-foreground">Saturday</p>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                      </div>
                    </div>

                    <div className="p-4 rounded-lg bg-muted/20">
                      <h4 className="font-medium mb-2">Avg Pages per Session</h4>
                      <p className="text-sm text-muted-foreground">3.2 pages</p>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div className="bg-purple-600 h-2 rounded-full" style={{ width: '60%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="devices">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="w-5 h-5" />
                Device & Platform Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Device Usage</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Smartphone className="w-5 h-5 text-blue-600" />
                        <span>Mobile</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${deviceData.mobile}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{deviceData.mobile}%</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Monitor className="w-5 h-5 text-green-600" />
                        <span>Desktop</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full" 
                            style={{ width: `${deviceData.desktop}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{deviceData.desktop}%</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-5 h-5 rounded bg-purple-600 flex items-center justify-center">
                          <div className="w-3 h-2 bg-white rounded-sm"></div>
                        </div>
                        <span>Tablet</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-purple-600 h-2 rounded-full" 
                            style={{ width: `${deviceData.tablet}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{deviceData.tablet}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Performance by Device</h3>
                  <div className="space-y-3">
                    <div className="p-3 rounded-lg bg-muted/20">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium">Mobile Load Time</span>
                        <span className="text-sm">2.1s</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-muted/20">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium">Desktop Load Time</span>
                        <span className="text-sm">1.4s</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '95%' }}></div>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-muted/20">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium">Tablet Load Time</span>
                        <span className="text-sm">1.8s</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '90%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="geography">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Geographic Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Users by Country</h3>
                  <div className="space-y-3">
                    {locationData.map((location, index) => (
                      <div key={location.country} className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
                        <div className="flex items-center space-x-3">
                          <MapPin className="w-4 h-4 text-blue-600" />
                          <span className="font-medium">{location.country}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${location.percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">{location.users}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Regional Insights</h3>
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-muted/20">
                      <h4 className="font-medium mb-2">Highest Engagement</h4>
                      <p className="text-sm text-muted-foreground">Australia</p>
                      <p className="text-xs text-green-600">5.2 pages per session</p>
                    </div>

                    <div className="p-4 rounded-lg bg-muted/20">
                      <h4 className="font-medium mb-2">Fastest Growth</h4>
                      <p className="text-sm text-muted-foreground">United Kingdom</p>
                      <p className="text-xs text-blue-600">+45% new users</p>
                    </div>

                    <div className="p-4 rounded-lg bg-muted/20">
                      <h4 className="font-medium mb-2">Peak Activity Time</h4>
                      <p className="text-sm text-muted-foreground">7:00 PM - 10:00 PM EST</p>
                      <p className="text-xs text-purple-600">Across all regions</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};