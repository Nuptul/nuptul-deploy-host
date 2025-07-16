import React from 'react';
import { Settings, MapPin, Clock, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Define a specific type for a wedding event for type safety
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

interface EventsSectionProps {
  isAdmin: boolean;
  events: WeddingEvent[];
  eventsLoading: boolean;
}

const EventsSection: React.FC<EventsSectionProps> = ({ isAdmin, events, eventsLoading }) => {
  const navigate = useNavigate();
  
  // Sort events by event_date to ensure chronological order
  const sortedEvents = [...events].sort((a, b) => {
    const dateA = a.event_date ? new Date(a.event_date).getTime() : 0;
    const dateB = b.event_date ? new Date(b.event_date).getTime() : 0;
    return dateA - dateB;
  });

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-AU', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatEventDateTime = (event: WeddingEvent) => {
    if (!event.event_date) return 'Time TBA';
    
    const eventDate = new Date(event.event_date);
    const dateStr = eventDate.toLocaleDateString('en-AU', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });

    if (event.start_time) {
      const timeStr = formatTime(event.start_time);
      const endTimeStr = event.end_time ? ` - ${formatTime(event.end_time)}` : '';
      return `${dateStr}, ${timeStr}${endTimeStr}`;
    }
    
    return dateStr;
  };

  const getVenueRoute = (venueName: string | undefined, location: string | undefined): string | null => {
    const venue = venueName || location || '';
    const lowerVenue = venue.toLowerCase();
    
    if (lowerVenue.includes('ben ean')) {
      return '/venue/ben-ean';
    } else if (lowerVenue.includes('prince of mereweather') || lowerVenue.includes('mereweather')) {
      return '/venue/prince-of-mereweather';
    } else if (lowerVenue.includes('newcastle beach')) {
      return '/venue/newcastle-beach';
    }
    
    return null;
  };

  const handleVenueClick = (venueName: string | undefined, location: string | undefined) => {
    const route = getVenueRoute(venueName, location);
    if (route) {
      navigate(route);
    }
  };

  return (
    <div className="responsive-card-padding mb-6 sm:mb-8 lg:mb-10 animate-fade-up rounded-3xl" style={{
      background: 'linear-gradient(135deg, rgba(155, 89, 182, 0.15) 0%, rgba(78, 205, 196, 0.1) 50%, rgba(255, 107, 107, 0.12) 100%)',
      backdropFilter: 'blur(30px) saturate(2)',
      WebkitBackdropFilter: 'blur(30px) saturate(2)',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      boxShadow: '0 20px 50px rgba(0, 0, 0, 0.1), inset 0 1px 1px rgba(255, 255, 255, 0.5), inset 0 -1px 1px rgba(0, 0, 0, 0.05)'
    }}>
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <h2 className="flex items-center gap-2 sm:gap-3" style={{
          fontSize: '24px',
          fontFamily: '"Bodoni Moda", serif',
          fontWeight: '600',
          color: '#000000'
        }}>
          <span className="text-xl sm:text-2xl">🎉</span>
          Schedule of Events
        </h2>
        {isAdmin && (
          <button className="min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110" style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.2) 100%)',
            backdropFilter: 'blur(15px) saturate(2)',
            WebkitBackdropFilter: 'blur(15px) saturate(2)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08), inset 0 1px 1px rgba(255, 255, 255, 0.5)'
          }}>
            <Settings size={18} style={{ color: 'rgba(0, 0, 0, 0.6)' }} />
          </button>
        )}
      </div>

      {eventsLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-wedding-navy" />
        </div>
      ) : sortedEvents.length > 0 ? (
        <div className="relative pl-8 sm:pl-12">
          {/* The vertical timeline bar */}
          <div className="absolute left-3 sm:left-4 top-2 bottom-2 w-0.5 rounded-full" style={{
            background: 'linear-gradient(180deg, rgba(155, 89, 182, 0.3) 0%, rgba(78, 205, 196, 0.2) 50%, rgba(255, 107, 107, 0.25) 100%)'
          }}></div>

          <div className="space-y-10">
            {sortedEvents.map((event, index) => (
              <div key={event.id} className="relative">
                <div className="absolute -left-[2.1rem] sm:-left-[2.7rem] top-1.5 w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center" style={{
                  background: 'linear-gradient(135deg, rgba(69, 183, 209, 0.9) 0%, rgba(78, 205, 196, 0.8) 100%)',
                  backdropFilter: 'blur(10px) saturate(2)',
                  WebkitBackdropFilter: 'blur(10px) saturate(2)',
                  boxShadow: '0 4px 12px rgba(69, 183, 209, 0.3), 0 0 0 4px rgba(255, 255, 255, 0.3)'
                }}>
                  <span className="text-sm sm:text-base">{['🎉', '🥂', '🍽️', '💃', '🕺'][index % 5]}</span>
                </div>
                <div className="ml-4">
                  <h3 style={{
                    fontSize: '18px',
                    fontFamily: '"Bodoni Moda", serif',
                    fontWeight: '600',
                    color: '#000000'
                  }}>{event.title}</h3>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-x-4 gap-y-1 mt-1" style={{
                    color: 'rgba(0, 0, 0, 0.6)',
                    fontFamily: '"Montserrat", sans-serif',
                    fontSize: '14px'
                  }}>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-glass-blue" />
                      <span>{formatEventDateTime(event)}</span>
                    </div>
                    {(event.venue_name || event.location) && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-glass-purple" />
                        {getVenueRoute(event.venue_name, event.location) ? (
                          <button
                            onClick={() => handleVenueClick(event.venue_name, event.location)}
                            className="transition-all duration-200 underline decoration-dotted hover:decoration-solid rounded min-h-[24px] px-1"
                            style={{
                              color: '#007AFF',
                              fontWeight: '500'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
                            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                          >
                            {event.venue_name || event.location}
                            <ExternalLink className="w-3 h-3 ml-1 inline" />
                          </button>
                        ) : (
                          <span>{event.venue_name || event.location}</span>
                        )}
                      </div>
                    )}
                  </div>
                  {event.description && (
                    <p className="mt-2" style={{
                      fontFamily: '"Montserrat", sans-serif',
                      fontSize: '15px',
                      color: 'rgba(0, 0, 0, 0.6)'
                    }}>
                      {event.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <p>The event schedule will be posted soon. Stay tuned!</p>
          {isAdmin && (
            <p className="text-xs mt-2">Add events through the admin panel.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default EventsSection;
