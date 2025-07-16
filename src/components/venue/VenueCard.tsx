import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, ExternalLink, Clock, Users, Phone, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface VenueCardProps {
  venue: {
    id: string;
    name: string;
    image_url: string;
    address: string | null;
    caption: string | null;
    quick_facts?: Record<string, string>;
  };
  onClick: (venueId: string) => void;
  className?: string;
}

const VenueCard: React.FC<VenueCardProps> = ({ venue, onClick, className = '' }) => {
  const getGoogleMapsUrl = (address: string) => {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  };

  // Extract meaningful quick facts with icons
  const getQuickFactIcon = (key: string) => {
    const lowerKey = key.toLowerCase();
    if (lowerKey.includes('capacity') || lowerKey.includes('guests')) return Users;
    if (lowerKey.includes('time') || lowerKey.includes('hours')) return Clock;
    if (lowerKey.includes('phone') || lowerKey.includes('contact')) return Phone;
    if (lowerKey.includes('date') || lowerKey.includes('schedule')) return Calendar;
    return null;
  };

  const formatQuickFacts = (facts: Record<string, string>) => {
    return Object.entries(facts).slice(0, 3).map(([key, value]) => ({
      key,
      value,
      icon: getQuickFactIcon(key)
    }));
  };

  return (
    <Card 
      className={`glass-card overflow-hidden group hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-[1.02] ${className}`}
      onClick={() => onClick(venue.id)}
    >
      {/* Image Container */}
      <div className="aspect-[4/3] sm:aspect-video relative overflow-hidden">
        <img
          src={venue.image_url}
          alt={venue.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Quick Actions - Mobile Optimized */}
        {venue.address && (
          <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
            <Button
              size="sm"
              variant="secondary"
              onClick={(e) => {
                e.stopPropagation();
                window.open(getGoogleMapsUrl(venue.address!), '_blank');
              }}
              className="bg-white/95 hover:bg-white text-black shadow-lg backdrop-blur-sm min-h-[44px] px-4 text-sm font-medium"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Directions
            </Button>
          </div>
        )}
      </div>
      
      {/* Content - Centered Layout */}
      <CardContent className="p-4 sm:p-6 text-center">
        {/* Venue Name */}
        <h3 className="font-bold text-lg sm:text-xl text-foreground mb-2 font-dolly line-clamp-2">
          {venue.name}
        </h3>
        
        {/* Caption */}
        {venue.caption && (
          <p className="text-sm sm:text-base text-muted-foreground mb-4 line-clamp-3 leading-relaxed">
            {venue.caption}
          </p>
        )}
        
        {/* Address */}
        {venue.address && (
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-4 px-2">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span className="line-clamp-2 text-center">{venue.address}</span>
          </div>
        )}
        
        {/* Quick Facts */}
        {venue.quick_facts && Object.keys(venue.quick_facts).length > 0 && (
          <div className="space-y-3 mb-4">
            <div className="flex flex-wrap justify-center gap-2">
              {formatQuickFacts(venue.quick_facts).map(({ key, value, icon: Icon }, index) => (
                <Badge 
                  key={index} 
                  variant="secondary" 
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-muted/50 hover:bg-muted/70 transition-colors"
                >
                  {Icon && <Icon className="w-3 h-3" />}
                  <span className="font-medium">{key}:</span>
                  <span>{value}</span>
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        {/* CTA Button */}
        <div className="pt-2">
          <Button 
            variant="outline" 
            size="sm"
            className="min-h-[44px] px-6 text-sm font-medium bg-background/50 hover:bg-background/80 transition-all duration-200"
            onClick={(e) => {
              e.stopPropagation();
              onClick(venue.id);
            }}
          >
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default VenueCard;