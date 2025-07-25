import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import LazyVenueMap from '@/components/LazyVenueMap';
import { 
  MapPin,
  Phone,
  Mail,
  DollarSign,
  Car,
  ExternalLink,
  Star,
  Wifi,
  Coffee,
  Utensils,
  Hotel,
  Home,
  Wine,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AccommodationCategory {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  display_order: number;
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
  coordinates?: [number, number];
  featured: boolean;
  category?: AccommodationCategory;
}

const AccommodationDisplay: React.FC = () => {
  const [categories, setCategories] = useState<AccommodationCategory[]>([]);
  const [accommodations, setAccommodations] = useState<AccommodationOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedAccommodation, setExpandedAccommodation] = useState<string | null>(null);

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
        .eq('is_active', true)
        .order('display_order');

      if (categoriesError) throw categoriesError;

      // Load accommodations with categories
      const { data: accommodationsData, error: accommodationsError } = await (supabase as any)
        .from('accommodation_options')
        .select(`
          *,
          category:accommodation_categories(*)
        `)
        .eq('is_active', true)
        .order('featured DESC, display_order');

      if (accommodationsError) throw accommodationsError;

      setCategories(categoriesData || []);
      setAccommodations(accommodationsData || []);
    } catch (error) {
      console.error('Error loading accommodation data:', error);
      toast.error('Failed to load accommodation options');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (iconName?: string) => {
    switch (iconName) {
      case 'hotel': return <Hotel className="w-5 h-5" />;
      case 'wine': return <Wine className="w-5 h-5" />;
      case 'home': return <Home className="w-5 h-5" />;
      default: return <Hotel className="w-5 h-5" />;
    }
  };

  const getAmenityIcon = (amenity: string) => {
    const lowerAmenity = amenity.toLowerCase();
    if (lowerAmenity.includes('wifi') || lowerAmenity.includes('internet')) {
      return <Wifi className="w-3 h-3" />;
    }
    if (lowerAmenity.includes('restaurant') || lowerAmenity.includes('dining')) {
      return <Utensils className="w-3 h-3" />;
    }
    if (lowerAmenity.includes('coffee') || lowerAmenity.includes('breakfast')) {
      return <Coffee className="w-3 h-3" />;
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-wedding-navy border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-3">Wedding Accommodation</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          We've curated wonderful accommodation options for our wedding weekend. 
          Whether you prefer Newcastle city center or the heart of Hunter Valley wine country, 
          we have recommendations to suit every preference and budget.
        </p>
      </div>

      {/* Featured Accommodations */}
      {accommodations.some(acc => acc.featured) && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Star className="w-6 h-6 text-yellow-500" />
            Recommended Accommodations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {accommodations
              .filter(acc => acc.featured)
              .map(accommodation => (
                <AccommodationCard 
                  key={accommodation.id} 
                  accommodation={accommodation}
                  isExpanded={expandedAccommodation === accommodation.id}
                  onToggleExpand={() => setExpandedAccommodation(
                    expandedAccommodation === accommodation.id ? null : accommodation.id
                  )}
                />
              ))}
          </div>
        </div>
      )}

      {/* Accommodations by Category */}
      {categories.map(category => {
        const categoryAccommodations = accommodations.filter(
          acc => acc.category_id === category.id && !acc.featured
        );
        
        if (categoryAccommodations.length === 0) return null;

        return (
          <div key={category.id} className="space-y-4">
            <div className="flex items-center gap-3">
              {getCategoryIcon(category.icon)}
              <div>
                <h2 className="text-2xl font-semibold">{category.name}</h2>
                {category.description && (
                  <p className="text-muted-foreground">{category.description}</p>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {categoryAccommodations.map(accommodation => (
                <AccommodationCard 
                  key={accommodation.id} 
                  accommodation={accommodation}
                  isExpanded={expandedAccommodation === accommodation.id}
                  onToggleExpand={() => setExpandedAccommodation(
                    expandedAccommodation === accommodation.id ? null : accommodation.id
                  )}
                />
              ))}
            </div>
          </div>
        );
      })}

      {/* General Booking Advice */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <h3 className="font-semibold mb-3 text-blue-900">Booking Tips</h3>
          <div className="space-y-2 text-blue-800">
            <p>• Book early for weekend availability, especially in Hunter Valley</p>
            <p>• Mention "Tim & Kirsten's wedding" when booking for potential group rates</p>
            <p>• Coach transport is available from Newcastle accommodation - see Transport page</p>
            <p>• Consider staying 2 nights to enjoy the full wedding weekend experience</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

interface AccommodationCardProps {
  accommodation: AccommodationOption;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

const AccommodationCard: React.FC<AccommodationCardProps> = ({ 
  accommodation, 
  isExpanded, 
  onToggleExpand 
}) => {
  return (
    <Card className={`overflow-hidden ${accommodation.featured ? 'ring-2 ring-wedding-gold' : ''}`}>
      {/* Image */}
      {accommodation.image_url && (
        <div className="relative h-48 overflow-hidden">
          <img 
            src={accommodation.image_url} 
            alt={accommodation.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback to placeholder if image fails to load
              (e.target as HTMLImageElement).src = `https://via.placeholder.com/400x200/E5E7EB/374151?text=${encodeURIComponent(accommodation.name)}`;
            }}
          />
          {accommodation.featured && (
            <div className="absolute top-3 right-3">
              <Badge className="bg-wedding-gold text-black">
                <Star className="w-3 h-3 mr-1" />
                Recommended
              </Badge>
            </div>
          )}
        </div>
      )}

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl">{accommodation.name}</CardTitle>
            <div className="flex items-center gap-4 mt-1">
              {accommodation.type && (
                <Badge variant="outline" className="capitalize">
                  {accommodation.type}
                </Badge>
              )}
              {accommodation.area && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="w-3 h-3" />
                  {accommodation.area}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {accommodation.description && (
          <p className="text-muted-foreground">{accommodation.description}</p>
        )}

        {/* Key Details */}
        <div className="grid grid-cols-1 gap-3">
          {accommodation.price_range && (
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-600" />
              <span className="font-medium text-green-600">{accommodation.price_range}</span>
            </div>
          )}
          
          {accommodation.distance_from_venue && (
            <div className="flex items-center gap-2">
              <Car className="w-4 h-4 text-blue-600" />
              <span className="text-sm">{accommodation.distance_from_venue}</span>
            </div>
          )}
        </div>

        {/* Amenities */}
        {accommodation.amenities && accommodation.amenities.length > 0 && (
          <div>
            <h4 className="font-medium text-sm mb-2">Amenities</h4>
            <div className="flex flex-wrap gap-2">
              {accommodation.amenities.slice(0, isExpanded ? undefined : 4).map((amenity, index) => (
                <Badge key={index} variant="secondary" className="text-xs flex items-center gap-1">
                  <span className="w-2 h-2 bg-current rounded-full"></span>
                  {amenity}
                </Badge>
              ))}
              {!isExpanded && accommodation.amenities.length > 4 && (
                <Badge variant="outline" className="text-xs">
                  +{accommodation.amenities.length - 4} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Expanded Details */}
        {isExpanded && (
          <div className="space-y-4 pt-4 border-t">
            {accommodation.address && (
              <div>
                <h4 className="font-medium text-sm mb-2">Address</h4>
                <p className="text-sm text-muted-foreground">{accommodation.address}</p>
              </div>
            )}

            {/* Contact Information */}
            {(accommodation.phone || accommodation.email) && (
              <div>
                <h4 className="font-medium text-sm mb-2">Contact</h4>
                <div className="space-y-1">
                  {accommodation.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-3 h-3" />
                      <a href={`tel:${accommodation.phone}`} className="hover:underline">
                        {accommodation.phone}
                      </a>
                    </div>
                  )}
                  {accommodation.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-3 h-3" />
                      <a href={`mailto:${accommodation.email}`} className="hover:underline">
                        {accommodation.email}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Map */}
            {accommodation.coordinates && (
              <div>
                <h4 className="font-medium text-sm mb-2">Location</h4>
                <LazyVenueMap
                  venue={{
                    name: accommodation.name,
                    address: accommodation.address || accommodation.area || '',
                    coordinates: accommodation.coordinates,
                    description: accommodation.description
                  }}
                />
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex gap-2">
            {accommodation.website_url && (
              <Button variant="outline" size="sm" asChild>
                <a href={accommodation.website_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-3 h-3 mr-1" />
                  Website
                </a>
              </Button>
            )}
            {accommodation.booking_url && (
              <Button size="sm" asChild>
                <a href={accommodation.booking_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-3 h-3 mr-1" />
                  Book Now
                </a>
              </Button>
            )}
          </div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onToggleExpand}
            className="flex items-center gap-1"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-4 h-4" />
                Less Details
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                More Details
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AccommodationDisplay;