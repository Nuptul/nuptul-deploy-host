import React, { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export const DashboardRedirect: React.FC = () => {
  const { userRole, user, loading } = useAuth();
  const navigate = useNavigate();
  
  // Wait for auth to finish loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-wedding-navy"></div>
      </div>
    );
  }

  // If no user, redirect to auth
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  useEffect(() => {
    // Only proceed if user is loaded and we have role data (or confirmed no role)
    if (!loading && user) {
      // For guests (users without admin role), redirect to guest dashboard
      if (!userRole || userRole?.role !== 'admin') {
        navigate('/guest-dashboard', { replace: true });
      }
    }
  }, [userRole, user, loading, navigate]);

  // Redirect admin users to admin dashboard
  if (userRole?.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // Redirect regular users to guest dashboard
  return <Navigate to="/guest-dashboard" replace />;
};

export default DashboardRedirect;