import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save,
  X,
  Bus,
  Car,
  Users,
  Clock,
  MapPin,
  Phone,
  AlertTriangle,
  CheckCircle,
  Send,
  UserCheck,
  Calendar
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import BusSeatVisualization from './BusSeatVisualization';
import BusAdministration from './BusAdministration';

interface TransportationOption {
  id: string;
  category_id?: string;
  method_name: string;
  description?: string;
  pickup_locations?: string[];
  cost_info?: string;
  booking_required: boolean;
  booking_phone?: string;
  capacity_info?: string;
  featured: boolean;
  display_order: number;
  is_active: boolean;
  schedules?: TransportationSchedule[];
  bookings?: TransportationBooking[];
}

interface TransportationSchedule {
  id: string;
  transportation_id: string;
  departure_time: string;
  departure_location: string;
  arrival_time?: string;
  arrival_location?: string;
  max_capacity?: number;
  current_bookings: number;
  is_active: boolean;
}

interface TransportationBooking {
  id: string;
  user_id: string;
  transportation_id: string;
  schedule_id?: string;
  booking_type: 'bus_seat' | 'carpool_driver' | 'carpool_passenger';
  status: 'confirmed' | 'cancelled' | 'waitlist';
  guest_count: number;
  user_profile?: {
    first_name?: string;
    last_name?: string;
    email: string;
  };
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
  is_active: boolean;
  driver_profile?: {
    first_name?: string;
    last_name?: string;
    email: string;
  };
  carpool_bookings?: CarpoolBooking[];
}

interface CarpoolBooking {
  id: string;
  carpool_id: string;
  passenger_user_id: string;
  passenger_count: number;
  pickup_location?: string;
  status: 'confirmed' | 'cancelled' | 'pending';
  passenger_profile?: {
    first_name?: string;
    last_name?: string;
    email: string;
  };
}

interface GuestTransportStatus {
  id: string;
  user_id: string;
  transport_method?: string;
  status: 'not_arranged' | 'booked' | 'driving' | 'carpooling' | 'self_arranged' | 'staying_nearby';
  needs_reminder: boolean;
  reminder_sent_count: number;
  user_profile?: {
    first_name?: string;
    last_name?: string;
    email: string;
  };
}

const TransportationManager: React.FC = () => {
  const [transportOptions, setTransportOptions] = useState<TransportationOption[]>([]);
  const [carpoolOfferings, setCarpoolOfferings] = useState<CarpoolOffering[]>([]);
  const [guestStatuses, setGuestStatuses] = useState<GuestTransportStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadTransportationData();
  }, []);

  const loadTransportationData = async () => {
    setLoading(true);
    try {
      // Load transportation options with schedules and bookings
      const { data: transportData, error: transportError } = await (supabase as any)
        .from('transportation_options')
        .select(`
          *,
          schedules:transportation_schedules(*),
          bookings:transportation_bookings(
            *,
            user_profile:profiles(first_name, last_name, email)
          )
        `)
        .order('display_order');

      if (transportError) throw transportError;

      // Load carpool offerings with bookings
      const { data: carpoolData, error: carpoolError } = await (supabase as any)
        .from('carpool_offerings')
        .select(`
          *,
          driver_profile:profiles!carpool_offerings_driver_user_id_fkey(first_name, last_name, email),
          carpool_bookings(
            *,
            passenger_profile:profiles!carpool_bookings_passenger_user_id_fkey(first_name, last_name, email)
          )
        `)
        .eq('is_active', true)
        .order('departure_date, departure_time');

      if (carpoolError) throw carpoolError;

      // Load guest transport statuses
      const { data: statusData, error: statusError } = await (supabase as any)
        .from('guest_transport_status')
        .select(`
          *,
          user_profile:profiles(first_name, last_name, email)
        `)
        .order('status, user_profile.first_name');

      if (statusError) throw statusError;

      setTransportOptions(transportData || []);
      setCarpoolOfferings(carpoolData || []);
      setGuestStatuses(statusData || []);
    } catch (error) {
      console.error('Error loading transportation data:', error);
      toast.error('Failed to load transportation data');
    } finally {
      setLoading(false);
    }
  };

  const sendTransportReminders = async () => {
    try {
      const unorganizedGuests = guestStatuses.filter(status => 
        status.status === 'not_arranged' && status.needs_reminder
      );

      if (unorganizedGuests.length === 0) {
        toast.info('All guests have arranged transportation');
        return;
      }

      // Here you would implement your reminder sending logic
      // For now, we'll simulate it
      for (const guest of unorganizedGuests) {
        // Update reminder count
        await (supabase as any)
          .from('guest_transport_status')
          .update({ 
            reminder_sent_count: guest.reminder_sent_count + 1,
            last_reminder_sent: new Date().toISOString()
          })
          .eq('id', guest.id);
      }

      toast.success(`Transport reminders sent to ${unorganizedGuests.length} guests`);
      loadTransportationData();
    } catch (error) {
      console.error('Error sending reminders:', error);
      toast.error('Failed to send transport reminders');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'not_arranged': return 'destructive';
      case 'booked': return 'default';
      case 'driving': return 'secondary';
      case 'carpooling': return 'secondary';
      case 'self_arranged': return 'outline';
      case 'staying_nearby': return 'outline';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'not_arranged': return <AlertTriangle className="w-4 h-4" />;
      case 'booked': return <CheckCircle className="w-4 h-4" />;
      case 'driving': return <Car className="w-4 h-4" />;
      case 'carpooling': return <Users className="w-4 h-4" />;
      case 'self_arranged': return <CheckCircle className="w-4 h-4" />;
      case 'staying_nearby': return <MapPin className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-wedding-navy border-t-transparent" />
      </div>
    );
  }

  const unorganizedCount = guestStatuses.filter(s => s.status === 'not_arranged').length;
  const busBookingsCount = guestStatuses.filter(s => s.status === 'booked').length;
  const carpoolDriversCount = guestStatuses.filter(s => s.status === 'driving').length;
  const carpoolPassengersCount = guestStatuses.filter(s => s.status === 'carpooling').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Transportation Management</h2>
          <p className="text-muted-foreground">
            Coordinate guest transportation with bus bookings and carpool coordination
          </p>
        </div>
        <Button onClick={sendTransportReminders} disabled={unorganizedCount === 0}>
          <Send className="w-4 h-4 mr-2" />
          Send Reminders ({unorganizedCount})
        </Button>
      </div>

      {/* Transport Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-500">{unorganizedCount}</div>
            <div className="text-sm text-muted-foreground">Need Transport</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-500">{busBookingsCount}</div>
            <div className="text-sm text-muted-foreground">Bus Bookings</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-500">{carpoolDriversCount}</div>
            <div className="text-sm text-muted-foreground">Carpool Drivers</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-500">{carpoolPassengersCount}</div>
            <div className="text-sm text-muted-foreground">Carpool Passengers</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="bus-transport">Bus Transport</TabsTrigger>
          <TabsTrigger value="bus-admin">Bus Admin</TabsTrigger>
          <TabsTrigger value="carpools">Carpools</TabsTrigger>
          <TabsTrigger value="guest-status">Guest Status</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Transport Options Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bus className="w-5 h-5" />
                  Available Transport Options
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {transportOptions.map(option => (
                  <div key={option.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{option.method_name}</h4>
                      <p className="text-sm text-muted-foreground">{option.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {option.bookings?.reduce((sum, booking) => sum + booking.guest_count, 0) || 0} booked
                      </div>
                      <Badge variant={option.is_active ? 'default' : 'secondary'}>
                        {option.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Recent Carpool Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Car className="w-5 h-5" />
                  Recent Carpool Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {carpoolOfferings.slice(0, 5).map(carpool => (
                  <div key={carpool.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">
                        {carpool.driver_profile?.first_name} {carpool.driver_profile?.last_name}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        From {carpool.departure_location}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {carpool.booked_seats}/{carpool.available_seats} seats
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {carpool.departure_time}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="bus-transport" className="space-y-4">
          {/* Enhanced Bus Seat Visualization */}
          <BusSeatVisualization 
            adminMode={true}
            onSeatClick={(seatNumber, seat) => {
              if (seat.isBooked) {
                toast.info(`Seat ${seatNumber} is booked by ${seat.guestName}`);
              } else if (!seat.isDriver && !seat.isGuide) {
                toast.info(`Seat ${seatNumber} is available for booking`);
              }
            }}
          />
          
          {/* Legacy Transport Options (if any exist) */}
          {transportOptions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Legacy Transport Options</CardTitle>
              </CardHeader>
              <CardContent>
                {transportOptions.map(option => (
                  <div key={option.id} className="border rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium">{option.method_name}</h4>
                        <p className="text-sm text-muted-foreground">{option.description}</p>
                      </div>
                      <Badge variant={option.featured ? 'default' : 'outline'}>
                        {option.featured ? 'Featured' : 'Standard'}
                      </Badge>
                    </div>
                    
                    {option.schedules && option.schedules.length > 0 ? (
                      <div className="space-y-2">
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
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium">
                                {schedule.current_bookings}/{schedule.max_capacity || 'Unlimited'} booked
                              </div>
                              <Badge variant={schedule.is_active ? 'default' : 'secondary'}>
                                {schedule.is_active ? 'Active' : 'Inactive'}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-muted-foreground">
                        No schedules configured
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="bus-admin" className="space-y-4">
          <BusAdministration />
        </TabsContent>

        <TabsContent value="carpools" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {carpoolOfferings.map(carpool => (
              <Card key={carpool.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Car className="w-5 h-5" />
                    {carpool.driver_profile?.first_name} {carpool.driver_profile?.last_name}
                  </CardTitle>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      From {carpool.departure_location}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {carpool.departure_time} on {carpool.departure_date}
                    </div>
                    {carpool.driver_phone && (
                      <div className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {carpool.driver_phone}
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium">Available Seats</span>
                      <span className="text-sm">
                        {carpool.available_seats - carpool.booked_seats} of {carpool.available_seats}
                      </span>
                    </div>

                    {carpool.vehicle_description && (
                      <div className="text-sm">
                        <span className="font-medium">Vehicle: </span>
                        {carpool.vehicle_description}
                      </div>
                    )}

                    {carpool.carpool_bookings && carpool.carpool_bookings.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Passengers</h4>
                        <div className="space-y-2">
                          {carpool.carpool_bookings.map(booking => (
                            <div key={booking.id} className="flex items-center justify-between p-2 border rounded">
                              <span className="text-sm">
                                {booking.passenger_profile?.first_name} {booking.passenger_profile?.last_name}
                              </span>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {booking.passenger_count} seat{booking.passenger_count !== 1 ? 's' : ''}
                                </Badge>
                                <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'} className="text-xs">
                                  {booking.status}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {carpoolOfferings.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <Car className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No carpool offerings yet</h3>
                <p className="text-muted-foreground">
                  Guests can volunteer to drive and offer carpool spots through their transport booking interface.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="guest-status" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="w-5 h-5" />
                Guest Transportation Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {guestStatuses.map(status => (
                  <div key={status.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium">
                          {status.user_profile?.first_name} {status.user_profile?.last_name}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {status.user_profile?.email}
                        </p>
                      </div>
                      <Badge variant={getStatusColor(status.status)} className="text-xs">
                        <div className="flex items-center gap-1">
                          {getStatusIcon(status.status)}
                          {status.status.replace('_', ' ')}
                        </div>
                      </Badge>
                    </div>

                    {status.transport_method && (
                      <div className="text-sm mb-2">
                        <span className="font-medium">Method: </span>
                        {status.transport_method.replace('_', ' ')}
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        Reminders sent: {status.reminder_sent_count}
                      </span>
                      {status.needs_reminder && (
                        <Badge variant="outline" className="text-xs">
                          Needs reminder
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TransportationManager;