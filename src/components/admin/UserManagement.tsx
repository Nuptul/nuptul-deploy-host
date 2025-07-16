import React, { useState } from 'react';
import GlassCard from '@/components/GlassCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Filter } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  created_at: string;
  role: 'guest' | 'admin' | 'couple';
}

interface UserManagementProps {
  users: User[];
  onRefresh: () => void;
}

const UserManagement: React.FC<UserManagementProps> = ({ users, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRoleChange = async (userId: string, newRole: 'guest' | 'admin' | 'couple') => {
    try {
      const { error } = await (supabase as any)
        .from('user_roles')
        .update({ role: newRole })
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "User role updated successfully",
      });

      onRefresh();
    } catch (error) {
      console.error('Error updating user role:', error);
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive"
      });
    }
  };

  return (
    <GlassCard className="p-4">
      <div className="flex items-center gap-4 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" size="sm">
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </Button>
      </div>
      
      <div className="space-y-3">
        {filteredUsers.map((user) => (
          <div key={user.id} className="flex items-center justify-between p-3 rounded-glass bg-secondary/30">
            <div className="flex-1">
              <div className="font-medium text-wedding-navy">
                {user.first_name} {user.last_name}
              </div>
              <div className="text-sm text-muted-foreground">{user.email}</div>
              <div className="text-xs text-muted-foreground">
                Joined {new Date(user.created_at).toLocaleDateString()}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                {user.role}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleRoleChange(user.id, user.role === 'admin' ? 'guest' : 'admin')}
              >
                {user.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
};

export default UserManagement;