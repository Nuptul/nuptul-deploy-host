import React, { Suspense, lazy } from 'react';
import GlassCard from '@/components/GlassCard';
import { MapPin } from 'lucide-react';

// Lazy load the actual VenueMap component
const VenueMap = lazy(() => import('./VenueMap'));

interface LazyVenueMapProps {
  venue: {
    name: string;
    address: string;
    coordinates: [number, number];
    description?: string;
  };
  className?: string;
}

// Loading placeholder for the map
const MapLoadingPlaceholder = ({ venueName }: { venueName: string }) => (
  <GlassCard className="p-6 animate-fade-up">
    <div className="flex items-center gap-3 mb-4">
      <MapPin className="w-5 sm:w-6 h-5 sm:h-6 text-glass-blue" />
      <h2 className="text-lg sm:text-xl font-semibold text-wedding-navy">Location</h2>
    </div>
    
    <div className="w-full h-64 sm:h-80 bg-gradient-to-br from-glass-green/20 to-glass-blue/20 rounded-glass flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-wedding-navy mx-auto mb-3"></div>
        <p className="text-sm text-wedding-navy font-medium">Loading Interactive Map...</p>
        <p className="text-xs text-muted-foreground mt-1">
          High-quality map experience loading
        </p>
      </div>
    </div>
  </GlassCard>
);

const LazyVenueMap: React.FC<LazyVenueMapProps> = ({ venue, className = '' }) => {
  return (
    <Suspense fallback={<MapLoadingPlaceholder venueName={venue.name} />}>
      <VenueMap venue={venue} className={className} />
    </Suspense>
  );
};

export default LazyVenueMap;