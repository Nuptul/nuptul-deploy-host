import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, MapPin, ExternalLink, Edit, Upload } from 'lucide-react';
import { toast } from 'sonner';
import VenueDetailGallery from '@/components/venue/VenueDetailGallery';
import { VenueImage } from '@/components/venue/VenueImage';

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

const VenueDetail: React.FC = () => {
  const { venueId } = useParams<{ venueId: string }>();
  const navigate = useNavigate();
  const { userRole } = useAuth();
  const [venue, setVenue] = useState<Venue | null>(null);
  const [loading, setLoading] = useState(true);

  const isAdmin = userRole?.role === 'admin';

  useEffect(() => {
    if (venueId) {
      fetchVenue();
    }
  }, [venueId]);

  const fetchVenue = async () => {
    if (!venueId) return;

    try {
      const { data, error } = await supabase
        .from('venues')
        .select('*')
        .eq('id', venueId)
        .single();

      if (error) throw error;
      setVenue(data);
    } catch (error) {
      console.error('Error fetching venue:', error);
      toast.error('Failed to load venue details');
      navigate('/venue');
    } finally {
      setLoading(false);
    }
  };

  const getGoogleMapsUrl = (address: string) => {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading venue details...</p>
        </div>
      </div>
    );
  }

  if (!venue) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4 pt-20">
        <div className="max-w-4xl mx-auto">
          <div className="glass-card p-12 text-center">
            <div className="space-y-4">
              <div className="text-6xl">📍</div>
              <h3 className="text-xl font-semibold">Venue not found</h3>
              <p className="text-muted-foreground">The venue you're looking for doesn't exist.</p>
              <Button onClick={() => navigate('/venue')}>
                Back to Venues
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4 pt-20">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Back Navigation */}
        <Button 
          variant="ghost" 
          onClick={() => navigate('/venue')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Venues
        </Button>

        {/* Venue Header */}
        <div className="glass-card overflow-hidden">
          <div className="aspect-video relative">
            <img
              src={venue.image_url}
              alt={venue.name}
              className="w-full h-full object-cover"
            />
            
            {/* Admin Controls */}
            {isAdmin && (
              <div className="absolute top-4 right-4 flex gap-2">
                <Button variant="secondary" size="sm">
                  <Upload className="w-4 h-4" />
                </Button>
                <Button variant="secondary" size="sm">
                  <Edit className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Left Column - Basic Info */}
              <div className="space-y-4">
                <div>
                  <h1 className="text-3xl font-bold text-foreground font-dolly mb-2">
                    {venue.name}
                  </h1>
                  {venue.caption && (
                    <p className="text-muted-foreground leading-relaxed">
                      {venue.caption}
                    </p>
                  )}
                </div>

                {venue.address && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-primary mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-foreground">{venue.address}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => window.open(getGoogleMapsUrl(venue.address!), '_blank')}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Open in Maps
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column - Quick Facts */}
              {venue.quick_facts && Object.keys(venue.quick_facts).length > 0 && (
                <Card className="glass-secondary">
                  <CardContent className="p-4">
                    <h3 className="text-lg font-semibold text-foreground mb-3">Quick Facts</h3>
                    <div className="space-y-2">
                      {Object.entries(venue.quick_facts).map(([key, value]) => (
                        <div key={key} className="flex justify-between py-2 border-b border-border/50 last:border-0">
                          <span className="text-sm font-medium text-muted-foreground">{key}</span>
                          <span className="text-sm text-foreground">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>

        {/* Venue Gallery */}
        <div className="glass-card p-6">
          <VenueDetailGallery venueId={venue.id} venueName={venue.name} />
        </div>
      </div>
    </div>
  );
};

export default VenueDetail;