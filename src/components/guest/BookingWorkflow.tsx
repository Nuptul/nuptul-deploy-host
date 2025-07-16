import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  CalendarIcon,
  MapPin,
  Clock,
  Users,
  Car,
  Bed,
  CreditCard,
  Check,
  ArrowRight,
  ArrowLeft,
  Star,
  Phone,
  Mail,
  Info,
  Heart,
  Shield,
  Zap,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface BookingWorkflowProps {
  guestId: string;
  weddingId: string;
  className?: string;
  onBookingComplete?: (bookings: any[]) => void;
}

interface TransportOption {
  id: string;
  providerName: string;
  serviceType: string;
  capacity: number;
  price: number;
  rating: number;
  description: string;
  features: string[];
  availability: boolean;
}

interface AccommodationOption {
  id: string;
  providerName: string;
  roomType: string;
  price: number;
  rating: number;
  amenities: string[];
  images: string[];
  distanceToVenue: number;
  availability: boolean;
}

interface BookingData {
  transport: {
    option: TransportOption | null;
    pickupLocation: string;
    pickupTime: Date | null;
    dropoffLocation: string;
    passengerCount: number;
    specialRequirements: string;
    contactPhone: string;
  };
  accommodation: {
    option: AccommodationOption | null;
    checkInDate: Date | null;
    checkOutDate: Date | null;
    guestCount: number;
    roomPreferences: string;
    specialRequests: string;
  };
  payment: {
    method: string;
    billingAddress: string;
    saveCard: boolean;
  };
}

