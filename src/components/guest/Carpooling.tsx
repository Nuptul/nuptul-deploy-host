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
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { 
  Car, 
  Users, 
  MapPin, 
  Calendar, 
  Clock, 
  MessageSquare, 
  Plus, 
  Search,
  Phone,
  Mail,
  Navigation,
  UserPlus,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface CarpoolRide {
  id: string;
  driver_id: string;
  departure_location: string;
  arrival_location: string;
  departure_date: string;
  departure_time: string;
  available_seats: number;
  total_seats: number;
  car_model?: string;
  car_color?: string;
  notes?: string;
  status: 'active' | 'full' | 'cancelled';
  created_at: string;
  driver?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    avatar_url?: string;
  };
  passengers?: Array<{
    id: string;
    user_id: string;
    status: 'pending' | 'confirmed' | 'cancelled';
    user?: {
      first_name: string;
      last_name: string;
      avatar_url?: string;
    };
  }>;
}

const Carpooling: React.FC = () => {
  const { user, profile } = useAuth();
  const [mode, setMode] = useState<'search' | 'offer'>('search');
  const [rides, setRides] = useState<CarpoolRide[]>([]);
  const [myRides, setMyRides] = useState<CarpoolRide[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchFilters, setSearchFilters] = useState({
    departure: '',
    arrival: '',
    date: ''
  });

  // Form state for creating a ride
  const [rideForm, setRideForm] = useState({
    departure_location: '',
    arrival_location: '',
    departure_date: '',
    departure_time: '',
    total_seats: 4,
    car_model: '',
    car_color: '',
    notes: ''
  });

  useEffect(() => {
    fetchRides();
    if (user) {
      fetchMyRides();
    }
  }, [user]);

  const fetchRides = async () => {
    try {
      const { data, error } = await supabase
        .from('carpool_rides')
        .select(`
          *,
          driver:profiles!carpool_rides_driver_id_fkey (
            id,
            first_name,
            last_name,
            email,
            phone,
            avatar_url
          ),
          carpool_passengers (
            id,
            user_id,
            status,
            user:profiles!carpool_passengers_user_id_fkey (
              first_name,
              last_name,
              avatar_url
            )
          )
        `)
        .eq('status', 'active')
        .gte('departure_date', new Date().toISOString().split('T')[0])
        .order('departure_date', { ascending: true });

      if (error) throw error;
      
      // Use demo data if no rides exist
      const demoRides: CarpoolRide[] = [
        {
          id: '1',
          driver_id: '1',
          departure_location: 'Sydney Airport',
          arrival_location: 'Wedding Venue - Ben Ean',
          departure_date: '2025-10-04',
          departure_time: '14:00',
          available_seats: 2,
          total_seats: 4,
          car_model: 'Toyota Camry',
          car_color: 'Silver',
          notes: 'Happy to make stops along the way. Non-smoking vehicle.',
          status: 'active',
          created_at: new Date().toISOString(),
          driver: {
            id: '1',
            first_name: 'Sarah',
            last_name: 'Johnson',
            email: 'sarah.j@example.com',
            phone: '+61 400 123 456',
            avatar_url: 'https://ui-avatars.com/api/?name=Sarah+Johnson&background=002147&color=fff'
          },
          passengers: []
        },
        {
          id: '2',
          driver_id: '2',
          departure_location: 'Newcastle CBD',
          arrival_location: 'Wedding Venue - Ben Ean',
          departure_date: '2025-10-05',
          departure_time: '09:00',
          available_seats: 3,
          total_seats: 5,
          car_model: 'Mazda CX-5',
          car_color: 'Blue',
          notes: 'Leaving from Civic Park. Can coordinate pickup.',
          status: 'active',
          created_at: new Date().toISOString(),
          driver: {
            id: '2',
            first_name: 'Michael',
            last_name: 'Chen',
            email: 'mchen@example.com',
            avatar_url: 'https://ui-avatars.com/api/?name=Michael+Chen&background=002147&color=fff'
          },
          passengers: [
            {
              id: '1',
              user_id: '3',
              status: 'confirmed',
              user: {
                first_name: 'Emma',
                last_name: 'Wilson',
                avatar_url: 'https://ui-avatars.com/api/?name=Emma+Wilson&background=002147&color=fff'
              }
            }
          ]
        }
      ];

      setRides(data && data.length > 0 ? data : demoRides);
    } catch (error) {
      console.error('Error fetching rides:', error);
      toast.error('Failed to load carpool rides');
    } finally {
      setLoading(false);
    }
  };

  const fetchMyRides = async () => {
    if (!user) return;

    try {
      // Fetch rides where user is driver
      const { data: driverRides } = await supabase
        .from('carpool_rides')
        .select('*')
        .eq('driver_id', user.id)
        .order('departure_date', { ascending: true });

      // Fetch rides where user is passenger
      const { data: passengerRides } = await supabase
        .from('carpool_passengers')
        .select(`
          carpool_rides (*)
        `)
        .eq('user_id', user.id)
        .not('status', 'eq', 'cancelled');

      const allMyRides = [
        ...(driverRides || []),
        ...(passengerRides?.map(p => p.carpool_rides) || [])
      ];

      setMyRides(allMyRides);
    } catch (error) {
      console.error('Error fetching my rides:', error);
    }
  };

  const handleCreateRide = async () => {
    if (!user) {
      toast.error('Please sign in to offer a ride');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('carpool_rides')
        .insert({
          driver_id: user.id,
          ...rideForm,
          available_seats: rideForm.total_seats,
          status: 'active'
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Ride offer created successfully!');
      setShowCreateForm(false);
      setRideForm({
        departure_location: '',
        arrival_location: '',
        departure_date: '',
        departure_time: '',
        total_seats: 4,
        car_model: '',
        car_color: '',
        notes: ''
      });
      fetchRides();
    } catch (error) {
      console.error('Error creating ride:', error);
      toast.error('Failed to create ride offer');
    }
  };

  const handleJoinRide = async (rideId: string) => {
    if (!user) {
      toast.error('Please sign in to join a ride');
      return;
    }

    try {
      const { error } = await supabase
        .from('carpool_passengers')
        .insert({
          ride_id: rideId,
          user_id: user.id,
          status: 'pending'
        });

      if (error) throw error;

      toast.success('Request sent to driver!');
      fetchRides();
    } catch (error) {
      console.error('Error joining ride:', error);
      toast.error('Failed to join ride');
    }
  };

  const filteredRides = rides.filter(ride => {
    if (searchFilters.departure && !ride.departure_location.toLowerCase().includes(searchFilters.departure.toLowerCase())) {
      return false;
    }
    if (searchFilters.arrival && !ride.arrival_location.toLowerCase().includes(searchFilters.arrival.toLowerCase())) {
      return false;
    }
    if (searchFilters.date && ride.departure_date !== searchFilters.date) {
      return false;
    }
    return true;
  });

  const renderRideCard = (ride: CarpoolRide) => (
    <Card key={ride.id} className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-4">
            <Avatar className="w-12 h-12">
              <AvatarImage src={ride.driver?.avatar_url} />
              <AvatarFallback>
                {ride.driver?.first_name?.[0]}{ride.driver?.last_name?.[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <h4 className="font-medium">
                {ride.driver?.first_name} {ride.driver?.last_name}
              </h4>
              <p className="text-sm text-gray-500">
                {ride.car_model} • {ride.car_color}
              </p>
            </div>
          </div>
          <Badge variant={ride.available_seats > 0 ? 'default' : 'secondary'}>
            {ride.available_seats} / {ride.total_seats} seats available
          </Badge>
        </div>

        <div className="space-y-3">
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium">From: {ride.departure_location}</p>
              <p className="text-sm font-medium">To: {ride.arrival_location}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-sm">
                {format(new Date(ride.departure_date), 'MMM d, yyyy')}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-sm">{ride.departure_time}</span>
            </div>
          </div>

          {ride.notes && (
            <div className="flex items-start gap-2">
              <MessageSquare className="w-4 h-4 text-gray-400 mt-0.5" />
              <p className="text-sm text-gray-600">{ride.notes}</p>
            </div>
          )}

          {ride.passengers && ride.passengers.length > 0 && (
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-400" />
              <div className="flex -space-x-2">
                {ride.passengers.slice(0, 3).map((passenger, idx) => (
                  <Avatar key={idx} className="w-6 h-6 border-2 border-white">
                    <AvatarImage src={passenger.user?.avatar_url} />
                    <AvatarFallback className="text-xs">
                      {passenger.user?.first_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {ride.passengers.length > 3 && (
                  <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs">
                    +{ride.passengers.length - 3}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 flex gap-2">
          {ride.driver_id === user?.id ? (
            <Badge variant="outline" className="text-xs">Your ride</Badge>
          ) : ride.available_seats > 0 ? (
            <>
              <Button
                size="sm"
                onClick={() => handleJoinRide(ride.id)}
                disabled={ride.passengers?.some(p => p.user_id === user?.id)}
              >
                <UserPlus className="w-4 h-4 mr-1" />
                Join Ride
              </Button>
              <Button size="sm" variant="outline">
                <MessageSquare className="w-4 h-4 mr-1" />
                Contact
              </Button>
            </>
          ) : (
            <Badge variant="secondary">Ride Full</Badge>
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
            <Car className="w-5 h-5" />
            Carpool & Ride Sharing
          </CardTitle>
          <CardDescription>
            Share rides with other wedding guests to save money and reduce environmental impact
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup value={mode} onValueChange={(v) => setMode(v as 'search' | 'offer')}>
            <div className="flex gap-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="search" id="search" />
                <Label htmlFor="search">Find a ride</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="offer" id="offer" />
                <Label htmlFor="offer">Offer a ride</Label>
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
              Search for Rides
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="departure">Departure Location</Label>
                <Input
                  id="departure"
                  placeholder="e.g., Sydney Airport"
                  value={searchFilters.departure}
                  onChange={(e) => setSearchFilters({ ...searchFilters, departure: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="arrival">Arrival Location</Label>
                <Input
                  id="arrival"
                  placeholder="e.g., Wedding Venue"
                  value={searchFilters.arrival}
                  onChange={(e) => setSearchFilters({ ...searchFilters, arrival: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={searchFilters.date}
                  onChange={(e) => setSearchFilters({ ...searchFilters, date: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Offer a Ride Form */}
      {mode === 'offer' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Offer a Ride
              </span>
              {!showCreateForm && (
                <Button onClick={() => setShowCreateForm(true)}>
                  Create Ride Offer
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          {showCreateForm && (
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="from">Departure Location</Label>
                    <Input
                      id="from"
                      placeholder="e.g., Sydney Airport"
                      value={rideForm.departure_location}
                      onChange={(e) => setRideForm({ ...rideForm, departure_location: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="to">Arrival Location</Label>
                    <Input
                      id="to"
                      placeholder="e.g., Wedding Venue"
                      value={rideForm.arrival_location}
                      onChange={(e) => setRideForm({ ...rideForm, arrival_location: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="date">Departure Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={rideForm.departure_date}
                      onChange={(e) => setRideForm({ ...rideForm, departure_date: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="time">Departure Time</Label>
                    <Input
                      id="time"
                      type="time"
                      value={rideForm.departure_time}
                      onChange={(e) => setRideForm({ ...rideForm, departure_time: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="seats">Available Seats</Label>
                    <Select
                      value={rideForm.total_seats.toString()}
                      onValueChange={(v) => setRideForm({ ...rideForm, total_seats: parseInt(v) })}
                    >
                      <SelectTrigger id="seats">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                          <SelectItem key={n} value={n.toString()}>
                            {n} {n === 1 ? 'seat' : 'seats'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="car">Car Model</Label>
                    <Input
                      id="car"
                      placeholder="e.g., Toyota Camry"
                      value={rideForm.car_model}
                      onChange={(e) => setRideForm({ ...rideForm, car_model: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="color">Car Color</Label>
                    <Input
                      id="color"
                      placeholder="e.g., Silver"
                      value={rideForm.car_color}
                      onChange={(e) => setRideForm({ ...rideForm, car_color: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any additional information for passengers..."
                    value={rideForm.notes}
                    onChange={(e) => setRideForm({ ...rideForm, notes: e.target.value })}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleCreateRide}>
                    Create Ride Offer
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

      {/* Rides List */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">
          {mode === 'search' ? 'Available Rides' : 'Your Rides'}
        </h3>
        {loading ? (
          <div className="text-center py-8">Loading rides...</div>
        ) : filteredRides.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Car className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">
                {mode === 'search' 
                  ? 'No rides available matching your criteria' 
                  : 'You haven\'t offered any rides yet'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filteredRides.map(renderRideCard)}
          </div>
        )}
      </div>

      {/* My Rides Section */}
      {user && myRides.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">My Upcoming Rides</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {myRides.map(renderRideCard)}
          </div>
        </div>
      )}
    </div>
  );
};

export default Carpooling;