import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VenueImage } from '@/hooks/useVenueImages';
import OptimizedImage from '@/components/OptimizedImage';


interface VenueHeroImageProps {
  venueId: string;
  venueName: string;
  className?: string;
}

import { useVenueImages } from '@/hooks/useVenueImages';

const VenueHeroImage: React.FC<VenueHeroImageProps> = ({ 
  venueId, 
  venueName, 
  className = '' 
}) => {
  const { images, loading } = useVenueImages(venueId);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (images.length > 0) {
      setImageError(false);
    }
  }, [images]);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  if (loading) {
    return (
      <div className={`w-full h-48 sm:h-64 md:h-80 bg-gradient-to-br from-glass-green/20 to-glass-blue/20 rounded-glass flex items-center justify-center ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-wedding-navy mx-auto mb-2"></div>
          <p className="text-sm text-wedding-navy">Loading images...</p>
        </div>
      </div>
    );
  }



  // Storage bucket fallback images
  const getFallbackImage = (venueName: string) => {
    const normalizedName = venueName.toLowerCase();
    if (normalizedName.includes('ben ean')) {
      return 'https://iwmfxcrzzwpmxomydmuq.supabase.co/storage/v1/object/public/venue-ben-ean/Screenshot%20from%202025-07-08%2017-52-15_upscayl_4x_upscayl-standard-4x.png';
    } else if (normalizedName.includes('prince') || normalizedName.includes('mereweather')) {
      return 'https://iwmfxcrzzwpmxomydmuq.supabase.co/storage/v1/object/public/venue-pub/The%20Prince%20Merewether_upscayl_4x_upscayl-standard-4x.png';
    } else if (normalizedName.includes('newcastle') || normalizedName.includes('beach')) {
      return 'https://iwmfxcrzzwpmxomydmuq.supabase.co/storage/v1/object/public/venue-beach/Necastle%20Beach_upscayl_4x_upscayl-standard-4x.png';
    }
    return null;
  };

  if (imageError || images.length === 0) {
    const fallbackImage = getFallbackImage(venueName);
    
    if (fallbackImage) {
      return (
        <div className={`w-full h-48 sm:h-64 md:h-80 relative rounded-glass overflow-hidden ${className}`}>
          <OptimizedImage
            src={fallbackImage}
            alt={`${venueName} venue image`}
            className="w-full h-full object-cover"
            loading="eager"
            onError={() => setImageError(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <h3 className="text-lg font-semibold mb-1 font-dolly">
              {venueName}
            </h3>
            <p className="text-sm text-white/90">
              Beautiful venue awaits your visit
            </p>
          </div>
        </div>
      );
    }
    
    return (
      <div className={`w-full h-48 sm:h-64 md:h-80 bg-gradient-to-br from-glass-green/20 to-glass-blue/20 rounded-glass flex items-center justify-center ${className}`}>
        <div className="text-center">
          <MapPin className="w-12 h-12 mx-auto mb-2 text-glass-green" />
          <p className="text-sm text-wedding-navy font-medium">
            {venueName} Images Coming Soon
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Beautiful venue photos will be available here
          </p>
        </div>
      </div>
    );
  }

  const currentImage = images[currentImageIndex];

  return (
    <div className={`w-full h-48 sm:h-64 md:h-80 relative rounded-glass overflow-hidden group ${className}`}>
      {/* Hero Image */}
      <OptimizedImage
        src={currentImage.image_url}
        alt={currentImage.title || `${venueName} venue image`}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        loading="eager"
        onError={() => setImageError(true)}
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
      
      {/* Image Navigation */}
      {images.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="sm"
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            onClick={prevImage}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            onClick={nextImage}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </>
      )}
      
      {/* Image Info */}
      <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
        {currentImage.title && (
          <h3 className="text-lg font-semibold mb-1 font-dolly">
            {currentImage.title}
          </h3>
        )}
        {currentImage.description && (
          <p className="text-sm text-white/90 mb-2">
            {currentImage.description}
          </p>
        )}
        {images.length > 1 && (
          <div className="flex justify-center gap-2 mt-2">
            {images.map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                  index === currentImageIndex ? 'bg-white' : 'bg-white/40'
                }`}
                onClick={() => setCurrentImageIndex(index)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VenueHeroImage;