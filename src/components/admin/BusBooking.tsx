import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Bus, Users, MapPin, Calendar, Clock, DollarSign, UserCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BusRoute {
  id: string;
  name: string;
  departure_location: string;
  arrival_location: string;
  departure_time: string;
  arrival_time: string;
  price: number;
  total_seats: number;
  bus_layout: string; // JSON string of seat layout
}

interface SeatBooking {
  seat_number: string;
  guest_id: string;
  guest_name: string;
  booking_status: 'confirmed' | 'pending' | 'cancelled';
}

interface BusBookingData {
  route_id: string;
  bookings: Record<string, SeatBooking>;
}

const BusBooking: React.FC = () => {
  const [routes, setRoutes] = useState<BusRoute[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<string>('');
  const [bookings, setBookings] = useState<Record<string, SeatBooking>>({});
  const [selectedSeats, setSelectedSeats] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Default bus layout (can be customized per route)
  const defaultBusLayout = {
    rows: 10,
    seatsPerRow: 4,
    aisleAfter: 2, // Aisle after 2nd seat
    unavailableSeats: ['1A', '1B'], // Driver area
  };

  useEffect(() => {
    fetchRoutes();
  }, []);

  useEffect(() => {
    if (selectedRoute) {
      fetchBookings(selectedRoute);
    }
  }, [selectedRoute]);

  const fetchRoutes = async () => {
    try {
      const { data, error } = await supabase
        .from('bus_routes')
        .select('*')
        .order('departure_time', { ascending: true });

      if (error) throw error;
      setRoutes(data || []);
    } catch (error) {
      console.error('Error fetching routes:', error);
      // Use demo data if table doesn't exist
      setRoutes([
        {
          id: '1',
          name: 'Airport Shuttle - Morning',
          departure_location: 'City Center Hotel',
          arrival_location: 'Wedding Venue',
          departure_time: '09:00',
          arrival_time: '10:30',
          price: 25,
          total_seats: 40,
          bus_layout: JSON.stringify(defaultBusLayout),
        },
        {
          id: '2',
          name: 'Airport Shuttle - Evening',
          departure_location: 'Wedding Venue',
          arrival_location: 'City Center Hotel',
          departure_time: '22:00',
          arrival_time: '23:30',
          price: 25,
          total_seats: 40,
          bus_layout: JSON.stringify(defaultBusLayout),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async (routeId: string) => {
    try {
      const { data, error } = await supabase
        .from('bus_bookings')
        .select(`
          *,
          guests (
            first_name,
            last_name
          )
        `)
        .eq('route_id', routeId);

      if (error) throw error;

      const bookingsMap: Record<string, SeatBooking> = {};
      data?.forEach(booking => {
        bookingsMap[booking.seat_number] = {
          seat_number: booking.seat_number,
          guest_id: booking.guest_id,
          guest_name: `${booking.guests?.first_name || ''} ${booking.guests?.last_name || ''}`.trim(),
          booking_status: booking.status,
        };
      });
      setBookings(bookingsMap);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      // Use demo bookings if table doesn't exist
      setBookings({
        '2C': { seat_number: '2C', guest_id: '1', guest_name: 'John Doe', booking_status: 'confirmed' },
        '2D': { seat_number: '2D', guest_id: '2', guest_name: 'Jane Smith', booking_status: 'confirmed' },
        '5A': { seat_number: '5A', guest_id: '3', guest_name: 'Bob Wilson', booking_status: 'pending' },
      });
    }
  };

  const getSeatStatus = (seatNumber: string, layout: any): 'available' | 'booked' | 'selected' | 'unavailable' => {
    if (layout.unavailableSeats?.includes(seatNumber)) return 'unavailable';
    if (selectedSeats.has(seatNumber)) return 'selected';
    if (bookings[seatNumber]) return 'booked';
    return 'available';
  };

  const toggleSeatSelection = (seatNumber: string, status: string) => {
    if (status === 'unavailable' || status === 'booked') return;
    
    const newSelected = new Set(selectedSeats);
    if (newSelected.has(seatNumber)) {
      newSelected.delete(seatNumber);
    } else {
      newSelected.add(seatNumber);
    }
    setSelectedSeats(newSelected);
  };

  const handleSaveBookings = async () => {
    if (selectedSeats.size === 0) {
      toast.error('Please select at least one seat');
      return;
    }

    setSaving(true);
    try {
      // In a real app, this would open a modal to assign guests to seats
      toast.success(`${selectedSeats.size} seats selected for booking`);
      setSelectedSeats(new Set());
    } catch (error) {
      toast.error('Failed to save bookings');
    } finally {
      setSaving(false);
    }
  };

  const renderSeat = (row: number, seat: string, layout: any) => {
    const seatNumber = `${row}${seat}`;
    const status = getSeatStatus(seatNumber, layout);
    const booking = bookings[seatNumber];

    return (
      <button
        key={seatNumber}
        onClick={() => toggleSeatSelection(seatNumber, status)}
        disabled={status === 'unavailable' || status === 'booked'}
        className={cn(
          'relative w-10 h-10 rounded-t-lg border-2 transition-all',
          'hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2',
          status === 'available' && 'bg-green-100 border-green-500 hover:bg-green-200 focus:ring-green-500',
          status === 'booked' && 'bg-red-100 border-red-500 cursor-not-allowed',
          status === 'selected' && 'bg-blue-200 border-blue-600 shadow-lg focus:ring-blue-500',
          status === 'unavailable' && 'bg-gray-200 border-gray-400 cursor-not-allowed'
        )}
        title={
          booking 
            ? `${booking.guest_name} - ${booking.booking_status}`
            : status === 'unavailable'
            ? 'Unavailable'
            : seatNumber
        }
      >
        <span className="text-xs font-semibold">
          {seatNumber}
        </span>
        {booking && (
          <UserCheck className="absolute -top-2 -right-2 w-4 h-4 text-red-600" />
        )}
      </button>
    );
  };

  const renderBusLayout = () => {
    if (!selectedRoute) return null;

    const route = routes.find(r => r.id === selectedRoute);
    if (!route) return null;

    const layout = JSON.parse(route.bus_layout || JSON.stringify(defaultBusLayout));
    const seats = ['A', 'B', 'C', 'D'];

    return (
      <div className="bg-gray-100 p-6 rounded-lg">
        {/* Bus Front */}
        <div className="flex justify-center mb-4">
          <div className="bg-gray-800 text-white px-4 py-2 rounded-t-xl">
            <Bus className="w-6 h-6 mx-auto" />
            <span className="text-xs">Driver</span>
          </div>
        </div>

        {/* Seat Grid */}
        <div className="space-y-2">
          {Array.from({ length: layout.rows }, (_, rowIndex) => {
            const row = rowIndex + 1;
            return (
              <div key={row} className="flex justify-center gap-1">
                <span className="w-8 text-right pr-2 text-sm text-gray-600">
                  {row}
                </span>
                {seats.map((seat, seatIndex) => (
                  <React.Fragment key={seat}>
                    {renderSeat(row, seat, layout)}
                    {seatIndex === layout.aisleAfter - 1 && (
                      <div className="w-8" /> // Aisle
                    )}
                  </React.Fragment>
                ))}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex justify-center gap-4 mt-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-100 border-2 border-green-500 rounded" />
            <span>Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-200 border-2 border-blue-600 rounded" />
            <span>Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-100 border-2 border-red-500 rounded" />
            <span>Booked</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-200 border-2 border-gray-400 rounded" />
            <span>Unavailable</span>
          </div>
        </div>
      </div>
    );
  };

  const getBookingStats = () => {
    if (!selectedRoute) return { total: 0, booked: 0, available: 0 };
    
    const route = routes.find(r => r.id === selectedRoute);
    if (!route) return { total: 0, booked: 0, available: 0 };

    const layout = JSON.parse(route.bus_layout || JSON.stringify(defaultBusLayout));
    const total = route.total_seats - (layout.unavailableSeats?.length || 0);
    const booked = Object.keys(bookings).length;
    const available = total - booked;

    return { total, booked, available };
  };

  const stats = getBookingStats();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bus className="w-5 h-5" />
            Bus Booking Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Route Selection */}
          <div className="mb-6">
            <Label htmlFor="route-select">Select Bus Route</Label>
            <Select value={selectedRoute} onValueChange={setSelectedRoute}>
              <SelectTrigger id="route-select">
                <SelectValue placeholder="Choose a bus route" />
              </SelectTrigger>
              <SelectContent>
                {routes.map(route => (
                  <SelectItem key={route.id} value={route.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{route.name}</span>
                      <span className="text-sm text-gray-500">
                        {route.departure_location} → {route.arrival_location}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Route Details */}
          {selectedRoute && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>Route</span>
                  </div>
                  <p className="font-medium">
                    {routes.find(r => r.id === selectedRoute)?.departure_location}
                  </p>
                  <p className="text-sm text-gray-500">to</p>
                  <p className="font-medium">
                    {routes.find(r => r.id === selectedRoute)?.arrival_location}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>Schedule</span>
                  </div>
                  <p className="font-medium">
                    {routes.find(r => r.id === selectedRoute)?.departure_time} - {routes.find(r => r.id === selectedRoute)?.arrival_time}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>Occupancy</span>
                  </div>
                  <p className="font-medium">
                    {stats.booked} / {stats.total} seats
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${(stats.booked / stats.total) * 100}%` }}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <DollarSign className="w-4 h-4" />
                    <span>Price</span>
                  </div>
                  <p className="font-medium text-lg">
                    ${routes.find(r => r.id === selectedRoute)?.price}
                  </p>
                  <p className="text-sm text-gray-500">per seat</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Bus Layout */}
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <>
              {renderBusLayout()}
              
              {/* Actions */}
              {selectedSeats.size > 0 && (
                <div className="mt-6 flex justify-between items-center">
                  <div>
                    <Badge variant="default" className="text-lg px-4 py-2">
                      {selectedSeats.size} seats selected
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setSelectedSeats(new Set())}
                    >
                      Clear Selection
                    </Button>
                    <Button
                      onClick={handleSaveBookings}
                      disabled={saving}
                    >
                      {saving ? 'Saving...' : 'Assign to Guests'}
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BusBooking;