const BookingWorkflow: React.FC<BookingWorkflowProps> = ({
  guestId,
  weddingId,
  className = '',
  onBookingComplete
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [bookingData, setBookingData] = useState<BookingData>({
    transport: {
      option: null,
      pickupLocation: '',
      pickupTime: null,
      dropoffLocation: '',
      passengerCount: 1,
      specialRequirements: '',
      contactPhone: ''
    },
    accommodation: {
      option: null,
      checkInDate: null,
      checkOutDate: null,
      guestCount: 1,
      roomPreferences: '',
      specialRequests: ''
    },
    payment: {
      method: '',
      billingAddress: '',
      saveCard: false
    }
  });

  const [transportOptions, setTransportOptions] = useState<TransportOption[]>([]);
  const [accommodationOptions, setAccommodationOptions] = useState<AccommodationOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [wedding, setWedding] = useState<any>(null);

  const steps = [
    { id: 'transport', title: 'Transportation', icon: Car },
    { id: 'accommodation', title: 'Accommodation', icon: Bed },
    { id: 'review', title: 'Review & Payment', icon: CreditCard },
    { id: 'confirmation', title: 'Confirmation', icon: CheckCircle }
  ];

  useEffect(() => {
    loadWeddingDetails();
    loadTransportOptions();
    loadAccommodationOptions();
  }, [weddingId]);

  const loadWeddingDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('weddings')
        .select('*')
        .eq('id', weddingId)
        .single();

      if (error) throw error;
      setWedding(data);
    } catch (error) {
      console.error('Error loading wedding details:', error);
    }
  };

  const loadTransportOptions = async () => {
    try {
      const { data, error } = await supabase
        .from('transport_providers')
        .select('*')
        .eq('is_active', true)
        .eq('is_verified', true);

      if (error) throw error;

      const options: TransportOption[] = data.map(provider => ({
        id: provider.id,
        providerName: provider.name,
        serviceType: provider.service_type,
        capacity: provider.capacity_max,
        price: provider.base_price || 0,
        rating: provider.rating || 0,
        description: provider.description || '',
        features: ['Professional Driver', 'GPS Tracking', 'Wedding Specialist'],
        availability: true
      }));

      setTransportOptions(options);
    } catch (error) {
      console.error('Error loading transport options:', error);
      toast.error('Failed to load transportation options');
    }
  };

  const loadAccommodationOptions = async () => {
    try {
      const { data: providers, error: providersError } = await supabase
        .from('accommodation_providers')
        .select(`
          *,
          accommodation_room_types (*)
        `)
        .eq('is_active', true);

      if (providersError) throw providersError;

      const options: AccommodationOption[] = [];
      providers.forEach(provider => {
        provider.accommodation_room_types?.forEach((roomType: any) => {
          options.push({
            id: `${provider.id}-${roomType.id}`,
            providerName: provider.name,
            roomType: roomType.room_type_name,
            price: roomType.base_rate || 0,
            rating: provider.rating || 0,
            amenities: provider.amenities || [],
            images: provider.gallery_images || [],
            distanceToVenue: provider.distance_to_venue_km || 0,
            availability: true
          });
        });
      });

      setAccommodationOptions(options);
    } catch (error) {
      console.error('Error loading accommodation options:', error);
      toast.error('Failed to load accommodation options');
    }
  };

  const handleTransportSelection = (option: TransportOption) => {
    setBookingData(prev => ({
      ...prev,
      transport: { ...prev.transport, option }
    }));
  };

  const handleAccommodationSelection = (option: AccommodationOption) => {
    setBookingData(prev => ({
      ...prev,
      accommodation: { ...prev.accommodation, option }
    }));
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const calculateTotalCost = () => {
    let total = 0;
    
    if (bookingData.transport.option) {
      total += bookingData.transport.option.price;
    }
    
    if (bookingData.accommodation.option && bookingData.accommodation.checkInDate && bookingData.accommodation.checkOutDate) {
      const nights = Math.ceil((bookingData.accommodation.checkOutDate.getTime() - bookingData.accommodation.checkInDate.getTime()) / (1000 * 60 * 60 * 24));
      total += bookingData.accommodation.option.price * nights;
    }
    
    return total;
  };

  const submitBookings = async () => {
    setIsLoading(true);
    try {
      const bookings = [];

      // Create transport booking
      if (bookingData.transport.option) {
        const { data: transportBooking, error: transportError } = await supabase
          .from('transport_bookings')
          .insert({
            wedding_id: weddingId,
            guest_id: guestId,
            provider_id: bookingData.transport.option.id,
            pickup_location: bookingData.transport.pickupLocation,
            pickup_datetime: bookingData.transport.pickupTime?.toISOString(),
            dropoff_location: bookingData.transport.dropoffLocation,
            passenger_count: bookingData.transport.passengerCount,
            special_requirements: bookingData.transport.specialRequirements,
            contact_phone: bookingData.transport.contactPhone,
            quoted_price: bookingData.transport.option.price,
            trip_purpose: 'ceremony'
          })
          .select()
          .single();

        if (transportError) throw transportError;
        bookings.push({ type: 'transport', data: transportBooking });
      }

      // Create accommodation booking
      if (bookingData.accommodation.option) {
        const [providerId, roomTypeId] = bookingData.accommodation.option.id.split('-');
        const nights = Math.ceil((bookingData.accommodation.checkOutDate!.getTime() - bookingData.accommodation.checkInDate!.getTime()) / (1000 * 60 * 60 * 24));
        
        const { data: accommodationBooking, error: accommodationError } = await supabase
          .from('accommodation_bookings')
          .insert({
            wedding_id: weddingId,
            guest_id: guestId,
            provider_id: providerId,
            room_type_id: roomTypeId,
            check_in_date: bookingData.accommodation.checkInDate!.toISOString().split('T')[0],
            check_out_date: bookingData.accommodation.checkOutDate!.toISOString().split('T')[0],
            guest_count: bookingData.accommodation.guestCount,
            special_requests: bookingData.accommodation.specialRequests,
            room_rate: bookingData.accommodation.option.price,
            total_nights_cost: bookingData.accommodation.option.price * nights,
            total_cost: bookingData.accommodation.option.price * nights
          })
          .select()
          .single();

        if (accommodationError) throw accommodationError;
        bookings.push({ type: 'accommodation', data: accommodationBooking });
      }

      setCurrentStep(steps.length - 1);
      onBookingComplete?.(bookings);
      toast.success('Bookings completed successfully!');
    } catch (error) {
      console.error('Error submitting bookings:', error);
      toast.error('Failed to complete bookings');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD'
    }).format(amount);
  };

  const renderTransportStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Choose Transportation</h3>
        <p className="text-gray-600 text-sm">Select your preferred transportation for the wedding event</p>
      </div>

      {/* Transport Options */}
      <div className="grid gap-4">
        {transportOptions.map(option => (
          <Card 
            key={option.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              bookingData.transport.option?.id === option.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
            }`}
            onClick={() => handleTransportSelection(option)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Car className="h-5 w-5 text-blue-600" />
                    <h4 className="font-medium">{option.providerName}</h4>
                    <Badge variant="secondary">{option.serviceType}</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{option.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      Up to {option.capacity} passengers
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      {option.rating}/5
                    </span>
                  </div>
                  <div className="flex gap-2 mt-2">
                    {option.features.map(feature => (
                      <Badge key={feature} variant="outline" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-blue-600">{formatCurrency(option.price)}</div>
                  <div className="text-xs text-gray-500">per trip</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Transport Details Form */}
      {bookingData.transport.option && (
        <Card>
          <CardHeader>
            <CardTitle>Transportation Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="pickup-location">Pickup Location</Label>
                <Input
                  id="pickup-location"
                  value={bookingData.transport.pickupLocation}
                  onChange={(e) => setBookingData(prev => ({
                    ...prev,
                    transport: { ...prev.transport, pickupLocation: e.target.value }
                  }))}
                  placeholder="Enter pickup address"
                />
              </div>
              <div>
                <Label htmlFor="dropoff-location">Dropoff Location</Label>
                <Input
                  id="dropoff-location"
                  value={bookingData.transport.dropoffLocation}
                  onChange={(e) => setBookingData(prev => ({
                    ...prev,
                    transport: { ...prev.transport, dropoffLocation: e.target.value }
                  }))}
                  placeholder="Wedding venue address"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Pickup Time</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {bookingData.transport.pickupTime ? format(bookingData.transport.pickupTime, 'PPP p') : 'Select date & time'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={bookingData.transport.pickupTime || undefined}
                      onSelect={(date) => setBookingData(prev => ({
                        ...prev,
                        transport: { ...prev.transport, pickupTime: date || null }
                      }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label htmlFor="passenger-count">Number of Passengers</Label>
                <Select
                  value={bookingData.transport.passengerCount.toString()}
                  onValueChange={(value) => setBookingData(prev => ({
                    ...prev,
                    transport: { ...prev.transport, passengerCount: parseInt(value) }
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: bookingData.transport.option.capacity }, (_, i) => (
                      <SelectItem key={i + 1} value={(i + 1).toString()}>
                        {i + 1} passenger{i + 1 > 1 ? 's' : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="contact-phone">Contact Phone</Label>
              <Input
                id="contact-phone"
                value={bookingData.transport.contactPhone}
                onChange={(e) => setBookingData(prev => ({
                  ...prev,
                  transport: { ...prev.transport, contactPhone: e.target.value }
                }))}
                placeholder="Your phone number"
              />
            </div>

            <div>
              <Label htmlFor="special-requirements">Special Requirements</Label>
              <Textarea
                id="special-requirements"
                value={bookingData.transport.specialRequirements}
                onChange={(e) => setBookingData(prev => ({
                  ...prev,
                  transport: { ...prev.transport, specialRequirements: e.target.value }
                }))}
                placeholder="Any special requirements or requests"
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderAccommodationStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Choose Accommodation</h3>
        <p className="text-gray-600 text-sm">Select your preferred accommodation near the wedding venue</p>
      </div>

      {/* Accommodation Options */}
      <div className="grid gap-4">
        {accommodationOptions.map(option => (
          <Card 
            key={option.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              bookingData.accommodation.option?.id === option.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
            }`}
            onClick={() => handleAccommodationSelection(option)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Bed className="h-5 w-5 text-green-600" />
                    <h4 className="font-medium">{option.providerName}</h4>
                    <Badge variant="secondary">{option.roomType}</Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {option.distanceToVenue.toFixed(1)}km from venue
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      {option.rating}/5
                    </span>
                  </div>
                  <div className="flex gap-2 mt-2">
                    {option.amenities.slice(0, 3).map(amenity => (
                      <Badge key={amenity} variant="outline" className="text-xs">
                        {amenity}
                      </Badge>
                    ))}
                    {option.amenities.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{option.amenities.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-green-600">{formatCurrency(option.price)}</div>
                  <div className="text-xs text-gray-500">per night</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Accommodation Details Form */}
      {bookingData.accommodation.option && (
        <Card>
          <CardHeader>
            <CardTitle>Accommodation Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Check-in Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {bookingData.accommodation.checkInDate ? format(bookingData.accommodation.checkInDate, 'PPP') : 'Select check-in date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={bookingData.accommodation.checkInDate || undefined}
                      onSelect={(date) => setBookingData(prev => ({
                        ...prev,
                        accommodation: { ...prev.accommodation, checkInDate: date || null }
                      }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label>Check-out Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {bookingData.accommodation.checkOutDate ? format(bookingData.accommodation.checkOutDate, 'PPP') : 'Select check-out date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={bookingData.accommodation.checkOutDate || undefined}
                      onSelect={(date) => setBookingData(prev => ({
                        ...prev,
                        accommodation: { ...prev.accommodation, checkOutDate: date || null }
                      }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div>
              <Label htmlFor="guest-count">Number of Guests</Label>
              <Select
                value={bookingData.accommodation.guestCount.toString()}
                onValueChange={(value) => setBookingData(prev => ({
                  ...prev,
                  accommodation: { ...prev.accommodation, guestCount: parseInt(value) }
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4].map(count => (
                    <SelectItem key={count} value={count.toString()}>
                      {count} guest{count > 1 ? 's' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="special-requests">Special Requests</Label>
              <Textarea
                id="special-requests"
                value={bookingData.accommodation.specialRequests}
                onChange={(e) => setBookingData(prev => ({
                  ...prev,
                  accommodation: { ...prev.accommodation, specialRequests: e.target.value }
                }))}
                placeholder="Any special requests or preferences"
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderReviewStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Review Your Bookings</h3>
        <p className="text-gray-600 text-sm">Please review your selections before completing the booking</p>
      </div>

      {/* Booking Summary */}
      <div className="grid gap-4">
        {bookingData.transport.option && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="h-5 w-5" />
                Transportation Booking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Service:</span>
                  <span className="font-medium">{bookingData.transport.option.providerName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Route:</span>
                  <span className="font-medium">{bookingData.transport.pickupLocation} → {bookingData.transport.dropoffLocation}</span>
                </div>
                <div className="flex justify-between">
                  <span>Passengers:</span>
                  <span className="font-medium">{bookingData.transport.passengerCount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cost:</span>
                  <span className="font-medium text-blue-600">{formatCurrency(bookingData.transport.option.price)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {bookingData.accommodation.option && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bed className="h-5 w-5" />
                Accommodation Booking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Hotel:</span>
                  <span className="font-medium">{bookingData.accommodation.option.providerName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Room Type:</span>
                  <span className="font-medium">{bookingData.accommodation.option.roomType}</span>
                </div>
                <div className="flex justify-between">
                  <span>Guests:</span>
                  <span className="font-medium">{bookingData.accommodation.guestCount}</span>
                </div>
                {bookingData.accommodation.checkInDate && bookingData.accommodation.checkOutDate && (
                  <>
                    <div className="flex justify-between">
                      <span>Dates:</span>
                      <span className="font-medium">
                        {format(bookingData.accommodation.checkInDate, 'MMM dd')} - {format(bookingData.accommodation.checkOutDate, 'MMM dd')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Nights:</span>
                      <span className="font-medium">
                        {Math.ceil((bookingData.accommodation.checkOutDate.getTime() - bookingData.accommodation.checkInDate.getTime()) / (1000 * 60 * 60 * 24))}
                      </span>
                    </div>
                  </>
                )}
                <div className="flex justify-between">
                  <span>Total Cost:</span>
                  <span className="font-medium text-green-600">
                    {formatCurrency(bookingData.accommodation.option.price * (bookingData.accommodation.checkInDate && bookingData.accommodation.checkOutDate ? 
                      Math.ceil((bookingData.accommodation.checkOutDate.getTime() - bookingData.accommodation.checkInDate.getTime()) / (1000 * 60 * 60 * 24)) : 1))}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Total Cost */}
        <Card className="border-2 border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">Total Cost:</span>
              <span className="text-2xl font-bold text-blue-600">{formatCurrency(calculateTotalCost())}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              Your payment information is secured with bank-level encryption. You will be charged only after booking confirmation.
            </AlertDescription>
          </Alert>
          
          <div>
            <Label>Payment Method</Label>
            <Select
              value={bookingData.payment.method}
              onValueChange={(value) => setBookingData(prev => ({
                ...prev,
                payment: { ...prev.payment, method: value }
              }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="credit_card">Credit Card</SelectItem>
                <SelectItem value="debit_card">Debit Card</SelectItem>
                <SelectItem value="paypal">PayPal</SelectItem>
                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderConfirmationStep = () => (
    <div className="text-center space-y-6">
      <div className="flex justify-center">
        <CheckCircle className="h-16 w-16 text-green-500" />
      </div>
      
      <div>
        <h3 className="text-2xl font-bold text-green-600 mb-2">Booking Confirmed!</h3>
        <p className="text-gray-600">Your bookings have been successfully submitted and confirmed.</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="text-lg font-semibold">What happens next?</div>
            <div className="space-y-2 text-left">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Confirmation emails sent to your registered email</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Providers will contact you within 24 hours</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">You can track and manage your bookings in your dashboard</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-2">
        <Button className="w-full" onClick={() => window.location.reload()}>
          View My Bookings
        </Button>
        <Button variant="outline" className="w-full" onClick={() => setCurrentStep(0)}>
          Make Another Booking
        </Button>
      </div>
    </div>
  );

  return (
    <div className={`max-w-4xl mx-auto ${className}`}>
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`flex items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}
            >
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                index <= currentStep
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'bg-white border-gray-300 text-gray-400'
              }`}>
                <step.icon className="h-5 w-5" />
              </div>
              <div className="ml-2">
                <div className={`text-sm font-medium ${
                  index <= currentStep ? 'text-blue-600' : 'text-gray-400'
                }`}>
                  {step.title}
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-4 ${
                  index < currentStep ? 'bg-blue-600' : 'bg-gray-300'
                }`} />
              )}
            </div>
          ))}
        </div>
        <Progress value={(currentStep / (steps.length - 1)) * 100} className="h-2" />
      </div>

      {/* Step Content */}
      <div className="mb-8">
        {currentStep === 0 && renderTransportStep()}
        {currentStep === 1 && renderAccommodationStep()}
        {currentStep === 2 && renderReviewStep()}
        {currentStep === 3 && renderConfirmationStep()}
      </div>

      {/* Navigation */}
      {currentStep < 3 && (
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 0}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          
          {currentStep < 2 ? (
            <Button
              onClick={nextStep}
              disabled={
                (currentStep === 0 && !bookingData.transport.option) ||
                (currentStep === 1 && !bookingData.accommodation.option)
              }
            >
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={submitBookings}
              disabled={isLoading || !bookingData.payment.method}
              className="bg-green-600 hover:bg-green-700"
            >
              {isLoading ? (
                <>
                  <Zap className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Complete Booking
                  <Heart className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default BookingWorkflow;