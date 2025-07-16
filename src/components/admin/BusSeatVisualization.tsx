import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Bus, 
  User, 
  Users, 
  Calendar, 
  Clock, 
  MapPin,
  RefreshCw,
  Settings,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface BusSeat {
  seatNumber: number;
  isBooked: boolean;
  guestName?: string;
  guestEmail?: string;
  bookingId?: string;
  guestCount?: number;
  isDriver?: boolean;
  isGuide?: boolean;
}

interface BusSchedule {
  id: string;
  route_type: 'arrival' | 'departure';
  departure_time: string;
  departure_location: string;
  arrival_location?: string;
  max_capacity: number;
  current_bookings: number;
  is_active: boolean;
  seats: BusSeat[];
}

interface BusSeatVisualizationProps {
  scheduleId?: string;
  onSeatClick?: (seatNumber: number, seat: BusSeat) => void;
  adminMode?: boolean;
}

const BusSeatVisualization: React.FC<BusSeatVisualizationProps> = ({
  scheduleId,
  onSeatClick,
  adminMode = false
}) => {
  const [busSchedules, setBusSchedules] = useState<BusSchedule[]>([]);
  const [selectedSchedule, setSelectedSchedule] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadBusSchedules();
  }, []);

  useEffect(() => {
    if (scheduleId && busSchedules.length > 0) {
      setSelectedSchedule(scheduleId);
    } else if (busSchedules.length > 0 && !selectedSchedule) {
      setSelectedSchedule(busSchedules[0].id);
    }
  }, [scheduleId, busSchedules]);

  const loadBusSchedules = async () => {
    setLoading(true);
    try {
      // Load bus schedules with bookings
      const { data: schedules, error: schedulesError } = await supabase
        .from('bus_schedules')
        .select(`
          *,
          bus_bookings(
            id,
            seat_number,
            guest_count,
            status,
            user_id,
            profiles(first_name, last_name, email)
          )
        `)
        .eq('is_active', true)
        .order('departure_time');

      if (schedulesError) throw schedulesError;

      // Process schedules to create seat maps
      const processedSchedules = schedules?.map(schedule => {
        const seats = Array.from({ length: 27 }, (_, index) => {
          const seatNumber = index + 1;
          const booking = schedule.bus_bookings?.find(b => b.seat_number === seatNumber && b.status === 'confirmed');
          
          return {
            seatNumber,
            isBooked: !!booking,
            guestName: booking ? `${booking.profiles?.first_name} ${booking.profiles?.last_name}` : undefined,
            guestEmail: booking?.profiles?.email,
            bookingId: booking?.id,
            guestCount: booking?.guest_count || 1,
            isDriver: seatNumber === 1, // Seat 1 is always driver
            isGuide: seatNumber === 2   // Seat 2 is guide/assistant
          };
        });

        return {
          ...schedule,
          seats
        };
      }) || [];

      setBusSchedules(processedSchedules);
    } catch (error) {
      console.error('Error loading bus schedules:', error);
      toast.error('Failed to load bus schedules');
    } finally {
      setLoading(false);
    }
  };

  const refreshSchedule = async () => {
    setRefreshing(true);
    await loadBusSchedules();
    setRefreshing(false);
    toast.success('Bus schedules refreshed');
  };

  const handleSeatClick = (seat: BusSeat) => {
    if (onSeatClick) {
      onSeatClick(seat.seatNumber, seat);
    } else if (adminMode && !seat.isDriver && !seat.isGuide) {
      // Admin can manage regular seats
      console.log('Admin seat management for seat:', seat.seatNumber);
    }
  };

  const getSeatColor = (seat: BusSeat) => {
    if (seat.isDriver) return 'bg-blue-500 text-white'; // Driver
    if (seat.isGuide) return 'bg-purple-500 text-white'; // Guide
    if (seat.isBooked) return 'bg-red-500 text-white'; // Booked
    return 'bg-green-500 text-white'; // Available
  };

  const getSeatIcon = (seat: BusSeat) => {
    if (seat.isDriver) return <User className="w-3 h-3" />;
    if (seat.isGuide) return <Users className="w-3 h-3" />;
    if (seat.isBooked) return <CheckCircle className="w-3 h-3" />;
    return null;
  };

  const currentSchedule = busSchedules.find(s => s.id === selectedSchedule);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-wedding-navy border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Schedule Selection */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Bus className="w-6 h-6 text-wedding-navy" />
          <div>
            <h3 className="text-lg font-semibold">Bus Seat Management</h3>
            <p className="text-sm text-muted-foreground">
              27-seat bus with visual seat allocation
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={selectedSchedule}
            onChange={(e) => setSelectedSchedule(e.target.value)}
            className="px-3 py-2 border rounded-md"
          >
            {busSchedules.map(schedule => (
              <option key={schedule.id} value={schedule.id}>
                {schedule.route_type === 'arrival' ? '🚌 To Wedding' : '🏠 From Wedding'} - {schedule.departure_time}
              </option>
            ))}
          </select>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshSchedule}
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {currentSchedule && (
        <>
          {/* Schedule Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                {currentSchedule.route_type === 'arrival' ? 'Arrival Bus' : 'Departure Bus'}
                <Badge variant={currentSchedule.is_active ? 'default' : 'secondary'}>
                  {currentSchedule.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">{currentSchedule.departure_time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{currentSchedule.departure_location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span className="text-sm">
                    {currentSchedule.current_bookings}/{currentSchedule.max_capacity} seated
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">
                    {currentSchedule.max_capacity - currentSchedule.current_bookings} available
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bus Seat Visualization */}
          <Card>
            <CardHeader>
              <CardTitle>Bus Layout - 27 Passenger Seats</CardTitle>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span>Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-500 rounded"></div>
                  <span>Booked</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-500 rounded"></div>
                  <span>Driver</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-purple-500 rounded"></div>
                  <span>Guide</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mx-auto max-w-md">
                {/* Bus Front */}
                <div className="text-center mb-4">
                  <div className="inline-block px-4 py-2 bg-gray-800 text-white rounded-t-lg">
                    🚌 FRONT OF BUS
                  </div>
                </div>

                {/* Driver and Guide Row */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {currentSchedule.seats.slice(0, 2).map(seat => (
                    <button
                      key={seat.seatNumber}
                      onClick={() => handleSeatClick(seat)}
                      className={`
                        w-12 h-12 rounded-lg border-2 border-gray-300 
                        ${getSeatColor(seat)}
                        hover:scale-105 transition-transform
                        flex items-center justify-center
                        ${(adminMode && !seat.isDriver && !seat.isGuide) ? 'cursor-pointer' : ''}
                      `}
                      title={
                        seat.isBooked 
                          ? `${seat.guestName} (${seat.guestEmail})`
                          : seat.isDriver 
                            ? 'Bus Driver'
                            : seat.isGuide
                              ? 'Tour Guide'
                              : 'Available Seat'
                      }
                      disabled={!adminMode && (seat.isDriver || seat.isGuide)}
                    >
                      <div className="text-center">
                        {getSeatIcon(seat)}
                        <div className="text-xs font-bold">{seat.seatNumber}</div>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Passenger Seats - 5 rows of 5 seats each */}
                <div className="space-y-2">
                  {Array.from({ length: 5 }, (_, rowIndex) => (
                    <div key={rowIndex} className="grid grid-cols-5 gap-2">
                      {currentSchedule.seats.slice(2 + rowIndex * 5, 7 + rowIndex * 5).map(seat => (
                        <button
                          key={seat.seatNumber}
                          onClick={() => handleSeatClick(seat)}
                          className={`
                            w-12 h-12 rounded-lg border-2 border-gray-300 
                            ${getSeatColor(seat)}
                            hover:scale-105 transition-transform
                            flex items-center justify-center text-xs font-bold
                            ${adminMode ? 'cursor-pointer' : seat.isBooked ? 'cursor-not-allowed' : 'cursor-pointer'}
                          `}
                          title={
                            seat.isBooked 
                              ? `${seat.guestName} (${seat.guestEmail})`
                              : 'Available Seat'
                          }
                        >
                          <div className="text-center">
                            {getSeatIcon(seat)}
                            <div>{seat.seatNumber}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  ))}
                </div>

                {/* Bus Back */}
                <div className="text-center mt-4">
                  <div className="inline-block px-4 py-2 bg-gray-800 text-white rounded-b-lg">
                    🚪 BACK OF BUS
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Booking Summary */}
          {currentSchedule.current_bookings > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Current Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {currentSchedule.seats
                    .filter(seat => seat.isBooked && !seat.isDriver && !seat.isGuide)
                    .map(seat => (
                      <div key={seat.seatNumber} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">Seat {seat.seatNumber}</div>
                          <div className="text-sm text-muted-foreground">{seat.guestName}</div>
                        </div>
                        <Badge variant="outline">
                          {seat.guestCount} guest{seat.guestCount !== 1 ? 's' : ''}
                        </Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {busSchedules.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Bus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No bus schedules configured</h3>
            <p className="text-muted-foreground">
              Configure bus schedules to enable seat management.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BusSeatVisualization;