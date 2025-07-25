# Accommodation Sharing & Transportation Feature Plan

## Executive Summary

This document outlines the comprehensive plan for implementing accommodation sharing and carpooling features for wedding guests, including visual seat allocation similar to bus booking systems, social media integration, and self-management capabilities through the guest dashboard.

## 1. Accommodation Sharing Feature

### 1.1 Core Concept
Allow guests to:
- Share available rooms/beds in their accommodation
- Find and request space in other guests' accommodations
- Split costs transparently
- Coordinate check-in/check-out times

### 1.2 Database Schema (New Tables Needed)

```sql
-- Guest accommodation sharing listings
CREATE TABLE accommodation_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  accommodation_option_id UUID REFERENCES accommodation_options(id),
  
  -- Room details
  room_type VARCHAR(50), -- 'entire_room', 'shared_room', 'couch', 'floor_space'
  total_spaces INTEGER NOT NULL,
  available_spaces INTEGER NOT NULL,
  price_per_night DECIMAL(10,2),
  
  -- Dates
  check_in_date DATE NOT NULL,
  check_out_date DATE NOT NULL,
  
  -- Details
  description TEXT,
  amenities JSONB, -- wifi, parking, breakfast, etc.
  house_rules TEXT,
  
  -- Location
  exact_address TEXT, -- Only shown after booking confirmed
  area_description TEXT, -- Public description
  distance_to_venue_km DECIMAL(5,2),
  
  -- Media
  photos JSONB, -- Array of photo URLs
  
  -- Status
  status VARCHAR(20) DEFAULT 'active', -- active, paused, full
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Booking requests
CREATE TABLE accommodation_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  share_id UUID REFERENCES accommodation_shares(id) ON DELETE CASCADE,
  guest_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Booking details
  spaces_requested INTEGER NOT NULL,
  check_in_date DATE NOT NULL,
  check_out_date DATE NOT NULL,
  total_price DECIMAL(10,2),
  
  -- Communication
  guest_message TEXT,
  host_message TEXT,
  
  -- Status
  status VARCHAR(20) DEFAULT 'pending', -- pending, accepted, rejected, cancelled
  payment_status VARCHAR(20) DEFAULT 'unpaid', -- unpaid, paid, refunded
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews
CREATE TABLE accommodation_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES accommodation_bookings(id),
  reviewer_id UUID REFERENCES auth.users(id),
  reviewee_id UUID REFERENCES auth.users(id),
  
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  
  -- Review aspects
  cleanliness_rating INTEGER,
  communication_rating INTEGER,
  location_rating INTEGER,
  value_rating INTEGER,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 1.3 UI/UX Design

#### Guest Dashboard - Accommodation Section
```
┌─────────────────────────────────────────────────────────┐
│  🏠 Accommodation Sharing                               │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │
│  │ List Space  │  │ Find Space  │  │ My Bookings │   │
│  └─────────────┘  └─────────────┘  └─────────────┘   │
│                                                         │
│  Available Spaces Near Venue:                          │
│  ┌────────────────────────────────────────────────┐   │
│  │ 🏨 Sarah's Spare Room                          │   │
│  │ 📍 2.5km from venue | $80/night                │   │
│  │ 🛏️ Queen bed | ⭐ 4.8 (12 reviews)            │   │
│  │ [View Details] [Request Booking]               │   │
│  └────────────────────────────────────────────────┘   │
│                                                         │
│  ┌────────────────────────────────────────────────┐   │
│  │ 🏠 Mike's Couch                                │   │
│  │ 📍 1.2km from venue | $30/night                │   │
│  │ 🛋️ Comfy couch | ⭐ 5.0 (3 reviews)           │   │
│  │ [View Details] [Request Booking]               │   │
│  └────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### 1.4 Features

1. **Listing Creation**
   - Photo upload (up to 5 photos)
   - Amenities checklist
   - House rules editor
   - Pricing calculator
   - Availability calendar

2. **Search & Filter**
   - Distance from venue
   - Price range
   - Room type
   - Amenities
   - Guest ratings

