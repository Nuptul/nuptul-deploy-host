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
  CheckCircle,
  AlertCircle,
  Loader2,
  Plane
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

interface BusSeat {
  seatNumber: number;
  isBooked: boolean;
  guestName?: string;
  guestEmail?: string;
  bookingId?: string;
  guestCount?: number;
  isDriver?: boolean;
  isGuide?: boolean;
  isSelected?: boolean;
}

interface BusSchedule {
  id: string;
  departure_time: string;
  departure_location: string;
  arrival_time?: string;
  arrival_location?: string;
  max_capacity: number;
  current_bookings: number;
  seats: BusSeat[];
}

interface BusSeatBookingProps {
  onBookingComplete?: (bookingId: string) => void;
  className?: string;
}

const BusSeatBooking: React.FC<BusSeatBookingProps> = ({
  onBookingComplete, 
  className 
}) => {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState<BusSchedule[]>([]);
  const [selectedSchedule, setSelectedSchedule] = useState<string>('');
  const [selectedSeat, setSelectedSeat] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    loadBusSchedules();
  }, []);

  const loadBusSchedules = async () => {
    setLoading(true);
    try {
      const { data: schedulesData, error } = await supabase
        .from('transportation_schedules')
        .select('*')
        .eq('is_active', true)
        .order('departure_time');

      if (error) throw error;

      const schedulesWithSeats = await Promise.all(
        (schedulesData || []).map(async (schedule) => {
          const { data: bookingsData } = await supabase
            .from('bus_seat_bookings')
            .select(`
              *,
              user_profile:profiles(first_name, last_name, email)
            `)
            .eq('transportation_schedule_id', schedule.id);

          // Create seat layout (26 seats total: 1 driver, 1 guide, 24 passengers in 6 rows of 4)
          const seats: BusSeat[] = [];

          // Driver seat (seat 1)
          seats.push({
            seatNumber: 1,
            isBooked: true,
            isDriver: true,
            guestName: 'Driver'
          });

          // Guide seat (seat 2)
          seats.push({
            seatNumber: 2,
            isBooked: true,
            isGuide: true,
            guestName: 'Guide'
          });

          // Passenger seats (seats 3-26: 6 rows × 4 seats per row)
          for (let i = 3; i <= 26; i++) {
            const booking = bookingsData?.find(b => b.seat_number === i);
            seats.push({
              seatNumber: i,
              isBooked: !!booking,
              guestName: booking ? `${booking.user_profile?.first_name} ${booking.user_profile?.last_name}` : undefined,
              guestEmail: booking?.user_profile?.email,
              bookingId: booking?.id
            });
          }

          return {
            ...schedule,
            seats,
            current_bookings: bookingsData?.length || 0
          };
        })
      );

      setSchedules(schedulesWithSeats);
      if (schedulesWithSeats.length > 0) {
        setSelectedSchedule(schedulesWithSeats[0].id);
      }
    } catch (error) {
      console.error('Error loading bus schedules:', error);
      toast.error('Failed to load bus schedules');
    } finally {
      setLoading(false);
    }
  };

  const handleSeatSelect = (seatNumber: number, seat: BusSeat) => {
    if (seat.isBooked || seat.isDriver || seat.isGuide) {
      return;
    }
    setSelectedSeat(seatNumber === selectedSeat ? null : seatNumber);
  };

  const handleBookSeat = async () => {
    if (!user || !selectedSeat || !selectedSchedule) {
      toast.error('Please select a seat and ensure you are logged in');
      return;
    }

    setBooking(true);
    try {
      const { data, error } = await supabase
        .from('bus_seat_bookings')
        .insert({
          user_id: user.id,
          transportation_schedule_id: selectedSchedule,
          seat_number: selectedSeat,
          passenger_name: user.email || 'Guest',
          booking_status: 'confirmed'
        })
        .select()
        .single();

      if (error) throw error;

      toast.success(`Seat ${selectedSeat} booked successfully!`);
      setSelectedSeat(null);
      loadBusSchedules();
      
      if (onBookingComplete) {
        onBookingComplete(data.id);
      }
    } catch (error) {
      console.error('Error booking seat:', error);
      toast.error('Failed to book seat');
    } finally {
      setBooking(false);
    }
  };

  const getSeatColor = (seat: BusSeat) => {
    if (seat.isDriver) return 'bg-gradient-to-br from-glass-blue to-glass-blue/80 text-white shadow-lg border-glass-blue/30';
    if (seat.isGuide) return 'bg-gradient-to-br from-glass-purple to-glass-purple/80 text-white shadow-lg border-glass-purple/30';
    if (seat.isBooked) return 'bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg border-red-400/30';
    if (seat.seatNumber === selectedSeat) return 'bg-gradient-to-br from-yellow-400 to-yellow-500 text-black shadow-lg border-yellow-300/50 ring-2 ring-yellow-400';
    return 'bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg border-green-400/30 hover:from-green-400 hover:to-green-500';
  };

  const getSeatIcon = (seat: BusSeat) => {
    if (seat.isDriver) return <User className="w-4 h-4" />;
    if (seat.isGuide) return <Users className="w-4 h-4" />;
    if (seat.isBooked) return <CheckCircle className="w-4 h-4" />;
    if (seat.seatNumber === selectedSeat) return <CheckCircle className="w-4 h-4" />;
    return null;
  };

  const currentSchedule = schedules.find(s => s.id === selectedSchedule);

  if (loading) {
    return (
      <Card className="glass-card">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          <span>Loading bus schedules...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bus className="w-5 h-5 text-glass-blue" />
            Select Your Bus Seat
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Coach Selection - Two Round-Trip Coaches */}
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-wedding-navy">🚌 Choose Your Coach</h3>
              <p className="text-sm text-gray-600">
                Two complimentary coaches available for Tim & Kirsten's wedding.
                <br />
                <strong>Outbound:</strong> Depart 1:00 PM, arrive Ben Ean 2:30 PM for 3:00 PM ceremony
                <br />
                <strong>Return:</strong> Depart Ben Ean 12:30 AM after reception ends
              </p>
              <div className="grid gap-3">
                {schedules.map((schedule) => (
                  <button
                    key={schedule.id}
                    onClick={() => setSelectedSchedule(schedule.id)}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      selectedSchedule === schedule.id
                        ? 'border-glass-blue bg-glass-blue/10'
                        : 'border-gray-200 hover:border-glass-blue/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-lg">
                          Coach {schedule.departure_location === 'Newcastle City' ? '1' : '2'}: {schedule.departure_location}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          <div>🚌 {schedule.departure_location} ↔ Ben Ean (Round Trip)</div>
                          <div>⏰ Depart: {schedule.departure_time} | Return: 12:30 AM</div>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-lg px-3 py-1">
                        {schedule.current_bookings}/{schedule.max_capacity} seats
                      </Badge>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Seat Map */}
          {currentSchedule && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="font-semibold mb-2">Bus Layout</h3>
                <div className="inline-block p-6 bg-gradient-to-b from-gray-100 to-gray-200 rounded-2xl border-2 border-gray-300">
                  {/* Front of Bus Indicator */}
                  <div className="text-center mb-4">
                    <div className="inline-block px-4 py-2 bg-gray-800 text-white rounded-full text-xs font-bold">
                      FRONT OF BUS
                    </div>
                  </div>

                  {/* Driver and Guide Row */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {currentSchedule.seats.slice(0, 2).map(seat => (
                      <button
                        key={seat.seatNumber}
                        onClick={() => handleSeatSelect(seat.seatNumber, seat)}
                        className={`
                          w-16 h-16 rounded-xl border-2 
                          ${getSeatColor(seat)}
                          transition-all duration-200
                          flex flex-col items-center justify-center
                          ${!seat.isBooked && !seat.isDriver && !seat.isGuide ? 'hover:scale-110 cursor-pointer' : 'cursor-not-allowed'}
                        `}
                        title={
                          seat.isBooked 
                            ? `${seat.guestName}`
                            : seat.isDriver 
                              ? 'Bus Driver'
                              : seat.isGuide
                                ? 'Tour Guide'
                                : 'Available Seat'
                        }
                        disabled={seat.isBooked || seat.isDriver || seat.isGuide}
                      >
                        <div className="text-center">
                          {getSeatIcon(seat)}
                          <div className="text-xs font-bold mt-1">{seat.seatNumber}</div>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Passenger Seats - 6 rows of 4 seats each (2-2 bus configuration) */}
                  <div className="space-y-3">
                    {Array.from({ length: 6 }, (_, rowIndex) => (
                      <div key={rowIndex} className="flex justify-center gap-4">
                        {/* Left side - 2 seats */}
                        <div className="flex gap-2">
                          {currentSchedule.seats.slice(2 + rowIndex * 4, 4 + rowIndex * 4).map(seat => (
                            <button
                              key={seat.seatNumber}
                              onClick={() => handleSeatSelect(seat.seatNumber, seat)}
                              className={`
                                w-14 h-14 rounded-xl border-2
                                ${getSeatColor(seat)}
                                transition-all duration-200
                                flex flex-col items-center justify-center text-xs font-bold
                                ${!seat.isBooked ? 'hover:scale-110 cursor-pointer' : 'cursor-not-allowed'}
                                group
                              `}
                              title={
                                seat.isBooked
                                  ? `Booked by ${seat.guestName}`
                                  : 'Available Seat'
                              }
                              disabled={seat.isBooked}
                            >
                              <div className="text-center">
                                {getSeatIcon(seat)}
                                <div className="text-xs font-bold mt-1">{seat.seatNumber}</div>
                              </div>
                            </button>
                          ))}
                        </div>

                        {/* Aisle */}
                        <div className="w-8 flex items-center justify-center">
                          <div className="w-1 h-12 bg-gray-300 rounded-full opacity-50"></div>
                        </div>

                        {/* Right side - 2 seats */}
                        <div className="flex gap-2">
                          {currentSchedule.seats.slice(4 + rowIndex * 4, 6 + rowIndex * 4).map(seat => (
                            <button
                              key={seat.seatNumber}
                              onClick={() => handleSeatSelect(seat.seatNumber, seat)}
                              className={`
                                w-14 h-14 rounded-xl border-2
                                ${getSeatColor(seat)}
                                transition-all duration-200
                                flex flex-col items-center justify-center text-xs font-bold
                                ${!seat.isBooked ? 'hover:scale-110 cursor-pointer' : 'cursor-not-allowed'}
                                group
                              `}
                              title={
                                seat.isBooked
                                  ? `Booked by ${seat.guestName}`
                                  : 'Available Seat'
                              }
                              disabled={seat.isBooked}
                            >
                              <div className="text-center">
                                {getSeatIcon(seat)}
                                <div className="text-xs font-bold mt-1">{seat.seatNumber}</div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div className="flex flex-wrap justify-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gradient-to-br from-green-500 to-green-600 rounded border"></div>
                  <span>Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded border"></div>
                  <span>Selected</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gradient-to-br from-red-500 to-red-600 rounded border"></div>
                  <span>Booked</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gradient-to-br from-glass-blue to-glass-blue/80 rounded border"></div>
                  <span>Driver</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gradient-to-br from-glass-purple to-glass-purple/80 rounded border"></div>
                  <span>Guide</span>
                </div>
              </div>

              {/* Booking Button */}
              <div className="text-center">
                <Button
                  onClick={handleBookSeat}
                  disabled={!selectedSeat || booking}
                  className="min-h-[44px] px-6 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    background: (!selectedSeat || booking) ? 'rgba(0, 122, 255, 0.5)' : 'linear-gradient(135deg, #007AFF 0%, #0051D5 100%)',
                    backdropFilter: 'blur(20px) saturate(1.8)',
                    WebkitBackdropFilter: 'blur(20px) saturate(1.8)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: '#FFFFFF',
                    fontWeight: '600',
                    borderRadius: '12px',
                    boxShadow: '0 8px 24px rgba(0, 122, 255, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.4)',
                    cursor: (!selectedSeat || booking) ? 'not-allowed' : 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedSeat && !booking) {
                      e.currentTarget.style.background = 'linear-gradient(135deg, #0051D5 0%, #003D9D 100%)';
                      e.currentTarget.style.boxShadow = '0 12px 32px rgba(0, 122, 255, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.5)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedSeat && !booking) {
                      e.currentTarget.style.background = 'linear-gradient(135deg, #007AFF 0%, #0051D5 100%)';
                      e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 122, 255, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.4)';
                    }
                  }}
                >
                  {booking ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Booking Seat...
                    </>
                  ) : selectedSeat ? (
                    `Book Seat ${selectedSeat}`
                  ) : (
                    'Select a Seat to Book'
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BusSeatBooking;
