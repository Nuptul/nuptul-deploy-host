import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ContentManagementSystem } from '@/components/admin/ContentManagementSystem';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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
          <Button 
            variant="ghost" 
            onClick={() => navigate('/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <h1 className="text-3xl font-bold text-wedding-navy mb-2">
            Content Management System
          </h1>
          <p className="text-muted-foreground">
            Manage all visual and text content across your wedding website
          </p>
        </div>

        <ContentManagementSystem />
      </div>
    </div>
  );
};

export default AdminContent;