import React from 'react';
import GlassCard from '@/components/GlassCard';
import { ExternalLink, MapPin, Star, Building, Home, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Accommodation: React.FC = () => {
  const navigate = useNavigate();
  const newcastleHotels = [
    {
      name: "Ibis Newcastle",
      type: "Hotel",
      area: "City Centre",
      description: "Modern hotel in the heart of Newcastle with easy access to restaurants and nightlife."
    },
    {
      name: "Holiday Inn Newcastle",
      type: "Hotel", 
      area: "City Centre",
      description: "Full-service hotel with harbour views and excellent facilities."
    },
    {
      name: "Kingsley Crystalbrook",
      type: "Luxury Hotel",
      area: "Newcastle East",
      description: "Premium boutique hotel with stunning ocean views and contemporary style."
    },
    {
      name: "QT Newcastle",
      type: "Boutique Hotel",
      area: "Newcastle West",
      description: "Stylish boutique hotel known for its unique design and excellent service."
    }
  ];

  const hunterValleyAccommodation = [
    {
      name: "Elfin Hill Vineyard Accommodation",
      type: "Vineyard Stay",
      area: "Hunter Valley",
      description: "Romantic vineyard accommodation surrounded by picturesque wine country."
    },
    {
      name: "Oaks Cypress Lakes Resort",
      type: "Resort",
      area: "Hunter Valley", 
      description: "Golf resort with spacious villas and resort-style amenities."
    },
    {
      name: "Chateau Elan",
      type: "Luxury Resort",
      area: "Hunter Valley",
      description: "Premium resort with spa facilities and award-winning dining."
    }
  ];

  const bookingSites = [
    { name: "Stayz", url: "https://www.stayz.com.au", icon: "🏠" },
    { name: "Airbnb", url: "https://www.airbnb.com.au", icon: "🏡" },
    { name: "Follow", url: "https://follow.com.au", icon: "🔍" }
  ];

  return (
    <div className="min-h-screen px-3 sm:px-5 pt-8 sm:pt-12 pb-20">
      {/* Header */}
      <div className="text-center mb-6 sm:mb-8 animate-fade-up">
        <h1 className="text-2xl sm:text-3xl lg:wedding-heading font-semibold text-wedding-navy mb-2 sm:mb-3">
          Accommodation
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
          Recommendations for where to stay during our wedding weekend
        </p>
      </div>

      {/* Coach Pickup Info */}
      <GlassCard className="mb-8 p-4 sm:p-6 animate-fade-up border-l-4 border-blue-400">
        <div className="flex items-start gap-3">
          <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold text-wedding-navy mb-2 text-sm sm:text-base">Coach Transport Available</h3>
            <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
              Free coaches will collect guests from Newcastle City and Hunter Valley accommodation areas. 
              Please indicate your accommodation details in your RSVP for pickup coordination.
            </p>
          </div>
        </div>
      </GlassCard>

      {/* Accommodation Sharing */}
      <GlassCard className="mb-8 p-6 animate-fade-up bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white rounded-lg shadow-sm">
            <Home className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-wedding-navy mb-2 text-lg">
              Share Accommodation with Other Guests
            </h3>
            <p className="text-muted-foreground text-sm mb-4">
              Looking to split costs? Connect with other wedding guests to share hotel rooms, 
              apartments, or vacation rentals. Save money and make new friends!
            </p>
            <Button 
              onClick={() => navigate('/accommodation-share')}
              className="flex items-center gap-2"
            >
              <Users className="w-4 h-4" />
              Find or Share Accommodation
            </Button>
          </div>
        </div>
      </GlassCard>

      {/* Newcastle Accommodation */}
      <div className="mb-8 animate-fade-up" style={{ animationDelay: '0.1s' }}>
        <div className="flex items-center gap-2 mb-4">
          <Building className="w-5 h-5 text-wedding-navy" />
          <h2 className="text-xl font-semibold text-wedding-navy">Newcastle</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Cooks Hill and Newcastle (East/West) are the most central suburbs.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {newcastleHotels.map((hotel, index) => (
            <GlassCard key={index} className="p-4 sm:p-5">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-wedding-navy text-sm sm:text-base">
                  {hotel.name}
                </h3>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  {hotel.type}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {hotel.area}
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {hotel.description}
              </p>
            </GlassCard>
          ))}
        </div>
      </div>

      {/* Hunter Valley Accommodation */}
      <div className="mb-8 animate-fade-up" style={{ animationDelay: '0.2s' }}>
        <div className="flex items-center gap-2 mb-4">
          <Star className="w-5 h-5 text-wedding-navy" />
          <h2 className="text-xl font-semibold text-wedding-navy">Hunter Valley</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Stay close to the venue in beautiful wine country.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {hunterValleyAccommodation.map((place, index) => (
            <GlassCard key={index} className="p-4 sm:p-5">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-wedding-navy text-sm sm:text-base line-clamp-2">
                  {place.name}
                </h3>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full whitespace-nowrap ml-2">
                  {place.type}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {place.area}
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {place.description}
              </p>
            </GlassCard>
          ))}
        </div>
      </div>

      {/* Alternative Booking Sites */}
      <div className="animate-fade-up" style={{ animationDelay: '0.3s' }}>
        <h2 className="text-xl font-semibold text-wedding-navy mb-4">
          Looking for Houses or Apartments?
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          We recommend these booking websites for finding private rentals:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {bookingSites.map((site, index) => (
            <GlassCard key={index} className="p-4 text-center">
              <div className="text-2xl mb-2">{site.icon}</div>
              <h3 className="font-semibold text-wedding-navy mb-2">{site.name}</h3>
              <a 
                href={site.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 transition-colors"
              >
                Visit Site
                <ExternalLink className="w-3 h-3" />
              </a>
            </GlassCard>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Accommodation;