import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { 
  Home, 
  Users, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Bed,
  Bath,
  Wifi,
  Car,
  Coffee,
  Dumbbell,
  Waves,
  Plus, 
  Search,
  Phone,
  Mail,
  MessageSquare,
  UserPlus,
  Info,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface AccommodationShare {
  id: string;
  host_id: string;
  property_type: 'hotel_room' | 'apartment' | 'house' | 'vacation_rental' | 'other';
  property_name: string;
  address: string;
  suburb?: string;
  distance_to_venue?: string;
  check_in_date: string;
  check_out_date: string;
  available_spots: number;
  total_spots: number;
  cost_per_person?: number;
  cost_split_type: 'equal' | 'per_night' | 'total' | 'flexible';
  amenities?: string[];
  room_type?: string;
  bed_configuration?: string;
  bathroom_type?: 'private' | 'shared' | 'ensuite';
  house_rules?: string;
  description?: string;
  photos?: string[];
  status: 'active' | 'full' | 'cancelled';
  created_at: string;
  host?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    avatar_url?: string;
  };
  guests?: Array<{
    id: string;
    guest_id: string;
    status: 'pending' | 'confirmed' | 'cancelled';
    spots_needed: number;
    user?: {
      first_name: string;
      last_name: string;
      avatar_url?: string;
    };
  }>;
}

const amenityIcons: Record<string, any> = {
  'WiFi': Wifi,
  'Parking': Car,
  'Breakfast included': Coffee,
  'Gym': Dumbbell,
  'Pool': Waves,
};

