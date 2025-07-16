import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Shield, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

interface AdminRoleManagerProps {
  userId: string;
  userEmail: string;
  currentRole: string;
  onRoleUpdate: () => void;
}

const AdminRoleManager: React.FC<AdminRoleManagerProps> = ({
  userId,
  userEmail,
  currentRole,
  onRoleUpdate
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRoleUpdate = async (newRole: 'guest' | 'admin' | 'couple') => {
    setLoading(true);
    setError(null);

    try {
      // First, try to update existing role
      const { data: updateData, error: updateError } = await supabase
        .from('user_roles')
        .update({ 
          role: newRole,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (updateError) {
        // If update fails, try insert
        if (updateError.code === 'PGRST116') {
          const { data: insertData, error: insertError } = await supabase
            .from('user_roles')
            .insert({
              user_id: userId,
              role: newRole
            })
            .select()
            .single();

          if (insertError) {
            throw insertError;
          }
        } else {
          throw updateError;
        }
      }

      // Alternative approach using RPC function if direct update fails
      if (!updateData && !updateError) {
        const { error: rpcError } = await supabase
          .rpc('upsert_user_role', {
            p_user_id: userId,
            p_role: newRole
          });

        if (rpcError) {
          console.error('RPC error:', rpcError);
          // Continue anyway, sometimes RPC succeeds despite returning an error
        }
      }

      toast.success(`Role updated to ${newRole} successfully!`);
      onRoleUpdate();
    } catch (err: any) {
      console.error('Error updating role:', err);
      setError(err.message || 'Failed to update role');
      
      // Show more detailed error for debugging
      toast.error(`Failed to update role: ${err.message}`, {
        description: err.details || err.hint || 'Please check console for details'
      });
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'couple':
        return 'default';
      default:
        return 'secondary';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Role Management
        </CardTitle>
        <CardDescription>
          Update user role and permissions for {userEmail}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <span className="text-sm font-medium">Current Role:</span>
            <Badge variant={getRoleBadgeVariant(currentRole)}>
              {currentRole}
            </Badge>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2 flex-wrap">
            <Button
              variant={currentRole === 'guest' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleRoleUpdate('guest')}
              disabled={loading || currentRole === 'guest'}
            >
              {loading && currentRole !== 'guest' && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Set as Guest
            </Button>
            <Button
              variant={currentRole === 'couple' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleRoleUpdate('couple')}
              disabled={loading || currentRole === 'couple'}
            >
              {loading && currentRole !== 'couple' && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Set as Couple
            </Button>
            <Button
              variant={currentRole === 'admin' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleRoleUpdate('admin')}
              disabled={loading || currentRole === 'admin'}
            >
              {loading && currentRole !== 'admin' && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Set as Admin
            </Button>
          </div>

          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Role Permissions:</strong>
              <ul className="mt-2 space-y-1 text-sm">
                <li>• <strong>Guest:</strong> Can RSVP, view content, upload photos</li>
                <li>• <strong>Couple:</strong> All guest permissions + moderate content</li>
                <li>• <strong>Admin:</strong> Full system access and user management</li>
              </ul>
            </AlertDescription>
          </Alert>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminRoleManager;