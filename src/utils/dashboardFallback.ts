// Dashboard Fallback Data and Error Handling
// This provides fallback data when RLS policies block dashboard access

import type { AdminStats, User, RSVP, Photo } from '@/components/dashboard/types';

export const getFallbackAdminStats = (): AdminStats => ({
  totalUsers: 12,
  totalRSVPs: 8,
  pendingPhotos: 3,
  totalMessages: 25,
  approvedPhotos: 15,
  activeUsers: 6
});

export const getFallbackUsers = (): User[] => [
  {
    id: '1',
    email: 'guest1@example.com',
    first_name: 'John',
    last_name: 'Smith',
    created_at: '2024-01-15T10:00:00Z',
    role: 'guest'
  },
  {
    id: '2', 
    email: 'guest2@example.com',
    first_name: 'Sarah',
    last_name: 'Johnson',
    created_at: '2024-01-20T14:30:00Z',
    role: 'guest'
  }
];

export const getFallbackRSVPs = (): RSVP[] => [
  {
    id: '1',
    user_id: '1',
    event_id: 'main-event',
    status: 'attending',
    guest_count: 2,
    created_at: '2024-02-01T09:00:00Z',
    updated_at: '2024-02-01T09:00:00Z',
    profiles: {
      first_name: 'John',
      last_name: 'Smith',
      email: 'guest1@example.com'
    }
  },
  {
    id: '2',
    user_id: '2', 
    event_id: 'main-event',
    status: 'pending',
    guest_count: 1,
    created_at: '2024-02-05T16:20:00Z',
    updated_at: '2024-02-05T16:20:00Z',
    profiles: {
      first_name: 'Sarah',
      last_name: 'Johnson',
      email: 'guest2@example.com'
    }
  }
];

export const getFallbackPhotos = (): Photo[] => [
  {
    id: '1',
    user_id: '1',
    file_name: 'engagement-photo-1.jpg',
    file_path: '/photos/engagement-1.jpg',
    is_approved: true,
    created_at: '2024-03-01T12:00:00Z',
    profiles: {
      first_name: 'John',
      last_name: 'Smith'
    }
  }
];

export const isDashboardBlocked = (error: any): boolean => {
  // Check if error is due to RLS or permission issues
  if (!error) return false;
  
  const errorMessage = error.message?.toLowerCase() || '';
  const errorCode = error.code || '';
  
  return (
    errorMessage.includes('permission denied') ||
    errorMessage.includes('rls') ||
    errorMessage.includes('policy') ||
    errorCode === '42501' || // insufficient_privilege
    errorCode === '42502'    // insufficient_privilege for table
  );
};

export const getErrorMessage = (error: any): string => {
  if (isDashboardBlocked(error)) {
    return "Dashboard data blocked by security policies. Please run the security fix first.";
  }
  
  return error.message || "An unexpected error occurred";
};