3. **Booking Flow**
   - Request with message
   - Host approval/rejection
   - Payment integration (Stripe)
   - Booking confirmation
   - Contact details exchange

4. **Communication**
   - In-app messaging
   - Booking notifications
   - Reminder emails

5. **Trust & Safety**
   - Guest verification
   - Review system
   - Report inappropriate listings
   - Emergency contact info

## 2. Carpooling with Visual Seat Allocation

### 2.1 Core Concept
Transform the existing carpool system into a visual, interactive experience where drivers can:
- Create a "car" with visual seat layout
- Set departure times and locations
- Manage passenger requests
- Share costs (fuel, tolls)

### 2.2 Enhanced Database Schema

```sql
-- Enhanced carpool coordination with visual layout
ALTER TABLE carpool_coordination ADD COLUMN IF NOT EXISTS
  car_details JSONB, -- make, model, color, license_plate
  seat_layout VARCHAR(20), -- '2x2', '2x3', '3x3' etc.
  seat_configuration JSONB, -- Visual seat map with status
  cost_per_passenger DECIMAL(10,2),
  pickup_points JSONB, -- Array of possible pickup locations
  route_flexibility TEXT,
  music_preferences TEXT,
  smoking_allowed BOOLEAN DEFAULT FALSE,
  pets_allowed BOOLEAN DEFAULT FALSE,
  luggage_space VARCHAR(50); -- 'small', 'medium', 'large'

-- Visual seat assignments
CREATE TABLE carpool_seats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  carpool_id UUID REFERENCES carpool_coordination(id) ON DELETE CASCADE,
  seat_number INTEGER NOT NULL,
  seat_row INTEGER NOT NULL,
  seat_column INTEGER NOT NULL,
  
  -- Assignment
  passenger_id UUID REFERENCES auth.users(id),
  passenger_name VARCHAR(255),
  
  -- Status
  status VARCHAR(20) DEFAULT 'available', -- available, reserved, confirmed
  
  -- Preferences
  special_needs TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(carpool_id, seat_number)
);

-- Pickup coordination
CREATE TABLE carpool_pickups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  carpool_id UUID REFERENCES carpool_coordination(id),
  passenger_id UUID REFERENCES auth.users(id),
  
  pickup_location TEXT NOT NULL,
  pickup_time TIMESTAMPTZ NOT NULL,
  pickup_coordinates POINT,
  
  status VARCHAR(20) DEFAULT 'pending',
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2.3 Visual Seat Selection UI

```
┌─────────────────────────────────────────────────────────┐
│  🚗 John's Car - BMW 3 Series (Blue)                   │
├─────────────────────────────────────────────────────────┤
│  Departure: Oct 5, 2:00 PM from Downtown               │
│  Cost: $20 per person | 3 seats available              │
│                                                         │
│  Select Your Seat:                                      │
│                                                         │
│         Front                                           │
│     ┌─────┬─────┐                                     │
│     │  🚗 │  1  │  ← Passenger seat available         │
│     │Driver│ ✓  │                                      │
│     └─────┴─────┘                                     │
│                                                         │
│     ┌─────┬─────┬─────┐                               │
│     │  2  │  3  │  4  │  ← Back row                   │
│     │  ✓  │  X  │  ✓  │  (X = taken, ✓ = available) │
│     └─────┴─────┴─────┘                               │
│                                                         │
│  Selected Seat: #3                                      │
│  [Confirm Booking] [Contact Driver]                    │
└─────────────────────────────────────────────────────────┘
```

### 2.4 Carpooling Features

1. **Car Creation**
   - Visual seat layout builder
   - Custom configurations (2-7 seats)
   - Car details and photos
   - Route planning with stops

2. **Passenger Management**
   - Visual seat selection
   - Request approval system
   - Waitlist for full cars
   - Passenger profiles

3. **Cost Sharing**
   - Automatic calculation
   - Split tolls/parking
   - In-app payment
   - Receipt generation

4. **Coordination Tools**
   - Group chat for car
   - Live location sharing
   - Pickup reminders
   - Traffic updates

5. **Matching Algorithm**
   - Similar departure times
   - Compatible routes
   - Preference matching
   - Trust scores

## 3. Social Media Integration

### 3.1 Sharing Features

```typescript
// Share accommodation listing
const shareAccommodation = {
  title: "I have space available for the wedding!",
  description: "Offering a spare room near the venue",
  image: accommodation.photos[0],
  link: `${APP_URL}/accommodation/${accommodation.id}`,
  hashtags: ['WeddingAccommodation', 'SarahAndMike2025']
};

