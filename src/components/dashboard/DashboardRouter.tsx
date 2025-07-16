import React from 'react';
import { useAuth } from '@/hooks/useAuth';
// Import dashboard popup components
import AdminDashboardPopup from './AdminDashboardPopup';
import GuestDashboardPopup from './GuestDashboardPopup';

interface DashboardRouterProps {
  onClose?: () => void;
}

export const DashboardRouter: React.FC<DashboardRouterProps> = ({
  onClose
}) => {
  const { userRole, user, loading } = useAuth();
  
  
  

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2 text-gray-800">Loading dashboard...</span>
      </div>
    );
  }

  // Allow guest dashboard even without authentication
  // Admin dashboard requires authentication
  if (!user && userRole?.role === 'admin') {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="text-red-600 mb-2">Authentication required</div>
          <div className="text-sm text-muted-foreground">
            Please log in to access the admin dashboard
          </div>
        </div>
      </div>
    );
  }

  // Route based on user role and display mode
  let role = userRole?.role || 'guest';
  
  
  
  // Route based on role - only popup versions
  if (role === 'admin') {
    return <AdminDashboardPopup onClose={onClose} />;
  } else {
    return <GuestDashboardPopup onClose={onClose} />;
  }
};