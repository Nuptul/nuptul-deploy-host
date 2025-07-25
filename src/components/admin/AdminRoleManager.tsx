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
      console.log(`Updating role for user ${userId} to ${newRole}`);

      // Use upsert to handle both insert and update cases
      const { data, error } = await supabase
        .from('user_roles')
        .upsert({
          user_id: userId,
          role: newRole,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id',
          ignoreDuplicates: false
        })
        .select()
        .single();

      if (error) {
        console.error('Upsert error:', error);
        throw error;
      }

      console.log('Role update successful:', data);
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
              className="min-h-[44px] px-3 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              onClick={() => handleRoleUpdate('guest')}
              disabled={loading || currentRole === 'guest'}
              style={{
                background: currentRole === 'guest'
                  ? 'linear-gradient(135deg, #34C759 0%, #30A14E 100%)'
                  : (loading || currentRole === 'guest')
                    ? 'rgba(0, 122, 255, 0.5)'
                    : 'linear-gradient(135deg, #007AFF 0%, #0051D5 100%)',
                backdropFilter: 'blur(20px) saturate(1.8)',
                WebkitBackdropFilter: 'blur(20px) saturate(1.8)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#FFFFFF',
                fontWeight: '600',
                borderRadius: '12px',
                boxShadow: currentRole === 'guest'
                  ? '0 8px 24px rgba(52, 199, 89, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.4)'
                  : '0 8px 24px rgba(0, 122, 255, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.4)',
                cursor: (loading || currentRole === 'guest') ? 'not-allowed' : 'pointer'
              }}
              onMouseEnter={(e) => {
                if (!(loading || currentRole === 'guest')) {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #0051D5 0%, #003D9D 100%)';
                  e.currentTarget.style.boxShadow = '0 12px 32px rgba(0, 122, 255, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.5)';
                }
              }}
              onMouseLeave={(e) => {
                if (!(loading || currentRole === 'guest')) {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #007AFF 0%, #0051D5 100%)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 122, 255, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.4)';
                }
              }}
            >
              {loading && currentRole !== 'guest' && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Set as Guest
            </Button>
            <Button
              className="min-h-[44px] px-3 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              onClick={() => handleRoleUpdate('couple')}
              disabled={loading || currentRole === 'couple'}
              style={{
                background: currentRole === 'couple'
                  ? 'linear-gradient(135deg, #34C759 0%, #30A14E 100%)'
                  : (loading || currentRole === 'couple')
                    ? 'rgba(0, 122, 255, 0.5)'
                    : 'linear-gradient(135deg, #007AFF 0%, #0051D5 100%)',
                backdropFilter: 'blur(20px) saturate(1.8)',
                WebkitBackdropFilter: 'blur(20px) saturate(1.8)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#FFFFFF',
                fontWeight: '600',
                borderRadius: '12px',
                boxShadow: currentRole === 'couple'
                  ? '0 8px 24px rgba(52, 199, 89, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.4)'
                  : '0 8px 24px rgba(0, 122, 255, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.4)',
                cursor: (loading || currentRole === 'couple') ? 'not-allowed' : 'pointer'
              }}
              onMouseEnter={(e) => {
                if (!(loading || currentRole === 'couple')) {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #0051D5 0%, #003D9D 100%)';
                  e.currentTarget.style.boxShadow = '0 12px 32px rgba(0, 122, 255, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.5)';
                }
              }}
              onMouseLeave={(e) => {
                if (!(loading || currentRole === 'couple')) {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #007AFF 0%, #0051D5 100%)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 122, 255, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.4)';
                }
              }}
            >
              {loading && currentRole !== 'couple' && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Set as Couple
            </Button>
            <Button
              className="min-h-[44px] px-3 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              onClick={() => handleRoleUpdate('admin')}
              disabled={loading || currentRole === 'admin'}
              style={{
                background: currentRole === 'admin'
                  ? 'linear-gradient(135deg, #34C759 0%, #30A14E 100%)'
                  : (loading || currentRole === 'admin')
                    ? 'rgba(0, 122, 255, 0.5)'
                    : 'linear-gradient(135deg, #007AFF 0%, #0051D5 100%)',
                backdropFilter: 'blur(20px) saturate(1.8)',
                WebkitBackdropFilter: 'blur(20px) saturate(1.8)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#FFFFFF',
                fontWeight: '600',
                borderRadius: '12px',
                boxShadow: currentRole === 'admin'
                  ? '0 8px 24px rgba(52, 199, 89, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.4)'
                  : '0 8px 24px rgba(0, 122, 255, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.4)',
                cursor: (loading || currentRole === 'admin') ? 'not-allowed' : 'pointer'
              }}
              onMouseEnter={(e) => {
                if (!(loading || currentRole === 'admin')) {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #0051D5 0%, #003D9D 100%)';
                  e.currentTarget.style.boxShadow = '0 12px 32px rgba(0, 122, 255, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.5)';
                }
              }}
              onMouseLeave={(e) => {
                if (!(loading || currentRole === 'admin')) {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #007AFF 0%, #0051D5 100%)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 122, 255, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.4)';
                }
              }}
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