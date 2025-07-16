import React from 'react';
import { useContentBlocks } from '@/hooks/useContentBlocks';

interface VenueImageProps {
  venueId: string;
  venueName: string;
  fallbackUrl?: string;
  className?: string;
  alt?: string;
}

export const VenueImage: React.FC<VenueImageProps> = ({ 
  venueId, 
  venueName, 
  fallbackUrl,
  className = '',
  alt
}) => {
  const { blocks, loading } = useContentBlocks(venueId);

  const imageBlock = blocks.find(block => block.type === 'image');
  const imageUrl = imageBlock?.metadata?.url || imageBlock?.content;
  
  // Use the fetched URL, or fallback if not found
  const displayUrl = imageUrl || fallbackUrl || `https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80`;
  
  if (loading) {
    return (
      <div className={`bg-muted animate-pulse ${className}`}>
        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
          Loading...
        </div>
      </div>
    );
  }
  
  return (
    <img
      src={displayUrl}
      alt={alt || venueName}
      className={className}
      loading="lazy"
    />
  );
};