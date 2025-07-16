import { createMockData, MockData } from '../__mocks__/supabase';

// Factory for app settings
export const appSettingsFactory = (overrides: Partial<any> = {}) => createMockData({
  setting_key: 'app_name',
  setting_value: 'Test Wedding',
  ...overrides,
});

// Factory for profiles
export const profileFactory = (overrides: Partial<any> = {}) => createMockData({
  user_id: 'test-user-id',
  first_name: 'John',
  last_name: 'Doe',
  display_name: 'John Doe',
  avatar_url: 'https://example.com/avatar.jpg',
  email: 'john@example.com',
  phone: '+1234567890',
  role: 'guest',
  ...overrides,
});

// Factory for wedding events
export const weddingEventFactory = (overrides: Partial<any> = {}) => createMockData({
  title: 'Wedding Ceremony',
  description: 'The main wedding ceremony',
  start_time: new Date('2025-10-05T15:00:00').toISOString(),
  end_time: new Date('2025-10-05T16:00:00').toISOString(),
  location: 'Main Chapel',
  is_active: true,
  ...overrides,
});

// Factory for guests
export const guestFactory = (overrides: Partial<any> = {}) => createMockData({
  first_name: 'Jane',
  last_name: 'Smith',
  email: 'jane@example.com',
  phone: '+0987654321',
  dietary_requirements: 'None',
  plus_one_allowed: true,
  invitation_sent: false,
  rsvp_status: 'pending',
  table_assignment: null,
  ...overrides,
});

// Factory for RSVPs
export const rsvpFactory = (overrides: Partial<any> = {}) => createMockData({
  guest_id: 'guest-id',
  event_id: 'event-id',
  attendance_status: 'attending',
  plus_one_attending: false,
  dietary_notes: '',
  special_requests: '',
  response_date: new Date().toISOString(),
  ...overrides,
});

// Factory for messages
export const messageFactory = (overrides: Partial<any> = {}) => createMockData({
  sender_id: 'sender-id',
  recipient_id: 'recipient-id',
  subject: 'Test Message',
  content: 'This is a test message',
  message_type: 'general',
  is_read: false,
  read_at: null,
  ...overrides,
});

// Factory for photos
export const photoFactory = (overrides: Partial<any> = {}) => createMockData({
  uploader_id: 'uploader-id',
  file_name: 'test-photo.jpg',
  file_url: 'https://example.com/photo.jpg',
  thumbnail_url: 'https://example.com/thumb.jpg',
  file_size: 1024000,
  mime_type: 'image/jpeg',
  caption: 'Beautiful wedding photo',
  is_approved: true,
  is_featured: false,
  ...overrides,
});

// Factory for chat messages
export const chatMessageFactory = (overrides: Partial<any> = {}) => createMockData({
  chat_id: 'chat-id',
  user_id: 'user-id',
  content: 'Hello world!',
  media_url: null,
  media_type: null,
  media_thumbnail: null,
  is_read: false,
  ...overrides,
});

// Factory for direct chats
export const directChatFactory = (overrides: Partial<any> = {}) => createMockData({
  participant_1: 'user-1',
  participant_2: 'user-2',
  last_message_at: new Date().toISOString(),
  is_active: true,
  ...overrides,
});

// Factory for venue images
export const venueImageFactory = (overrides: Partial<any> = {}) => createMockData({
  venue_id: 'venue-id',
  image_url: 'https://example.com/venue.jpg',
  alt_text: 'Beautiful venue',
  display_order: 1,
  is_primary: false,
  ...overrides,
});

// Factory for venue data
export const venueFactory = (overrides: Partial<any> = {}) => createMockData({
  name: 'Test Venue',
  address: '123 Wedding St',
  city: 'Wedding City',
  state: 'WC',
  postal_code: '12345',
  country: 'Wedding Country',
  phone: '+1234567890',
  email: 'venue@example.com',
  website: 'https://venue.example.com',
  description: 'A beautiful wedding venue',
  capacity: 200,
  ...overrides,
});

// Factory for accommodation categories
export const accommodationCategoryFactory = (overrides: Partial<any> = {}) => createMockData({
  name: 'Hotel',
  description: 'Hotel accommodations',
  display_order: 1,
  is_active: true,
  ...overrides,
});

// Factory for accommodation options
export const accommodationOptionFactory = (overrides: Partial<any> = {}) => createMockData({
  category_id: 'category-id',
  name: 'Grand Hotel',
  description: 'Luxury hotel near venue',
  address: '456 Hotel Ave',
  phone: '+1234567890',
  website: 'https://hotel.example.com',
  price_range: '$200-300/night',
  distance_from_venue: '2 miles',
  amenities: ['WiFi', 'Pool', 'Parking'],
  booking_url: 'https://booking.example.com',
  is_recommended: true,
  ...overrides,
});

// Factory for transportation options
export const transportationOptionFactory = (overrides: Partial<any> = {}) => createMockData({
  name: 'Shuttle Service',
  description: 'Complimentary shuttle from hotel to venue',
  departure_location: 'Grand Hotel',
  arrival_location: 'Wedding Venue',
  departure_time: new Date('2025-10-05T14:00:00').toISOString(),
  arrival_time: new Date('2025-10-05T14:30:00').toISOString(),
  capacity: 50,
  price: 0,
  booking_required: true,
  contact_info: 'shuttle@example.com',
  ...overrides,
});

// Factory for content blocks
export const contentBlockFactory = (overrides: Partial<any> = {}) => createMockData({
  block_key: 'welcome_message',
  title: 'Welcome',
  content: 'Welcome to our wedding website!',
  block_type: 'text',
  is_active: true,
  display_order: 1,
  ...overrides,
});

// Factory for stories
export const storyFactory = (overrides: Partial<any> = {}) => createMockData({
  user_id: 'user-id',
  content: 'Our love story begins...',
  media_url: 'https://example.com/story.jpg',
  media_type: 'image',
  visibility: 'public',
  expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
  ...overrides,
});

// Factory for user roles
export const userRoleFactory = (overrides: Partial<any> = {}) => createMockData({
  user_id: 'user-id',
  role_name: 'guest',
  assigned_by: 'admin-id',
  assigned_at: new Date().toISOString(),
  ...overrides,
});

// Factory for dietary requirements
export const dietaryRequirementFactory = (overrides: Partial<any> = {}) => createMockData({
  name: 'Vegetarian',
  description: 'No meat products',
  is_allergen: false,
  display_order: 1,
  is_active: true,
  ...overrides,
});

// Helper to create arrays of factory data
export const createFactoryArray = <T>(factory: (overrides?: Partial<any>) => T, count: number, overrides: Partial<any> = {}): T[] => {
  return Array.from({ length: count }, (_, index) => 
    factory({ ...overrides, id: `mock-id-${index}` })
  );
};

// Combined factory object for easy access
export const factories = {
  appSettings: appSettingsFactory,
  profile: profileFactory,
  weddingEvent: weddingEventFactory,
  guest: guestFactory,
  rsvp: rsvpFactory,
  message: messageFactory,
  photo: photoFactory,
  chatMessage: chatMessageFactory,
  directChat: directChatFactory,
  venueImage: venueImageFactory,
  venue: venueFactory,
  accommodationCategory: accommodationCategoryFactory,
  accommodationOption: accommodationOptionFactory,
  transportationOption: transportationOptionFactory,
  contentBlock: contentBlockFactory,
  story: storyFactory,
  userRole: userRoleFactory,
  dietaryRequirement: dietaryRequirementFactory,
};

export default factories;