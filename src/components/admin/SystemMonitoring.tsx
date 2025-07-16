import React, { useState, useEffect } from 'react';
import { Activity, Database, Server, Wifi, AlertCircle, CheckCircle, Clock, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SystemHealth {
  database: {
    status: 'healthy' | 'warning' | 'error';
    responseTime: number;
    connections: number;
    uptime: string;
  };
  storage: {
    status: 'healthy' | 'warning' | 'error';
    usage: number;
    available: number;
    buckets: { name: string; size: number; files: number }[];
  };
  realtime: {
    status: 'healthy' | 'warning' | 'error';
    connections: number;
    channels: number;
  };
  performance: {
    avgResponseTime: number;
    errorRate: number;
    requestsPerMinute: number;
    peakHour: string;
  };
  errors: Array<{
    id: string;
    timestamp: string;
    type: 'database' | 'storage' | 'auth' | 'api';
    message: string;
    severity: 'low' | 'medium' | 'high';
  }>;
}

const SystemMonitoring: React.FC = () => {
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('1h');
  const { toast } = useToast();

  useEffect(() => {
    fetchSystemHealth();
    const interval = setInterval(fetchSystemHealth, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [timeRange]);

  const fetchSystemHealth = async () => {
    try {
      setLoading(true);
      
      // Test database connection
      const dbStart = Date.now();
      const { data: dbTest, error: dbError } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);
      const dbResponseTime = Date.now() - dbStart;

      // Test storage
      const storageStart = Date.now();
      const { data: buckets, error: storageError } = await supabase.storage.listBuckets();
      
      // Calculate storage usage
      let totalStorageUsage = 0;
      const bucketDetails = [];
      
      if (buckets) {
        for (const bucket of buckets) {
          const { data: files } = await supabase.storage
            .from(bucket.name)
            .list('', { limit: 1000 });
          
          const bucketSize = files?.reduce((acc, file) => acc + (file.metadata?.size || 0), 0) || 0;
          totalStorageUsage += bucketSize;
          
          bucketDetails.push({
            name: bucket.name,
            size: bucketSize,
            files: files?.length || 0
          });
        }
      }

      // Simulate additional metrics (in a real app, these would come from monitoring services)
      const mockHealth: SystemHealth = {
        database: {
          status: dbError ? 'error' : dbResponseTime > 500 ? 'warning' : 'healthy',
          responseTime: dbResponseTime,
          connections: Math.floor(Math.random() * 20) + 5,
          uptime: '99.9%'
        },
        storage: {
          status: storageError ? 'error' : totalStorageUsage > 1000000000 ? 'warning' : 'healthy', // 1GB threshold
          usage: totalStorageUsage,
          available: 5000000000 - totalStorageUsage, // 5GB limit
          buckets: bucketDetails
        },
        realtime: {
          status: 'healthy',
          connections: Math.floor(Math.random() * 50) + 10,
          channels: Math.floor(Math.random() * 10) + 2
        },
        performance: {
          avgResponseTime: Math.floor(Math.random() * 200) + 100,
          errorRate: Math.random() * 2,
          requestsPerMinute: Math.floor(Math.random() * 100) + 50,
          peakHour: '18:00-19:00'
        },
        errors: [
          {
            id: '1',
            timestamp: new Date(Date.now() - 300000).toISOString(),
            type: 'api',
            message: 'Rate limit exceeded for user authentication',
            severity: 'medium'
          },
          {
            id: '2',
            timestamp: new Date(Date.now() - 900000).toISOString(),
            type: 'storage',
            message: 'Failed to upload file: size exceeds limit',
            severity: 'low'
          }
        ]
      };

      setSystemHealth(mockHealth);
    } catch (error) {
      console.error('Error fetching system health:', error);
      toast({
        title: "Error",
        description: "Failed to fetch system health data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusIcon = (status: 'healthy' | 'warning' | 'error') => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-4 h-4 text-glass-green" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-glass-pink" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getStatusBadge = (status: 'healthy' | 'warning' | 'error') => {
    const variant = status === 'healthy' ? 'default' : status === 'warning' ? 'secondary' : 'destructive';
    return <Badge variant={variant}>{status}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-wedding-navy"></div>
      </div>
    );
  }

  if (!systemHealth) {
    return (
      <div className="text-center text-muted-foreground py-8">
        Failed to load system health data
      </div>
    );
  }

  return (
    <div className="space-y-4 h-full overflow-y-auto" style={{ maxHeight: '580px' }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-wedding-navy" />
          <h3 className="font-semibold text-wedding-navy">System Monitoring</h3>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-20 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">1 Hour</SelectItem>
              <SelectItem value="24h">24 Hours</SelectItem>
              <SelectItem value="7d">7 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm" variant="outline" onClick={fetchSystemHealth}>
            <Activity className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* System Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card className="glass-card">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-glass-blue" />
                <span className="text-sm font-medium">Database</span>
              </div>
              {getStatusIcon(systemHealth.database.status)}
            </div>
            <div className="mt-2 space-y-1">
              <div className="text-xs text-muted-foreground">
                Response: {systemHealth.database.responseTime}ms
              </div>
              <div className="text-xs text-muted-foreground">
                Uptime: {systemHealth.database.uptime}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-glass-purple" />
                <span className="text-sm font-medium">Storage</span>
              </div>
              {getStatusIcon(systemHealth.storage.status)}
            </div>
            <div className="mt-2 space-y-1">
              <div className="text-xs text-muted-foreground">
                Used: {formatBytes(systemHealth.storage.usage)}
              </div>
              <div className="text-xs text-muted-foreground">
                Buckets: {systemHealth.storage.buckets.length}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wifi className="w-4 h-4 text-glass-green" />
                <span className="text-sm font-medium">Realtime</span>
              </div>
              {getStatusIcon(systemHealth.realtime.status)}
            </div>
            <div className="mt-2 space-y-1">
              <div className="text-xs text-muted-foreground">
                Connections: {systemHealth.realtime.connections}
              </div>
              <div className="text-xs text-muted-foreground">
                Channels: {systemHealth.realtime.channels}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Card className="glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Performance Metrics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
            <div>
              <div className="text-lg font-semibold">{systemHealth.performance.avgResponseTime}ms</div>
              <div className="text-xs text-muted-foreground">Avg Response</div>
            </div>
            <div>
              <div className="text-lg font-semibold">{systemHealth.performance.errorRate.toFixed(2)}%</div>
              <div className="text-xs text-muted-foreground">Error Rate</div>
            </div>
            <div>
              <div className="text-lg font-semibold">{systemHealth.performance.requestsPerMinute}</div>
              <div className="text-xs text-muted-foreground">Req/Min</div>
            </div>
            <div>
              <div className="text-lg font-semibold">{systemHealth.performance.peakHour}</div>
              <div className="text-xs text-muted-foreground">Peak Hour</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Storage Details */}
      <Card className="glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Server className="w-4 h-4" />
            Storage Buckets
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {systemHealth.storage.buckets.map((bucket) => (
              <div key={bucket.name} className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium">{bucket.name}</span>
                  <div className="text-xs text-muted-foreground">
                    {bucket.files} files
                  </div>
                </div>
                <span className="text-xs font-medium">{formatBytes(bucket.size)}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Errors */}
      <Card className="glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Recent Errors
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {systemHealth.errors.map((error) => (
              <div key={error.id} className="p-2 bg-muted/50 rounded text-xs">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {error.type}
                    </Badge>
                    <Badge variant={error.severity === 'high' ? 'destructive' : error.severity === 'medium' ? 'secondary' : 'default'}>
                      {error.severity}
                    </Badge>
                  </div>
                  <span className="text-muted-foreground">
                    {new Date(error.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div className="text-muted-foreground">{error.message}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemMonitoring;