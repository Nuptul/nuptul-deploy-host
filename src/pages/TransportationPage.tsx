import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Bus, 
  MapPin, 
  Clock, 
  Calendar,
  Users,
  Info,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import BusSeatBooking from '@/components/guest/BusSeatBooking';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface UserBooking {
  id: string;
  seat_number: number;
  passenger_name: string;
  booking_status: string;
  transportation_schedule: {
    departure_time: string;
    departure_location: string;
    arrival_location?: string;
  };
}

const TransportationPage: React.FC = () => {
  const { user } = useAuth();
  const [userBookings, setUserBookings] = useState<UserBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadUserBookings();
    }
  }, [user]);

  const loadUserBookings = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('bus_seat_bookings')
        .select(`
          *,
          transportation_schedule:transportation_schedules(
            departure_time,
            departure_location,
            arrival_location
          )
        `)
        .eq('user_id', user.id)
        .eq('booking_status', 'confirmed');

      if (error) throw error;

      setUserBookings(data || []);
    } catch (error) {
      console.error('Error loading user bookings:', error);
      toast.error('Failed to load your bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleBookingComplete = (bookingId: string) => {
    toast.success('Seat booked successfully!');
    loadUserBookings();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-wedding-navy">
            Wedding Transportation
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We're providing complimentary coach transport to Ben Ean for Tim & Kirsten's wedding on October 5th, 2025.
            Two coaches available - one from Newcastle City, one from Hunter Valley.
            Arrive at Ben Ean at 2:30 PM for a 3:00 PM ceremony start!
          </p>
        </div>

        {/* Transportation Info */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="w-5 h-5 text-glass-blue" />
              Transportation Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-glass-blue" />
                  <div>
                    <div className="font-semibold">Departure Locations</div>
                    <div className="text-gray-600">Newcastle City & Hunter Valley</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-glass-blue" />
                  <div>
                    <div className="font-semibold">Destination</div>
                    <div className="text-gray-600">Ben Ean, 119 McDonalds Rd, Pokolbin NSW 2320</div>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-glass-blue" />
                  <div>
                    <div className="font-semibold">Departure Time</div>
                    <div className="text-gray-600">1:00 PM (Arrive at Ben Ean by 2:30 PM)</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-glass-blue" />
                  <div>
                    <div className="font-semibold">Return Time</div>
                    <div className="text-gray-600">After reception ends (12:30 AM)</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <div className="font-semibold text-blue-800">Important Notes</div>
                  <ul className="text-blue-700 text-sm mt-1 space-y-1">
                    <li>• Limited seats available - first come, first served</li>
                    <li>• Please arrive 15 minutes before departure</li>
                    <li>• Exact pickup location will be confirmed closer to the date</li>
                    <li>• Return journey includes a comfort stop</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Bookings */}
        {userBookings.length > 0 && (
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Your Current Bookings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {userBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Bus className="w-5 h-5 text-green-600" />
                      <div>
                        <div className="font-semibold">Seat {booking.seat_number}</div>
                        <div className="text-sm text-gray-600">
                          Departure: {booking.transportation_schedule?.departure_time}
                        </div>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">
                      Confirmed
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Seat Selection */}
        <BusSeatBooking
          onBookingComplete={handleBookingComplete}
          className="max-w-4xl mx-auto"
        />

        {/* Additional Information */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-glass-blue" />
              What to Expect
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Outbound Journey</h4>
                <ul className="text-gray-600 space-y-1">
                  <li>• Comfortable coach with air conditioning</li>
                  <li>• Refreshments provided</li>
                  <li>• Scenic route through the Hunter Valley</li>
                  <li>• Arrival at venue by 2:15 PM</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Return Journey</h4>
                <ul className="text-gray-600 space-y-1">
                  <li>• Departure after reception ends</li>
                  <li>• Comfort stop for refreshments</li>
                  <li>• Return to Sydney by 11:30 PM</li>
                  <li>• Drop-off at central Sydney location</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TransportationPage;
