import React, { useState, useEffect } from 'react';
import { Download, Upload, RotateCcw, HardDrive, Calendar, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

interface BackupItem {
  id: string;
  name: string;
  type: 'full' | 'incremental' | 'database' | 'media';
  size: string;
  created: Date;
  status: 'completed' | 'in_progress' | 'failed';
  description: string;
}

interface RestorePoint {
  id: string;
  timestamp: Date;
  description: string;
  size: string;
  type: 'automatic' | 'manual';
}

const BackupRecovery: React.FC = () => {
  const [backups, setBackups] = useState<BackupItem[]>([]);
  const [restorePoints, setRestorePoints] = useState<RestorePoint[]>([]);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [backupProgress, setBackupProgress] = useState(0);
  const [selectedBackupType, setSelectedBackupType] = useState<string>('full');
  const { toast } = useToast();

  useEffect(() => {
    fetchBackups();
    fetchRestorePoints();
  }, []);

  const fetchBackups = () => {
    // Simulate backup data - in real app, this would come from backup service
    const mockBackups: BackupItem[] = [
      {
        id: '1',
        name: 'wedding-app-backup-2025-01-09',
        type: 'full',
        size: '2.4 GB',
        created: new Date(Date.now() - 2 * 60 * 60 * 1000),
        status: 'completed',
        description: 'Complete database and media backup'
      },
      {
        id: '2',
        name: 'database-backup-2025-01-08',
        type: 'database',
        size: '156 MB',
        created: new Date(Date.now() - 26 * 60 * 60 * 1000),
        status: 'completed',
        description: 'Database tables and user data'
      },
      {
        id: '3',
        name: 'media-backup-2025-01-07',
        type: 'media',
        size: '1.8 GB',
        created: new Date(Date.now() - 50 * 60 * 60 * 1000),
        status: 'completed',
        description: 'Photos, videos, and uploaded files'
      },
      {
        id: '4',
        name: 'incremental-backup-2025-01-06',
        type: 'incremental',
        size: '45 MB',
        created: new Date(Date.now() - 74 * 60 * 60 * 1000),
        status: 'failed',
        description: 'Changes since last full backup'
      }
    ];
    
    setBackups(mockBackups);
  };

  const fetchRestorePoints = () => {
    // Simulate restore points
    const mockRestorePoints: RestorePoint[] = [
      {
        id: '1',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        description: 'Before system maintenance',
        size: '2.4 GB',
        type: 'manual'
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
        description: 'Daily automated backup',
        size: '2.3 GB',
        type: 'automatic'
      },
      {
        id: '3',
        timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000),
        description: 'Before feature deployment',
        size: '2.2 GB',
        type: 'manual'
      }
    ];
    
    setRestorePoints(mockRestorePoints);
  };

  const createBackup = async () => {
    setIsBackingUp(true);
    setBackupProgress(0);

    // Simulate backup progress
    const interval = setInterval(() => {
      setBackupProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsBackingUp(false);
          
          // Add new backup to list
          const newBackup: BackupItem = {
            id: Date.now().toString(),
            name: `${selectedBackupType}-backup-${new Date().toISOString().split('T')[0]}`,
            type: selectedBackupType as BackupItem['type'],
            size: selectedBackupType === 'full' ? '2.5 GB' : selectedBackupType === 'database' ? '160 MB' : '50 MB',
            created: new Date(),
            status: 'completed',
            description: getBackupDescription(selectedBackupType)
          };
          
          setBackups(prev => [newBackup, ...prev]);
          
          toast({
            title: "Backup Created",
            description: `${selectedBackupType} backup completed successfully`,
          });
          
          return 100;
        }
        return prev + 10;
      });
    }, 500);
  };

  const downloadBackup = (backup: BackupItem) => {
    // Simulate download
    toast({
      title: "Download Started",
      description: `Downloading ${backup.name}...`,
    });
  };

  const restoreFromBackup = async (backupId: string) => {
    setIsRestoring(true);
    
    // Simulate restore process
    setTimeout(() => {
      setIsRestoring(false);
      toast({
        title: "Restore Complete",
        description: "System has been restored from backup successfully",
      });
    }, 3000);
  };

  const getBackupDescription = (type: string): string => {
    switch (type) {
      case 'full':
        return 'Complete database and media backup';
      case 'database':
        return 'Database tables and user data';
      case 'media':
        return 'Photos, videos, and uploaded files';
      case 'incremental':
        return 'Changes since last full backup';
      default:
        return 'System backup';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-glass-green bg-green-500/10';
      case 'in_progress':
        return 'text-glass-blue bg-blue-500/10';
      case 'failed':
        return 'text-red-500 bg-red-500/10';
      default:
        return 'text-muted-foreground bg-muted';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'full':
        return <HardDrive className="w-4 h-4" />;
      case 'database':
        return <CheckCircle className="w-4 h-4" />;
      case 'media':
        return <Download className="w-4 h-4" />;
      case 'incremental':
        return <RotateCcw className="w-4 h-4" />;
      default:
        return <HardDrive className="w-4 h-4" />;
    }
  };

  const completedBackups = backups.filter(b => b.status === 'completed');
  const failedBackups = backups.filter(b => b.status === 'failed');

  return (
    <div className="space-y-4 h-full overflow-y-auto" style={{ maxHeight: '580px' }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HardDrive className="w-5 h-5 text-wedding-navy" />
          <h3 className="font-semibold text-wedding-navy">Backup & Recovery</h3>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="glass-card">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-glass-green" />
                <span className="text-sm font-medium">Completed</span>
              </div>
              <span className="text-lg font-bold text-glass-green">{completedBackups.length}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-glass-pink" />
                <span className="text-sm font-medium">Failed</span>
              </div>
              <span className="text-lg font-bold text-glass-pink">{failedBackups.length}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create New Backup */}
      <Card className="glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Create New Backup</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Select value={selectedBackupType} onValueChange={setSelectedBackupType}>
              <SelectTrigger className="flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full">Full Backup</SelectItem>
                <SelectItem value="database">Database Only</SelectItem>
                <SelectItem value="media">Media Files Only</SelectItem>
                <SelectItem value="incremental">Incremental</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              onClick={createBackup} 
              disabled={isBackingUp}
              className="whitespace-nowrap"
            >
              {isBackingUp ? (
                <>
                  <div className="w-4 h-4 animate-spin rounded-full border border-current border-t-transparent mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Create Backup
                </>
              )}
            </Button>
          </div>
          
          {isBackingUp && (
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Backup Progress</span>
                <span>{backupProgress}%</span>
              </div>
              <Progress value={backupProgress} className="w-full" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Backups */}
      <Card className="glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Recent Backups</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {backups.slice(0, 4).map((backup) => (
              <div key={backup.id} className="flex items-center justify-between p-2 rounded border border-white/10">
                <div className="flex items-center gap-3">
                  {getTypeIcon(backup.type)}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{backup.name}</span>
                      <Badge className={`text-xs ${getStatusColor(backup.status)}`}>
                        {backup.status}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {backup.description} • {backup.size} • {backup.created.toLocaleString()}
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-1">
                  {backup.status === 'completed' && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => downloadBackup(backup)}
                      >
                        <Download className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => restoreFromBackup(backup.id)}
                        disabled={isRestoring}
                      >
                        <RotateCcw className="w-3 h-3" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Restore Points */}
      <Card className="glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Quick Restore Points</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {restorePoints.slice(0, 3).map((point) => (
              <div key={point.id} className="flex items-center justify-between p-2 rounded border border-white/10">
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-glass-blue" />
                  <div>
                    <div className="text-sm font-medium">{point.description}</div>
                    <div className="text-xs text-muted-foreground">
                      {point.timestamp.toLocaleString()} • {point.size} • {point.type}
                    </div>
                  </div>
                </div>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => restoreFromBackup(point.id)}
                  disabled={isRestoring}
                >
                  {isRestoring ? (
                    <div className="w-3 h-3 animate-spin rounded-full border border-current border-t-transparent" />
                  ) : (
                    <RotateCcw className="w-3 h-3" />
                  )}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {isRestoring && (
        <Alert>
          <RotateCcw className="h-4 w-4" />
          <AlertDescription>
            System restore in progress. Please do not refresh or close this page.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default BackupRecovery;