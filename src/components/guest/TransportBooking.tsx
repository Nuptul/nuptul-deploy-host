import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Bus, 
  Car, 
  Users, 
  Clock, 
  MapPin, 
  Phone, 
  AlertTriangle, 
  CheckCircle,
  Plus,
  Calendar,
  Star,
  ArrowRight,
  UserPlus,
  Trash2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

interface TransportationOption {
  id: string;
  method_name: string;
  description?: string;
  pickup_locations?: string[];
  cost_info?: string;
  booking_required: boolean;
  featured: boolean;
  schedules?: TransportationSchedule[];
}

interface TransportationSchedule {
  id: string;
  departure_time: string;
  departure_location: string;
  max_capacity?: number;
  current_bookings: number;
  is_active: boolean;
}

interface CarpoolOffering {
  id: string;
  driver_user_id: string;
  departure_location: string;
  departure_time: string;
  departure_date: string;
  available_seats: number;
  booked_seats: number;
  vehicle_description?: string;
  driver_phone?: string;
  special_notes?: string;
  driver_profile?: {
    first_name?: string;
    last_name?: string;
  };
}

interface MyTransportStatus {
  transport_method?: string;
  status: string;
  my_bookings?: any[];
  my_carpool_offering?: CarpoolOffering;
  my_carpool_booking?: any;
}

