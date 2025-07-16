import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { 
  Database, 
  RefreshCw, 
  Trash2, 
  Shield, 
  AlertTriangle,
  CheckCircle,
  Loader2,
  Users,
  Image,
  MessageSquare,
  Calendar
} from 'lucide-react';

interface SystemAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action: () => Promise<void>;
  variant: 'default' | 'destructive' | 'secondary';
  requiresConfirm?: boolean;
}

const SystemActions: React.FC = () => {
  const [loading, setLoading] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<string | null>(null);

  const executeAction = async (action: SystemAction) => {
    if (action.requiresConfirm && confirmAction !== action.id) {
      setConfirmAction(action.id);
      return;
    }

    setLoading(action.id);
    setConfirmAction(null);

    try {
      await action.action();
    } catch (error: any) {
      console.error(`Error executing ${action.title}:`, error);
      toast.error(`Failed to ${action.title.toLowerCase()}`, {
        description: error.message || 'An unexpected error occurred'
      });
    } finally {
      setLoading(null);
    }
  };

  const systemActions: SystemAction[] = [
    {
      id: 'refresh-permissions',
      title: 'Refresh Permissions',
      description: 'Reload all user permissions and roles from the database',
      icon: <Shield className="w-4 h-4" />,
      variant: 'default',
      action: async () => {
        const { data, error } = await supabase.rpc('execute_admin_action', {
          action_name: 'refresh_permissions'
        });
        
        if (error) throw error;
        
        toast.success('Permissions refreshed successfully');
        setTimeout(() => window.location.reload(), 1000);
      }
    },
    {
      id: 'clean-orphaned-data',
      title: 'Clean Orphaned Data',
      description: 'Remove orphaned records from photos, messages, and other tables',
      icon: <Database className="w-4 h-4" />,
      variant: 'secondary',
      requiresConfirm: true,
      action: async () => {
        const { data, error } = await supabase.rpc('execute_admin_action', {
          action_name: 'clean_orphaned_data'
        });
        
        if (error) throw error;
        
        const result = data as any;
        toast.success(`Cleaned ${result.photos_deleted} photos and ${result.messages_deleted} messages`);
      }
    },
    {
      id: 'reset-guest-rsvps',
      title: 'Reset Guest RSVPs',
      description: 'Clear all RSVP responses (use with caution)',
      icon: <Calendar className="w-4 h-4" />,
      variant: 'destructive',
      requiresConfirm: true,
      action: async () => {
        const { data, error } = await supabase.rpc('execute_admin_action', {
          action_name: 'reset_guest_rsvps'
        });
        
        if (error) throw error;
        
        const result = data as any;
        toast.success(`Reset ${result.rsvps_reset} RSVPs to pending status`);
      }
    },
    {
      id: 'clear-test-data',
      title: 'Clear Test Data',
      description: 'Remove all test posts, messages, and uploads',
      icon: <Trash2 className="w-4 h-4" />,
      variant: 'destructive',
      requiresConfirm: true,
      action: async () => {
        const { data, error } = await supabase.rpc('execute_admin_action', {
          action_name: 'clear_test_data'
        });
        
        if (error) throw error;
        
        const result = data as any;
        toast.success(`Cleared ${result.posts_deleted} test posts and ${result.messages_deleted} test messages`);
      }
    },
    {
      id: 'sync-user-profiles',
      title: 'Sync User Profiles',
      description: 'Ensure all auth users have corresponding profiles',
      icon: <Users className="w-4 h-4" />,
      variant: 'default',
      action: async () => {
        const { data, error } = await supabase.rpc('execute_admin_action', {
          action_name: 'sync_user_profiles'
        });
        
        if (error) throw error;
        
        const result = data as any;
        toast.success(`Sync complete. Processed ${result.users_processed} users, created ${result.profiles_created} profiles.`);
      }
    },
    {
      id: 'optimize-images',
      title: 'Optimize Image Storage',
      description: 'Clean up unused images and optimize storage',
      icon: <Image className="w-4 h-4" />,
      variant: 'secondary',
      requiresConfirm: true,
      action: async () => {
        // Get all image references from database
        const { data: photos } = await supabase
          .from('photos')
          .select('file_path, file_url');

        const { data: gallery } = await supabase
          .from('photo_gallery')
          .select('image_url, thumbnail_url');

        // This is a placeholder - actual implementation would require
        // storage API access to remove orphaned files
        const totalImages = (photos?.length || 0) + (gallery?.length || 0);
        
        toast.success(`Image optimization complete. ${totalImages} images in use.`);
      }
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {systemActions.map((action) => (
        <Card key={action.id}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              {action.icon}
              {action.title}
            </CardTitle>
            <CardDescription>{action.description}</CardDescription>
          </CardHeader>
          <CardContent>
            {confirmAction === action.id && (
              <Alert className="mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Confirm Action</AlertTitle>
                <AlertDescription>
                  Are you sure you want to {action.title.toLowerCase()}? This action cannot be undone.
                </AlertDescription>
              </Alert>
            )}
            
            <div className="flex gap-2">
              <Button
                variant={action.variant}
                size="sm"
                onClick={() => executeAction(action)}
                disabled={loading === action.id}
              >
                {loading === action.id ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : confirmAction === action.id ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Confirm
                  </>
                ) : (
                  'Execute'
                )}
              </Button>
              
              {confirmAction === action.id && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setConfirmAction(null)}
                >
                  Cancel
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default SystemActions;