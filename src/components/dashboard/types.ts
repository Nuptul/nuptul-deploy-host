export interface AdminStats {
  totalUsers: number;
  totalRSVPs: number;
  pendingPhotos: number;
  totalMessages: number;
  approvedPhotos: number;
  activeUsers: number;
}

export interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  created_at: string;
  role: 'guest' | 'admin' | 'couple';
}

export interface RSVP {
  id: string;
  user_id: string;
  event_id: string;
  status: 'attending' | 'declined' | 'pending' | 'maybe';
  guest_count: number;
  created_at: string;
  updated_at: string;
  profiles: {
    first_name?: string;
    last_name?: string;
    email: string;
  };
}

export interface Photo {
  id: string;
  title?: string;
  file_url: string;
  is_approved: boolean;
  created_at: string;
  profiles: {
    first_name?: string;
    last_name?: string;
  };
}

export interface DashboardData {
  stats: AdminStats;
  users: User[];
  rsvps: RSVP[];
  photos: Photo[];
}