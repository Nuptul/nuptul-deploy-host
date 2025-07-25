import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, ExternalLink, Clock, Users, Phone, Calendar, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import AdaptiveGlassCard from '@/components/AdaptiveGlassCard';

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
  isActive?: boolean;
  index?: number;
}

const VenueCard: React.FC<VenueCardProps> = ({ venue, onClick, className = '', isActive = false, index = 0 }) => {
  // All venues use blue buttons with subtle color accents
  const getVariant = () => {
    if (venue.name.includes('Ben Ean')) return { variant: 'formal' as const, color: 'blue', accent: 'blue' };
    if (venue.name.includes('Prince') || venue.name.includes('Merewether')) return { variant: 'romantic' as const, color: 'blue', accent: 'amber' };
    if (venue.name.includes('Beach') || venue.name.includes('Newcastle')) return { variant: 'nature' as const, color: 'blue', accent: 'teal' };
    return { variant: 'auto' as const, color: 'blue', accent: 'blue' };
  };
  
  const style = getVariant();
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -5 }}
      className="h-full"
    >
      <AdaptiveGlassCard 
        variant={style.variant}
        className={`h-full overflow-hidden group cursor-pointer transition-all duration-300 ${
          isActive ? 'ring-2 ring-offset-2 ring-blue-500' : ''
        } ${className}`}
        onClick={() => onClick(venue.id)}
        glowOnHover
      >
        {/* Image Container */}
        <div className="relative h-48 sm:h-56 overflow-hidden">
          <img
            src={venue.image_url}
            alt={venue.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
          />
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Event Number with accent color */}
          <div className="absolute top-3 right-3">
            <div className={`w-10 h-10 rounded-full bg-${style.accent}-100 text-${style.accent}-700 flex items-center justify-center font-bold shadow-md backdrop-blur-sm`}>
              {index + 1}
            </div>
          </div>
          
          {/* Active Indicator */}
          {isActive && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute top-3 left-3"
            >
              <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-lg">
                Currently Viewing
              </Badge>
            </motion.div>
          )}
        
        </div>
      
        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Title */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">
              {venue.name}
            </h3>
        
            {venue.caption && (
              <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                {venue.caption}
              </p>
            )}
          </div>
        
          {/* Key Quick Facts */}
          {venue.quick_facts && (() => {
            const keyFacts = Object.entries(venue.quick_facts)
              .filter(([key]) => key.toLowerCase().includes('date') || key.toLowerCase().includes('time') || key.toLowerCase().includes('ceremony'))
              .slice(0, 2);
            
            return keyFacts.length > 0 && (
              <div className="space-y-2">
                {keyFacts.map(([key, value], idx) => {
                  const Icon = getQuickFactIcon(key);
                  return Icon && (
                    <div key={idx} className="flex items-center gap-3 text-sm">
                      <div className={`p-1.5 rounded-lg bg-${style.accent}-100`}>
                        <Icon className={`w-4 h-4 text-${style.accent}-600`} />
                      </div>
                      <span className="text-gray-700 font-medium">{value}</span>
                    </div>
                  );
                })}
              </div>
            );
          })()}
          
          {/* Address */}
          {venue.address && (
            <div className="flex items-start gap-3 text-sm">
              <div className={`p-1.5 rounded-lg bg-${style.accent}-100 mt-0.5`}>
                <MapPin className={`w-4 h-4 text-${style.accent}-600`} />
              </div>
              <span className="text-gray-600 line-clamp-2">{venue.address}</span>
            </div>
          )}
        
        
          {/* Action Button - Always Blue */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button 
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0 shadow-md group/btn transition-all duration-200"
              style={{
                background: 'linear-gradient(to right, #3b82f6, #2563eb)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(to right, #2563eb, #1d4ed8)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(to right, #3b82f6, #2563eb)';
              }}
              onClick={(e) => {
                e.stopPropagation();
                onClick(venue.id);
              }}
            >
              <span>View Details</span>
              <ChevronRight className="w-4 h-4 ml-2 transition-transform group-hover/btn:translate-x-1" />
            </Button>
          </motion.div>
        </div>
      </AdaptiveGlassCard>
    </motion.div>
  );
};

export default VenueCard;