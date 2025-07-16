import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Shield, Crown, RefreshCw } from 'lucide-react';
import GlassCard from '@/components/GlassCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import AdminRoleManager from '@/components/admin/AdminRoleManager';

interface UserWithRole {
  id: string;
  user_id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  display_name?: string;
  role: 'guest' | 'admin' | 'couple';
  created_at: string;
}

const AdminUserRoles: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [showAdvancedManager, setShowAdvancedManager] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          user_roles(role)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const usersWithRoles: UserWithRole[] = (data || []).map(user => ({
        ...user,
        role: (user.user_roles?.[0] as any)?.role || 'guest'
      }));

      setUsers(usersWithRoles);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: 'guest' | 'admin' | 'couple') => {
    setUpdating(userId);
    
    try {
      const { error } = await supabase
        .from('user_roles')
        .upsert({
          user_id: userId,
          role: newRole
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "User role updated successfully",
      });

      // Refresh users list
      fetchUsers();
    } catch (error: any) {
      console.error('Error updating user role:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update user role",
        variant: "destructive",
      });
    } finally {
      setUpdating(null);
    }
  };

  const getDisplayName = (user: UserWithRole) => {
    return user.display_name || 
           `${user.first_name || ''} ${user.last_name || ''}`.trim() || 
           user.email.split('@')[0];
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="w-4 h-4" />;
      case 'couple':
        return <Crown className="w-4 h-4" />;
      default:
        return <Users className="w-4 h-4" />;
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
    <div className="min-h-screen px-5 pt-12 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard/users')}
            className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-[#7a736b]" />
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-[#2d3f51]">User Role Management</h1>
            <p className="text-sm text-[#7a736b]">Manage user permissions and access levels</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchUsers}
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Role Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[
          { role: 'admin', count: users.filter(u => u.role === 'admin').length, icon: Shield },
          { role: 'couple', count: users.filter(u => u.role === 'couple').length, icon: Crown },
          { role: 'guest', count: users.filter(u => u.role === 'guest').length, icon: Users }
        ].map(({ role, count, icon: Icon }) => (
          <GlassCard key={role} className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Icon className="w-5 h-5 text-wedding-navy" />
              <span className="text-lg font-semibold text-[#2d3f51] capitalize">{role}s</span>
            </div>
            <div className="text-2xl font-bold text-wedding-navy">{count}</div>
          </GlassCard>
        ))}
      </div>

      {/* Users List */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-wedding-navy mx-auto"></div>
        </div>
      ) : (
        <GlassCard className="p-6">
          <div className="space-y-4">
            {users.map((user) => (
              <div key={user.id}>
                <div className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-background/30">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-wedding-navy text-white flex items-center justify-center text-sm font-semibold">
                      {getDisplayName(user).charAt(0).toUpperCase()}
                    </div>
                    
                    <div>
                      <div className="font-semibold text-[#2d3f51]">{getDisplayName(user)}</div>
                      <div className="text-sm text-[#7a736b]">{user.email}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <Badge variant={getRoleBadgeVariant(user.role)} className="flex items-center gap-1">
                      {getRoleIcon(user.role)}
                      <span className="capitalize">{user.role}</span>
                    </Badge>

                    <Select
                      value={user.role}
                      onValueChange={(newRole) => handleRoleChange(user.user_id, newRole as any)}
                      disabled={updating === user.user_id}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="guest">Guest</SelectItem>
                        <SelectItem value="couple">Couple</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAdvancedManager(
                        showAdvancedManager === user.user_id ? null : user.user_id
                      )}
                    >
                      <Shield className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {showAdvancedManager === user.user_id && (
                  <div className="mt-4">
                    <AdminRoleManager
                      userId={user.user_id}
                      userEmail={user.email}
                      currentRole={user.role}
                      onRoleUpdate={fetchUsers}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
};

export default AdminUserRoles;