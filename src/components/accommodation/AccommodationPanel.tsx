import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Hotel,
  Home,
  Building,
  MapPin,
  Calendar,
  Users,
  Plus,
  Edit,
  Trash2,
  Star,
  Wifi,
  Car,
  UtensilsCrossed,
  Dumbbell,
  Waves,
  Coffee,
  Bed,
  Bath,
  DollarSign,
  Phone,
  Mail,
  Navigation,
  AlertCircle,
  CheckCircle,
  User,
  Clock,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface AccommodationOption {
  id: string;
  type: 'hotel' | 'bnb' | 'vacation_rental' | 'resort' | 'hostel' | 'apartment';
  name: string;
  description: string;
  address: string;
  distanceFromVenue: number; // in miles
  checkInDate: string;
  checkOutDate: string;
  totalRooms: number;
  bookedRooms: number;
  pricePerNight: number;
  starRating: number;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  website: string;
  amenities: string[];
  specialOffers: string;
  isActive: boolean;
  bookings: AccommodationBooking[];
}

interface AccommodationBooking {
  id: string;
  guestId: string;
  guestName: string;
  guestEmail: string;
  roomType: string;
  guestCount: number;
  checkinDate: string;
  checkoutDate: string;
  specialRequests: string;
  bookingStatus: 'pending' | 'confirmed' | 'cancelled';
  bookedAt: string;
}

interface AccommodationPanelProps {
  className?: string;
}

