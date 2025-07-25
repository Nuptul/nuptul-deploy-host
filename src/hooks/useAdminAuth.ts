import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { User } from '@supabase/supabase-js';

export interface AdminUser extends User {
  isAdmin: boolean;
  role: string | null;
}

export const useAdminAuth = () => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const { toast } = useToast();

  const checkAdminRole = async (userId: string): Promise<boolean> => {
    try {
      console.log('Checking admin role for user:', userId);

      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'admin')
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking admin role:', error);
        return false;
      }

      const isAdmin = !!data;
      console.log('Admin check result:', { userId, isAdmin, data });
      return isAdmin;
    } catch (error) {
      console.error('Error in checkAdminRole:', error);
      return false;
    }
  };

  const loadUser = async () => {
    try {
      setLoading(true);
      const { data: { user: authUser }, error } = await supabase.auth.getUser();
      
      if (error) {
        console.error('Auth error:', error);
        setUser(null);
        return;
      }

      if (!authUser) {
        setUser(null);
        return;
      }

      // Check if user has admin role
      const isAdmin = await checkAdminRole(authUser.id);
      
      setUser({
        ...authUser,
        isAdmin,
        role: isAdmin ? 'admin' : null
      });

    } catch (error) {
      console.error('Error loading user:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const signInAsAdmin = async (email: string, password: string) => {
    try {
      setChecking(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        toast({
          title: "Authentication Failed",
          description: error.message,
          variant: "destructive"
        });
        return false;
      }

      if (!data.user) {
        toast({
          title: "Authentication Failed",
          description: "No user found",
          variant: "destructive"
        });
        return false;
      }

      // Check admin role
      const isAdmin = await checkAdminRole(data.user.id);
      
      if (!isAdmin) {
        // Sign out if not admin
        await supabase.auth.signOut();
        toast({
          title: "Access Denied",
          description: "Admin privileges required",
          variant: "destructive"
        });
        return false;
      }

      setUser({
        ...data.user,
        isAdmin: true,
        role: 'admin'
      });

      toast({
        title: "Welcome Admin",
        description: "Successfully signed in with admin privileges",
      });

      return true;
    } catch (error) {
      console.error('Error signing in as admin:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
      return false;
    } finally {
      setChecking(false);
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      toast({
        title: "Signed Out",
        description: "You have been signed out successfully",
      });
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive"
      });
    }
  };

  // Create admin user for development (only if no admin exists)
  const createDevAdmin = async () => {
    try {
      // First check if any admin exists
      const { data: existingAdmin } = await (supabase as any)
        .from('user_roles')
        .select('user_id')
        .eq('role', 'admin')
        .limit(1);

      if (existingAdmin && existingAdmin.length > 0) {
        
        return;
      }

      // Create admin user via auth
      const { data, error } = await supabase.auth.signUp({
        email: 'admin@wedding.local',
        password: 'admin123',
        options: {
          data: {
            first_name: 'Admin',
            last_name: 'User'
          }
        }
      });

      if (error) {
        console.error('Error creating admin user:', error);
        return;
      }

      if (data.user) {
        // Add admin role
        const { error: roleError } = await (supabase as any)
          .from('user_roles')
          .insert({
            user_id: data.user.id,
            role: 'admin'
          });

        if (roleError) {
          console.error('Error adding admin role:', roleError);
        } else {
          
        }
      }
    } catch (error) {
      console.error('Error in createDevAdmin:', error);
    }
  };

  useEffect(() => {
    loadUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const isAdmin = await checkAdminRole(session.user.id);
          setUser({
            ...session.user,
            isAdmin,
            role: isAdmin ? 'admin' : null
          });
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return {
    user,
    loading,
    checking,
    signInAsAdmin,
    signOut,
    createDevAdmin,
    refreshUser: loadUser
  };
};