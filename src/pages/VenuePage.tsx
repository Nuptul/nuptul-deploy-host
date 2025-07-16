import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { supabase, supabaseAdmin } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ChevronLeft, ChevronRight, MapPin, ExternalLink, Edit, Upload, Trash2, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { VenueImage } from '@/components/venue/VenueImage';
import { StorageService } from '@/services/storageService';

interface Venue {
  id: string;
  name: string;
  image_url: string;
  image_path: string;
  caption: string | null;
  address: string | null;
  quick_facts: any;
  display_order: number;
  created_at: string;
  updated_at: string;
}

interface VenueFormData {
  name: string;
  caption: string;
  address: string;
  quick_facts: Record<string, string>;
}

const VenuePage: React.FC = () => {
  const { userRole } = useAuth();
  const navigate = useNavigate();
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [editingVenue, setEditingVenue] = useState<Venue | null>(null);
  const [formData, setFormData] = useState<VenueFormData>({
    name: '',
    caption: '',
    address: '',
    quick_facts: {}
  });
  const [quickFactKey, setQuickFactKey] = useState('');
  const [quickFactValue, setQuickFactValue] = useState('');
  const [uploading, setUploading] = useState(false);

  const isAdmin = userRole?.role === 'admin';

  const handleVenueClick = (venueName: string) => {
    // Route to specific venue pages based on venue name
    if (venueName.includes('Ben Ean')) {
      navigate('/venue/ben-ean');
    } else if (venueName.includes('Prince') || venueName.includes('Merewether')) {
      navigate('/venue/prince-of-mereweather');
    } else if (venueName.includes('Beach') || venueName.includes('Newcastle')) {
      navigate('/venue/newcastle-beach');
    }
  };

  useEffect(() => {
    fetchVenues();
  }, []);

  // Debug effect to log venue data
  useEffect(() => {
    
    
  }, [venues, loading]);

  const fetchVenues = async () => {
    try {
      
      
      // Try admin client first for reliable access
      const { data: adminData, error: adminError } = await supabaseAdmin
        .from('venues')
        .select('*')
        .order('display_order', { ascending: true });

      
      
      if (!adminError && adminData && adminData.length > 0) {
        setVenues(adminData);
        
        return;
      }

      // Fallback to regular client
      const { data, error } = await supabase
        .from('venues')
        .select('*')
        .order('display_order', { ascending: true });

      
      
      if (error) {
        console.warn('Database fetch failed, will use fallback venues:', error);
        setVenues([]);
      } else {
        setVenues(data || []);
        
      }
    } catch (error) {
      console.warn('Error fetching venues, using fallback:', error);
      setVenues([]);
    } finally {
      setLoading(false);
    }
  };

  const nextVenue = () => {
    setCurrentIndex((prev) => (prev + 1) % displayVenues.length);
  };

  const prevVenue = () => {
    setCurrentIndex((prev) => (prev - 1 + displayVenues.length) % displayVenues.length);
  };

  const openEditDialog = (venue: Venue) => {
    setEditingVenue(venue);
    setFormData({
      name: venue.name,
      caption: venue.caption || '',
      address: venue.address || '',
      quick_facts: venue.quick_facts || {}
    });
  };

  const handleUpdateVenue = async () => {
    if (!editingVenue) return;

    try {
      const { error } = await supabase
        .from('venues')
        .update({
          name: formData.name,
          caption: formData.caption || null,
          address: formData.address || null,
          quick_facts: Object.keys(formData.quick_facts).length > 0 ? formData.quick_facts : null
        })
        .eq('id', editingVenue.id);

      if (error) throw error;

      toast.success('Venue updated successfully');
      setEditingVenue(null);
      fetchVenues();
    } catch (error) {
      console.error('Error updating venue:', error);
      toast.error('Failed to update venue');
    }
  };

  const handleImageUpload = async (venue: Venue, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setUploading(true);
    try {
      // Upload using StorageService
      const result = await StorageService.uploadVenueImage(
        venue.id,
        file,
        'hero'
      );

      if (!result.success) throw result.error;

      // Update venue record with new URL
      const { error: dbError } = await supabase
        .from('venues')
        .update({
          image_url: result.publicUrl,
          image_path: result.path
        })
        .eq('id', venue.id);

      if (dbError) throw dbError;

      toast.success('Venue image updated successfully');
      fetchVenues();
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const addQuickFact = () => {
    if (quickFactKey && quickFactValue) {
      setFormData({
        ...formData,
        quick_facts: {
          ...formData.quick_facts,
          [quickFactKey]: quickFactValue
        }
      });
      setQuickFactKey('');
      setQuickFactValue('');
    }
  };

  const removeQuickFact = (key: string) => {
    const newQuickFacts = { ...formData.quick_facts };
    delete newQuickFacts[key];
    setFormData({
      ...formData,
      quick_facts: newQuickFacts
    });
  };

  const getGoogleMapsUrl = (address: string) => {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading venues...</p>
        </div>
      </div>
    );
  }

  // Fallback venues in case database access fails
  const fallbackVenues = [
    {
      id: 'deee0f2e-6b57-469c-aac3-fd7c7ee9ef68',
      name: 'Ben Ean Winery',
      image_url: 'https://iwmfxcrzzwpmxomydmuq.storage.supabase.co/v1/object/public/venue-ben-ean/Ben%20Ean%20Venue%20Main.png',
      image_path: 'venue-ben-ean/Ben Ean Venue Main.png',
      caption: 'Wedding ceremony and reception venue in the beautiful Hunter Valley. Join us for the main celebration on Sunday, October 5th, 2025.',
      address: '119 McDonalds Rd, Pokolbin NSW 2320',
      quick_facts: {
        'Ceremony': '3:00 PM on Garden Terrace',
        'Reception': '5:00 PM cocktails, 7:00 PM dinner',
        'Dress Code': 'Cocktail/Dapper',
        'End Time': '12:00 AM'
      },
      display_order: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'dac9fa6a-6c86-4b3b-b1cc-12f99c0eade7',
      name: 'The Prince Hotel, Merewether',
      image_url: 'https://iwmfxcrzzwpmxomydmuq.storage.supabase.co/v1/object/public/venue-pub/The%20Prince%20Merewether.png',
      image_path: 'venue-pub/The Prince Merewether.png',
      caption: 'Pre-wedding drinks and casual dinner. Stop in to have a drink and grab yourself a meal if you are hungry.',
      address: 'Mereweather, NSW 2291',
      quick_facts: {
        'Date': 'Saturday, October 4th',
        'Time': '4:00 PM - 8:00 PM',
        'Style': 'Casual drinks and food',
        'Dress Code': 'Casual'
      },
      display_order: 2,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'b3e0b587-46ea-4bf1-9ce1-9455ff61a9bf',
      name: 'Newcastle Beach',
      image_url: 'https://iwmfxcrzzwpmxomydmuq.storage.supabase.co/v1/object/public/venue-beach/Necastle%20Beach.png',
      image_path: 'venue-beach/Necastle Beach.png',
      caption: 'Recovery beach day with coffee and excellent food. Good for soaking up the libations from the night before!',
      address: 'Newcastle Beach, Newcastle NSW',
      quick_facts: {
        'Date': 'Monday, October 6th',
        'Time': 'From 11:00 AM onwards',
        'Style': 'Casual beach hangout',
        'Food': 'Kiosk with coffee and food'
      },
      display_order: 3,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  // Use database venues if available, otherwise fallback to hardcoded
  const displayVenues = venues.length > 0 ? venues : (!loading ? fallbackVenues : []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading venues...</p>
        </div>
      </div>
    );
  }

  if (displayVenues.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4 pt-20">
        <div className="max-w-4xl mx-auto">
          <div className="glass-card p-12 text-center">
            <div className="space-y-4">
              <div className="text-6xl">📍</div>
              <h3 className="text-xl font-semibold">No venues configured</h3>
              <p className="text-muted-foreground">Venue information will be available soon!</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentVenue = displayVenues[currentIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4 pt-20">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground font-dolly">
                Wedding Venues
              </h1>
              <p className="text-muted-foreground mt-2">
                Discover the beautiful locations for our special day
              </p>
            </div>
            <div className="text-sm text-muted-foreground">
              {currentIndex + 1} of {displayVenues.length}
            </div>
          </div>
        </div>

        {/* Main Venue Carousel */}
        <div className="glass-card overflow-hidden shadow-2xl">
          <div className="relative">
            {/* Image */}
            <div className="aspect-video relative group">
              <VenueImage
                venueId={currentVenue.id}
                venueName={currentVenue.name}
                fallbackUrl={currentVenue.image_url}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              
              {/* Enhanced Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              
              {/* Navigation Arrows */}
              {displayVenues.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2"
                    onClick={prevVenue}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2"
                    onClick={nextVenue}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </>
              )}

              {/* Admin Controls */}
              {isAdmin && (
                <div className="absolute top-4 right-4 flex gap-2">
                  <label htmlFor={`venue-upload-${currentVenue.id}`}>
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={uploading}
                      className="cursor-pointer"
                      asChild
                    >
                      <span>
                        <Upload className="w-4 h-4" />
                      </span>
                    </Button>
                    <input
                      id={`venue-upload-${currentVenue.id}`}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(currentVenue, e)}
                      className="hidden"
                    />
                  </label>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => openEditDialog(currentVenue)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Left Column - Basic Info */}
                <div className="space-y-4">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground font-dolly">
                      {currentVenue.name}
                    </h2>
                    {currentVenue.caption && (
                      <p className="text-muted-foreground mt-2 leading-relaxed">
                        {currentVenue.caption}
                      </p>
                    )}
                  </div>

                  {currentVenue.address && (
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-primary mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm text-foreground">{currentVenue.address}</p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={() => window.open(getGoogleMapsUrl(currentVenue.address!), '_blank')}
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Open in Maps
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* View Details Button */}
                  <div className="pt-4">
                    <Button 
                      className="w-full"
                      onClick={() => handleVenueClick(currentVenue.name)}
                    >
                      View Full Details & Maps
                    </Button>
                  </div>
                </div>

                {/* Right Column - Quick Facts */}
                {currentVenue.quick_facts && Object.keys(currentVenue.quick_facts).length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-3">Quick Facts</h3>
                    <div className="space-y-2">
                      {Object.entries(currentVenue.quick_facts).map(([key, value]) => (
                        <div key={key} className="flex justify-between py-2 border-b border-border/50 last:border-0">
                          <span className="text-sm font-medium text-muted-foreground">{key}</span>
                          <span className="text-sm text-foreground">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Venue Thumbnails - Mobile Responsive Grid */}
        {displayVenues.length > 1 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {displayVenues.map((venue, index) => (
              <div
                key={venue.id}
                className={`transition-all duration-500 ${
                  index === currentIndex ? 'scale-[1.03]' : 'scale-100'
                }`}
              >
                <Card
                  className={`glass-card cursor-pointer transition-all duration-500 hover:shadow-2xl transform hover:scale-[1.02] overflow-hidden ${
                    index === currentIndex 
                      ? 'ring-2 ring-primary shadow-2xl bg-gradient-to-br from-primary/5 to-primary/10' 
                      : 'hover:ring-1 hover:ring-primary/50'
                  }`}
                  onClick={() => setCurrentIndex(index)}
                >
                  <div className="aspect-[4/3] sm:aspect-video relative overflow-hidden group">
                    <VenueImage
                      venueId={venue.id}
                      venueName={venue.name}
                      fallbackUrl={venue.image_url}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    {/* Quick Actions on Hover */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="bg-white/90 hover:bg-white"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleVenueClick(venue.name);
                        }}
                      >
                        View Details
                      </Button>
                    </div>
                    
                    {/* Active Indicator */}
                    {index === currentIndex && (
                      <div className="absolute bottom-2 left-2 right-2">
                        <div className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1">
                          <div className="w-2 h-2 bg-primary-foreground rounded-full animate-pulse" />
                          Currently Viewing
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <CardContent className="p-4 space-y-3">
                    <h3 className="font-bold text-base sm:text-lg line-clamp-1 font-dolly text-foreground">
                      {venue.name}
                    </h3>
                    
                    {venue.caption && (
                      <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                        {venue.caption}
                      </p>
                    )}
                    
                    <div className="pt-2 space-y-2">
                      {venue.address && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <MapPin className="w-4 h-4 flex-shrink-0 text-primary" />
                          <span className="line-clamp-1">{venue.address}</span>
                        </div>
                      )}
                      
                      {/* Extract key quick fact */}
                      {venue.quick_facts?.Date && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="w-4 h-4 flex-shrink-0 text-primary" />
                          <span>{venue.quick_facts.Date}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* View Button */}
                    <Button 
                      className="w-full mt-3"
                      size="sm"
                      variant={index === currentIndex ? "default" : "outline"}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleVenueClick(venue.name);
                      }}
                    >
                      View Full Details
                    </Button>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        )}

        {/* Edit Venue Dialog */}
        {isAdmin && editingVenue && (
          <Dialog open={!!editingVenue} onOpenChange={() => setEditingVenue(null)}>
            <DialogContent className="glass-popup max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Venue</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Name</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Venue name"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Caption</label>
                  <Textarea
                    value={formData.caption}
                    onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                    placeholder="Describe this beautiful venue"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Address</label>
                  <Input
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Full address for maps"
                  />
                </div>
                
                {/* Quick Facts Section */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Quick Facts</label>
                  
                  {/* Add New Quick Fact */}
                  <div className="flex gap-2 mb-3">
                    <Input
                      placeholder="Fact name"
                      value={quickFactKey}
                      onChange={(e) => setQuickFactKey(e.target.value)}
                      className="flex-1"
                    />
                    <Input
                      placeholder="Fact value"
                      value={quickFactValue}
                      onChange={(e) => setQuickFactValue(e.target.value)}
                      className="flex-1"
                    />
                    <Button onClick={addQuickFact} disabled={!quickFactKey || !quickFactValue}>
                      Add
                    </Button>
                  </div>

                  {/* Existing Quick Facts */}
                  {Object.entries(formData.quick_facts).length > 0 && (
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {Object.entries(formData.quick_facts).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between bg-muted/50 p-2 rounded">
                          <span className="text-sm">{key}: {value}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeQuickFact(key)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <Button onClick={handleUpdateVenue} className="flex-1">
                    Save Changes
                  </Button>
                  <Button variant="outline" onClick={() => setEditingVenue(null)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
};

export default VenuePage;