const TransportBooking: React.FC = () => {
  const { user } = useAuth();
  const [transportOptions, setTransportOptions] = useState<TransportationOption[]>([]);
  const [carpoolOfferings, setCarpoolOfferings] = useState<CarpoolOffering[]>([]);
  const [myStatus, setMyStatus] = useState<MyTransportStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCarpoolForm, setShowCarpoolForm] = useState(false);
  const [carpoolFormData, setCarpoolFormData] = useState({
    departure_location: '',
    departure_time: '15:00',
    departure_date: '2025-10-05',
    available_seats: 3,
    vehicle_description: '',
    driver_phone: '',
    special_notes: '',
    return_offered: true,
    return_time: '23:00'
  });

  useEffect(() => {
    if (user) {
      loadTransportData();
    }
  }, [user]);

  const loadTransportData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Load available transport options
      const { data: transportData, error: transportError } = await (supabase as any)
        .from('transportation_options')
        .select(`
          *,
          schedules:transportation_schedules(*)
        `)
        .eq('is_active', true)
        .order('display_order');

      if (transportError) throw transportError;

      // Load available carpool offerings (excluding user's own)
      const { data: carpoolData, error: carpoolError } = await (supabase as any)
        .from('carpool_coordination')
        .select(`
          *,
          driver_profile:profiles(first_name, last_name)
        `)
        .eq('status', 'active')
        .neq('user_id', user.id)
        .order('departure_time');

      if (carpoolError) throw carpoolError;

      // Load user's transport status and bookings
      const { data: statusData, error: statusError } = await (supabase as any)
        .from('guest_transport_status')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      // Load user's bookings
      const { data: bookingsData, error: bookingsError } = await (supabase as any)
        .from('bus_seat_bookings')
        .select('*')
        .eq('user_id', user.id);

      // Load user's carpool offering
      const { data: myCarpoolData, error: myCarpoolError } = await (supabase as any)
        .from('carpool_coordination')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle();

      // Load user's carpool booking
      const { data: myCarpoolBookingData, error: myCarpoolBookingError } = await (supabase as any)
        .from('carpool_participants')
        .select(`
          *,
          carpool:carpool_coordination(
            *,
            driver_profile:profiles(first_name, last_name)
          )
        `)
        .eq('participant_user_id', user.id)
        .eq('status', 'confirmed')
        .maybeSingle();

      setTransportOptions(transportData || []);
      setCarpoolOfferings(carpoolData || []);
      setMyStatus({
        ...statusData,
        my_bookings: bookingsData || [],
        my_carpool_offering: myCarpoolData,
        my_carpool_booking: myCarpoolBookingData
      });

    } catch (error) {
      console.error('Error loading transport data:', error);
      toast.error('Failed to load transport options');
    } finally {
      setLoading(false);
    }
  };

  const bookBusSeat = async (scheduleId: string, transportationId: string) => {
    if (!user) return;

    try {
      const { error } = await (supabase as any)
        .from('bus_seat_bookings')
        .insert([{
          user_id: user.id,
          transportation_schedule_id: scheduleId,
          passenger_name: user.email || 'Guest'
        }]);

      if (error) throw error;

      toast.success('Bus seat booked successfully!');
      loadTransportData();
    } catch (error) {
      console.error('Error booking bus seat:', error);
      toast.error('Failed to book bus seat');
    }
  };

  const joinCarpool = async (carpoolId: string) => {
    if (!user) return;

    try {
      const { error } = await (supabase as any)
        .from('carpool_participants')
        .insert([{
          carpool_id: carpoolId,
          participant_user_id: user.id,
          passenger_name: user.email || 'Guest'
        }]);

      if (error) throw error;

      toast.success('Carpool booking confirmed!');
      loadTransportData();
    } catch (error) {
      console.error('Error joining carpool:', error);
      toast.error('Failed to join carpool');
    }
  };

  const createCarpoolOffering = async () => {
    if (!user) return;

    try {
      const { error } = await (supabase as any)
        .from('carpool_coordination')
        .insert([{
          user_id: user.id,
          coordination_type: 'driver',
          departure_location: carpoolFormData.departure_location,
          departure_time: `${carpoolFormData.departure_date} ${carpoolFormData.departure_time}`,
          available_seats: carpoolFormData.available_seats,
          contact_phone: carpoolFormData.driver_phone,
          special_requirements: carpoolFormData.special_notes
        }]);

      if (error) throw error;

      toast.success('Carpool offering created! Other guests can now book with you.');
      setShowCarpoolForm(false);
      setCarpoolFormData({
        departure_location: '',
        departure_time: '15:00',
        departure_date: '2025-10-05',
        available_seats: 3,
        vehicle_description: '',
        driver_phone: '',
        special_notes: '',
        return_offered: true,
        return_time: '23:00'
      });
      loadTransportData();
    } catch (error) {
      console.error('Error creating carpool offering:', error);
      toast.error('Failed to create carpool offering');
    }
  };

  const markTransportArranged = async (method: string) => {
    if (!user) return;

    try {
      const { error } = await (supabase as any)
        .from('guest_transport_status')
        .upsert({
          user_id: user.id,
          transport_method: method,
          status: method === 'staying_nearby' ? 'staying_nearby' : 'self_arranged'
        });

      if (error) throw error;

      toast.success('Transport status updated!');
      loadTransportData();
    } catch (error) {
      console.error('Error updating transport status:', error);
      toast.error('Failed to update transport status');
    }
  };

  const cancelBooking = async (bookingId: string, bookingType: string) => {
    if (!user) return;

    try {
      if (bookingType === 'transportation') {
        await (supabase as any)
          .from('bus_seat_bookings')
          .delete()
          .eq('id', bookingId);
      } else if (bookingType === 'carpool') {
        await (supabase as any)
          .from('carpool_participants')
          .delete()
          .eq('id', bookingId);
      }

      toast.success('Booking cancelled successfully');
      loadTransportData();
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast.error('Failed to cancel booking');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-wedding-navy border-t-transparent" />
      </div>
    );
  }

  const hasArrangedTransport = myStatus && ['booked', 'driving', 'carpooling', 'self_arranged', 'staying_nearby'].includes(myStatus.status);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Wedding Transportation</h2>
        <p className="text-muted-foreground">
          Book your transport to Ben Ean Pokolbin or coordinate carpools with other guests
        </p>
      </div>

      {/* Current Status */}
      {myStatus && (
        <Card className={`border-2 ${hasArrangedTransport ? 'border-green-200 bg-green-50' : 'border-orange-200 bg-orange-50'}`}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              {hasArrangedTransport ? (
                <CheckCircle className="w-6 h-6 text-green-500" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-orange-500" />
              )}
              <div>
                <h3 className="font-semibold">
                  {hasArrangedTransport ? 'Transport Arranged' : 'Transport Not Arranged'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {hasArrangedTransport 
                    ? `You're all set with ${myStatus.transport_method?.replace('_', ' ') || myStatus.status}`
                    : 'Please arrange your transportation to the wedding venue'
                  }
                </p>
              </div>
            </div>

            {/* Show current bookings */}
            {myStatus.my_bookings && myStatus.my_bookings.length > 0 && (
              <div className="mt-3 pt-3 border-t">
                <h4 className="font-medium mb-2">Your Bookings</h4>
                {myStatus.my_bookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-2 bg-white rounded border">
                    <span>Bus seat - {booking.guest_count} guest{booking.guest_count !== 1 ? 's' : ''}</span>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => cancelBooking(booking.id, 'transportation')}
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Cancel
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Show carpool offering */}
            {myStatus.my_carpool_offering && (
              <div className="mt-3 pt-3 border-t">
                <h4 className="font-medium mb-2">Your Carpool Offering</h4>
                <div className="p-2 bg-white rounded border">
                  <div className="text-sm">
                    <strong>From:</strong> {myStatus.my_carpool_offering.departure_location}<br />
                    <strong>Time:</strong> {myStatus.my_carpool_offering.departure_time}<br />
                    <strong>Seats:</strong> {myStatus.my_carpool_offering.booked_seats}/{myStatus.my_carpool_offering.available_seats} booked
                  </div>
                </div>
              </div>
            )}

            {/* Show carpool booking */}
            {myStatus.my_carpool_booking && (
              <div className="mt-3 pt-3 border-t">
                <h4 className="font-medium mb-2">Your Carpool Booking</h4>
                <div className="flex items-center justify-between p-2 bg-white rounded border">
                  <div className="text-sm">
                    <strong>Driver:</strong> {myStatus.my_carpool_booking.carpool?.driver_profile?.first_name} {myStatus.my_carpool_booking.carpool?.driver_profile?.last_name}<br />
                    <strong>From:</strong> {myStatus.my_carpool_booking.carpool?.departure_location}
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => cancelBooking(myStatus.my_carpool_booking.id, 'carpool')}
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {!hasArrangedTransport && (
        <>
          {/* Coach/Bus Transport Options */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bus className="w-5 h-5" />
                Coach Transport
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Professional coach service with pickup from Newcastle accommodation
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {transportOptions.map(option => (
                <div key={option.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold flex items-center gap-2">
                        {option.method_name}
                        {option.featured && <Star className="w-4 h-4 text-yellow-500" />}
                      </h3>
                      <p className="text-sm text-muted-foreground">{option.description}</p>
                      {option.cost_info && (
                        <p className="text-sm font-medium text-wedding-purple mt-1">{option.cost_info}</p>
                      )}
                    </div>
                  </div>

                  {option.pickup_locations && (
                    <div className="mb-3">
                      <h4 className="text-sm font-medium mb-1">Pickup Locations:</h4>
                      <div className="text-sm text-muted-foreground">
                        {option.pickup_locations.join(', ')}
                      </div>
                    </div>
                  )}

                  {option.schedules && option.schedules.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Available Departure Times:</h4>
                      {option.schedules.map(schedule => (
                        <div key={schedule.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {schedule.departure_time}
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {schedule.departure_location}
                            </div>
                            {schedule.max_capacity && (
                              <Badge variant="outline">
                                {schedule.current_bookings}/{schedule.max_capacity} booked
                              </Badge>
                            )}
                          </div>
                          <Button
                            onClick={() => bookBusSeat(schedule.id, option.id)}
                            disabled={schedule.max_capacity ? schedule.current_bookings >= schedule.max_capacity : false}
                          >
                            {schedule.max_capacity && schedule.current_bookings >= schedule.max_capacity 
                              ? 'Full' 
                              : 'Book Seat'
                            }
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Carpool Options */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="w-5 h-5" />
                Carpool Options
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Share a ride with other guests or offer your own car
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Available Carpools */}
              {carpoolOfferings.length > 0 && (
                <div>
                  <h3 className="font-medium mb-3">Available Carpools</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {carpoolOfferings.map(carpool => (
                      <div key={carpool.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-medium">
                              {carpool.driver_profile?.first_name} {carpool.driver_profile?.last_name}
                            </h4>
                            <div className="text-sm text-muted-foreground space-y-1">
                              <div className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                From {carpool.departure_location}
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {carpool.departure_time}
                              </div>
                              {carpool.driver_phone && (
                                <div className="flex items-center gap-1">
                                  <Phone className="w-3 h-3" />
                                  {carpool.driver_phone}
                                </div>
                              )}
                            </div>
                          </div>
                          <Badge variant="outline">
                            {carpool.available_seats - carpool.booked_seats} seats left
                          </Badge>
                        </div>

                        {carpool.vehicle_description && (
                          <p className="text-sm mb-3">{carpool.vehicle_description}</p>
                        )}

                        {carpool.special_notes && (
                          <p className="text-sm text-muted-foreground mb-3">{carpool.special_notes}</p>
                        )}

                        <Button
                          onClick={() => joinCarpool(carpool.id)}
                          disabled={carpool.available_seats <= carpool.booked_seats}
                          className="w-full"
                        >
                          {carpool.available_seats <= carpool.booked_seats ? 'Full' : 'Join Carpool'}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Offer to Drive */}
              <div className="border rounded-lg p-4 bg-blue-50">
                <h3 className="font-medium mb-2 flex items-center gap-2">
                  <UserPlus className="w-4 h-4" />
                  Offer to Drive
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Have a car? Offer spare seats to other guests and coordinate carpools
                </p>
                
                {!showCarpoolForm ? (
                  <Button onClick={() => setShowCarpoolForm(true)} variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Carpool Offering
                  </Button>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="departure_location">Departure Location *</Label>
                        <Input
                          id="departure_location"
                          value={carpoolFormData.departure_location}
                          onChange={(e) => setCarpoolFormData({...carpoolFormData, departure_location: e.target.value})}
                          placeholder="Newcastle City, Ibis Hotel, etc."
                        />
                      </div>
                      <div>
                        <Label htmlFor="departure_time">Departure Time</Label>
                        <Input
                          id="departure_time"
                          type="time"
                          value={carpoolFormData.departure_time}
                          onChange={(e) => setCarpoolFormData({...carpoolFormData, departure_time: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="available_seats">Available Seats</Label>
                        <Input
                          id="available_seats"
                          type="number"
                          min="1"
                          max="6"
                          value={carpoolFormData.available_seats}
                          onChange={(e) => setCarpoolFormData({...carpoolFormData, available_seats: parseInt(e.target.value)})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="driver_phone">Your Phone Number</Label>
                        <Input
                          id="driver_phone"
                          value={carpoolFormData.driver_phone}
                          onChange={(e) => setCarpoolFormData({...carpoolFormData, driver_phone: e.target.value})}
                          placeholder="For coordination"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="vehicle_description">Vehicle Description (Optional)</Label>
                      <Input
                        id="vehicle_description"
                        value={carpoolFormData.vehicle_description}
                        onChange={(e) => setCarpoolFormData({...carpoolFormData, vehicle_description: e.target.value})}
                        placeholder="Blue Honda Civic, Red SUV, etc."
                      />
                    </div>

                    <div>
                      <Label htmlFor="special_notes">Special Notes (Optional)</Label>
                      <Textarea
                        id="special_notes"
                        value={carpoolFormData.special_notes}
                        onChange={(e) => setCarpoolFormData({...carpoolFormData, special_notes: e.target.value})}
                        placeholder="Any special requirements or notes for passengers"
                        rows={2}
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={createCarpoolOffering}>
                        Create Carpool Offering
                      </Button>
                      <Button variant="outline" onClick={() => setShowCarpoolForm(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Alternative Transport Options */}
          <Card>
            <CardHeader>
              <CardTitle>Alternative Transport</CardTitle>
              <p className="text-sm text-muted-foreground">
                Already have transport arranged or staying nearby?
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button 
                  variant="outline" 
                  onClick={() => markTransportArranged('self_arranged')}
                  className="h-auto p-4 flex flex-col items-start"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle className="w-4 h-4" />
                    <span className="font-medium">Transport Arranged</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    I have my own transport sorted
                  </span>
                </Button>

                <Button 
                  variant="outline" 
                  onClick={() => markTransportArranged('staying_nearby')}
                  className="h-auto p-4 flex flex-col items-start"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin className="w-4 h-4" />
                    <span className="font-medium">Staying Nearby</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    I'm staying close to the venue
                  </span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default TransportBooking;