import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Car, 
  Bus, 
  Plane, 
  Train, 
  MapPin, 
  Clock, 
  Users, 
  Plus,
  Edit,
  Trash2,
  Calendar,
  Phone,
  Mail,
  Navigation,
  AlertCircle,
  CheckCircle,
  User,
  DollarSign,
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
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface TransportOption {
  id: string;
  type: 'bus' | 'car' | 'shuttle' | 'taxi' | 'rideshare' | 'train' | 'plane';
  name: string;
  description: string;
  departureLocation: string;
  arrivalLocation: string;
  departureTime: string;
  arrivalTime: string;
  capacity: number;
  bookedSeats: number;
  pricePerPerson: number;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  specialRequirements: string;
  isActive: boolean;
  bookings: TransportBooking[];
}

interface TransportBooking {
  id: string;
  guestId: string;
  guestName: string;
  guestEmail: string;
  passengerCount: number;
  specialRequests: string;
  bookingStatus: 'pending' | 'confirmed' | 'cancelled';
  bookedAt: string;
}

interface TransportPanelProps {
  className?: string;
}

const TransportPanel: React.FC<TransportPanelProps> = ({ className }) => {
  const [transportOptions, setTransportOptions] = useState<TransportOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingTransport, setEditingTransport] = useState<TransportOption | null>(null);
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [selectedTransport, setSelectedTransport] = useState<TransportOption | null>(null);
  const [formData, setFormData] = useState({
    type: 'bus' as TransportOption['type'],
    name: '',
    description: '',
    departureLocation: '',
    arrivalLocation: '',
    departureTime: '',
    arrivalTime: '',
    capacity: 50,
    pricePerPerson: 0,
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    specialRequirements: ''
  });

  useEffect(() => {
    loadTransportOptions();
  }, []);

  const loadTransportOptions = async () => {
    try {
      setLoading(true);
      // Mock data - in a real app, this would come from Supabase
      const mockTransports: TransportOption[] = [
        {
          id: '1',
          type: 'bus',
          name: 'Wedding Shuttle Bus',
          description: 'Luxury charter bus for wedding guests',
          departureLocation: 'Marriott Hotel Downtown',
          arrivalLocation: 'Ben Ean Winery',
          departureTime: '14:00',
          arrivalTime: '15:30',
          capacity: 48,
          bookedSeats: 32,
          pricePerPerson: 25,
          contactName: 'Metro Charter Services',
          contactPhone: '+1 (555) 123-4567',
          contactEmail: 'bookings@metrocharter.com',
          specialRequirements: 'Wheelchair accessible, Air conditioning',
          isActive: true,
          bookings: [
            {
              id: 'b1',
              guestId: 'g1',
              guestName: 'Sarah Johnson',
              guestEmail: 'sarah.j@email.com',
              passengerCount: 2,
              specialRequests: 'Wheelchair access needed',
              bookingStatus: 'confirmed',
              bookedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
            }
          ]
        },
        {
          id: '2',
          type: 'shuttle',
          name: 'Return Shuttle Service',
          description: 'Return journey to hotels',
          departureLocation: 'Ben Ean Winery',
          arrivalLocation: 'Multiple Hotels',
          departureTime: '23:00',
          arrivalTime: '00:30',
          capacity: 48,
          bookedSeats: 28,
          pricePerPerson: 25,
          contactName: 'Metro Charter Services',
          contactPhone: '+1 (555) 123-4567',
          contactEmail: 'bookings@metrocharter.com',
          specialRequirements: 'Multiple drop-off points',
          isActive: true,
          bookings: []
        },
        {
          id: '3',
          type: 'car',
          name: 'VIP Car Service',
          description: 'Luxury sedan for special guests',
          departureLocation: 'Airport',
          arrivalLocation: 'Hotel/Venue',
          departureTime: 'On demand',
          arrivalTime: 'Variable',
          capacity: 4,
          bookedSeats: 0,
          pricePerPerson: 150,
          contactName: 'Elite Transportation',
          contactPhone: '+1 (555) 987-6543',
          contactEmail: 'vip@elitetrans.com',
          specialRequirements: 'Premium service, meet & greet',
          isActive: true,
          bookings: []
        }
      ];

      setTransportOptions(mockTransports);
    } catch (error) {
      console.error('Error loading transport options:', error);
      toast.error('Failed to load transport options');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const transportData: Partial<TransportOption> = {
        ...formData,
        bookedSeats: 0,
        isActive: true,
        bookings: []
      };

      if (editingTransport) {
        // Update existing transport
        setTransportOptions(prev => 
          prev.map(t => t.id === editingTransport.id ? { ...t, ...transportData } : t)
        );
        toast.success('Transport option updated successfully');
      } else {
        // Create new transport
        const newTransport = {
          ...transportData,
          id: Date.now().toString()
        } as TransportOption;
        
        setTransportOptions(prev => [...prev, newTransport]);
        toast.success('Transport option created successfully');
      }

      setShowCreateDialog(false);
      setEditingTransport(null);
      resetForm();
    } catch (error) {
      console.error('Error saving transport:', error);
      toast.error('Failed to save transport option');
    }
  };

  const handleEdit = (transport: TransportOption) => {
    setEditingTransport(transport);
    setFormData({
      type: transport.type,
      name: transport.name,
      description: transport.description,
      departureLocation: transport.departureLocation,
      arrivalLocation: transport.arrivalLocation,
      departureTime: transport.departureTime,
      arrivalTime: transport.arrivalTime,
      capacity: transport.capacity,
      pricePerPerson: transport.pricePerPerson,
      contactName: transport.contactName,
      contactPhone: transport.contactPhone,
      contactEmail: transport.contactEmail,
      specialRequirements: transport.specialRequirements
    });
    setShowCreateDialog(true);
  };

  const handleDelete = async (transportId: string) => {
    try {
      setTransportOptions(prev => prev.filter(t => t.id !== transportId));
      toast.success('Transport option deleted successfully');
    } catch (error) {
      console.error('Error deleting transport:', error);
      toast.error('Failed to delete transport option');
    }
  };

  const resetForm = () => {
    setFormData({
      type: 'bus',
      name: '',
      description: '',
      departureLocation: '',
      arrivalLocation: '',
      departureTime: '',
      arrivalTime: '',
      capacity: 50,
      pricePerPerson: 0,
      contactName: '',
      contactPhone: '',
      contactEmail: '',
      specialRequirements: ''
    });
  };

  const getTransportIcon = (type: TransportOption['type']) => {
    switch (type) {
      case 'bus': return Bus;
      case 'car': return Car;
      case 'shuttle': return Bus;
      case 'taxi': return Car;
      case 'rideshare': return Car;
      case 'train': return Train;
      case 'plane': return Plane;
      default: return Car;
    }
  };

  const getTransportColor = (type: TransportOption['type']) => {
    switch (type) {
      case 'bus': return 'bg-blue-100 text-blue-800';
      case 'car': return 'bg-green-100 text-green-800';
      case 'shuttle': return 'bg-purple-100 text-purple-800';
      case 'taxi': return 'bg-yellow-100 text-yellow-800';
      case 'rideshare': return 'bg-orange-100 text-orange-800';
      case 'train': return 'bg-gray-100 text-gray-800';
      case 'plane': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAvailability = (transport: TransportOption) => {
    const available = transport.capacity - transport.bookedSeats;
    const percentage = (transport.bookedSeats / transport.capacity) * 100;
    
    return {
      available,
      percentage,
      status: percentage >= 90 ? 'full' : percentage >= 70 ? 'limited' : 'available'
    };
  };

  return (
    <div className={cn('space-y-6 p-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-wedding-navy flex items-center">
            <Car className="w-6 h-6 mr-2" />
            Transportation
          </h2>
          <p className="text-sm text-muted-foreground">
            Coordinate guest transportation for your wedding
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => {
                setEditingTransport(null);
                resetForm();
              }}
              className="bg-wedding-navy hover:bg-wedding-navy/90"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Transport
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-popup max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingTransport ? 'Edit Transport Option' : 'Add Transport Option'}
              </DialogTitle>
              <DialogDescription>
                {editingTransport 
                  ? 'Update the transportation details.' 
                  : 'Create a new transportation option for your guests.'
                }
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="font-medium text-wedding-navy">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="type">Transport Type</Label>
                    <Select 
                      value={formData.type} 
                      onValueChange={(value: any) => setFormData({...formData, type: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bus">Bus</SelectItem>
                        <SelectItem value="shuttle">Shuttle</SelectItem>
                        <SelectItem value="car">Car</SelectItem>
                        <SelectItem value="taxi">Taxi</SelectItem>
                        <SelectItem value="rideshare">Rideshare</SelectItem>
                        <SelectItem value="train">Train</SelectItem>
                        <SelectItem value="plane">Plane</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="name">Service Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="e.g., Wedding Shuttle Bus"
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
                    placeholder="Brief description of the transport service"
                    rows={2}
                  />
                </div>
              </div>

              {/* Route Information */}
              <div className="space-y-4">
                <h3 className="font-medium text-wedding-navy">Route & Schedule</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="departureLocation">Departure Location</Label>
                    <Input
                      id="departureLocation"
                      value={formData.departureLocation}
                      onChange={(e) => setFormData({...formData, departureLocation: e.target.value})}
                      placeholder="Starting point"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="arrivalLocation">Arrival Location</Label>
                    <Input
                      id="arrivalLocation"
                      value={formData.arrivalLocation}
                      onChange={(e) => setFormData({...formData, arrivalLocation: e.target.value})}
                      placeholder="Destination"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="departureTime">Departure Time</Label>
                    <Input
                      id="departureTime"
                      type="time"
                      value={formData.departureTime}
                      onChange={(e) => setFormData({...formData, departureTime: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="arrivalTime">Arrival Time</Label>
                    <Input
                      id="arrivalTime"
                      type="time"
                      value={formData.arrivalTime}
                      onChange={(e) => setFormData({...formData, arrivalTime: e.target.value})}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Capacity & Pricing */}
              <div className="space-y-4">
                <h3 className="font-medium text-wedding-navy">Capacity & Pricing</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="capacity">Capacity</Label>
                    <Input
                      id="capacity"
                      type="number"
                      value={formData.capacity}
                      onChange={(e) => setFormData({...formData, capacity: Number(e.target.value)})}
                      min="1"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="pricePerPerson">Price per Person ($)</Label>
                    <Input
                      id="pricePerPerson"
                      type="number"
                      value={formData.pricePerPerson}
                      onChange={(e) => setFormData({...formData, pricePerPerson: Number(e.target.value)})}
                      min="0"
                      step="0.01"
                    />
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
                    placeholder="Service provider name"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
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
                      placeholder="contact@transport.com"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="specialRequirements">Special Requirements</Label>
                  <Textarea
                    id="specialRequirements"
                    value={formData.specialRequirements}
                    onChange={(e) => setFormData({...formData, specialRequirements: e.target.value})}
                    placeholder="Wheelchair accessibility, child seats, etc."
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
                    setEditingTransport(null);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-wedding-navy hover:bg-wedding-navy/90">
                  {editingTransport ? 'Update Transport' : 'Add Transport'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Transport Options List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-wedding-navy mx-auto"></div>
          </div>
        ) : transportOptions.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Car className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                No transport options added yet. Click "Add Transport" to get started.
              </p>
            </CardContent>
          </Card>
        ) : (
          <AnimatePresence>
            {transportOptions.map((transport) => {
              const Icon = getTransportIcon(transport.type);
              const availability = getAvailability(transport);
              
              return (
                <motion.div
                  key={transport.id}
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
                                {transport.name}
                              </h3>
                              <Badge className={getTransportColor(transport.type)}>
                                {transport.type}
                              </Badge>
                            </div>
                          </div>
                          
                          <p className="text-sm text-gray-700 mb-4">
                            {transport.description}
                          </p>

                          {/* Route Information */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="space-y-2">
                              <div className="flex items-center text-sm">
                                <MapPin className="w-4 h-4 mr-2 text-green-600" />
                                <span className="font-medium">From:</span>
                                <span className="ml-1">{transport.departureLocation}</span>
                              </div>
                              <div className="flex items-center text-sm">
                                <MapPin className="w-4 h-4 mr-2 text-red-600" />
                                <span className="font-medium">To:</span>
                                <span className="ml-1">{transport.arrivalLocation}</span>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center text-sm">
                                <Clock className="w-4 h-4 mr-2 text-blue-600" />
                                <span className="font-medium">Departure:</span>
                                <span className="ml-1">{transport.departureTime}</span>
                              </div>
                              <div className="flex items-center text-sm">
                                <Clock className="w-4 h-4 mr-2 text-purple-600" />
                                <span className="font-medium">Arrival:</span>
                                <span className="ml-1">{transport.arrivalTime}</span>
                              </div>
                            </div>
                          </div>

                          {/* Capacity & Pricing */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div className="text-center">
                              <div className="text-sm text-muted-foreground">Capacity</div>
                              <div className="font-semibold">{transport.capacity}</div>
                            </div>
                            <div className="text-center">
                              <div className="text-sm text-muted-foreground">Booked</div>
                              <div className="font-semibold">{transport.bookedSeats}</div>
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
                              <div className="text-sm text-muted-foreground">Price</div>
                              <div className="font-semibold">
                                {transport.pricePerPerson > 0 ? `$${transport.pricePerPerson}` : 'Free'}
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

                          {/* Contact Information */}
                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center">
                              <User className="w-3 h-3 mr-1" />
                              {transport.contactName}
                            </div>
                            {transport.contactPhone && (
                              <div className="flex items-center">
                                <Phone className="w-3 h-3 mr-1" />
                                {transport.contactPhone}
                              </div>
                            )}
                            {transport.contactEmail && (
                              <div className="flex items-center">
                                <Mail className="w-3 h-3 mr-1" />
                                {transport.contactEmail}
                              </div>
                            )}
                          </div>

                          {transport.specialRequirements && (
                            <div className="mt-3 p-2 bg-blue-50 rounded-lg">
                              <div className="flex items-start">
                                <Info className="w-4 h-4 mt-0.5 mr-2 text-blue-600" />
                                <div>
                                  <div className="text-sm font-medium text-blue-900">Special Requirements</div>
                                  <div className="text-xs text-blue-700">{transport.specialRequirements}</div>
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
                              setSelectedTransport(transport);
                              setShowBookingDialog(true);
                            }}
                            className="text-blue-600 hover:bg-blue-50"
                          >
                            <Users className="w-4 h-4 mr-1" />
                            View Bookings
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(transport)}
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
                                <AlertDialogTitle>Delete Transport Option</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{transport.name}"? This will cancel all 
                                  existing bookings and cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(transport.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete Transport
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
            <DialogTitle>Bookings for {selectedTransport?.name}</DialogTitle>
            <DialogDescription>
              View and manage guest bookings for this transport option
            </DialogDescription>
          </DialogHeader>
          {selectedTransport && (
            <div className="space-y-4">
              {selectedTransport.bookings.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No bookings yet for this transport option.
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedTransport.bookings.map((booking) => (
                    <div key={booking.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{booking.guestName}</div>
                          <div className="text-sm text-muted-foreground">{booking.guestEmail}</div>
                          <div className="text-sm">
                            {booking.passengerCount} passenger{booking.passengerCount > 1 ? 's' : ''}
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

export default TransportPanel;