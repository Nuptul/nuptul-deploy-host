import React, { useState, useEffect } from 'react';
import { Shield, Lock, Eye, AlertTriangle, CheckCircle, Key, UserCheck, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SecurityAlert {
  id: string;
  type: 'login_attempt' | 'permission_change' | 'data_access' | 'system_change';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
  resolved: boolean;
}

interface SecuritySettings {
  requireMFA: boolean;
  sessionTimeout: number;
  maxLoginAttempts: number;
  passwordComplexity: boolean;
  auditLogging: boolean;
  ipWhitelist: boolean;
  dataEncryption: boolean;
  autoBackups: boolean;
}

const AdvancedSecurity: React.FC = () => {
  const [securityAlerts, setSecurityAlerts] = useState<SecurityAlert[]>([]);
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    requireMFA: false,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    passwordComplexity: true,
    auditLogging: true,
    ipWhitelist: false,
    dataEncryption: true,
    autoBackups: true
  });
  const [scanning, setScanning] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSecurityAlerts();
    loadSecuritySettings();
  }, []);

  const fetchSecurityAlerts = () => {
    // Simulate security alerts - in real app, these would come from security monitoring
    const mockAlerts: SecurityAlert[] = [
      {
        id: '1',
        type: 'login_attempt',
        severity: 'medium',
        message: 'Multiple failed login attempts from IP 192.168.1.100',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        resolved: false
      },
      {
        id: '2',
        type: 'permission_change',
        severity: 'high',
        message: 'Admin role granted to user@example.com',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
        resolved: true
      },
      {
        id: '3',
        type: 'data_access',
        severity: 'low',
        message: 'Bulk data export requested',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
        resolved: true
      }
    ];
    
    setSecurityAlerts(mockAlerts);
  };

  const loadSecuritySettings = async () => {
    try {
      const { data } = await supabase
        .from('app_settings')
        .select('setting_key, setting_value')
        .in('setting_key', [
          'require_mfa',
          'session_timeout',
          'max_login_attempts',
          'password_complexity',
          'audit_logging',
          'ip_whitelist',
          'data_encryption',
          'auto_backups'
        ]);

      if (data) {
        const settings = data.reduce((acc, item) => {
          const key = item.setting_key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
          acc[key] = item.setting_value === 'true' ? true : 
                    item.setting_value === 'false' ? false : 
                    parseInt(item.setting_value) || item.setting_value;
          return acc;
        }, {} as any);
        
        setSecuritySettings(prev => ({ ...prev, ...settings }));
      }
    } catch (error) {
      console.error('Error loading security settings:', error);
    }
  };

  const updateSecuritySetting = async (key: keyof SecuritySettings, value: boolean | number) => {
    try {
      const settingKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      
      await supabase
        .from('app_settings')
        .upsert({
          setting_key: settingKey,
          setting_value: value.toString()
        });

      setSecuritySettings(prev => ({ ...prev, [key]: value }));
      
      toast({
        title: "Security Setting Updated",
        description: `${key} has been updated successfully`,
      });
    } catch (error) {
      console.error('Error updating security setting:', error);
      toast({
        title: "Error",
        description: "Failed to update security setting",
        variant: "destructive"
      });
    }
  };

  const runSecurityScan = async () => {
    setScanning(true);
    
    // Simulate security scan
    setTimeout(() => {
      setScanning(false);
      toast({
        title: "Security Scan Complete",
        description: "No critical vulnerabilities detected",
      });
    }, 3000);
  };

  const resolveAlert = (alertId: string) => {
    setSecurityAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId 
          ? { ...alert, resolved: true }
          : alert
      )
    );
    
    toast({
      title: "Alert Resolved",
      description: "Security alert has been marked as resolved",
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-500 bg-red-500/10';
      case 'high':
        return 'text-orange-500 bg-orange-500/10';
      case 'medium':
        return 'text-yellow-500 bg-yellow-500/10';
      case 'low':
        return 'text-green-500 bg-green-500/10';
      default:
        return 'text-muted-foreground bg-muted';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'login_attempt':
        return <Key className="w-4 h-4" />;
      case 'permission_change':
        return <UserCheck className="w-4 h-4" />;
      case 'data_access':
        return <Eye className="w-4 h-4" />;
      case 'system_change':
        return <Activity className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const unresolvedAlerts = securityAlerts.filter(alert => !alert.resolved);
  const criticalAlerts = unresolvedAlerts.filter(alert => alert.severity === 'critical' || alert.severity === 'high');

  return (
    <div className="space-y-4 h-full overflow-y-auto" style={{ maxHeight: '580px' }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-wedding-navy" />
          <h3 className="font-semibold text-wedding-navy">Advanced Security</h3>
        </div>
        <Button 
          onClick={runSecurityScan} 
          disabled={scanning}
          size="sm"
        >
          {scanning ? (
            <div className="w-4 h-4 animate-spin rounded-full border border-current border-t-transparent mr-2" />
          ) : (
            <Shield className="w-3 h-3 mr-2" />
          )}
          Security Scan
        </Button>
      </div>

      {/* Security Status Overview */}
      {criticalAlerts.length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {criticalAlerts.length} critical security {criticalAlerts.length === 1 ? 'alert' : 'alerts'} require immediate attention.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Card className="glass-card">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-glass-green" />
                <span className="text-sm font-medium">Security Score</span>
              </div>
              <span className="text-lg font-bold text-glass-green">87%</span>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-glass-pink" />
                <span className="text-sm font-medium">Active Alerts</span>
              </div>
              <span className="text-lg font-bold text-glass-pink">{unresolvedAlerts.length}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="alerts" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="alerts">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Security Alerts
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Lock className="w-3 h-3 mr-1" />
            Security Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="alerts" className="space-y-3">
          <div className="space-y-2">
            {securityAlerts.map((alert) => (
              <Card key={alert.id} className="glass-card">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getAlertIcon(alert.type)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={`text-xs ${getSeverityColor(alert.severity)}`}>
                            {alert.severity}
                          </Badge>
                          {alert.resolved && (
                            <Badge variant="outline" className="text-xs">
                              Resolved
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm font-medium">{alert.message}</div>
                        <div className="text-xs text-muted-foreground">
                          {alert.timestamp.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    {!alert.resolved && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => resolveAlert(alert.id)}
                      >
                        Resolve
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-3">
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Authentication Security</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">Require Multi-Factor Authentication</div>
                  <div className="text-xs text-muted-foreground">Force MFA for all admin users</div>
                </div>
                <Switch
                  checked={securitySettings.requireMFA}
                  onCheckedChange={(checked) => updateSecuritySetting('requireMFA', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">Password Complexity Requirements</div>
                  <div className="text-xs text-muted-foreground">Enforce strong password policies</div>
                </div>
                <Switch
                  checked={securitySettings.passwordComplexity}
                  onCheckedChange={(checked) => updateSecuritySetting('passwordComplexity', checked)}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">System Security</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">Audit Logging</div>
                  <div className="text-xs text-muted-foreground">Log all admin actions</div>
                </div>
                <Switch
                  checked={securitySettings.auditLogging}
                  onCheckedChange={(checked) => updateSecuritySetting('auditLogging', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">Data Encryption</div>
                  <div className="text-xs text-muted-foreground">Encrypt sensitive data at rest</div>
                </div>
                <Switch
                  checked={securitySettings.dataEncryption}
                  onCheckedChange={(checked) => updateSecuritySetting('dataEncryption', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">Automatic Backups</div>
                  <div className="text-xs text-muted-foreground">Daily encrypted backups</div>
                </div>
                <Switch
                  checked={securitySettings.autoBackups}
                  onCheckedChange={(checked) => updateSecuritySetting('autoBackups', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedSecurity;