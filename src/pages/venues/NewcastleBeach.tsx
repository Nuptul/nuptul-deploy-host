import React from 'react';
import GlassCard from '@/components/GlassCard';
import LazyVenueMap from '@/components/LazyVenueMap';
import VenueHeroImage from '@/components/venue/VenueHeroImage';
import { MapPin, Clock, Coffee, Waves, Sun, Users } from 'lucide-react';

const NewcastleBeach: React.FC = () => {
  const venueData = {
    id: 'b3e0b587-46ea-4bf1-9ce1-9455ff61a9bf', // Newcastle Beach venue ID
    name: 'Newcastle Beach',
    address: 'Newcastle Beach, Newcastle NSW 2300',
    coordinates: [151.7789, -32.9292] as [number, number], // Newcastle Beach coordinates
    description: 'Recovery breakfast and beach hangout'
  };

  return (
    <div className="min-h-screen px-5 pt-12 pb-6">
      {/* Header */}
      <div className="text-center mb-8 animate-fade-up">
        <h1 className="wedding-heading text-wedding-navy mb-3">
          Newcastle Beach
        </h1>
        <p className="wedding-body text-muted-foreground">
          Recovery Beach Day
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
          <h2 className="text-xl font-semibold text-wedding-navy">Recovery Day Details</h2>
        </div>
        
        <div className="space-y-4">
          <div className="p-4 bg-glass-blue/10 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <p className="font-medium text-wedding-navy">Monday, October 6th, 2025</p>
              <p className="font-medium text-wedding-navy">From 11:00 AM onwards</p>
            </div>
            <p className="text-muted-foreground">
              While we do not have a formal recovery breakfast planned, we will be at Newcastle Beach from 11 AM onwards. 
              There is a kiosk that serves good coffee and excellent food. Good for soaking up the libations!
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium text-wedding-navy mb-1">Dress Code</p>
              <p className="text-muted-foreground">Casual beach wear</p>
            </div>
            <div>
              <p className="font-medium text-wedding-navy mb-1">Duration</p>
              <p className="text-muted-foreground">Open-ended</p>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Location Details */}
      <GlassCard className="mb-6 p-6 animate-fade-up" style={{ animationDelay: '0.3s' }}>
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-glass-green/20 flex items-center justify-center flex-shrink-0">
            <MapPin className="w-6 h-6 text-glass-green" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-wedding-navy mb-2">
              Newcastle Beach
            </h2>
            <p className="text-muted-foreground mb-3">
              Newcastle Beach, Newcastle NSW 2300<br />
              <span className="text-sm">Main beach area near the city center</span>
            </p>
            <p className="text-sm text-muted-foreground">
              Beautiful beach with excellent facilities, kiosk, and plenty of space to relax and recover from the celebrations.
            </p>
          </div>
        </div>
      </GlassCard>

      {/* Map */}
      <LazyVenueMap 
        venue={venueData} 
        className="mb-8 animate-fade-up" 
      />

      {/* What's Available */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <GlassCard className="p-5 animate-fade-up" style={{ animationDelay: '0.5s' }}>
          <div className="flex items-center gap-3 mb-3">
            <Coffee className="w-5 h-5 text-glass-purple" />
            <h3 className="font-semibold text-wedding-navy">Beach Kiosk</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Good coffee, excellent food, and perfect hangover remedies available on-site.
          </p>
        </GlassCard>

        <GlassCard className="p-5 animate-fade-up" style={{ animationDelay: '0.6s' }}>
          <div className="flex items-center gap-3 mb-3">
            <Sun className="w-5 h-5 text-glass-pink" />
            <h3 className="font-semibold text-wedding-navy">Beach Activities</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Swimming, walking, or just relaxing on the sand while recovering from the celebrations.
          </p>
        </GlassCard>
      </div>

      {/* Recovery Information */}
      <GlassCard className="p-6 animate-fade-up" style={{ animationDelay: '0.7s' }} variant="secondary">
        <h3 className="text-lg font-semibold mb-4 text-wedding-navy">What to Expect</h3>
        <div className="space-y-4 text-sm">
          <div className="p-4 bg-glass-green/10 rounded-lg">
            <p className="font-medium text-wedding-navy mb-2">Casual Hangout</p>
            <p className="text-muted-foreground">
              This is not a formal event - just a casual gathering for those who want to continue the celebrations and recover together.
            </p>
          </div>
          
          <div className="p-4 bg-glass-blue/10 rounded-lg">
            <p className="font-medium text-wedding-navy mb-2">Perfect for Recovery</p>
            <p className="text-muted-foreground">
              Fresh ocean air, good coffee, and great company - everything you need to recover from the wedding festivities!
            </p>
          </div>
          
          <div className="p-4 bg-glass-pink/10 rounded-lg">
            <p className="font-medium text-wedding-navy mb-2">No RSVP Needed</p>
            <p className="text-muted-foreground">
              Just turn up if you feel like it! Tim & Kirsten will be there from 11 AM, come and go as you please.
            </p>
          </div>

          <div className="flex items-start gap-3 p-4 bg-glass-purple/10 rounded-lg">
            <Users className="w-5 h-5 text-glass-purple mt-1" />
            <div>
              <p className="font-medium text-wedding-navy mb-1">Bring the Family</p>
              <p className="text-muted-foreground">
                Beach is perfect for kids and families. Great way to extend the weekend celebrations!
              </p>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

export default NewcastleBeach;