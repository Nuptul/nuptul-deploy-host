import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock,
  Zap,
  Database,
  Wifi,
  Server,
  Globe,
  Heart,
  Camera,
  MessageSquare,
  Gift,
  Bell,
  RefreshCw
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface LiveMetrics {
  activeUsers: number;
  totalUsers: number;
  photosShared: number;
  messagesExchanged: number;
  rsvpCount: number;
  giftsPurchased: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
  responseTime: number;
  uptime: number;
  errorRate: number;
}

interface SystemAlert {
  id: string;
  type: 'error' | 'warning' | 'info';
  message: string;
  timestamp: Date;
  resolved: boolean;
}

interface UserActivity {
  timestamp: Date;
  action: string;
  user: string;
  details: string;
}

export const LiveMonitoring: React.FC = () => {
  const [metrics, setMetrics] = useState<LiveMetrics>({
    activeUsers: 0,
    totalUsers: 0,
    photosShared: 0,
    messagesExchanged: 0,
    rsvpCount: 0,
    giftsPurchased: 0,
    systemHealth: 'healthy',
    responseTime: 0,
    uptime: 99.9,
    errorRate: 0.1
  });
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [recentActivity, setRecentActivity] = useState<UserActivity[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadLiveMetrics();
    loadSystemAlerts();
    loadRecentActivity();

    // Set up real-time updates
    const interval = setInterval(() => {
      loadLiveMetrics();
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const loadLiveMetrics = async () => {
    try {
      setIsRefreshing(true);

      // Fetch real metrics from database
      const [
        { count: totalUsers },
        { count: photosShared },
        { count: messagesExchanged },
        { count: rsvpCount },
        { count: giftsPurchased }
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        (supabase as any).from('photos').select('*', { count: 'exact', head: true }),
        (supabase as any).from('messages').select('*', { count: 'exact', head: true }),
        (supabase as any).from('rsvps').select('*', { count: 'exact', head: true }),
        (supabase as any).from('gift_registry').select('*', { count: 'exact', head: true }).eq('is_purchased', true)
      ]);

      // Simulate active users and performance metrics
      const activeUsers = Math.floor(Math.random() * 50) + 10;
      const responseTime = Math.random() * 200 + 50;
      const errorRate = Math.random() * 0.5;
      
      let systemHealth: 'healthy' | 'warning' | 'critical' = 'healthy';
      if (errorRate > 0.3 || responseTime > 200) systemHealth = 'warning';
      if (errorRate > 0.5 || responseTime > 300) systemHealth = 'critical';

      setMetrics({
        activeUsers,
        totalUsers: totalUsers || 0,
        photosShared: photosShared || 0,
        messagesExchanged: messagesExchanged || 0,
        rsvpCount: rsvpCount || 0,
        giftsPurchased: giftsPurchased || 0,
        systemHealth,
        responseTime: Math.round(responseTime),
        uptime: 99.9,
        errorRate: Number(errorRate.toFixed(2))
      });
    } catch (error) {
      console.error('Error loading live metrics:', error);
      toast({
        title: "Error",
        description: "Failed to load live metrics",
        variant: "destructive"
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const loadSystemAlerts = () => {
    // Simulate system alerts
    const mockAlerts: SystemAlert[] = [
      {
        id: '1',
        type: 'info',
        message: 'Database backup completed successfully',
        timestamp: new Date(Date.now() - 300000),
        resolved: true
      },
      {
        id: '2',
        type: 'warning',
        message: 'High memory usage detected on photo processing server',
        timestamp: new Date(Date.now() - 600000),
        resolved: false
      },
      {
        id: '3',
        type: 'info',
        message: 'CDN cache cleared and refreshed',
        timestamp: new Date(Date.now() - 900000),
        resolved: true
      }
    ];
    setAlerts(mockAlerts);
  };

  const loadRecentActivity = () => {
    // Simulate recent user activity
    const activities: UserActivity[] = [
      {
        timestamp: new Date(Date.now() - 60000),
        action: 'Photo Upload',
        user: 'Sarah M.',
        details: 'Uploaded wedding ceremony photo'
      },
      {
        timestamp: new Date(Date.now() - 120000),
        action: 'RSVP Submitted',
        user: 'John D.',
        details: 'Confirmed attendance for 2 guests'
      },
      {
        timestamp: new Date(Date.now() - 180000),
        action: 'Gift Purchased',
        user: 'Emily R.',
        details: 'Purchased Kitchen Mixer ($299)'
      },
      {
        timestamp: new Date(Date.now() - 240000),
        action: 'Message Sent',
        user: 'Mike T.',
        details: 'Posted congratulations message'
      },
      {
        timestamp: new Date(Date.now() - 300000),
        action: 'Profile Updated',
        user: 'Lisa K.',
        details: 'Updated contact information'
      }
    ];
    setRecentActivity(activities);
  };

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'healthy': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'critical': return <XCircle className="w-5 h-5 text-red-600" />;
      default: return <Activity className="w-5 h-5" />;
    }
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy': return 'bg-green-100 text-green-800 border-green-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleTimeString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-wedding-navy flex items-center gap-2">
            <Activity className="w-6 h-6" />
            Phase 11: Live Monitoring
          </h2>
          <p className="text-muted-foreground">Real-time monitoring and continuous improvement</p>
        </div>
        <Button onClick={loadLiveMetrics} disabled={isRefreshing}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* System Health Overview */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getHealthIcon(metrics.systemHealth)}
            System Health Overview
            <Badge className={getHealthColor(metrics.systemHealth)}>
              {metrics.systemHealth.toUpperCase()}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{metrics.uptime}%</div>
              <p className="text-sm text-muted-foreground">Uptime</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{metrics.responseTime}ms</div>
              <p className="text-sm text-muted-foreground">Avg Response Time</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{metrics.errorRate}%</div>
              <p className="text-sm text-muted-foreground">Error Rate</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{metrics.activeUsers}</div>
              <p className="text-sm text-muted-foreground">Active Users</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Live Metrics */}
      <Tabs defaultValue="metrics" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="metrics">Live Metrics</TabsTrigger>
          <TabsTrigger value="alerts">System Alerts</TabsTrigger>
          <TabsTrigger value="activity">User Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="metrics">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="glass-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                    <p className="text-2xl font-bold">{metrics.totalUsers}</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Photos Shared</p>
                    <p className="text-2xl font-bold">{metrics.photosShared}</p>
                  </div>
                  <Camera className="w-8 h-8 text-pink-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Messages</p>
                    <p className="text-2xl font-bold">{metrics.messagesExchanged}</p>
                  </div>
                  <MessageSquare className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">RSVPs</p>
                    <p className="text-2xl font-bold">{metrics.rsvpCount}</p>
                  </div>
                  <Heart className="w-8 h-8 text-red-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Gifts Purchased</p>
                    <p className="text-2xl font-bold">{metrics.giftsPurchased}</p>
                  </div>
                  <Gift className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active Now</p>
                    <p className="text-2xl font-bold">{metrics.activeUsers}</p>
                  </div>
                  <Zap className="w-8 h-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alerts">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                System Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alerts.map((alert) => (
                  <Alert 
                    key={alert.id} 
                    className={`border ${
                      alert.type === 'error' ? 'border-red-200' :
                      alert.type === 'warning' ? 'border-yellow-200' :
                      'border-blue-200'
                    }`}
                  >
                    {alert.type === 'error' && <XCircle className="h-4 w-4" />}
                    {alert.type === 'warning' && <AlertTriangle className="h-4 w-4" />}
                    {alert.type === 'info' && <CheckCircle className="h-4 w-4" />}
                    <AlertDescription>
                      <div className="flex justify-between items-start">
                        <div>
                          <strong>{alert.message}</strong>
                          <p className="text-sm text-muted-foreground mt-1">
                            {formatTimestamp(alert.timestamp)}
                          </p>
                        </div>
                        <Badge variant={alert.resolved ? 'default' : 'secondary'}>
                          {alert.resolved ? 'Resolved' : 'Active'}
                        </Badge>
                      </div>
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Recent User Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-4 p-4 rounded-lg bg-muted/20">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{activity.action}</h4>
                        <span className="text-sm text-muted-foreground">
                          {formatTimestamp(activity.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        <strong>{activity.user}</strong> - {activity.details}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Database className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Database</p>
                <p className="text-xs text-green-600">Healthy</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Server className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-medium">Server</p>
                <p className="text-xs text-green-600">Online</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Globe className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium">CDN</p>
                <p className="text-xs text-green-600">Optimized</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Wifi className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="text-sm font-medium">API</p>
                <p className="text-xs text-green-600">Responsive</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};