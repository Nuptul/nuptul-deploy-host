import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Bed, Home, Calendar, Users, Phone, Info, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import GlassCard from '@/components/GlassCard';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface AccommodationFormData {
  needsAccommodation: boolean;
  propertyPreference?: string;
  roomsNeeded?: number;
  checkInDate?: string;
  checkOutDate?: string;
  occupants?: number;
  sharingPreference?: 'private' | 'share' | 'either';
  budgetRange?: string;
  specialRequirements?: string;
  contactForBooking?: boolean;
}

const PROPERTY_OPTIONS = [
  { value: 'benean', name: 'Benean Homestead (On-site)', description: 'Historic homestead at the venue' },
  { value: 'merewether', name: 'Prince of Merewether', description: '5 mins from venue, beachside' },
  { value: 'newcastle-cbd', name: 'Newcastle CBD Hotels', description: '20 mins from venue' },
  { value: 'airbnb', name: 'Local Airbnb', description: 'Various options nearby' },
  { value: 'other', name: 'Other Arrangements', description: 'I\'ll arrange my own' }
];

const BUDGET_RANGES = [
  'Under $150/night',
  '$150-250/night',
  '$250-400/night',
  'Over $400/night',
  'Flexible'
];

const AccommodationForm: React.FC = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [existingRequest, setExistingRequest] = useState<any>(null);

  const form = useForm<AccommodationFormData>({
    defaultValues: {
      needsAccommodation: false,
      roomsNeeded: 1,
      checkInDate: '2024-12-30',
      checkOutDate: '2025-01-01',
      occupants: 2,
      sharingPreference: 'private',
      budgetRange: '$150-250/night',
      contactForBooking: true
    }
  });

  const needsAccommodation = form.watch('needsAccommodation');
  const propertyPreference = form.watch('propertyPreference');

  useEffect(() => {
    fetchExistingAccommodation();
  }, [user]);

  const fetchExistingAccommodation = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('accommodation_requests')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (data) {
      setExistingRequest(data);
      form.reset({
        needsAccommodation: true,
        propertyPreference: data.property_preference,
        roomsNeeded: data.rooms_needed,
        checkInDate: data.check_in_date,
        checkOutDate: data.check_out_date,
        occupants: data.occupants,
        specialRequirements: data.special_requirements
      });
    }
  };

  const onSubmit = async (data: AccommodationFormData) => {
    if (!user) return;

    setLoading(true);
    try {
      if (data.needsAccommodation) {
        const requestData = {
          user_id: user.id,
          property_preference: data.propertyPreference,
          rooms_needed: data.roomsNeeded || 1,
          check_in_date: data.checkInDate,
          check_out_date: data.checkOutDate,
          occupants: data.occupants || 2,
          special_requirements: data.specialRequirements,
          status: 'pending'
        };

        if (existingRequest) {
          await supabase
            .from('accommodation_requests')
            .update(requestData)
            .eq('id', existingRequest.id);
        } else {
          await supabase
            .from('accommodation_requests')
            .insert(requestData);
        }

        toast({
          title: "Accommodation Request Saved",
          description: "We'll contact you with booking options soon.",
        });
      } else {
        // Remove any existing request
        if (existingRequest) {
          await supabase
            .from('accommodation_requests')
            .delete()
            .eq('id', existingRequest.id);
        }

        toast({
          title: "Accommodation Updated",
          description: "No accommodation needed.",
        });
      }
    } catch (error) {
      console.error('Error saving accommodation:', error);
      toast({
        title: "Error",
        description: "Failed to save accommodation details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <GlassCard className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Bed className="w-6 h-6 text-wedding-gold" />
        <h2 className="text-2xl font-semibold text-wedding-navy">Accommodation</h2>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Need Accommodation */}
        <div className="space-y-4">
          <Label>Do you need accommodation?</Label>
          <RadioGroup
            value={needsAccommodation ? 'yes' : 'no'}
            onValueChange={(value) => form.setValue('needsAccommodation', value === 'yes')}
          >
            <div className="flex items-center space-x-2 p-4 rounded-lg bg-white/50 hover:bg-white/70 transition-colors">
              <RadioGroupItem value="yes" id="accom-yes" />
              <Label htmlFor="accom-yes" className="flex-1 cursor-pointer">
                Yes, I need help finding accommodation
              </Label>
            </div>
            <div className="flex items-center space-x-2 p-4 rounded-lg bg-white/50 hover:bg-white/70 transition-colors">
              <RadioGroupItem value="no" id="accom-no" />
              <Label htmlFor="accom-no" className="flex-1 cursor-pointer">
                No, I have accommodation sorted
              </Label>
            </div>
          </RadioGroup>
        </div>

        {needsAccommodation && (
          <>
            {/* Property Preference */}
            <div className="space-y-4">
              <Label>Accommodation Preference</Label>
              <div className="space-y-2">
                {PROPERTY_OPTIONS.map((option) => (
                  <div
                    key={option.value}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      propertyPreference === option.value
                        ? 'border-wedding-gold bg-wedding-gold/10'
                        : 'border-gray-200 bg-white/50 hover:border-wedding-gold/50'
                    }`}
                    onClick={() => form.setValue('propertyPreference', option.value)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="pt-1">
                        <RadioGroupItem
                          value={option.value}
                          checked={propertyPreference === option.value}
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Home className="w-4 h-4 text-wedding-gold" />
                          <span className="font-medium">{option.name}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {option.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Dates and Occupancy */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="checkInDate">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Check-in Date
                </Label>
                <Input
                  id="checkInDate"
                  type="date"
                  {...form.register('checkInDate')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="checkOutDate">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Check-out Date
                </Label>
                <Input
                  id="checkOutDate"
                  type="date"
                  {...form.register('checkOutDate')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="roomsNeeded">
                  <Bed className="w-4 h-4 inline mr-1" />
                  Rooms Needed
                </Label>
                <Input
                  id="roomsNeeded"
                  type="number"
                  min="1"
                  max="5"
                  {...form.register('roomsNeeded', { valueAsNumber: true })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="occupants">
                  <Users className="w-4 h-4 inline mr-1" />
                  Total Occupants
                </Label>
                <Input
                  id="occupants"
                  type="number"
                  min="1"
                  max="10"
                  {...form.register('occupants', { valueAsNumber: true })}
                />
              </div>
            </div>

            {/* Budget Range */}
            <div className="space-y-2">
              <Label>Budget Range (per night)</Label>
              <Select
                value={form.watch('budgetRange')}
                onValueChange={(value) => form.setValue('budgetRange', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select budget range" />
                </SelectTrigger>
                <SelectContent>
                  {BUDGET_RANGES.map((range) => (
                    <SelectItem key={range} value={range}>
                      {range}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Room Sharing */}
            <div className="space-y-2">
              <Label>Room Sharing Preference</Label>
              <RadioGroup
                value={form.watch('sharingPreference')}
                onValueChange={(value) => form.setValue('sharingPreference', value as any)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="private" id="private" />
                  <Label htmlFor="private">Private room(s) only</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="share" id="share" />
                  <Label htmlFor="share">Happy to share with other guests</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="either" id="either" />
                  <Label htmlFor="either">Either is fine</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Special Requirements */}
            <div className="space-y-2">
              <Label htmlFor="specialRequirements">
                Special Requirements or Preferences
              </Label>
              <Textarea
                id="specialRequirements"
                placeholder="Accessibility needs, pet-friendly, specific location preferences..."
                {...form.register('specialRequirements')}
                className="min-h-[80px]"
              />
            </div>

            {/* Contact Preference */}
            <div className="flex items-center space-x-2 p-4 bg-wedding-gold/5 rounded-lg">
              <Checkbox
                id="contactForBooking"
                checked={form.watch('contactForBooking')}
                onCheckedChange={(checked) => form.setValue('contactForBooking', !!checked)}
              />
              <Label htmlFor="contactForBooking" className="flex-1 cursor-pointer">
                <div className="flex items-start gap-2">
                  <Phone className="w-4 h-4 mt-0.5 text-wedding-gold" />
                  <div>
                    <span>I'd like to be contacted with accommodation options</span>
                    <p className="text-sm text-muted-foreground mt-1">
                      We'll send you details about available properties matching your preferences
                    </p>
                  </div>
                </div>
              </Label>
            </div>

            {/* Info Box */}
            <div className="flex items-start gap-2 p-4 bg-blue-50 rounded-lg">
              <Info className="w-5 h-5 mt-0.5 text-blue-600" />
              <div className="text-sm">
                <p className="font-medium text-blue-900 mb-1">Accommodation Notes:</p>
                <ul className="space-y-1 text-blue-800">
                  <li>• Benean Homestead has limited rooms - book early!</li>
                  <li>• Group bookings available for Airbnb properties</li>
                  <li>• We can arrange discounted rates at partner hotels</li>
                  <li>• Transportation will be provided from all listed locations</li>
                </ul>
              </div>
            </div>
          </>
        )}

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-wedding-navy hover:bg-wedding-navy-light"
        >
          {loading ? 'Saving...' : 'Save Accommodation Preferences'}
        </Button>
      </form>
    </GlassCard>
  );
};

export default AccommodationForm;