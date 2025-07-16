import React, { useState, useEffect } from 'react';
import { Activity, Users, MessageSquare, Camera, TrendingUp, AlertTriangle, CheckCircle, Wifi, Server, Database } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';

interface SystemMetrics {
  activeUsers: number;
  totalConnections: number;
  messagesPerMinute: number;
  photosUploadedToday: number;
  systemLoad: number;
  databaseHealth: 'good' | 'warning' | 'error';
  storageUsage: number;
  apiResponseTime: number;
}

interface LiveActivity {
  id: string;
  type: 'user_login' | 'photo_upload' | 'message_sent' | 'rsvp_submitted';
  user: string;
  timestamp: Date;
  details: string;
}

const RealTimeMonitoring: React.FC = () => {
  const [metrics, setMetrics] = useState<SystemMetrics>({
    activeUsers: 0,
    totalConnections: 0,
    messagesPerMinute: 0,
    photosUploadedToday: 0,
    systemLoad: 0,
    databaseHealth: 'good',
    storageUsage: 0,
    apiResponseTime: 0
  });
  
  const [liveActivities, setLiveActivities] = useState<LiveActivity[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected'>('connecting');

  useEffect(() => {
    fetchSystemMetrics();
    setupRealTimeMonitoring();
    
    const interval = setInterval(fetchSystemMetrics, 30000); // Update every 30 seconds
    
    return () => {
      clearInterval(interval);
    };
  }, []);

  const fetchSystemMetrics = async () => {
    try {
      // Simulate fetching real metrics - in real app, these would come from monitoring APIs
      const [usersData, messagesData, photosData] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        (supabase as any).from('messages').select('*').gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
        (supabase as any).from('photos').select('*').gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      ]);

      setMetrics({
        activeUsers: Math.floor(Math.random() * 25) + 5, // Simulated active users
        totalConnections: usersData.count || 0,
        messagesPerMinute: Math.floor(Math.random() * 10) + 2,
        photosUploadedToday: photosData.data?.length || 0,
        systemLoad: Math.floor(Math.random() * 30) + 20, // 20-50% load
        databaseHealth: Math.random() > 0.1 ? 'good' : 'warning',
        storageUsage: Math.floor(Math.random() * 40) + 30, // 30-70% storage
        apiResponseTime: Math.floor(Math.random() * 100) + 50 // 50-150ms
      });
      
      setConnectionStatus('connected');
    } catch (error) {
      console.error('Error fetching system metrics:', error);
      setConnectionStatus('disconnected');
    }
  };

  const setupRealTimeMonitoring = () => {
    // Set up real-time subscriptions for live activity
    const channel = supabase
      .channel('admin-monitoring')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => addLiveActivity('message_sent', payload))
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'photos' },
        (payload) => addLiveActivity('photo_upload', payload))
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'rsvps' },
        (payload) => addLiveActivity('rsvp_submitted', payload))
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const addLiveActivity = (type: LiveActivity['type'], payload: any) => {
    const newActivity: LiveActivity = {
      id: payload.new.id,
      type,
      user: 'Anonymous User', // In real app, fetch user details
      timestamp: new Date(),
      details: getActivityDetails(type, payload.new)
    };

    setLiveActivities(prev => [newActivity, ...prev.slice(0, 9)]); // Keep last 10 activities
  };

  const getActivityDetails = (type: string, data: any): string => {
    switch (type) {
      case 'message_sent':
        return `Sent a message in public chat`;
      case 'photo_upload':
        return `Uploaded a new photo`;
      case 'rsvp_submitted':
        return `Submitted RSVP response`;
      default:
        return 'Unknown activity';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
      case 'connected':
        return 'text-glass-green';
      case 'warning':
      case 'connecting':
        return 'text-glass-pink';
      case 'error':
      case 'disconnected':
        return 'text-red-500';
      default:
        return 'text-muted-foreground';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_login':
        return <Users className="w-3 h-3" />;
      case 'photo_upload':
        return <Camera className="w-3 h-3" />;
      case 'message_sent':
        return <MessageSquare className="w-3 h-3" />;
      case 'rsvp_submitted':
        return <CheckCircle className="w-3 h-3" />;
      default:
        return <Activity className="w-3 h-3" />;
    }
  };

  return (
    <div className="space-y-4 h-full overflow-y-auto" style={{ maxHeight: '580px' }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-wedding-navy" />
          <h3 className="font-semibold text-wedding-navy">Real-Time Monitoring</h3>
        </div>
        <div className="flex items-center gap-2">
          <Wifi className={`w-4 h-4 ${getStatusColor(connectionStatus)}`} />
          <span className={`text-sm ${getStatusColor(connectionStatus)}`}>
            {connectionStatus.charAt(0).toUpperCase() + connectionStatus.slice(1)}
          </span>
        </div>
      </div>

      {/* System Health Overview */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="glass-card">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-glass-blue" />
                <span className="text-sm font-medium">Active Users</span>
              </div>
              <span className="text-lg font-bold text-glass-blue">{metrics.activeUsers}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-glass-green" />
                <span className="text-sm font-medium">Messages/Min</span>
              </div>
              <span className="text-lg font-bold text-glass-green">{metrics.messagesPerMinute}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-glass-pink" />
                <span className="text-sm font-medium">System Load</span>
              </div>
              <span className="text-lg font-bold text-glass-pink">{metrics.systemLoad}%</span>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className={`w-4 h-4 ${getStatusColor(metrics.databaseHealth)}`} />
                <span className="text-sm font-medium">DB Health</span>
              </div>
              <Badge variant={metrics.databaseHealth === 'good' ? 'default' : 'secondary'}>
                {metrics.databaseHealth}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="metrics" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="metrics">
            <TrendingUp className="w-3 h-3 mr-1" />
            System Metrics
          </TabsTrigger>
          <TabsTrigger value="activity">
            <Activity className="w-3 h-3 mr-1" />
            Live Activity
          </TabsTrigger>
        </TabsList>

        <TabsContent value="metrics" className="space-y-3">
          {/* Performance Metrics */}
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>API Response Time</span>
                  <span>{metrics.apiResponseTime}ms</span>
                </div>
                <Progress value={Math.min(metrics.apiResponseTime / 2, 100)} className="w-full" />
              </div>
              
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>Storage Usage</span>
                  <span>{metrics.storageUsage}%</span>
                </div>
                <Progress value={metrics.storageUsage} className="w-full" />
              </div>
              
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>System Load</span>
                  <span>{metrics.systemLoad}%</span>
                </div>
                <Progress value={metrics.systemLoad} className="w-full" />
              </div>
            </CardContent>
          </Card>

          {/* Daily Summary */}
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Today's Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-lg font-semibold text-glass-blue">
                    {metrics.photosUploadedToday}
                  </div>
                  <div className="text-xs text-muted-foreground">Photos Uploaded</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-glass-green">
                    {metrics.totalConnections}
                  </div>
                  <div className="text-xs text-muted-foreground">Total Users</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-3">
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {liveActivities.length === 0 ? (
                  <div className="text-center text-muted-foreground text-sm py-4">
                    No recent activity
                  </div>
                ) : (
                  liveActivities.map((activity) => (
                    <div key={activity.id} className="flex items-center gap-3 p-2 rounded border border-white/10">
                      <div className="flex items-center gap-2">
                        {getActivityIcon(activity.type)}
                        <div className="flex-1">
                          <div className="text-sm font-medium">{activity.user}</div>
                          <div className="text-xs text-muted-foreground">{activity.details}</div>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {activity.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RealTimeMonitoring;