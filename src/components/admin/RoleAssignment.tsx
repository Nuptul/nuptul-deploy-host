import React from 'react';
import { Shield, Users, Heart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface RoleAssignmentProps {
  userId: string;
  currentRole: 'guest' | 'admin' | 'couple';
  userEmail: string;
  onRoleUpdate?: (newRole: 'guest' | 'admin' | 'couple') => void;
}

const RoleAssignment: React.FC<RoleAssignmentProps> = ({ 
  userId, 
  currentRole, 
  userEmail,
  onRoleUpdate 
}) => {
  const [isUpdating, setIsUpdating] = React.useState(false);

  const updateRole = async (newRole: 'guest' | 'admin' | 'couple') => {
    if (newRole === currentRole) return;

    setIsUpdating(true);
    try {
      console.log(`Updating role for user ${userId} (${userEmail}) to ${newRole}`);

      // Update user_roles table with better error handling
      const { data, error: roleError } = await supabase
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

      if (roleError) {
        console.error('Role update error:', roleError);
        throw roleError;
      }

      console.log('Role update successful:', data);
      toast.success(`Role updated to ${newRole} for ${userEmail}`);

      if (onRoleUpdate) {
        onRoleUpdate(newRole);
      }
    } catch (error: any) {
      console.error('Error updating role:', error);
      toast.error(`Failed to update user role: ${error.message || 'Unknown error'}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const roleOptions = [
    { 
      value: 'guest' as const, 
      label: 'Guest', 
      icon: Users, 
      color: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
      activeColor: 'bg-gray-600 text-white'
    },
    { 
      value: 'admin' as const, 
      label: 'Admin', 
      icon: Shield, 
      color: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
      activeColor: 'bg-blue-600 text-white'
    },
    { 
      value: 'couple' as const, 
      label: 'Couple', 
      icon: Heart, 
      color: 'bg-pink-100 text-pink-700 hover:bg-pink-200',
      activeColor: 'bg-pink-600 text-white'
    }
  ];

  return (
    <div className="flex items-center gap-1 bg-white/10 rounded-lg p-1">
      {roleOptions.map((option) => {
        const Icon = option.icon;
        const isActive = currentRole === option.value;
        
        return (
          <button
            key={option.value}
            onClick={() => updateRole(option.value)}
            disabled={isUpdating}
            className={`
              flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium
              transition-all duration-200 
              ${isActive ? option.activeColor : option.color}
              ${isUpdating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
            title={`Set role to ${option.label}`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default RoleAssignment;