import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

// Lazy load the ContentManagementSystem to catch any loading errors
const ContentManagementSystem = React.lazy(() => import('@/components/admin/ContentManagementSystem'));

const AdminContent: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  // Check if user is admin
  React.useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    // Verify admin role via Supabase only
    const checkAdminRole = async () => {
      const { data: userRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (!userRole || userRole.role !== 'admin') {
        toast({
          title: "Access Denied",
          description: "You don't have permission to access this page.",
          variant: "destructive",
        });
        navigate('/guest-dashboard');
      }
    };

    checkAdminRole();
  }, [user, navigate, toast]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-wedding-pearl via-white to-wedding-pearl/30">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-wedding-navy mb-2">
            Content Management System
          </h1>
          <p className="text-muted-foreground">
            Manage all visual and text content across your wedding website
          </p>
        </div>

        <div className="p-4 border rounded-lg bg-white">
          <h2 className="text-xl font-semibold mb-4">Advanced Content Management System</h2>
          <React.Suspense fallback={
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading enhanced CMS...</p>
              </div>
            </div>
          }>
            <ContentManagementSystem />
          </React.Suspense>
        </div>
      </div>
    </div>
  );
};

export default AdminContent;