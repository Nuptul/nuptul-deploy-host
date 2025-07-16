import React from 'react';
import GlassCard from '@/components/GlassCard';
import LazyVenueMap from '@/components/LazyVenueMap';
import VenueHeroImage from '@/components/venue/VenueHeroImage';
import { MapPin, Clock, Users, Utensils, Phone, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PrinceOfMereweather: React.FC = () => {
  const venueData = {
    id: 'dac9fa6a-6c86-4b3b-b1cc-12f99c0eade7', // Prince of Mereweather venue ID
    name: 'Prince of Mereweather',
    address: 'Mereweather, NSW 2291',
    coordinates: [151.7467, -32.9408] as [number, number], // Prince of Mereweather coordinates
    description: 'Pre-wedding drinks and casual dinner'
  };

  return (
    <div className="min-h-screen px-5 pt-12 pb-6">
      {/* Header */}
      <div className="text-center mb-8 animate-fade-up">
        <h1 className="wedding-heading text-wedding-navy mb-3">
          Prince of Mereweather
        </h1>
        <p className="wedding-body text-muted-foreground">
          Pre-Wedding Drinks & Casual Dinner
        </p>
      </div>

      {/* Hero Image */}
      <GlassCard className="mb-8 p-6 animate-fade-up" style={{ animationDelay: '0.1s' }}>
        <VenueHeroImage 
          venueId={venueData.id}
          venueName={venueData.name}
          className="mb-4"
        />
      </GlassCard>

      {/* Event Details */}
      <GlassCard className="mb-6 p-6 animate-fade-up" style={{ animationDelay: '0.2s' }}>
        <div className="flex items-center gap-3 mb-4">
          <Clock className="w-6 h-6 text-glass-blue" />
          <h2 className="text-xl font-semibold text-wedding-navy">Event Details</h2>
        </div>
        
        <div className="space-y-4">
          <div className="p-4 bg-glass-blue/10 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <p className="font-medium text-wedding-navy">Saturday, October 4th, 2025</p>
              <p className="font-medium text-wedding-navy">4:00 PM - 8:00 PM</p>
            </div>
            <p className="text-muted-foreground">
              Tim and Kirsten will be at the Prince of Mereweather pub. Stop in to have a drink and grab yourself a meal if you are hungry.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium text-wedding-navy mb-1">Dress Code</p>
              <p className="text-muted-foreground">Casual</p>
            </div>
            <div>
              <p className="font-medium text-wedding-navy mb-1">Food Available</p>
              <p className="text-muted-foreground">Full pub menu</p>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Venue Details */}
      <GlassCard className="mb-6 p-6 animate-fade-up" style={{ animationDelay: '0.3s' }}>
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-glass-green/20 flex items-center justify-center flex-shrink-0">
            <MapPin className="w-6 h-6 text-glass-green" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-wedding-navy mb-2">
              Prince of Mereweather Pub
            </h2>
            <p className="text-muted-foreground mb-3">
              Mereweather, NSW 2291<br />
              <span className="text-sm">Newcastle Beach area</span>
            </p>
            <div className="flex flex-wrap gap-3">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => window.open('https://g.co/kgs/YdLu2R4', '_blank')}
              >
                <Globe className="w-4 h-4 mr-1" />
                Google Maps Link
              </Button>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Map */}
      <LazyVenueMap 
        venue={venueData} 
        className="mb-8 animate-fade-up" 
      />

      {/* What to Expect */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <GlassCard className="p-5 animate-fade-up" style={{ animationDelay: '0.5s' }}>
          <div className="flex items-center gap-3 mb-3">
            <Utensils className="w-5 h-5 text-glass-purple" />
            <h3 className="font-semibold text-wedding-navy">Food & Drinks</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Full pub menu available. Great selection of drinks and casual dining options.
          </p>
        </GlassCard>

        <GlassCard className="p-5 animate-fade-up" style={{ animationDelay: '0.6s' }}>
          <div className="flex items-center gap-3 mb-3">
            <Users className="w-5 h-5 text-glass-blue" />
            <h3 className="font-semibold text-wedding-navy">Atmosphere</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Relaxed pub atmosphere. Perfect for casual pre-wedding catch-ups.
          </p>
        </GlassCard>
      </div>

      {/* Important Notes */}
      <GlassCard className="p-6 animate-fade-up" style={{ animationDelay: '0.7s' }} variant="secondary">
        <h3 className="text-lg font-semibold mb-4 text-wedding-navy">Important Notes</h3>
        <div className="space-y-4 text-sm">
          <div className="p-4 bg-glass-green/10 rounded-lg">
            <p className="font-medium text-wedding-navy mb-2">Casual Event</p>
            <p className="text-muted-foreground">
              This is a casual pre-wedding gathering. Come and go as you please during the 4-8 PM timeframe.
            </p>
          </div>
          
          <div className="p-4 bg-glass-blue/10 rounded-lg">
            <p className="font-medium text-wedding-navy mb-2">No RSVP Required</p>
            <p className="text-muted-foreground">
              Just drop by if you can make it! Tim & Kirsten will be there to chat and catch up.
            </p>
          </div>
          
          <div className="p-4 bg-glass-pink/10 rounded-lg">
            <p className="font-medium text-wedding-navy mb-2">Food & Drinks</p>
            <p className="text-muted-foreground">
              Food and drinks are at your own expense. The pub has a great menu and reasonable prices.
            </p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

export default PrinceOfMereweather;