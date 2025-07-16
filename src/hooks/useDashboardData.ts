import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { AdminStats, User, RSVP, Photo, DashboardData } from '@/components/dashboard/types';
import { 
  getFallbackAdminStats, 
  getFallbackUsers, 
  getFallbackRSVPs, 
  getFallbackPhotos,
  isDashboardBlocked,
  getErrorMessage 
} from '@/utils/dashboardFallback';

export const useDashboardData = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData>({
    stats: {
      totalUsers: 0,
      totalRSVPs: 0,
      pendingPhotos: 0,
      totalMessages: 0,
      approvedPhotos: 0,
      activeUsers: 0
    },
    users: [],
    rsvps: [],
    photos: []
  });
  const { toast } = useToast();

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch users with roles
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select(`
          id,
          user_id,
          email,
          first_name,
          last_name,
          created_at
        `);

      if (usersError) {
        console.error('Error fetching users:', usersError);
      }

      // Fetch RSVPs
      const { data: rsvpsData, error: rsvpsError } = await supabase
        .from('rsvps')
        .select('*');

      if (rsvpsError) {
        console.error('Error fetching RSVPs:', rsvpsError);
      }

      // Fetch photos (using correct table name)
      const { data: photosData, error: photosError } = await supabase
        .from('photo_gallery')
        .select('*');

      if (photosError) {
        console.error('Error fetching photos:', photosError);
      }

      // Fetch all profiles for joining
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, first_name, last_name, email');

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
      }

      // Fetch messages count (using correct table name)
      const { count: messagesCount, error: messagesError } = await supabase
        .from('chat_messages')
        .select('*', { count: 'exact', head: true });

      if (messagesError) {
        console.error('Error fetching messages count:', messagesError);
      }

      // Fetch user roles separately
      const { data: userRolesData, error: userRolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (userRolesError) {
        console.error('Error fetching user roles:', userRolesError);
      }

      // Format users data
      const formattedUsers: User[] = usersData?.map(user => ({
        id: user.user_id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        created_at: user.created_at,
        role: (userRolesData?.find(ur => ur.user_id === user.user_id)?.role || 'guest') as 'guest' | 'admin' | 'couple'
      })) || [];

      // Format RSVPs with profiles
      const formattedRSVPs: RSVP[] = rsvpsData?.map(rsvp => ({
        ...rsvp,
        status: rsvp.status as 'attending' | 'declined' | 'pending' | 'maybe',
        profiles: profilesData?.find(p => p.user_id === rsvp.user_id) || { 
          first_name: '', 
          last_name: '', 
          email: '' 
        }
      })) || [];
      
      // Format photos with profiles
      const formattedPhotos: Photo[] = photosData?.map(photo => ({
        ...photo,
        profiles: profilesData?.find(p => p.user_id === photo.user_id) || { 
          first_name: '', 
          last_name: '' 
        }
      })) || [];

      // Calculate stats
      const pendingPhotos = photosData?.filter(p => !p.is_approved).length || 0;
      const approvedPhotos = photosData?.filter(p => p.is_approved).length || 0;
      const totalRSVPs = rsvpsData?.reduce((sum, rsvp) => sum + (rsvp.guest_count || 1), 0) || 0;

      const stats: AdminStats = {
        totalUsers: usersData?.length || 0,
        totalRSVPs,
        pendingPhotos,
        totalMessages: messagesCount || 0,
        approvedPhotos,
        activeUsers: usersData?.filter(u => 
          new Date(u.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        ).length || 0
      };

      setData({
        stats,
        users: formattedUsers,
        rsvps: formattedRSVPs,
        photos: formattedPhotos
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      
      // Check if error is due to RLS/security policies
      if (isDashboardBlocked(error)) {
        // Use fallback data when blocked by security policies
        console.warn('Dashboard data blocked by RLS. Using fallback data.');
        
        setData({
          stats: getFallbackAdminStats(),
          users: getFallbackUsers(),
          rsvps: getFallbackRSVPs(),
          photos: getFallbackPhotos()
        });
        
        toast({
          title: "Limited Dashboard Access",
          description: "Using sample data. Run security fix for full access.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Error",
          description: getErrorMessage(error),
          variant: "destructive"
        });
      }
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return {
    ...data,
    loading,
    fetchDashboardData
  };
};