const AccommodationShare: React.FC = () => {
  const { user, profile } = useAuth();
  const [mode, setMode] = useState<'search' | 'offer'>('search');
  const [accommodations, setAccommodations] = useState<AccommodationShare[]>([]);
  const [myAccommodations, setMyAccommodations] = useState<AccommodationShare[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchFilters, setSearchFilters] = useState({
    location: '',
    checkIn: '',
    checkOut: '',
    propertyType: ''
  });

  // Form state for creating accommodation share
  const [accommodationForm, setAccommodationForm] = useState({
    property_type: 'hotel_room' as const,
    property_name: '',
    address: '',
    suburb: '',
    distance_to_venue: '',
    check_in_date: '',
    check_out_date: '',
    total_spots: 2,
    cost_per_person: '',
    cost_split_type: 'per_night' as const,
    amenities: [] as string[],
    room_type: '',
    bed_configuration: '',
    bathroom_type: 'private' as const,
    house_rules: '',
    description: ''
  });

  const availableAmenities = [
    'WiFi', 'Parking', 'Pool', 'Gym', 'Breakfast included', 
    'Air conditioning', 'Kitchen', 'Laundry', 'Pet friendly',
    'Balcony', 'Beach access', 'Hot tub'
  ];

  useEffect(() => {
    fetchAccommodations();
    if (user) {
      fetchMyAccommodations();
    }
  }, [user]);

  const fetchAccommodations = async () => {
    try {
      const { data, error } = await supabase
        .from('accommodation_shares')
        .select(`
          *,
          host:profiles!accommodation_shares_host_id_fkey (
            id,
            first_name,
            last_name,
            email,
            phone,
            avatar_url
          ),
          accommodation_guests (
            id,
            guest_id,
            status,
            spots_needed,
            user:profiles!accommodation_guests_guest_id_fkey (
              first_name,
              last_name,
              avatar_url
            )
          )
        `)
        .eq('status', 'active')
        .gte('check_out_date', new Date().toISOString().split('T')[0])
        .order('check_in_date', { ascending: true });

      if (error) throw error;
      
      // Use demo data if no accommodations exist
      const demoAccommodations: AccommodationShare[] = [
        {
          id: '1',
          host_id: '1',
          property_type: 'hotel_room',
          property_name: 'Crowne Plaza Hunter Valley',
          address: '430 Wine Country Dr, Lovedale NSW 2325',
          suburb: 'Lovedale',
          distance_to_venue: '15 minutes from venue',
          check_in_date: '2025-10-04',
          check_out_date: '2025-10-06',
          available_spots: 1,
          total_spots: 2,
          cost_per_person: 150,
          cost_split_type: 'per_night',
          amenities: ['WiFi', 'Parking', 'Pool', 'Breakfast included', 'Air conditioning'],
          room_type: 'Twin Room with Garden View',
          bed_configuration: '2 single beds',
          bathroom_type: 'private',
          house_rules: 'No smoking, Check-in after 3pm, Check-out before 11am',
          description: 'Sharing a beautiful twin room at Crowne Plaza. Perfect for single guests attending the wedding.',
          status: 'active',
          created_at: new Date().toISOString(),
          host: {
            id: '1',
            first_name: 'Emily',
            last_name: 'Chen',
            email: 'emily.c@example.com',
            phone: '+61 400 123 456',
            avatar_url: 'https://ui-avatars.com/api/?name=Emily+Chen&background=002147&color=fff'
          },
          guests: []
        },
        {
          id: '2',
          host_id: '2',
          property_type: 'apartment',
          property_name: 'Modern Apartment in Newcastle',
          address: '123 Hunter St, Newcastle NSW 2300',
          suburb: 'Newcastle CBD',
          distance_to_venue: '45 minutes from venue',
          check_in_date: '2025-10-03',
          check_out_date: '2025-10-07',
          available_spots: 2,
          total_spots: 3,
          cost_per_person: 80,
          cost_split_type: 'per_night',
          amenities: ['WiFi', 'Kitchen', 'Laundry', 'Parking', 'Air conditioning'],
          room_type: '2 Bedroom Apartment',
          bed_configuration: '1 queen bed, 2 single beds',
          bathroom_type: 'shared',
          description: 'Spacious apartment in the heart of Newcastle. Walking distance to restaurants and bars.',
          status: 'active',
          created_at: new Date().toISOString(),
          host: {
            id: '2',
            first_name: 'James',
            last_name: 'Wilson',
            email: 'jwilson@example.com',
            avatar_url: 'https://ui-avatars.com/api/?name=James+Wilson&background=002147&color=fff'
          },
          guests: [
            {
              id: '1',
              guest_id: '3',
              status: 'confirmed',
              spots_needed: 1,
              user: {
                first_name: 'Sophie',
                last_name: 'Taylor',
                avatar_url: 'https://ui-avatars.com/api/?name=Sophie+Taylor&background=002147&color=fff'
              }
            }
          ]
        }
      ];

      setAccommodations(data && data.length > 0 ? data : demoAccommodations);
    } catch (error) {
      console.error('Error fetching accommodations:', error);
      toast.error('Failed to load accommodation shares');
    } finally {
      setLoading(false);
    }
  };

  const fetchMyAccommodations = async () => {
    if (!user) return;

    try {
      // Fetch accommodations where user is host
      const { data: hostAccommodations } = await supabase
        .from('accommodation_shares')
        .select('*')
        .eq('host_id', user.id)
        .order('check_in_date', { ascending: true });

      // Fetch accommodations where user is guest
      const { data: guestAccommodations } = await supabase
        .from('accommodation_guests')
        .select(`
          accommodation_shares (*)
        `)
        .eq('guest_id', user.id)
        .not('status', 'eq', 'cancelled');

      const allMyAccommodations = [
        ...(hostAccommodations || []),
        ...(guestAccommodations?.map(g => g.accommodation_shares) || [])
      ];

      setMyAccommodations(allMyAccommodations);
    } catch (error) {
      console.error('Error fetching my accommodations:', error);
    }
  };

  const handleCreateAccommodation = async () => {
    if (!user) {
      toast.error('Please sign in to share accommodation');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('accommodation_shares')
        .insert({
          host_id: user.id,
          ...accommodationForm,
          available_spots: accommodationForm.total_spots,
          cost_per_person: accommodationForm.cost_per_person ? parseFloat(accommodationForm.cost_per_person) : null,
          status: 'active'
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Accommodation share created successfully!');
      setShowCreateForm(false);
      setAccommodationForm({
        property_type: 'hotel_room',
        property_name: '',
        address: '',
        suburb: '',
        distance_to_venue: '',
        check_in_date: '',
        check_out_date: '',
        total_spots: 2,
        cost_per_person: '',
        cost_split_type: 'per_night',
        amenities: [],
        room_type: '',
        bed_configuration: '',
        bathroom_type: 'private',
        house_rules: '',
        description: ''
      });
      fetchAccommodations();
    } catch (error) {
      console.error('Error creating accommodation:', error);
      toast.error('Failed to create accommodation share');
    }
  };

  const handleJoinAccommodation = async (accommodationId: string, spotsNeeded: number = 1) => {
    if (!user) {
      toast.error('Please sign in to join accommodation');
      return;
    }

    try {
      const { error } = await supabase
        .from('accommodation_guests')
        .insert({
          accommodation_id: accommodationId,
          guest_id: user.id,
          spots_needed: spotsNeeded,
          status: 'pending'
        });

      if (error) throw error;

      toast.success('Request sent to host!');
      fetchAccommodations();
    } catch (error) {
      console.error('Error joining accommodation:', error);
      toast.error('Failed to join accommodation');
    }
  };

  const filteredAccommodations = accommodations.filter(acc => {
    if (searchFilters.location && 
        !acc.address.toLowerCase().includes(searchFilters.location.toLowerCase()) &&
        !acc.suburb?.toLowerCase().includes(searchFilters.location.toLowerCase()) &&
        !acc.property_name.toLowerCase().includes(searchFilters.location.toLowerCase())) {
      return false;
    }
    if (searchFilters.propertyType && acc.property_type !== searchFilters.propertyType) {
      return false;
    }
    if (searchFilters.checkIn && acc.check_in_date > searchFilters.checkIn) {
      return false;
    }
    if (searchFilters.checkOut && acc.check_out_date < searchFilters.checkOut) {
      return false;
    }
    return true;
  });

  const renderAccommodationCard = (accommodation: AccommodationShare) => (
    <Card key={accommodation.id} className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h4 className="text-lg font-semibold">{accommodation.property_name}</h4>
            <p className="text-sm text-gray-500">{accommodation.room_type || accommodation.property_type.replace('_', ' ')}</p>
          </div>
          <Badge variant={accommodation.available_spots > 0 ? 'default' : 'secondary'}>
            {accommodation.available_spots} / {accommodation.total_spots} spots available
          </Badge>
        </div>

        <div className="space-y-3">
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm">{accommodation.address}</p>
              {accommodation.distance_to_venue && (
                <p className="text-xs text-gray-500">{accommodation.distance_to_venue}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-sm">
                {format(new Date(accommodation.check_in_date), 'MMM d')} - 
                {format(new Date(accommodation.check_out_date), 'MMM d')}
              </span>
            </div>
            {accommodation.cost_per_person && (
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-gray-400" />
                <span className="text-sm">
                  ${accommodation.cost_per_person}/{accommodation.cost_split_type === 'per_night' ? 'night' : 'total'}
                </span>
              </div>
            )}
          </div>

          {accommodation.bed_configuration && (
            <div className="flex items-center gap-2">
              <Bed className="w-4 h-4 text-gray-400" />
              <span className="text-sm">{accommodation.bed_configuration}</span>
            </div>
          )}

          {accommodation.bathroom_type && (
            <div className="flex items-center gap-2">
              <Bath className="w-4 h-4 text-gray-400" />
              <span className="text-sm">{accommodation.bathroom_type} bathroom</span>
            </div>
          )}

          {accommodation.amenities && accommodation.amenities.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {accommodation.amenities.slice(0, 4).map((amenity, idx) => {
                const Icon = amenityIcons[amenity] || Wifi;
                return (
                  <Badge key={idx} variant="outline" className="text-xs">
                    <Icon className="w-3 h-3 mr-1" />
                    {amenity}
                  </Badge>
                );
              })}
              {accommodation.amenities.length > 4 && (
                <Badge variant="outline" className="text-xs">
                  +{accommodation.amenities.length - 4} more
                </Badge>
              )}
            </div>
          )}

          {accommodation.description && (
            <p className="text-sm text-gray-600 line-clamp-2">{accommodation.description}</p>
          )}

          <div className="pt-3 border-t flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="w-8 h-8">
                <AvatarImage src={accommodation.host?.avatar_url} />
                <AvatarFallback>
                  {accommodation.host?.first_name?.[0]}{accommodation.host?.last_name?.[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">
                  {accommodation.host?.first_name} {accommodation.host?.last_name}
                </p>
                <p className="text-xs text-gray-500">Host</p>
              </div>
            </div>

            {accommodation.guests && accommodation.guests.length > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {accommodation.guests.slice(0, 3).map((guest, idx) => (
                    <Avatar key={idx} className="w-6 h-6 border-2 border-white">
                      <AvatarImage src={guest.user?.avatar_url} />
                      <AvatarFallback className="text-xs">
                        {guest.user?.first_name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                </div>
                {accommodation.guests.length > 3 && (
                  <span className="text-xs text-gray-500">
                    +{accommodation.guests.length - 3} guests
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          {accommodation.host_id === user?.id ? (
            <Badge variant="outline" className="text-xs">Your listing</Badge>
          ) : accommodation.available_spots > 0 ? (
            <>
              <Button
                size="sm"
                onClick={() => handleJoinAccommodation(accommodation.id)}
                disabled={accommodation.guests?.some(g => g.guest_id === user?.id)}
              >
                <UserPlus className="w-4 h-4 mr-1" />
                Request to Join
              </Button>
              <Button size="sm" variant="outline">
                <MessageSquare className="w-4 h-4 mr-1" />
                Contact Host
              </Button>
            </>
          ) : (
            <Badge variant="secondary">Fully Booked</Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="w-5 h-5" />
            Accommodation Sharing
          </CardTitle>
          <CardDescription>
            Share accommodation costs with other wedding guests to save money and make new friends
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup value={mode} onValueChange={(v) => setMode(v as 'search' | 'offer')}>
            <div className="flex gap-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="search" id="search" />
                <Label htmlFor="search">Find accommodation</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="offer" id="offer" />
                <Label htmlFor="offer">Share my accommodation</Label>
              </div>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Search/Filter Section */}
      {mode === 'search' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Search className="w-4 h-4" />
              Search Accommodations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="e.g., Hunter Valley"
                  value={searchFilters.location}
                  onChange={(e) => setSearchFilters({ ...searchFilters, location: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="checkIn">Check-in</Label>
                <Input
                  id="checkIn"
                  type="date"
                  value={searchFilters.checkIn}
                  onChange={(e) => setSearchFilters({ ...searchFilters, checkIn: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="checkOut">Check-out</Label>
                <Input
                  id="checkOut"
                  type="date"
                  value={searchFilters.checkOut}
                  onChange={(e) => setSearchFilters({ ...searchFilters, checkOut: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="type">Property Type</Label>
                <Select
                  value={searchFilters.propertyType}
                  onValueChange={(v) => setSearchFilters({ ...searchFilters, propertyType: v })}
                >
                  <SelectTrigger id="type">
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All types</SelectItem>
                    <SelectItem value="hotel_room">Hotel Room</SelectItem>
                    <SelectItem value="apartment">Apartment</SelectItem>
                    <SelectItem value="house">House</SelectItem>
                    <SelectItem value="vacation_rental">Vacation Rental</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Share Accommodation Form */}
      {mode === 'offer' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Share Your Accommodation
              </span>
              {!showCreateForm && (
                <Button onClick={() => setShowCreateForm(true)}>
                  Create Listing
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          {showCreateForm && (
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="propertyType">Property Type</Label>
                    <Select
                      value={accommodationForm.property_type}
                      onValueChange={(v) => setAccommodationForm({ ...accommodationForm, property_type: v as any })}
                    >
                      <SelectTrigger id="propertyType">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hotel_room">Hotel Room</SelectItem>
                        <SelectItem value="apartment">Apartment</SelectItem>
                        <SelectItem value="house">House</SelectItem>
                        <SelectItem value="vacation_rental">Vacation Rental</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="propertyName">Property Name</Label>
                    <Input
                      id="propertyName"
                      placeholder="e.g., Crowne Plaza Hunter Valley"
                      value={accommodationForm.property_name}
                      onChange={(e) => setAccommodationForm({ ...accommodationForm, property_name: e.target.value })}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      placeholder="Full address"
                      value={accommodationForm.address}
                      onChange={(e) => setAccommodationForm({ ...accommodationForm, address: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="suburb">Suburb/Area</Label>
                    <Input
                      id="suburb"
                      placeholder="e.g., Pokolbin"
                      value={accommodationForm.suburb}
                      onChange={(e) => setAccommodationForm({ ...accommodationForm, suburb: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="distance">Distance to Venue</Label>
                    <Input
                      id="distance"
                      placeholder="e.g., 15 minutes drive"
                      value={accommodationForm.distance_to_venue}
                      onChange={(e) => setAccommodationForm({ ...accommodationForm, distance_to_venue: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="checkInDate">Check-in Date</Label>
                    <Input
                      id="checkInDate"
                      type="date"
                      value={accommodationForm.check_in_date}
                      onChange={(e) => setAccommodationForm({ ...accommodationForm, check_in_date: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="checkOutDate">Check-out Date</Label>
                    <Input
                      id="checkOutDate"
                      type="date"
                      value={accommodationForm.check_out_date}
                      onChange={(e) => setAccommodationForm({ ...accommodationForm, check_out_date: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="spots">Available Spots</Label>
                    <Select
                      value={accommodationForm.total_spots.toString()}
                      onValueChange={(v) => setAccommodationForm({ ...accommodationForm, total_spots: parseInt(v) })}
                    >
                      <SelectTrigger id="spots">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                          <SelectItem key={n} value={n.toString()}>
                            {n} {n === 1 ? 'person' : 'people'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="cost">Cost per Person</Label>
                    <div className="flex gap-2">
                      <Input
                        id="cost"
                        type="number"
                        placeholder="Amount"
                        value={accommodationForm.cost_per_person}
                        onChange={(e) => setAccommodationForm({ ...accommodationForm, cost_per_person: e.target.value })}
                      />
                      <Select
                        value={accommodationForm.cost_split_type}
                        onValueChange={(v) => setAccommodationForm({ ...accommodationForm, cost_split_type: v as any })}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="per_night">Per Night</SelectItem>
                          <SelectItem value="total">Total</SelectItem>
                          <SelectItem value="equal">Equal Split</SelectItem>
                          <SelectItem value="flexible">Flexible</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="roomType">Room Type</Label>
                    <Input
                      id="roomType"
                      placeholder="e.g., Twin Room, 2 Bedroom Apt"
                      value={accommodationForm.room_type}
                      onChange={(e) => setAccommodationForm({ ...accommodationForm, room_type: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="beds">Bed Configuration</Label>
                    <Input
                      id="beds"
                      placeholder="e.g., 2 single beds"
                      value={accommodationForm.bed_configuration}
                      onChange={(e) => setAccommodationForm({ ...accommodationForm, bed_configuration: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="bathroom">Bathroom Type</Label>
                    <Select
                      value={accommodationForm.bathroom_type}
                      onValueChange={(v) => setAccommodationForm({ ...accommodationForm, bathroom_type: v as any })}
                    >
                      <SelectTrigger id="bathroom">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="private">Private</SelectItem>
                        <SelectItem value="shared">Shared</SelectItem>
                        <SelectItem value="ensuite">Ensuite</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Amenities</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                    {availableAmenities.map(amenity => (
                      <div key={amenity} className="flex items-center space-x-2">
                        <Checkbox
                          id={amenity}
                          checked={accommodationForm.amenities.includes(amenity)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setAccommodationForm({
                                ...accommodationForm,
                                amenities: [...accommodationForm.amenities, amenity]
                              });
                            } else {
                              setAccommodationForm({
                                ...accommodationForm,
                                amenities: accommodationForm.amenities.filter(a => a !== amenity)
                              });
                            }
                          }}
                        />
                        <Label htmlFor={amenity} className="text-sm font-normal">
                          {amenity}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="rules">House Rules</Label>
                  <Textarea
                    id="rules"
                    placeholder="e.g., No smoking, Quiet hours after 10pm"
                    value={accommodationForm.house_rules}
                    onChange={(e) => setAccommodationForm({ ...accommodationForm, house_rules: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your accommodation and what you're looking for in guests..."
                    value={accommodationForm.description}
                    onChange={(e) => setAccommodationForm({ ...accommodationForm, description: e.target.value })}
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleCreateAccommodation}>
                    Create Listing
                  </Button>
                  <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Accommodations List */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">
          {mode === 'search' ? 'Available Accommodations' : 'Your Listings'}
        </h3>
        {loading ? (
          <div className="text-center py-8">Loading accommodations...</div>
        ) : filteredAccommodations.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Home className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">
                {mode === 'search' 
                  ? 'No accommodations available matching your criteria' 
                  : 'You haven\'t shared any accommodations yet'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filteredAccommodations.map(renderAccommodationCard)}
          </div>
        )}
      </div>

      {/* My Accommodations Section */}
      {user && myAccommodations.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">My Accommodation Bookings</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {myAccommodations.map(renderAccommodationCard)}
          </div>
        </div>
      )}
    </div>
  );
};

export default AccommodationShare;