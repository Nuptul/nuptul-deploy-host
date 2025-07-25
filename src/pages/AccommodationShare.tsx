import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Home, Search, Plus, Users, MapPin, Calendar, DollarSign, Star, Shield, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdaptiveGlassCard from '@/components/AdaptiveGlassCard';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

interface AccommodationListing {
  id: string;
  hostName: string;
  hostAvatar?: string;
  roomType: 'entire_room' | 'shared_room' | 'couch' | 'floor_space';
  title: string;
  description: string;
  location: string;
  distanceFromVenue: number;
  pricePerNight: number;
  availableSpaces: number;
  totalSpaces: number;
  checkIn: string;
  checkOut: string;
  amenities: string[];
  rating: number;
  reviewCount: number;
  photos: string[];
  verified: boolean;
}

const AccommodationShare: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 200]);
  const [selectedRoomType, setSelectedRoomType] = useState<string>('all');

  // Mock data - would be fetched from Supabase
  const mockListings: AccommodationListing[] = [
    {
      id: '1',
      hostName: 'Sarah Johnson',
      roomType: 'entire_room',
      title: 'Cozy Queen Room in Newcastle',
      description: 'Spare room in my apartment, 10 min from venue. Includes breakfast and parking.',
      location: 'Newcastle East',
      distanceFromVenue: 2.5,
      pricePerNight: 80,
      availableSpaces: 1,
      totalSpaces: 1,
      checkIn: '2025-10-04',
      checkOut: '2025-10-06',
      amenities: ['WiFi', 'Parking', 'Breakfast', 'Air Conditioning'],
      rating: 4.8,
      reviewCount: 12,
      photos: ['/placeholder-room.jpg'],
      verified: true
    },
    {
      id: '2',
      hostName: 'Mike Chen',
      roomType: 'shared_room',
      title: 'Share Twin Room - Split Costs!',
      description: 'Looking for someone to share a twin room at the Ibis. Let\'s split the cost 50/50!',
      location: 'Newcastle CBD',
      distanceFromVenue: 3.2,
      pricePerNight: 45,
      availableSpaces: 1,
      totalSpaces: 2,
      checkIn: '2025-10-04',
      checkOut: '2025-10-06',
      amenities: ['WiFi', 'Gym Access', 'City Views'],
      rating: 5.0,
      reviewCount: 3,
      photos: ['/placeholder-hotel.jpg'],
      verified: true
    },
    {
      id: '3',
      hostName: 'Emma Wilson',
      roomType: 'couch',
      title: 'Comfy Couch Available',
      description: 'Happy to offer my living room couch. Great location, friendly cat included!',
      location: 'Cooks Hill',
      distanceFromVenue: 1.2,
      pricePerNight: 30,
      availableSpaces: 1,
      totalSpaces: 1,
      checkIn: '2025-10-04',
      checkOut: '2025-10-07',
      amenities: ['WiFi', 'Kitchen Access', 'Pet Friendly'],
      rating: 4.9,
      reviewCount: 7,
      photos: ['/placeholder-couch.jpg'],
      verified: false
    }
  ];

  const getRoomTypeIcon = (type: string) => {
    switch (type) {
      case 'entire_room': return '🛏️';
      case 'shared_room': return '👥';
      case 'couch': return '🛋️';
      case 'floor_space': return '🏠';
      default: return '🏠';
    }
  };

  const getRoomTypeLabel = (type: string) => {
    switch (type) {
      case 'entire_room': return 'Private Room';
      case 'shared_room': return 'Shared Room';
      case 'couch': return 'Couch/Sofa';
      case 'floor_space': return 'Floor Space';
      default: return 'All Types';
    }
  };

  const filteredListings = mockListings.filter(listing => {
    const matchesSearch = listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         listing.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         listing.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedRoomType === 'all' || listing.roomType === selectedRoomType;
    const matchesPrice = listing.pricePerNight >= priceRange[0] && listing.pricePerNight <= priceRange[1];
    
    return matchesSearch && matchesType && matchesPrice;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4 pt-20">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/accommodation')}
              className="rounded-full hover:bg-white/20"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                <Home className="w-8 h-8 text-blue-600" />
                Share Accommodation
              </h1>
              <p className="text-muted-foreground mt-1">
                Connect with other guests to share accommodation and save money
              </p>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <Tabs defaultValue="find" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-8">
            <TabsTrigger value="find" className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              Find Space
            </TabsTrigger>
            <TabsTrigger value="list" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              List Space
            </TabsTrigger>
            <TabsTrigger value="bookings" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              My Bookings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="find" className="space-y-6">
            {/* Search and Filters */}
            <AdaptiveGlassCard variant="informational" className="p-6">
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="Search by location, description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant={selectedRoomType === 'all' ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => setSelectedRoomType('all')}
                  >
                    All Types
                  </Badge>
                  {['entire_room', 'shared_room', 'couch', 'floor_space'].map(type => (
                    <Badge
                      key={type}
                      variant={selectedRoomType === type ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => setSelectedRoomType(type)}
                    >
                      {getRoomTypeIcon(type)} {getRoomTypeLabel(type)}
                    </Badge>
                  ))}
                </div>
              </div>
            </AdaptiveGlassCard>

            {/* Listings */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredListings.map((listing, index) => (
                <motion.div
                  key={listing.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <AdaptiveGlassCard variant="auto" className="overflow-hidden hover:shadow-xl transition-shadow">
                    {/* Image Placeholder */}
                    <div className="h-48 bg-gradient-to-br from-gray-200 to-gray-300 relative">
                      <div className="absolute inset-0 flex items-center justify-center text-6xl">
                        {getRoomTypeIcon(listing.roomType)}
                      </div>
                      {listing.verified && (
                        <div className="absolute top-3 right-3 bg-green-500 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                          <Shield className="w-3 h-3" />
                          Verified
                        </div>
                      )}
                    </div>

                    <div className="p-5 space-y-4">
                      {/* Host Info */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-semibold">
                            {listing.hostName.charAt(0)}
                          </div>
                          <span className="text-sm font-medium">{listing.hostName}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="text-sm font-medium">{listing.rating}</span>
                          <span className="text-xs text-gray-500">({listing.reviewCount})</span>
                        </div>
                      </div>

                      {/* Title and Description */}
                      <div>
                        <h3 className="font-semibold text-lg mb-1">{listing.title}</h3>
                        <p className="text-sm text-gray-600 line-clamp-2">{listing.description}</p>
                      </div>

                      {/* Location and Distance */}
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">{listing.location}</span>
                        </div>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-600">{listing.distanceFromVenue}km from venue</span>
                      </div>

                      {/* Availability */}
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                          <Calendar className="w-4 h-4 inline mr-1" />
                          Oct 4-6
                        </div>
                        <div className="text-sm">
                          <span className="font-medium text-green-600">
                            {listing.availableSpaces}/{listing.totalSpaces} available
                          </span>
                        </div>
                      </div>

                      {/* Price and Action */}
                      <div className="flex items-center justify-between pt-3 border-t">
                        <div>
                          <span className="text-2xl font-bold text-blue-600">
                            ${listing.pricePerNight}
                          </span>
                          <span className="text-sm text-gray-500">/night</span>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="rounded-full"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                          >
                            Request Booking
                          </Button>
                        </div>
                      </div>
                    </div>
                  </AdaptiveGlassCard>
                </motion.div>
              ))}
            </div>

            {filteredListings.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No accommodations found matching your criteria</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="list" className="space-y-6">
            <AdaptiveGlassCard variant="romantic" className="p-8 text-center">
              <Home className="w-16 h-16 text-blue-600 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold mb-2">List Your Space</h2>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Have extra space? Help fellow wedding guests by sharing your accommodation and split the costs.
              </p>
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
              >
                Create Listing
              </Button>
            </AdaptiveGlassCard>
          </TabsContent>

          <TabsContent value="bookings" className="space-y-6">
            <AdaptiveGlassCard variant="nature" className="p-8 text-center">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2 text-gray-700">No Bookings Yet</h2>
              <p className="text-gray-500">
                Your accommodation bookings will appear here once confirmed.
              </p>
            </AdaptiveGlassCard>
          </TabsContent>
        </Tabs>

        {/* Trust & Safety Notice */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12"
        >
          <AdaptiveGlassCard variant="informational" className="p-6">
            <div className="flex items-start gap-4">
              <Shield className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold mb-2">Trust & Safety</h3>
                <p className="text-sm text-gray-600">
                  All users are verified wedding guests. We recommend meeting in person or video calling before confirming bookings. 
                  Always use the platform's messaging system and payment processing for your protection.
                </p>
              </div>
            </div>
          </AdaptiveGlassCard>
        </motion.div>
      </div>
    </div>
  );
};

export default AccommodationShare;