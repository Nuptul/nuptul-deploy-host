import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Bus, 
  User, 
  Calendar, 
  Clock, 
  MapPin,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface BusSchedule {
  id: string;
  route_type: 'arrival' | 'departure';
  route_name: string;
  departure_time: string;
  departure_date: string;
  departure_location: string;
  arrival_location?: string;
  max_capacity: number;
  current_bookings: number;
  is_active: boolean;
}

interface BusBookingFormProps {
  onBookingComplete?: (bookingId: string) => void;
}

const BusBookingForm: React.FC<BusBookingFormProps> = ({ onBookingComplete }) => {
  const [schedules, setSchedules] = useState<BusSchedule[]>([]);
  const [selectedSchedule, setSelectedSchedule] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    guest_count: 1,
    passenger_names: [''],
    special_requirements: '',
    pickup_location: '',
    emergency_contact_name: '',
    emergency_contact_phone: ''
  });

  useEffect(() => {
    loadBusSchedules();
  }, []);

  const loadBusSchedules = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('bus_schedules')
        .select('*')
        .eq('is_active', true)
        .gte('departure_date', new Date().toISOString().split('T')[0])
        .order('departure_date', { ascending: true })
        .order('departure_time', { ascending: true });

      if (error) throw error;
      setSchedules(data || []);
    } catch (error) {
      console.error('Error loading bus schedules:', error);
      toast.error('Failed to load bus schedules');
    } finally {
      setLoading(false);
    }
  };

  const handlePassengerNameChange = (index: number, value: string) => {
    const newNames = [...formData.passenger_names];
    newNames[index] = value;
    setFormData(prev => ({ ...prev, passenger_names: newNames }));
  };

  const adjustPassengerNames = (count: number) => {
    const newNames = Array.from({ length: count }, (_, i) => 
      formData.passenger_names[i] || ''
    );
    setFormData(prev => ({ 
      ...prev, 
      guest_count: count,
      passenger_names: newNames 
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSchedule) {
      toast.error('Please select a bus schedule');
      return;
    }

    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please sign in to book a bus seat');
        return;
      }

      // Find available seat number
      const { data: existingBookings } = await supabase
        .from('bus_bookings')
        .select('seat_number')
        .eq('schedule_id', selectedSchedule)
        .eq('status', 'confirmed');

      const occupiedSeats = existingBookings?.map(b => b.seat_number) || [];
      
      // Find first available seat (excluding driver seat 1 and guide seat 2)
      let availableSeat = null;
      for (let i = 3; i <= 27; i++) {
        if (!occupiedSeats.includes(i)) {
          availableSeat = i;
          break;
        }
      }

      if (!availableSeat) {
        toast.error('No seats available on this bus');
        return;
      }

      const bookingData = {
        schedule_id: selectedSchedule,
        user_id: user.id,
        seat_number: availableSeat,
        guest_count: formData.guest_count,
        passenger_names: formData.passenger_names.filter(name => name.trim()),
        special_requirements: formData.special_requirements || null,
        pickup_location: formData.pickup_location || null,
        emergency_contact_name: formData.emergency_contact_name || null,
        emergency_contact_phone: formData.emergency_contact_phone || null,
        status: 'confirmed'
      };

      const { data, error } = await supabase
        .from('bus_bookings')
        .insert(bookingData)
        .select()
        .single();

      if (error) throw error;

      toast.success(`Bus seat ${availableSeat} booked successfully!`);
      
      if (onBookingComplete) {
        onBookingComplete(data.id);
      }

      // Reset form
      setSelectedSchedule('');
      setFormData({
        guest_count: 1,
        passenger_names: [''],
        special_requirements: '',
        pickup_location: '',
        emergency_contact_name: '',
        emergency_contact_phone: ''
      });

      // Reload schedules to show updated capacity
      loadBusSchedules();

    } catch (error) {
      console.error('Error booking bus seat:', error);
      toast.error('Failed to book bus seat');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedScheduleData = schedules.find(s => s.id === selectedSchedule);
  const availableSeats = selectedScheduleData ? selectedScheduleData.max_capacity - selectedScheduleData.current_bookings : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-wedding-navy border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Bus className="w-6 h-6 text-wedding-navy" />
        <div>
          <h3 className="text-lg font-semibold">Book Your Bus Seat</h3>
          <p className="text-sm text-muted-foreground">
            Reserve your seat on the wedding transportation
          </p>
        </div>
      </div>

      {schedules.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Bus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No bus schedules available</h3>
            <p className="text-muted-foreground">
              Bus schedules will be available closer to the wedding date.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Available Schedules */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {schedules.map(schedule => (
              <Card 
                key={schedule.id} 
                className={`cursor-pointer transition-all ${
                  selectedSchedule === schedule.id 
                    ? 'ring-2 ring-wedding-navy bg-blue-50' 
                    : 'hover:shadow-md'
                }`}
                onClick={() => setSelectedSchedule(schedule.id)}
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bus className="w-5 h-5" />
                      {schedule.route_name}
                    </div>
                    <Badge variant={schedule.route_type === 'arrival' ? 'default' : 'secondary'}>
                      {schedule.route_type === 'arrival' ? '🚌 To Wedding' : '🏠 From Wedding'}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4" />
                      {schedule.departure_date}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4" />
                      {schedule.departure_time}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4" />
                      {schedule.departure_location}
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-sm font-medium">
                        {schedule.max_capacity - schedule.current_bookings} seats available
                      </span>
                      <Badge variant="outline">
                        {schedule.current_bookings}/{schedule.max_capacity} booked
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Booking Form */}
          {selectedSchedule && (
            <Card>
              <CardHeader>
                <CardTitle>Booking Details</CardTitle>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Selected: {selectedScheduleData?.route_name}
                  <Badge variant="outline">
                    {availableSeats} seats available
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="guest_count">Number of Passengers</Label>
                    <Input
                      id="guest_count"
                      type="number"
                      min="1"
                      max={Math.min(availableSeats, 5)}
                      value={formData.guest_count}
                      onChange={(e) => adjustPassengerNames(parseInt(e.target.value) || 1)}
                      required
                    />
                  </div>

                  <div>
                    <Label>Passenger Names</Label>
                    <div className="space-y-2">
                      {formData.passenger_names.map((name, index) => (
                        <Input
                          key={index}
                          placeholder={`Passenger ${index + 1} full name`}
                          value={name}
                          onChange={(e) => handlePassengerNameChange(index, e.target.value)}
                          required
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="pickup_location">Pickup Location (if different)</Label>
                    <Input
                      id="pickup_location"
                      value={formData.pickup_location}
                      onChange={(e) => setFormData(prev => ({ ...prev, pickup_location: e.target.value }))}
                      placeholder="Optional: Specific pickup address"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="emergency_contact_name">Emergency Contact Name</Label>
                      <Input
                        id="emergency_contact_name"
                        value={formData.emergency_contact_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, emergency_contact_name: e.target.value }))}
                        placeholder="Contact person name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="emergency_contact_phone">Emergency Contact Phone</Label>
                      <Input
                        id="emergency_contact_phone"
                        value={formData.emergency_contact_phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, emergency_contact_phone: e.target.value }))}
                        placeholder="+61 400 123 456"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="special_requirements">Special Requirements</Label>
                    <Textarea
                      id="special_requirements"
                      value={formData.special_requirements}
                      onChange={(e) => setFormData(prev => ({ ...prev, special_requirements: e.target.value }))}
                      placeholder="Any special requirements or notes..."
                      rows={3}
                    />
                  </div>

                  <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-blue-500" />
                    <div className="text-sm">
                      <p className="font-medium">Booking Confirmation</p>
                      <p className="text-muted-foreground">
                        Your seat will be reserved immediately. You'll receive confirmation details.
                      </p>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={submitting || availableSeats === 0}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Booking Seat...
                      </>
                    ) : (
                      <>
                        <Bus className="w-4 h-4 mr-2" />
                        Book Bus Seat
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default BusBookingForm;