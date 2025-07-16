import React, { useState, useEffect } from 'react';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useWeddingEvents } from '@/hooks/useWeddingData';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Calendar, MapPin, ExternalLink, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface WeddingEvent {
  id: string;
  title: string;
  start_time?: string | null;
  end_time?: string | null;
  venue_name?: string;
  location?: string;
  description?: string;
  event_date?: string;
}

interface Venue {
  id: string;
  name: string;
  image_url: string;
  caption: string | null;
  address: string | null;
  quick_facts: Record<string, string> | null;
}

interface EventsPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const EventsPopup: React.FC<EventsPopupProps> = ({ isOpen, onClose }) => {
  useKeyboardShortcuts({ isOpen, onClose });
  const { events, loading: eventsLoading } = useWeddingEvents();
  const navigate = useNavigate();
  
  const [venues, setVenues] = useState<Venue[]>([]);
  const [venuesLoading, setVenuesLoading] = useState(true);
  const [currentMainVenue, setCurrentMainVenue] = useState(0);

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('events-popup-open');
      fetchVenues();
    } else {
      document.body.classList.remove('events-popup-open');
    }
    return () => {
      document.body.classList.remove('events-popup-open');
    };
  }, [isOpen]);

  const fetchVenues = async () => {
    setVenuesLoading(true);
    console.log('EventsPopup: Starting to fetch venues...');
    
    // Fallback venue data with storage bucket images
    const fallbackVenues: Venue[] = [
      {
        id: '1',
        name: 'Ben Ean Winery',
        image_url: 'https://iwmfxcrzzwpmxomydmuq.supabase.co/storage/v1/object/public/venue-ben-ean/Screenshot%20from%202025-07-08%2017-52-15_upscayl_4x_upscayl-standard-4x.png',
        caption: 'Wedding ceremony and reception venue in the beautiful Hunter Valley. Join us for the main celebration on Sunday, October 5th, 2025.',
        address: '119 McDonalds Rd, Pokolbin NSW 2320',
        quick_facts: {
          "Ceremony": "3:00 PM on Garden Terrace",
          "End Time": "12:00 PM",
          "Reception": "5:00 PM cocktails, 7:00 PM dinner",
          "Dress Code": "Cocktail/Dapper"
        }
      },
      {
        id: '2',
        name: 'The Prince Hotel, Mereweather',
        image_url: 'https://iwmfxcrzzwpmxomydmuq.supabase.co/storage/v1/object/public/venue-pub/The%20Prince%20Merewether_upscayl_4x_upscayl-standard-4x.png',
        caption: 'Pre-wedding drinks and casual dinner. Stop in to have a drink and grab yourself a meal if you are hungry.',
        address: 'Mereweather, NSW 2291',
        quick_facts: {
          "Event": "Pre-wedding drinks",
          "Date": "October 4th, 4-8 PM", 
          "Dress Code": "Casual",
          "Food": "Full pub menu available"
        }
      },
      {
        id: '3',
        name: 'Newcastle Beach',
        image_url: 'https://iwmfxcrzzwpmxomydmuq.supabase.co/storage/v1/object/public/venue-beach/Necastle%20Beach_upscayl_4x_upscayl-standard-4x.png',
        caption: 'Recovery beach day with coffee and excellent food. Good for sobbing up... hair of the dog perhaps?',
        address: 'Newcastle Beach, NSW 2300',
        quick_facts: {
          "Event": "Recovery Day",
          "Date": "October 6th, 11 AM",
          "Activities": "Beach, coffee, food",
          "Vibe": "Relaxed recovery"
        }
      }
    ];
    
    try {
      const { data, error } = await supabase
        .from('venues')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) {
        console.error('EventsPopup: Error fetching venues, using fallback:', error);
        setVenues(fallbackVenues);
      } else if (!data || data.length === 0) {
        console.log('EventsPopup: No venues in database, using fallback data');
        setVenues(fallbackVenues);
      } else {
        console.log('EventsPopup: Venues fetched successfully:', data);
        setVenues((data as Venue[]) || []);
      }
    } catch (error) {
      console.error('EventsPopup: Exception while fetching venues, using fallback:', error);
      setVenues(fallbackVenues);
    } finally {
      setVenuesLoading(false);
    }
  };

  const nextMainVenue = () => {
    setCurrentMainVenue((prev) => (prev + 1) % venues.length);
  };

  const prevMainVenue = () => {
    setCurrentMainVenue((prev) => (prev - 1 + venues.length) % venues.length);
  };

  const getVenueRoute = (venueName?: string) => {
    if (!venueName) return null;
    
    const normalizedName = venueName.toLowerCase();
    if (normalizedName.includes('ben ean')) {
      return '/venue/ben-ean';
    } else if (normalizedName.includes('prince') || normalizedName.includes('mereweather')) {
      return '/venue/prince-of-mereweather';
    } else if (normalizedName.includes('newcastle') || normalizedName.includes('beach')) {
      return '/venue/newcastle-beach';
    }
    return null;
  };

  const handleVenueClick = (venue: Venue) => {
    const route = getVenueRoute(venue.name);
    if (route) {
      onClose();
      navigate(route);
    }
  };

  const getGoogleMapsUrl = (address: string) => {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  };

  if (!isOpen) {
    return null;
  }

  const mainVenue = venues[currentMainVenue];

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/25 backdrop-blur-md transition-opacity duration-300"
        style={{ zIndex: 9999 }}
        onClick={onClose}
      />
      <div 
        className="fixed inset-0 flex items-center justify-center p-4"
        style={{ zIndex: 10000 }}
        onClick={onClose}
      >
        <div 
          className="w-full max-w-5xl max-h-[90vh] rounded-3xl overflow-hidden flex flex-col"
          style={{
            background: 'linear-gradient(135deg, rgba(155, 89, 182, 0.15) 0%, rgba(78, 205, 196, 0.1) 50%, rgba(255, 107, 107, 0.12) 100%)',
            backdropFilter: 'blur(30px) saturate(2)',
            WebkitBackdropFilter: 'blur(30px) saturate(2)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.15), inset 0 1px 1px rgba(255, 255, 255, 0.5), inset 0 -1px 1px rgba(0, 0, 0, 0.05)'
          }}
          onClick={e => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="venue-title"
        >
          <CardHeader className="flex-shrink-0 flex flex-row items-center justify-between p-4 sm:p-6" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.2)' }}>
            <div>
              <h2 id="venue-title" style={{
                fontSize: '28px',
                fontFamily: '"Bodoni Moda", serif',
                fontWeight: '600',
                color: '#000000',
                marginBottom: '0.5rem'
              }}>
                Wedding Venues
              </h2>
              <p style={{
                fontSize: '15px',
                color: 'rgba(0, 0, 0, 0.6)',
                fontFamily: '"Montserrat", sans-serif',
                marginTop: '4px'
              }}>
                Discover the beautiful locations for our special day
              </p>
              {venues.length > 1 && (
                <p style={{
                  fontSize: '13px',
                  color: 'rgba(0, 0, 0, 0.5)',
                  fontFamily: '"Montserrat", sans-serif',
                  marginTop: '4px'
                }}>
                  {currentMainVenue + 1} of {venues.length}
                </p>
              )}
            </div>
            <button 
              onClick={onClose} 
              className="rounded-full min-h-[44px] min-w-[44px] flex items-center justify-center transition-all duration-200 hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.2) 100%)',
                backdropFilter: 'blur(15px) saturate(2)',
                WebkitBackdropFilter: 'blur(15px) saturate(2)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08), inset 0 1px 1px rgba(255, 255, 255, 0.5)'
              }}
            >
              <X className="w-5 h-5" style={{ color: '#000000' }} />
            </button>
          </CardHeader>

          <CardContent className="p-0 flex-grow overflow-y-auto">
            {venuesLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-wedding-navy" />
              </div>
            ) : venues.length > 0 && mainVenue ? (
              <div className="flex flex-col">
                {/* Main Featured Venue Card */}
                <div className="relative">
                  <div className="relative w-full h-80 md:h-96 cursor-pointer group" onClick={() => handleVenueClick(mainVenue)}>
                    <img 
                      src={mainVenue.image_url} 
                      alt={mainVenue.name} 
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    
                    {/* Navigation arrows */}
                    {venues.length > 1 && (
                      <>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            prevMainVenue();
                          }} 
                          className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full min-h-[48px] min-w-[48px] flex items-center justify-center transition-all duration-200 hover:scale-105"
                          style={{
                            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.15) 100%)',
                            backdropFilter: 'blur(20px) saturate(2)',
                            WebkitBackdropFilter: 'blur(20px) saturate(2)',
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15), inset 0 1px 1px rgba(255, 255, 255, 0.5)'
                          }}
                        >
                          <ChevronLeft className="w-6 h-6" style={{ color: '#FFFFFF' }} />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            nextMainVenue();
                          }} 
                          className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full min-h-[48px] min-w-[48px] flex items-center justify-center transition-all duration-200 hover:scale-105"
                          style={{
                            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.15) 100%)',
                            backdropFilter: 'blur(20px) saturate(2)',
                            WebkitBackdropFilter: 'blur(20px) saturate(2)',
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15), inset 0 1px 1px rgba(255, 255, 255, 0.5)'
                          }}
                        >
                          <ChevronRight className="w-6 h-6" style={{ color: '#FFFFFF' }} />
                        </button>
                      </>
                    )}

                    {/* Venue name overlay */}
                    <div className="absolute bottom-6 left-6 right-6">
                      <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-2">
                        {mainVenue.name}
                      </h2>
                      <p className="text-white/90 text-lg max-w-2xl">
                        {mainVenue.caption}
                      </p>
                    </div>
                  </div>

                  {/* Venue Details Section */}
                  <div className="p-6" style={{
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.15) 100%)',
                    backdropFilter: 'blur(20px) saturate(2)',
                    WebkitBackdropFilter: 'blur(20px) saturate(2)'
                  }}>
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Left Column - Address and Details */}
                      <div className="space-y-4">
                        {mainVenue.address && (
                          <div className="flex items-start gap-3">
                            <MapPin className="w-5 h-5 text-glass-purple mt-1 flex-shrink-0" />
                            <div>
                              <p className="text-gray-800 font-medium">{mainVenue.address}</p>
                              <button
                                className="mt-2 px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 hover:scale-[1.02] flex items-center"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.open(getGoogleMapsUrl(mainVenue.address!), '_blank');
                                }}
                                style={{
                                  background: 'linear-gradient(135deg, rgba(69, 183, 209, 0.2) 0%, rgba(78, 205, 196, 0.15) 100%)',
                                  backdropFilter: 'blur(15px) saturate(2)',
                                  WebkitBackdropFilter: 'blur(15px) saturate(2)',
                                  border: '1px solid rgba(69, 183, 209, 0.3)',
                                  color: '#007AFF',
                                  fontFamily: '"Montserrat", sans-serif'
                                }}
                              >
                                <ExternalLink className="w-4 h-4 mr-2" />
                                Open in Maps
                              </button>
                            </div>
                          </div>
                        )}
                        
                        <button
                          className="w-full min-h-[52px] rounded-xl font-semibold text-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                          onClick={() => handleVenueClick(mainVenue)}
                          style={{
                            background: 'linear-gradient(135deg, rgba(155, 89, 182, 0.9) 0%, rgba(78, 205, 196, 0.8) 50%, rgba(255, 107, 107, 0.85) 100%)',
                            color: '#FFFFFF',
                            backdropFilter: 'blur(10px) saturate(2)',
                            WebkitBackdropFilter: 'blur(10px) saturate(2)',
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                            boxShadow: '0 4px 12px rgba(155, 89, 182, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.5)',
                            fontFamily: '"Montserrat", sans-serif',
                            textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
                          }}
                        >
                          View Full Details & Map
                        </button>
                      </div>

                      {/* Right Column - Quick Facts */}
                      {mainVenue.quick_facts && Object.keys(mainVenue.quick_facts).length > 0 && (
                        <div className="rounded-xl p-5" style={{
                          background: 'linear-gradient(135deg, rgba(255, 154, 0, 0.1) 0%, rgba(255, 255, 255, 0.15) 50%, rgba(46, 213, 115, 0.08) 100%)',
                          backdropFilter: 'blur(15px) saturate(2)',
                          WebkitBackdropFilter: 'blur(15px) saturate(2)',
                          border: '1px solid rgba(255, 255, 255, 0.25)',
                          boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.4), inset 0 -1px 1px rgba(0, 0, 0, 0.05)'
                        }}>
                          <h4 style={{
                            fontFamily: '"Bodoni Moda", serif',
                            fontSize: '18px',
                            fontWeight: '600',
                            color: '#000000',
                            marginBottom: '12px'
                          }}>Quick Facts</h4>
                          <div className="space-y-3">
                            {Object.entries(mainVenue.quick_facts).map(([key, value]) => (
                              <div key={key} className="flex justify-between items-center py-2" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.2)' }}>
                                <span style={{
                                  fontFamily: '"Montserrat", sans-serif',
                                  fontWeight: '500',
                                  color: '#000000'
                                }}>{key}</span>
                                <span style={{
                                  fontFamily: '"Montserrat", sans-serif',
                                  color: 'rgba(0, 0, 0, 0.7)',
                                  textAlign: 'right'
                                }}>{value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Small Venue Cards Row */}
                {venues.length > 1 && (
                  <div className="p-6" style={{
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.1) 100%)',
                    backdropFilter: 'blur(15px) saturate(2)',
                    WebkitBackdropFilter: 'blur(15px) saturate(2)'
                  }}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {venues.map((venue, index) => (
                        <div 
                          key={venue.id} 
                          className="relative group cursor-pointer rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.02]"
                          onClick={() => handleVenueClick(venue)}
                          style={{
                            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.15) 100%)',
                            backdropFilter: 'blur(20px) saturate(2)',
                            WebkitBackdropFilter: 'blur(20px) saturate(2)',
                            border: '1px solid rgba(255, 255, 255, 0.25)',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1), inset 0 1px 1px rgba(255, 255, 255, 0.4)'
                          }}
                        >
                          <div className="relative h-32 overflow-hidden">
                            <img 
                              src={venue.image_url} 
                              alt={venue.name} 
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" 
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                            
                            {/* Currently Viewing Badge */}
                            {index === currentMainVenue && (
                              <div className="absolute top-2 left-2 text-xs px-3 py-1.5 rounded-full" style={{
                                background: 'linear-gradient(135deg, rgba(155, 89, 182, 0.9) 0%, rgba(78, 205, 196, 0.8) 100%)',
                                backdropFilter: 'blur(10px) saturate(2)',
                                WebkitBackdropFilter: 'blur(10px) saturate(2)',
                                color: '#FFFFFF',
                                fontFamily: '"Montserrat", sans-serif',
                                fontWeight: '600',
                                textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)'
                              }}>
                                Currently Viewing
                              </div>
                            )}
                            
                            <div className="absolute bottom-0 left-0 right-0 p-3">
                              <h4 className="text-white font-semibold text-sm mb-1">{venue.name}</h4>
                              <p className="text-white/80 text-xs line-clamp-2">{venue.caption}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                <p>No venues available</p>
              </div>
            )}
          </CardContent>
        </div>
      </div>
    </>
  );
};

export default EventsPopup;