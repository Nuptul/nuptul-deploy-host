import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Car, Bus, MapPin, Clock, Users, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import GlassCard from '@/components/GlassCard';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface TransportFormData {
  transportType: 'coach' | 'carpool' | 'self';
  seatsNeeded?: number;
  pickupLocation?: string;
  departureTime?: string;
  returnRequired: boolean;
  carpoolOffer?: {
    seatsAvailable: number;
    departureSuburb: string;
    departureTime: string;
    returnTime?: string;
    contactPhone: string;
  };
  specialRequirements?: string;
}

const PICKUP_LOCATIONS = [
  'Newcastle CBD',
  'Hamilton',
  'Merewether',
  'Charlestown',
  'Kotara',
  'Mayfield',
  'Broadmeadow',
  'New Lambton',
  'Jesmond',
  'Other (specify in notes)'
];

const TransportationForm: React.FC = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [existingRequest, setExistingRequest] = useState<any>(null);
  const [existingOffer, setExistingOffer] = useState<any>(null);

  const form = useForm<TransportFormData>({
    defaultValues: {
      transportType: 'coach',
      seatsNeeded: 1,
      returnRequired: true,
      carpoolOffer: {
        seatsAvailable: 1,
        departureSuburb: '',
        departureTime: '17:00',
        returnTime: '23:00',
        contactPhone: profile?.phone || ''
      }
    }
  });

  const transportType = form.watch('transportType');

  useEffect(() => {
    fetchExistingTransport();
  }, [user]);

  const fetchExistingTransport = async () => {
    if (!user) return;

    // Fetch transport request
    const { data: requestData } = await supabase
      .from('transport_requests')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (requestData) {
      setExistingRequest(requestData);
      form.reset({
        transportType: 'coach',
        seatsNeeded: requestData.seats_requested,
        pickupLocation: requestData.pickup_location,
        departureTime: requestData.departure_time,
        returnRequired: requestData.return_required,
        specialRequirements: requestData.special_requirements
      });
    }

    // Fetch carpool offer
    const { data: offerData } = await supabase
      .from('carpool_offers')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (offerData) {
      setExistingOffer(offerData);
    }
  };

  const onSubmit = async (data: TransportFormData) => {
    if (!user) return;

    setLoading(true);
    try {
      if (data.transportType === 'coach') {
        // Create or update transport request
        const requestData = {
          user_id: user.id,
          seats_requested: data.seatsNeeded || 1,
          pickup_location: data.pickupLocation,
          departure_time: data.departureTime,
          return_required: data.returnRequired,
          special_requirements: data.specialRequirements,
          status: 'pending'
        };

        if (existingRequest) {
          await supabase
            .from('transport_requests')
            .update(requestData)
            .eq('id', existingRequest.id);
        } else {
          await supabase
            .from('transport_requests')
            .insert(requestData);
        }

        toast({
          title: "Transport Request Saved",
          description: "We'll confirm your coach booking soon.",
        });
      } else if (data.transportType === 'carpool' && data.carpoolOffer) {
        // Create or update carpool offer
        const offerData = {
          user_id: user.id,
          seats_available: data.carpoolOffer.seatsAvailable,
          departure_suburb: data.carpoolOffer.departureSuburb,
          departure_time: `2024-12-31 ${data.carpoolOffer.departureTime}:00`,
          return_time: data.carpoolOffer.returnTime ? `2025-01-01 ${data.carpoolOffer.returnTime}:00` : null,
          contact_phone: data.carpoolOffer.contactPhone,
          notes: data.specialRequirements
        };

        if (existingOffer) {
          await supabase
            .from('carpool_offers')
            .update(offerData)
            .eq('id', existingOffer.id);
        } else {
          await supabase
            .from('carpool_offers')
            .insert(offerData);
        }

        toast({
          title: "Carpool Offer Saved",
          description: "Other guests can now see your offer.",
        });
      } else {
        // Self-driving - remove any existing requests
        if (existingRequest) {
          await supabase
            .from('transport_requests')
            .delete()
            .eq('id', existingRequest.id);
        }

        toast({
          title: "Transport Updated",
          description: "Safe travels on the day!",
        });
      }
    } catch (error) {
      console.error('Error saving transport:', error);
      toast({
        title: "Error",
        description: "Failed to save transport details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <GlassCard className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Bus className="w-6 h-6 text-wedding-gold" />
        <h2 className="text-2xl font-semibold text-wedding-navy">Transportation</h2>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Transport Type Selection */}
        <div className="space-y-4">
          <Label>How will you get to the venue?</Label>
          <RadioGroup
            value={transportType}
            onValueChange={(value) => form.setValue('transportType', value as any)}
          >
            <div className="flex items-center space-x-2 p-4 rounded-lg bg-white/50 hover:bg-white/70 transition-colors">
              <RadioGroupItem value="coach" id="coach" />
              <Label htmlFor="coach" className="flex-1 cursor-pointer flex items-center gap-2">
                <Bus className="w-4 h-4 text-wedding-gold" />
                <span>Coach Service (Free shuttle from Newcastle)</span>
              </Label>
            </div>
            <div className="flex items-center space-x-2 p-4 rounded-lg bg-white/50 hover:bg-white/70 transition-colors">
              <RadioGroupItem value="carpool" id="carpool" />
              <Label htmlFor="carpool" className="flex-1 cursor-pointer flex items-center gap-2">
                <Users className="w-4 h-4 text-wedding-gold" />
                <span>Offer Carpool (Share ride with other guests)</span>
              </Label>
            </div>
            <div className="flex items-center space-x-2 p-4 rounded-lg bg-white/50 hover:bg-white/70 transition-colors">
              <RadioGroupItem value="self" id="self" />
              <Label htmlFor="self" className="flex-1 cursor-pointer flex items-center gap-2">
                <Car className="w-4 h-4 text-wedding-gold" />
                <span>Self Drive / Other Arrangements</span>
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Coach Service Form */}
        {transportType === 'coach' && (
          <div className="space-y-4 p-4 bg-wedding-gold/5 rounded-lg">
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <Info className="w-4 h-4 mt-0.5 text-wedding-gold" />
              <p>Free coaches will depart from various Newcastle locations at 4:30 PM</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="seatsNeeded">
                  <Users className="w-4 h-4 inline mr-1" />
                  Seats Needed
                </Label>
                <Input
                  id="seatsNeeded"
                  type="number"
                  min="1"
                  max="10"
                  {...form.register('seatsNeeded', { valueAsNumber: true })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pickupLocation">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Pickup Location
                </Label>
                <Select
                  value={form.watch('pickupLocation')}
                  onValueChange={(value) => form.setValue('pickupLocation', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select pickup point" />
                  </SelectTrigger>
                  <SelectContent>
                    {PICKUP_LOCATIONS.map((location) => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Return Journey</Label>
              <RadioGroup
                value={form.watch('returnRequired') ? 'yes' : 'no'}
                onValueChange={(value) => form.setValue('returnRequired', value === 'yes')}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="return-yes" />
                  <Label htmlFor="return-yes">Yes, I need return transport (11:30 PM)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="return-no" />
                  <Label htmlFor="return-no">No, I'll arrange my own return</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        )}

        {/* Carpool Offer Form */}
        {transportType === 'carpool' && (
          <div className="space-y-4 p-4 bg-wedding-gold/5 rounded-lg">
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <Info className="w-4 h-4 mt-0.5 text-wedding-gold" />
              <p>Offer seats in your car to help other guests get to the venue</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="seatsAvailable">
                  <Users className="w-4 h-4 inline mr-1" />
                  Seats Available
                </Label>
                <Input
                  id="seatsAvailable"
                  type="number"
                  min="1"
                  max="6"
                  {...form.register('carpoolOffer.seatsAvailable', { valueAsNumber: true })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="departureSuburb">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Departure Suburb
                </Label>
                <Input
                  id="departureSuburb"
                  placeholder="e.g., Merewether"
                  {...form.register('carpoolOffer.departureSuburb')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="departureTime">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Departure Time
                </Label>
                <Input
                  id="departureTime"
                  type="time"
                  {...form.register('carpoolOffer.departureTime')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="returnTime">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Return Time (Optional)
                </Label>
                <Input
                  id="returnTime"
                  type="time"
                  {...form.register('carpoolOffer.returnTime')}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="contactPhone">
                  Contact Phone
                </Label>
                <Input
                  id="contactPhone"
                  type="tel"
                  placeholder="+61 4XX XXX XXX"
                  {...form.register('carpoolOffer.contactPhone')}
                />
              </div>
            </div>
          </div>
        )}

        {/* Special Requirements */}
        {transportType !== 'self' && (
          <div className="space-y-2">
            <Label htmlFor="specialRequirements">
              Special Requirements or Notes
            </Label>
            <Textarea
              id="specialRequirements"
              placeholder="Any mobility needs, preferred seating, or other requirements..."
              {...form.register('specialRequirements')}
              className="min-h-[80px]"
            />
          </div>
        )}

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-wedding-navy hover:bg-wedding-navy-light"
        >
          {loading ? 'Saving...' : 'Save Transportation Details'}
        </Button>
      </form>
    </GlassCard>
  );
};

export default TransportationForm;