const AccommodationPanel: React.FC<AccommodationPanelProps> = ({ className }) => {
  const [accommodations, setAccommodations] = useState<AccommodationOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingAccommodation, setEditingAccommodation] = useState<AccommodationOption | null>(null);
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [selectedAccommodation, setSelectedAccommodation] = useState<AccommodationOption | null>(null);
  const [formData, setFormData] = useState({
    type: 'hotel' as AccommodationOption['type'],
    name: '',
    description: '',
    address: '',
    distanceFromVenue: 0,
    checkInDate: '',
    checkOutDate: '',
    totalRooms: 10,
    pricePerNight: 0,
    starRating: 3,
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    website: '',
    amenities: [] as string[],
    specialOffers: ''
  });

  const availableAmenities = [
    'Free WiFi', 'Parking', 'Pool', 'Gym', 'Restaurant', 'Bar', 
    'Room Service', 'Spa', 'Business Center', 'Pet Friendly',
    'Air Conditioning', 'Breakfast Included', 'Concierge', 'Laundry'
  ];

  useEffect(() => {
    loadAccommodations();
  }, []);

  const loadAccommodations = async () => {
    try {
      setLoading(true);
      // Mock data - in a real app, this would come from Supabase
      const mockAccommodations: AccommodationOption[] = [
        {
          id: '1',
          type: 'hotel',
          name: 'Grand Marriott Hotel',
          description: 'Luxury hotel in downtown with elegant rooms and world-class service',
          address: '123 Main Street, Downtown',
          distanceFromVenue: 2.5,
          checkInDate: '2024-06-15',
          checkOutDate: '2024-06-17',
          totalRooms: 150,
          bookedRooms: 45,
          pricePerNight: 250,
          starRating: 4,
          contactName: 'Hotel Reservations',
          contactPhone: '+1 (555) 234-5678',
          contactEmail: 'reservations@grandmarriott.com',
          website: 'https://grandmarriott.com',
          amenities: ['Free WiFi', 'Parking', 'Pool', 'Gym', 'Restaurant', 'Room Service'],
          specialOffers: '15% discount for wedding guests with code WEDDING2024',
          isActive: true,
          bookings: [
            {
              id: 'b1',
              guestId: 'g1',
              guestName: 'John & Sarah Smith',
              guestEmail: 'smith@email.com',
              roomType: 'Deluxe King',
              guestCount: 2,
              checkinDate: '2024-06-15',
              checkoutDate: '2024-06-17',
              specialRequests: 'High floor, away from elevator',
              bookingStatus: 'confirmed',
              bookedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
            }
          ]
        },
        {
          id: '2',
          type: 'bnb',
          name: 'Charming Garden B&B',
          description: 'Cozy bed & breakfast with beautiful gardens and homemade breakfast',
          address: '456 Garden Lane, Historic District',
          distanceFromVenue: 1.8,
          checkInDate: '2024-06-15',
          checkOutDate: '2024-06-17',
          totalRooms: 8,
          bookedRooms: 5,
          pricePerNight: 180,
          starRating: 5,
          contactName: 'Maria Rodriguez',
          contactPhone: '+1 (555) 345-6789',
          contactEmail: 'maria@gardenbnb.com',
          website: 'https://charmingardenbnb.com',
          amenities: ['Free WiFi', 'Breakfast Included', 'Parking', 'Air Conditioning'],
          specialOffers: 'Complimentary wine and cheese upon arrival',
          isActive: true,
          bookings: []
        },
        {
          id: '3',
          type: 'vacation_rental',
          name: 'Luxury Villa Retreat',
          description: 'Spacious villa with private pool perfect for families and groups',
          address: '789 Villa Drive, Wine Country',
          distanceFromVenue: 5.2,
          checkInDate: '2024-06-14',
          checkOutDate: '2024-06-18',
          totalRooms: 6,
          bookedRooms: 0,
          pricePerNight: 450,
          starRating: 5,
          contactName: 'Elite Vacation Rentals',
          contactPhone: '+1 (555) 456-7890',
          contactEmail: 'bookings@elitevacation.com',
          website: 'https://elitevacation.com/villa-retreat',
          amenities: ['Pool', 'Free WiFi', 'Parking', 'Gym', 'Pet Friendly', 'Spa'],
          specialOffers: 'Free grocery stocking service for stays over 3 nights',
          isActive: true,
          bookings: []
        }
      ];

      setAccommodations(mockAccommodations);
    } catch (error) {
      console.error('Error loading accommodations:', error);
      toast.error('Failed to load accommodations');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const accommodationData: Partial<AccommodationOption> = {
        ...formData,
        bookedRooms: 0,
        isActive: true,
        bookings: []
      };

      if (editingAccommodation) {
        // Update existing accommodation
        setAccommodations(prev => 
          prev.map(a => a.id === editingAccommodation.id ? { ...a, ...accommodationData } : a)
        );
        toast.success('Accommodation updated successfully');
      } else {
        // Create new accommodation
        const newAccommodation = {
          ...accommodationData,
          id: Date.now().toString()
        } as AccommodationOption;
        
        setAccommodations(prev => [...prev, newAccommodation]);
        toast.success('Accommodation created successfully');
      }

      setShowCreateDialog(false);
      setEditingAccommodation(null);
      resetForm();
    } catch (error) {
      console.error('Error saving accommodation:', error);
      toast.error('Failed to save accommodation');
    }
  };

  const handleEdit = (accommodation: AccommodationOption) => {
    setEditingAccommodation(accommodation);
    setFormData({
      type: accommodation.type,
      name: accommodation.name,
      description: accommodation.description,
      address: accommodation.address,
      distanceFromVenue: accommodation.distanceFromVenue,
      checkInDate: accommodation.checkInDate,
      checkOutDate: accommodation.checkOutDate,
      totalRooms: accommodation.totalRooms,
      pricePerNight: accommodation.pricePerNight,
      starRating: accommodation.starRating,
      contactName: accommodation.contactName,
      contactPhone: accommodation.contactPhone,
      contactEmail: accommodation.contactEmail,
      website: accommodation.website,
      amenities: accommodation.amenities,
      specialOffers: accommodation.specialOffers
    });
    setShowCreateDialog(true);
  };

  const handleDelete = async (accommodationId: string) => {
    try {
      setAccommodations(prev => prev.filter(a => a.id !== accommodationId));
      toast.success('Accommodation deleted successfully');
    } catch (error) {
      console.error('Error deleting accommodation:', error);
      toast.error('Failed to delete accommodation');
    }
  };

  const resetForm = () => {
    setFormData({
      type: 'hotel',
      name: '',
      description: '',
      address: '',
      distanceFromVenue: 0,
      checkInDate: '',
      checkOutDate: '',
      totalRooms: 10,
      pricePerNight: 0,
      starRating: 3,
      contactName: '',
      contactPhone: '',
      contactEmail: '',
      website: '',
      amenities: [],
      specialOffers: ''
    });
  };

  const getAccommodationIcon = (type: AccommodationOption['type']) => {
    switch (type) {
      case 'hotel': return Hotel;
      case 'bnb': return Home;
      case 'vacation_rental': return Building;
      case 'resort': return Waves;
      case 'hostel': return Bed;
      case 'apartment': return Building;
      default: return Hotel;
    }
  };

  const getAccommodationColor = (type: AccommodationOption['type']) => {
    switch (type) {
      case 'hotel': return 'bg-blue-100 text-blue-800';
      case 'bnb': return 'bg-green-100 text-green-800';
      case 'vacation_rental': return 'bg-purple-100 text-purple-800';
      case 'resort': return 'bg-cyan-100 text-cyan-800';
      case 'hostel': return 'bg-orange-100 text-orange-800';
      case 'apartment': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAvailability = (accommodation: AccommodationOption) => {
    const available = accommodation.totalRooms - accommodation.bookedRooms;
    const percentage = (accommodation.bookedRooms / accommodation.totalRooms) * 100;
    
    return {
      available,
      percentage,
      status: percentage >= 90 ? 'full' : percentage >= 70 ? 'limited' : 'available'
    };
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={cn(
          'w-4 h-4',
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        )} 
      />
    ));
  };

  const getAmenityIcon = (amenity: string) => {
    switch (amenity.toLowerCase()) {
      case 'free wifi': return Wifi;
      case 'parking': return Car;
      case 'restaurant': return UtensilsCrossed;
      case 'gym': return Dumbbell;
      case 'pool': return Waves;
      case 'breakfast included': return Coffee;
      default: return CheckCircle;
    }
  };

  const toggleAmenity = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  return (
    <div className={cn('space-y-6 p-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-wedding-navy flex items-center">
            <Hotel className="w-6 h-6 mr-2" />
            Accommodation
          </h2>
          <p className="text-sm text-muted-foreground">
            Manage guest accommodation options for your wedding
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => {
                setEditingAccommodation(null);
                resetForm();
              }}
              className="bg-wedding-navy hover:bg-wedding-navy/90"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Accommodation
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-popup max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingAccommodation ? 'Edit Accommodation' : 'Add Accommodation'}
              </DialogTitle>
              <DialogDescription>
                {editingAccommodation 
                  ? 'Update the accommodation details.' 
                  : 'Create a new accommodation option for your guests.'
                }
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="font-medium text-wedding-navy">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="type">Accommodation Type</Label>
                    <Select 
                      value={formData.type} 
                      onValueChange={(value: any) => setFormData({...formData, type: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hotel">Hotel</SelectItem>
                        <SelectItem value="bnb">Bed & Breakfast</SelectItem>
                        <SelectItem value="vacation_rental">Vacation Rental</SelectItem>
                        <SelectItem value="resort">Resort</SelectItem>
                        <SelectItem value="hostel">Hostel</SelectItem>
                        <SelectItem value="apartment">Apartment</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="name">Property Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="e.g., Grand Marriott Hotel"
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Brief description of the accommodation"
                    rows={2}
                  />
                </div>
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    placeholder="Full address of the property"
                    required
                  />
                </div>
              </div>

              {/* Location & Dates */}
              <div className="space-y-4">
                <h3 className="font-medium text-wedding-navy">Location & Dates</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="distanceFromVenue">Distance from Venue (miles)</Label>
                    <Input
                      id="distanceFromVenue"
                      type="number"
                      value={formData.distanceFromVenue}
                      onChange={(e) => setFormData({...formData, distanceFromVenue: Number(e.target.value)})}
                      min="0"
                      step="0.1"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="checkInDate">Check-in Date</Label>
                    <Input
                      id="checkInDate"
                      type="date"
                      value={formData.checkInDate}
                      onChange={(e) => setFormData({...formData, checkInDate: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="checkOutDate">Check-out Date</Label>
                    <Input
                      id="checkOutDate"
                      type="date"
                      value={formData.checkOutDate}
                      onChange={(e) => setFormData({...formData, checkOutDate: e.target.value})}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Capacity & Pricing */}
              <div className="space-y-4">
                <h3 className="font-medium text-wedding-navy">Capacity & Pricing</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="totalRooms">Total Rooms</Label>
                    <Input
                      id="totalRooms"
                      type="number"
                      value={formData.totalRooms}
                      onChange={(e) => setFormData({...formData, totalRooms: Number(e.target.value)})}
                      min="1"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="pricePerNight">Price per Night ($)</Label>
                    <Input
                      id="pricePerNight"
                      type="number"
                      value={formData.pricePerNight}
                      onChange={(e) => setFormData({...formData, pricePerNight: Number(e.target.value)})}
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <Label htmlFor="starRating">Star Rating</Label>
                    <Select 
                      value={formData.starRating.toString()} 
                      onValueChange={(value) => setFormData({...formData, starRating: Number(value)})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 Star</SelectItem>
                        <SelectItem value="2">2 Stars</SelectItem>
                        <SelectItem value="3">3 Stars</SelectItem>
                        <SelectItem value="4">4 Stars</SelectItem>
                        <SelectItem value="5">5 Stars</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="font-medium text-wedding-navy">Contact Information</h3>
                <div>
                  <Label htmlFor="contactName">Contact Name/Company</Label>
                  <Input
                    id="contactName"
                    value={formData.contactName}
                    onChange={(e) => setFormData({...formData, contactName: e.target.value})}
                    placeholder="Property manager or company name"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="contactPhone">Phone Number</Label>
                    <Input
                      id="contactPhone"
                      type="tel"
                      value={formData.contactPhone}
                      onChange={(e) => setFormData({...formData, contactPhone: e.target.value})}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  <div>
                    <Label htmlFor="contactEmail">Email Address</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      value={formData.contactEmail}
                      onChange={(e) => setFormData({...formData, contactEmail: e.target.value})}
                      placeholder="contact@property.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      type="url"
                      value={formData.website}
                      onChange={(e) => setFormData({...formData, website: e.target.value})}
                      placeholder="https://property.com"
                    />
                  </div>
                </div>
              </div>

              {/* Amenities */}
              <div className="space-y-4">
                <h3 className="font-medium text-wedding-navy">Amenities</h3>
                <div className="grid grid-cols-3 gap-2">
                  {availableAmenities.map((amenity) => (
                    <div key={amenity} className="flex items-center space-x-2">
                      <Switch
                        id={amenity}
                        checked={formData.amenities.includes(amenity)}
                        onCheckedChange={() => toggleAmenity(amenity)}
                      />
                      <Label htmlFor={amenity} className="text-sm">{amenity}</Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Special Offers */}
              <div className="space-y-4">
                <h3 className="font-medium text-wedding-navy">Special Offers</h3>
                <div>
                  <Label htmlFor="specialOffers">Special Offers for Wedding Guests</Label>
                  <Textarea
                    id="specialOffers"
                    value={formData.specialOffers}
                    onChange={(e) => setFormData({...formData, specialOffers: e.target.value})}
                    placeholder="Discounts, complimentary services, upgrade offers..."
                    rows={2}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowCreateDialog(false);
                    setEditingAccommodation(null);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-wedding-navy hover:bg-wedding-navy/90">
                  {editingAccommodation ? 'Update Accommodation' : 'Add Accommodation'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Accommodations List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-wedding-navy mx-auto"></div>
          </div>
        ) : accommodations.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Hotel className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                No accommodations added yet. Click "Add Accommodation" to get started.
              </p>
            </CardContent>
          </Card>
        ) : (
          <AnimatePresence>
            {accommodations.map((accommodation) => {
              const Icon = getAccommodationIcon(accommodation.type);
              const availability = getAvailability(accommodation);
              
              return (
                <motion.div
                  key={accommodation.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="w-10 h-10 rounded-lg bg-wedding-navy/10 flex items-center justify-center">
                              <Icon className="w-5 h-5 text-wedding-navy" />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-wedding-navy">
                                {accommodation.name}
                              </h3>
                              <div className="flex items-center space-x-2">
                                <Badge className={getAccommodationColor(accommodation.type)}>
                                  {accommodation.type.replace('_', ' ')}
                                </Badge>
                                <div className="flex items-center">
                                  {renderStars(accommodation.starRating)}
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <p className="text-sm text-gray-700 mb-4">
                            {accommodation.description}
                          </p>

                          {/* Location & Dates */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="space-y-2">
                              <div className="flex items-center text-sm">
                                <MapPin className="w-4 h-4 mr-2 text-blue-600" />
                                <span className="font-medium">Address:</span>
                                <span className="ml-1">{accommodation.address}</span>
                              </div>
                              <div className="flex items-center text-sm">
                                <Navigation className="w-4 h-4 mr-2 text-green-600" />
                                <span className="font-medium">Distance:</span>
                                <span className="ml-1">{accommodation.distanceFromVenue} miles from venue</span>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center text-sm">
                                <Calendar className="w-4 h-4 mr-2 text-purple-600" />
                                <span className="font-medium">Check-in:</span>
                                <span className="ml-1">{accommodation.checkInDate}</span>
                              </div>
                              <div className="flex items-center text-sm">
                                <Calendar className="w-4 h-4 mr-2 text-red-600" />
                                <span className="font-medium">Check-out:</span>
                                <span className="ml-1">{accommodation.checkOutDate}</span>
                              </div>
                            </div>
                          </div>

                          {/* Capacity & Pricing */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div className="text-center">
                              <div className="text-sm text-muted-foreground">Total Rooms</div>
                              <div className="font-semibold">{accommodation.totalRooms}</div>
                            </div>
                            <div className="text-center">
                              <div className="text-sm text-muted-foreground">Booked</div>
                              <div className="font-semibold">{accommodation.bookedRooms}</div>
                            </div>
                            <div className="text-center">
                              <div className="text-sm text-muted-foreground">Available</div>
                              <div className={cn(
                                'font-semibold',
                                availability.status === 'full' ? 'text-red-600' :
                                availability.status === 'limited' ? 'text-orange-600' :
                                'text-green-600'
                              )}>
                                {availability.available}
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-sm text-muted-foreground">Price/Night</div>
                              <div className="font-semibold">
                                {accommodation.pricePerNight > 0 ? `$${accommodation.pricePerNight}` : 'Contact'}
                              </div>
                            </div>
                          </div>

                          {/* Availability Bar */}
                          <div className="mb-4">
                            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                              <span>Booking Status</span>
                              <span>{Math.round(availability.percentage)}% booked</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={cn(
                                  'h-2 rounded-full transition-all',
                                  availability.status === 'full' ? 'bg-red-500' :
                                  availability.status === 'limited' ? 'bg-orange-500' :
                                  'bg-green-500'
                                )}
                                style={{ width: `${availability.percentage}%` }}
                              />
                            </div>
                          </div>

                          {/* Amenities */}
                          {accommodation.amenities.length > 0 && (
                            <div className="mb-4">
                              <div className="text-sm font-medium text-gray-600 mb-2">Amenities</div>
                              <div className="flex flex-wrap gap-2">
                                {accommodation.amenities.slice(0, 6).map((amenity) => {
                                  const AmenityIcon = getAmenityIcon(amenity);
                                  return (
                                    <div key={amenity} className="flex items-center text-xs bg-gray-100 px-2 py-1 rounded-full">
                                      <AmenityIcon className="w-3 h-3 mr-1" />
                                      {amenity}
                                    </div>
                                  );
                                })}
                                {accommodation.amenities.length > 6 && (
                                  <div className="text-xs text-muted-foreground px-2 py-1">
                                    +{accommodation.amenities.length - 6} more
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Contact Information */}
                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center">
                              <User className="w-3 h-3 mr-1" />
                              {accommodation.contactName}
                            </div>
                            {accommodation.contactPhone && (
                              <div className="flex items-center">
                                <Phone className="w-3 h-3 mr-1" />
                                {accommodation.contactPhone}
                              </div>
                            )}
                            {accommodation.contactEmail && (
                              <div className="flex items-center">
                                <Mail className="w-3 h-3 mr-1" />
                                {accommodation.contactEmail}
                              </div>
                            )}
                          </div>

                          {accommodation.specialOffers && (
                            <div className="mt-3 p-2 bg-green-50 rounded-lg">
                              <div className="flex items-start">
                                <Info className="w-4 h-4 mt-0.5 mr-2 text-green-600" />
                                <div>
                                  <div className="text-sm font-medium text-green-900">Special Offers</div>
                                  <div className="text-xs text-green-700">{accommodation.specialOffers}</div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedAccommodation(accommodation);
                              setShowBookingDialog(true);
                            }}
                            className="text-blue-600 hover:bg-blue-50"
                          >
                            <Bed className="w-4 h-4 mr-1" />
                            View Bookings
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(accommodation)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Accommodation</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{accommodation.name}"? This will cancel all 
                                  existing bookings and cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(accommodation.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete Accommodation
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      {/* Booking Details Dialog */}
      <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
        <DialogContent className="glass-popup max-w-3xl">
          <DialogHeader>
            <DialogTitle>Bookings for {selectedAccommodation?.name}</DialogTitle>
            <DialogDescription>
              View and manage guest bookings for this accommodation
            </DialogDescription>
          </DialogHeader>
          {selectedAccommodation && (
            <div className="space-y-4">
              {selectedAccommodation.bookings.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No bookings yet for this accommodation.
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedAccommodation.bookings.map((booking) => (
                    <div key={booking.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{booking.guestName}</div>
                          <div className="text-sm text-muted-foreground">{booking.guestEmail}</div>
                          <div className="text-sm">
                            {booking.roomType} • {booking.guestCount} guest{booking.guestCount > 1 ? 's' : ''}
                          </div>
                          <div className="text-sm">
                            {booking.checkinDate} to {booking.checkoutDate}
                          </div>
                          {booking.specialRequests && (
                            <div className="text-sm text-blue-600 mt-1">
                              Special requests: {booking.specialRequests}
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <Badge 
                            variant={
                              booking.bookingStatus === 'confirmed' ? 'default' :
                              booking.bookingStatus === 'pending' ? 'secondary' :
                              'destructive'
                            }
                          >
                            {booking.bookingStatus}
                          </Badge>
                          <div className="text-xs text-muted-foreground mt-1">
                            Booked {new Date(booking.bookedAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AccommodationPanel;