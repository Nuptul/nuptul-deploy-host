export interface EnhancedRSVP {
  id: string;
  user_id: string;
  event_id: string;
  status: 'attending' | 'declined' | 'pending' | 'maybe';
  guest_count: number;
  created_at: string;
  updated_at: string;
  dietary_restrictions?: string;
  message?: string;
  plus_one_name?: string;
  table_assignment?: string;
  meal_preference?: string;
  song_request?: string;
  accommodation_needed?: boolean;
  transportation_needed?: boolean;
  profiles: {
    first_name?: string;
    last_name?: string;
    email: string;
    phone?: string;
  };
}

export interface RSVPEvent {
  id: string;
  title: string;
  event_date: string;
  venue_name?: string;
  address?: string;
  rsvp_deadline?: string;
  max_capacity?: number;
}

export interface SeatingTable {
  id: string;
  table_number: number;
  capacity: number;
  assigned_guests: number;
  special_requirements?: string;
}

export interface RSVPStats {
  total: number;
  attending: number;
  declined: number;
  pending: number;
  maybe: number;
  totalGuests: number;
  registeredUsers: number;
  unregisteredGuests: number;
  dietaryRestrictions: number;
  plusOnes: number;
  needAccommodation: number;
  needTransportation: number;
  responseRate: number;
  capacityUsed: number;
}

export interface RealTimeStats {
  lastUpdated: Date;
  totalCapacity: number;
  confirmedGuests: number;
}