// Share carpool
const shareCarpool = {
  title: "Driving to the wedding - seats available!",
  description: `${available_seats} seats left in my ${car.make}`,
  image: generateCarVisual(seat_layout),
  link: `${APP_URL}/carpool/${carpool.id}`,
  hashtags: ['WeddingCarpool', 'SarahAndMike2025']
};
```

### 3.2 Social Features

1. **In-App Social Feed**
   - Accommodation offers
   - Carpool announcements
   - Travel tips
   - Local recommendations

2. **External Sharing**
   - Facebook groups
   - WhatsApp broadcast
   - Instagram stories
   - Twitter posts

3. **Social Matching**
   - Friend connections
   - Mutual friends indicator
   - Trust badges
   - Social verification

## 4. Implementation Plan

### Phase 1: Core Infrastructure (Week 1-2)
1. Database schema creation
2. API endpoints development
3. Basic UI components
4. Authentication/authorization

### Phase 2: Accommodation Sharing (Week 3-4)
1. Listing creation flow
2. Search and filter system
3. Booking management
4. Payment integration
5. Review system

### Phase 3: Visual Carpooling (Week 5-6)
1. Seat layout builder
2. Visual selection UI
3. Passenger management
4. Cost calculation
5. Coordination tools

### Phase 4: Social Integration (Week 7)
1. Social feed development
2. External sharing APIs
3. Social matching algorithm
4. Trust system

### Phase 5: Polish & Launch (Week 8)
1. Mobile optimization
2. Performance testing
3. Security audit
4. User documentation
5. Beta testing

## 5. Technical Architecture

### 5.1 Frontend Components

```typescript
// Key React components needed
- AccommodationDashboard
- AccommodationListing
- AccommodationSearch
- AccommodationBooking
- CarpoolDashboard
- VisualSeatSelector
- CarpoolCreator
- CarpoolSearch
- SocialShareModal
- TrustBadges
```

### 5.2 API Endpoints

```typescript
// Accommodation
POST   /api/accommodation/listings
GET    /api/accommodation/search
POST   /api/accommodation/bookings
PUT    /api/accommodation/bookings/:id
POST   /api/accommodation/reviews

// Carpooling
POST   /api/carpool/create
GET    /api/carpool/search
POST   /api/carpool/seats/book
PUT    /api/carpool/seats/:id
GET    /api/carpool/matches

// Social
POST   /api/social/share
GET    /api/social/connections
POST   /api/social/verify
```

### 5.3 Real-time Features

```typescript
// Supabase real-time subscriptions
- Seat availability updates
- Booking status changes
- New message notifications
- Location sharing
- Group chat messages
```

## 6. Security & Privacy

1. **Data Protection**
   - Encrypted personal info
   - Address revealed only after booking
   - Secure payment processing
   - GDPR compliance

2. **Trust & Safety**
   - Identity verification
   - Background checks (optional)
   - Emergency contacts
   - Reporting system

3. **Moderation**
   - Content review
   - Automated flagging
   - Admin oversight
   - Dispute resolution

## 7. Success Metrics

1. **Adoption**
   - % of guests using features
   - Listings created
   - Successful bookings
   - Carpool fill rate

2. **Satisfaction**
   - User ratings
   - Review scores
   - Support tickets
   - Feature requests

3. **Financial**
   - Cost savings for guests
   - Transaction volume
   - Platform fees
   - Dispute rate

## 8. Future Enhancements

1. **AI Matching**
   - Personality compatibility
   - Travel preference matching
   - Optimal route planning

2. **Gamification**
   - Eco-friendly badges
   - Super host status
   - Referral rewards

3. **Extended Features**
   - Airport shuttle coordination
   - Group activity planning
   - Local experience sharing
   - Wedding gift pooling