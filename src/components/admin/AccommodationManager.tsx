import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save,
  X,
  ExternalLink,
  Hotel,
  Home,
  Wine,
  Star,
  MapPin,
  Phone,
  Mail,
  DollarSign,
  Car,
  Camera,
  Download,
  Link,
  Image
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AccommodationCategory {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  display_order: number;
  is_active: boolean;
}

interface AccommodationOption {
  id: string;
  category_id?: string;
  name: string;
  type?: string;
  area?: string;
  address?: string;
  description?: string;
  website_url?: string;
  booking_url?: string;
  phone?: string;
  email?: string;
  price_range?: string;
  distance_from_venue?: string;
  amenities?: string[];
  image_url?: string;
  coordinates?: [number, number]; // [longitude, latitude] for mapping
  featured: boolean;
  display_order: number;
  is_active: boolean;
  category?: AccommodationCategory;
}

interface AccommodationFormData {
  name: string;
  type: string;
  area: string;
  address: string;
  description: string;
  website_url: string;
  booking_url: string;
  phone: string;
  email: string;
  price_range: string;
  distance_from_venue: string;
  amenities: string;
  image_url: string;
  coordinates: string; // Will be stored as "lng,lat" string
  featured: boolean;
  category_id: string;
}

const AccommodationManager: React.FC = () => {
  const [categories, setCategories] = useState<AccommodationCategory[]>([]);
  const [accommodations, setAccommodations] = useState<AccommodationOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingAccommodation, setEditingAccommodation] = useState<AccommodationOption | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [capturingImage, setCapturingImage] = useState(false);
  const [formData, setFormData] = useState<AccommodationFormData>({
    name: '',
    type: '',
    area: '',
    address: '',
    description: '',
    website_url: '',
    booking_url: '',
    phone: '',
    email: '',
    price_range: '',
    distance_from_venue: '',
    amenities: '',
    image_url: '',
    coordinates: '',
    featured: false,
    category_id: ''
  });

  useEffect(() => {
    loadAccommodationData();
  }, []);

  const loadAccommodationData = async () => {
    setLoading(true);
    try {
      // Load categories
      const { data: categoriesData, error: categoriesError } = await (supabase as any)
        .from('accommodation_categories')
        .select('*')
        .order('display_order');

      if (categoriesError) throw categoriesError;

      // Load accommodations with categories
      const { data: accommodationsData, error: accommodationsError } = await (supabase as any)
        .from('accommodation_options')
        .select(`
          *,
          category:accommodation_categories(*)
        `)
        .order('display_order');

      if (accommodationsError) throw accommodationsError;

      setCategories(categoriesData || []);
      setAccommodations(accommodationsData || []);
    } catch (error) {
      console.error('Error loading accommodation data:', error);
      toast.error('Failed to load accommodation data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof AccommodationFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const captureWebsiteImage = async (websiteUrl: string) => {
    if (!websiteUrl) {
      toast.error('Please provide a website URL first');
      return;
    }

    setCapturingImage(true);
    try {
      // This is a placeholder for image capture functionality
      // In a real implementation, you might use a service like:
      // - Screenshot API (screenshotapi.net)
      // - Puppeteer service
      // - Manual upload interface
      
      toast.info('Image capture feature coming soon. Please upload images manually for now.');
      
      // For now, we'll extract domain and suggest a placeholder
      const domain = new URL(websiteUrl).hostname;
      const placeholderImageUrl = `https://via.placeholder.com/400x300/E5E7EB/374151?text=${encodeURIComponent(domain)}`;
      
      setFormData(prev => ({
        ...prev,
        image_url: placeholderImageUrl
      }));
      
    } catch (error) {
      console.error('Error capturing image:', error);
      toast.error('Failed to capture website image');
    } finally {
      setCapturingImage(false);
    }
  };

  const geocodeAddress = async (address: string) => {
    if (!address) {
      toast.error('Please provide an address first');
      return;
    }

    try {
      // Use Mapbox Geocoding API to get coordinates
      const mapboxToken = 'pk.eyJ1Ijoic3VwYWJhc2VjcnlwdCIsImEiOiJjbWNzcG03N3kxNjFyMmlxMmQyb290cWhvIn0.VTVcx03Z6tAg5ZVzJoxjSA';
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${mapboxToken}&country=AU&limit=1`
      );
      
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const coordinates = data.features[0].center; // [lng, lat]
        setFormData(prev => ({
          ...prev,
          coordinates: `${coordinates[0]},${coordinates[1]}`
        }));
        toast.success('Coordinates found and added');
      } else {
        toast.error('Could not find coordinates for this address');
      }
    } catch (error) {
      console.error('Error geocoding address:', error);
      toast.error('Failed to get coordinates');
    }
  };

  const handleSave = async () => {
    try {
      const amenitiesArray = formData.amenities.split(',').map(a => a.trim()).filter(a => a);
      const coordinatesArray = formData.coordinates ? 
        formData.coordinates.split(',').map(c => parseFloat(c.trim())) : null;
      
      const accommodationData = {
        ...formData,
        amenities: amenitiesArray,
        coordinates: coordinatesArray,
        category_id: formData.category_id || null
      };

      if (editingAccommodation) {
        const { error } = await (supabase as any)
          .from('accommodation_options')
          .update(accommodationData)
          .eq('id', editingAccommodation.id);

        if (error) throw error;
        toast.success('Accommodation updated successfully');
      } else {
        const { error } = await (supabase as any)
          .from('accommodation_options')
          .insert([accommodationData]);

        if (error) throw error;
        toast.success('Accommodation added successfully');
      }

      setEditingAccommodation(null);
      setShowAddForm(false);
      setFormData({
        name: '',
        type: '',
        area: '',
        address: '',
        description: '',
        website_url: '',
        booking_url: '',
        phone: '',
        email: '',
        price_range: '',
        distance_from_venue: '',
        amenities: '',
        image_url: '',
        coordinates: '',
        featured: false,
        category_id: ''
      });
      loadAccommodationData();
    } catch (error) {
      console.error('Error saving accommodation:', error);
      toast.error('Failed to save accommodation');
    }
  };

  const handleEdit = (accommodation: AccommodationOption) => {
    setEditingAccommodation(accommodation);
    setFormData({
      name: accommodation.name,
      type: accommodation.type || '',
      area: accommodation.area || '',
      address: accommodation.address || '',
      description: accommodation.description || '',
      website_url: accommodation.website_url || '',
      booking_url: accommodation.booking_url || '',
      phone: accommodation.phone || '',
      email: accommodation.email || '',
      price_range: accommodation.price_range || '',
      distance_from_venue: accommodation.distance_from_venue || '',
      amenities: accommodation.amenities?.join(', ') || '',
      image_url: accommodation.image_url || '',
      coordinates: accommodation.coordinates ? `${accommodation.coordinates[0]},${accommodation.coordinates[1]}` : '',
      featured: accommodation.featured,
      category_id: accommodation.category_id || ''
    });
    setShowAddForm(true);
  };

  const handleDelete = async (accommodationId: string) => {
    if (!confirm('Are you sure you want to delete this accommodation option?')) return;

    try {
      const { error } = await (supabase as any)
        .from('accommodation_options')
        .delete()
        .eq('id', accommodationId);

      if (error) throw error;
      toast.success('Accommodation deleted successfully');
      loadAccommodationData();
    } catch (error) {
      console.error('Error deleting accommodation:', error);
      toast.error('Failed to delete accommodation');
    }
  };

  const toggleActive = async (accommodationId: string, isActive: boolean) => {
    try {
      const { error } = await (supabase as any)
        .from('accommodation_options')
        .update({ is_active: !isActive })
        .eq('id', accommodationId);

      if (error) throw error;
      toast.success(`Accommodation ${!isActive ? 'activated' : 'deactivated'}`);
      loadAccommodationData();
    } catch (error) {
      console.error('Error toggling accommodation status:', error);
      toast.error('Failed to update accommodation status');
    }
  };

  const getCategoryIcon = (iconName?: string) => {
    switch (iconName) {
      case 'hotel': return <Hotel className="w-4 h-4" />;
      case 'wine': return <Wine className="w-4 h-4" />;
      case 'home': return <Home className="w-4 h-4" />;
      default: return <Hotel className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-wedding-navy border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Accommodation Management</h2>
          <p className="text-muted-foreground">
            Manage hotel recommendations and lodging options for wedding guests
          </p>
        </div>
        <Button onClick={() => { setShowAddForm(true); setEditingAccommodation(null); }}>
          <Plus className="w-4 h-4 mr-2" />
          Add Accommodation
        </Button>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <Card className="border-wedding-purple/30">
          <CardHeader>
            <CardTitle>
              {editingAccommodation ? 'Edit Accommodation' : 'Add New Accommodation'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Hotel or accommodation name"
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <select
                  value={formData.category_id}
                  onChange={(e) => handleInputChange('category_id', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="">Select category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="type">Type</Label>
                <Input
                  id="type"
                  value={formData.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  placeholder="hotel, resort, airbnb, etc."
                />
              </div>
              <div>
                <Label htmlFor="area">Area/Location</Label>
                <Input
                  id="area"
                  value={formData.area}
                  onChange={(e) => handleInputChange('area', e.target.value)}
                  placeholder="Newcastle City, Pokolbin, etc."
                />
              </div>
              <div>
                <Label htmlFor="price_range">Price Range</Label>
                <Input
                  id="price_range"
                  value={formData.price_range}
                  onChange={(e) => handleInputChange('price_range', e.target.value)}
                  placeholder="$120-180/night"
                />
              </div>
              <div>
                <Label htmlFor="distance_from_venue">Distance from Venue</Label>
                <Input
                  id="distance_from_venue"
                  value={formData.distance_from_venue}
                  onChange={(e) => handleInputChange('distance_from_venue', e.target.value)}
                  placeholder="45 minutes to venue"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="Phone number"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Contact email"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Full address"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Description of the accommodation..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="website_url">Website URL</Label>
                <Input
                  id="website_url"
                  value={formData.website_url}
                  onChange={(e) => handleInputChange('website_url', e.target.value)}
                  placeholder="https://www.hotel.com"
                />
              </div>
              <div>
                <Label htmlFor="booking_url">Booking URL</Label>
                <Input
                  id="booking_url"
                  value={formData.booking_url}
                  onChange={(e) => handleInputChange('booking_url', e.target.value)}
                  placeholder="Direct booking link"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="amenities">Amenities (comma-separated)</Label>
              <Input
                id="amenities"
                value={formData.amenities}
                onChange={(e) => handleInputChange('amenities', e.target.value)}
                placeholder="Free WiFi, Pool, Restaurant, Parking"
              />
            </div>

            <div>
              <Label htmlFor="image_url">Accommodation Image</Label>
              <div className="space-y-2">
                <Input
                  id="image_url"
                  value={formData.image_url}
                  onChange={(e) => handleInputChange('image_url', e.target.value)}
                  placeholder="Image URL (or use capture button)"
                />
                <div className="flex gap-2">
                  <Button 
                    type="button"
                    variant="outline" 
                    size="sm"
                    onClick={() => captureWebsiteImage(formData.website_url)}
                    disabled={!formData.website_url || capturingImage}
                  >
                    {capturingImage ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2" />
                    ) : (
                      <Camera className="w-4 h-4 mr-2" />
                    )}
                    Capture from Website
                  </Button>
                  {formData.image_url && (
                    <Button 
                      type="button"
                      variant="outline" 
                      size="sm"
                      onClick={() => window.open(formData.image_url, '_blank')}
                    >
                      <Image className="w-4 h-4 mr-2" />
                      Preview
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="coordinates">Location Coordinates</Label>
              <div className="space-y-2">
                <Input
                  id="coordinates"
                  value={formData.coordinates}
                  onChange={(e) => handleInputChange('coordinates', e.target.value)}
                  placeholder="longitude,latitude (or use geocode button)"
                />
                <div className="flex gap-2">
                  <Button 
                    type="button"
                    variant="outline" 
                    size="sm"
                    onClick={() => geocodeAddress(formData.address)}
                    disabled={!formData.address}
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    Get Coordinates
                  </Button>
                  {formData.coordinates && (
                    <Button 
                      type="button"
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        const [lng, lat] = formData.coordinates.split(',');
                        const googleMapsUrl = `https://www.google.com/maps/@${lat},${lng},15z`;
                        window.open(googleMapsUrl, '_blank');
                      }}
                    >
                      <Link className="w-4 h-4 mr-2" />
                      View on Map
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Coordinates enable map display and distance calculations
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="featured"
                checked={formData.featured}
                onCheckedChange={(checked) => handleInputChange('featured', checked)}
              />
              <Label htmlFor="featured">Featured accommodation</Label>
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                {editingAccommodation ? 'Update' : 'Add'} Accommodation
              </Button>
              <Button variant="outline" onClick={() => { setShowAddForm(false); setEditingAccommodation(null); }}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Accommodations by Category */}
      {categories.map(category => {
        const categoryAccommodations = accommodations.filter(acc => acc.category_id === category.id);
        
        return (
          <Card key={category.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getCategoryIcon(category.icon)}
                {category.name}
                <Badge variant="secondary">{categoryAccommodations.length}</Badge>
              </CardTitle>
              {category.description && (
                <p className="text-sm text-muted-foreground">{category.description}</p>
              )}
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryAccommodations.map(accommodation => (
                  <Card key={accommodation.id} className={`relative ${!accommodation.is_active ? 'opacity-50' : ''}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-semibold flex items-center gap-2">
                            {accommodation.name}
                            {accommodation.featured && <Star className="w-4 h-4 text-yellow-500" />}
                          </h4>
                          {accommodation.type && (
                            <p className="text-sm text-muted-foreground capitalize">{accommodation.type}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(accommodation)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(accommodation.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {accommodation.area && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                          <MapPin className="w-3 h-3" />
                          {accommodation.area}
                        </div>
                      )}

                      {accommodation.description && (
                        <p className="text-sm mb-3 line-clamp-2">{accommodation.description}</p>
                      )}

                      <div className="space-y-2">
                        {accommodation.price_range && (
                          <div className="flex items-center gap-1 text-sm">
                            <DollarSign className="w-3 h-3" />
                            {accommodation.price_range}
                          </div>
                        )}

                        {accommodation.distance_from_venue && (
                          <div className="flex items-center gap-1 text-sm">
                            <Car className="w-3 h-3" />
                            {accommodation.distance_from_venue}
                          </div>
                        )}

                        {accommodation.phone && (
                          <div className="flex items-center gap-1 text-sm">
                            <Phone className="w-3 h-3" />
                            {accommodation.phone}
                          </div>
                        )}

                        {accommodation.email && (
                          <div className="flex items-center gap-1 text-sm">
                            <Mail className="w-3 h-3" />
                            {accommodation.email}
                          </div>
                        )}
                      </div>

                      {accommodation.amenities && accommodation.amenities.length > 0 && (
                        <div className="mt-3">
                          <div className="flex flex-wrap gap-1">
                            {accommodation.amenities.slice(0, 3).map((amenity, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {amenity}
                              </Badge>
                            ))}
                            {accommodation.amenities.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{accommodation.amenities.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between mt-4 pt-3 border-t">
                        <div className="flex items-center gap-2">
                          {accommodation.website_url && (
                            <Button variant="outline" size="sm" asChild>
                              <a href={accommodation.website_url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="w-3 h-3 mr-1" />
                                Website
                              </a>
                            </Button>
                          )}
                          {accommodation.booking_url && (
                            <Button variant="outline" size="sm" asChild>
                              <a href={accommodation.booking_url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="w-3 h-3 mr-1" />
                                Book
                              </a>
                            </Button>
                          )}
                        </div>
                        
                        <Switch
                          checked={accommodation.is_active}
                          onCheckedChange={() => toggleActive(accommodation.id, accommodation.is_active)}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Uncategorized Accommodations */}
      {accommodations.filter(acc => !acc.category_id).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Uncategorized Accommodations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {accommodations.filter(acc => !acc.category_id).map(accommodation => (
                <Card key={accommodation.id} className={`relative ${!accommodation.is_active ? 'opacity-50' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold flex items-center gap-2">
                          {accommodation.name}
                          {accommodation.featured && <Star className="w-4 h-4 text-yellow-500" />}
                        </h4>
                        {accommodation.type && (
                          <p className="text-sm text-muted-foreground capitalize">{accommodation.type}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(accommodation)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(accommodation.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {accommodation.description && (
                      <p className="text-sm mb-3 line-clamp-2">{accommodation.description}</p>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t">
                      <div className="flex items-center gap-2">
                        {accommodation.website_url && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={accommodation.website_url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="w-3 h-3 mr-1" />
                              Website
                            </a>
                          </Button>
                        )}
                      </div>
                      
                      <Switch
                        checked={accommodation.is_active}
                        onCheckedChange={() => toggleActive(accommodation.id, accommodation.is_active)}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {accommodations.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Hotel className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No accommodations found</h3>
            <p className="text-muted-foreground mb-4">
              Start by adding accommodation options for your wedding guests.
            </p>
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add First Accommodation
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AccommodationManager;