import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

interface VenueMapProps {
  venue: {
    name: string;
    address: string;
    coordinates: [number, number]; // [longitude, latitude]
    description?: string;
  };
  className?: string;
}

const VenueMap: React.FC<VenueMapProps> = ({ venue, className = '' }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const mapboxToken = 'pk.eyJ1Ijoic3VwYWJhc2VjcnlwdCIsImEiOiJjbWNzcG03N3kxNjFyMmlxMmQyb290cWhvIn0.VTVcx03Z6tAg5ZVzJoxjSA';

  useEffect(() => {
    if (!mapContainer.current) {
      console.error('Map container not found');
      return;
    }

    try {
      console.log('Initializing Mapbox with coordinates:', venue.coordinates);
      
      // Initialize map
      mapboxgl.accessToken = mapboxToken;
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12', // Using default style for now
        center: venue.coordinates,
        zoom: 15,
        pitch: 0, // Reduced pitch for better performance
        attributionControl: true,
        trackResize: true, // Automatically track container resizes
        fitBoundsOptions: { padding: 20 }
      });
      
      // Add load event to check if map loads
      map.current.on('load', () => {
        console.log('Mapbox loaded successfully');
        // Trigger resize after load to ensure proper sizing
        map.current?.resize();
      });
      
      map.current.on('error', (e) => {
        console.error('Mapbox error:', e);
      });

      // Add resize observer to handle container size changes
      const resizeObserver = new ResizeObserver(() => {
        map.current?.resize();
      });
      
      resizeObserver.observe(mapContainer.current);

      // Add navigation controls
      map.current.addControl(
        new mapboxgl.NavigationControl({
          visualizePitch: true,
        }),
        'top-right'
      );

      // Add marker for venue
      new mapboxgl.Marker({
        color: '#2C3E50',
        scale: 1.2
      })
        .setLngLat(venue.coordinates)
        .setPopup(
          new mapboxgl.Popup({ offset: 25 })
            .setHTML(`
              <div style="padding: 10px;">
                <h3 style="margin: 0 0 8px 0; font-weight: bold; color: #2C3E50;">${venue.name}</h3>
                <p style="margin: 0; color: #666; font-size: 14px;">${venue.address}</p>
                ${venue.description ? `<p style="margin: 8px 0 0 0; color: #666; font-size: 12px;">${venue.description}</p>` : ''}
              </div>
            `)
        )
        .addTo(map.current);

      // Show popup by default after map loads
      const showPopup = () => {
        setTimeout(() => {
          const markers = document.querySelectorAll('.mapboxgl-marker');
          if (markers.length > 0) {
            (markers[0] as HTMLElement).click();
          }
        }, 500);
      };
      
      if (map.current.loaded()) {
        showPopup();
      } else {
        map.current.once('load', showPopup);
      }

      // Cleanup
      return () => {
        resizeObserver.disconnect();
        map.current?.remove();
      };
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }, [venue]);

  const openInGoogleMaps = () => {
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venue.address)}`;
    window.open(googleMapsUrl, '_blank');
  };

  return (
    <div className={`relative ${className}`}>
      {/* Square map container with responsive sizing */}
      <div className="relative w-full aspect-square sm:aspect-[4/3] md:aspect-square rounded-2xl overflow-hidden shadow-xl bg-gray-100">
        <div 
          ref={mapContainer} 
          className="absolute inset-0 w-full h-full rounded-2xl"
        />
      </div>
      <div className="absolute top-4 left-4 z-10">
        <Button 
          size="sm" 
          variant="secondary" 
          onClick={openInGoogleMaps}
          className="shadow-lg bg-white/90 hover:bg-white backdrop-blur-sm"
          title="Open directions in Google Maps"
        >
          <ExternalLink className="w-4 h-4 mr-1" />
          <span className="hidden sm:inline">Get Directions</span>
          <span className="sm:hidden">Directions</span>
        </Button>
      </div>
    </div>
  );
};

export default VenueMap;