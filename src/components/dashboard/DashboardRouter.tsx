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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        <span className="ml-2 text-white">Loading dashboard...</span>
      </div>
    );
  }

  // Debug logging to see what's happening
  console.log('DashboardRouter - user:', !!user, 'userRole:', userRole?.role, 'loading:', loading);

  // Allow guest dashboard even without authentication
  // Admin dashboard requires authentication - but this condition was wrong
  // We should never have a case where !user but userRole?.role === 'admin'
  // If user is not authenticated, they should get guest dashboard

  // Route based on user role and display mode
  let role = userRole?.role || 'guest';

  console.log('DashboardRouter - Final role decision:', role);

  // Route based on role - only popup versions
  if (role === 'admin') {
    console.log('DashboardRouter - Rendering AdminDashboardPopup');
    return <AdminDashboardPopup onClose={onClose} />;
  } else {
    console.log('DashboardRouter - Rendering GuestDashboardPopup');
    return <GuestDashboardPopup onClose={onClose} />;
  }
};