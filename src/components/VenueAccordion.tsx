import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronUp } from 'lucide-react';

const VenueAccordion: React.FC = () => {
  const [openSections, setOpenSections] = useState({
    venues: true,
    dressCode: true,
    accommodation: false,
    location: false
  });

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const venues = [
    {
      id: 'ben-ean',
      title: 'Ben Ean',
      subtitle: 'Wedding Ceremony & Reception',
      date: 'October 5, 2025',
      time: '2:30 PM arrival for 3:00 PM start',
      description: 'Ceremony on Garden Terrace Lawn, followed by cocktails and reception until midnight',
      dotColor: 'dot-pink',
      path: '/venue/ben-ean'
    },
    {
      id: 'prince-pub',
      title: 'Prince of Mereweather',
      subtitle: 'Pre-Wedding Drinks',
      date: 'October 4, 2025',
      time: '4:00 PM - 8:00 PM',
      description: 'Casual drinks and dinner at the pub. Come and go as you please!',
      dotColor: 'dot-blue',
      path: '/venue/prince-of-mereweather'
    },
    {
      id: 'beach',
      title: 'Newcastle Beach',
      subtitle: 'Recovery Beach Day',
      date: 'October 6, 2025',
      time: 'From 11:00 AM onwards',
      description: 'Casual beach hangout with coffee and food from the kiosk',
      dotColor: 'dot-green',
      path: '/venue/newcastle-beach'
    }
  ];

  const AccordionSection = ({ 
    title, 
    icon, 
    isOpen, 
    onToggle, 
    children 
  }: { 
    title: string; 
    icon: string; 
    isOpen: boolean; 
    onToggle: () => void; 
    children: React.ReactNode;
  }) => (
    <div className="glass-card overflow-hidden mb-4 sm:mb-6 animate-fade-up">
      <button
        onClick={onToggle}
        className="w-full p-4 sm:p-6 flex items-center justify-between text-left hover:bg-white/20 transition-colors duration-200 touch-target"
      >
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-glass-blue to-glass-purple rounded-xl flex items-center justify-center text-xl sm:text-2xl flex-shrink-0">
            {icon}
          </div>
          <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-wedding-navy tracking-tight">
            {title}
          </h2>
        </div>
        <div className="flex-shrink-0 ml-4">
          {isOpen ? (
            <ChevronUp className="w-5 h-5 sm:w-6 sm:h-6 text-wedding-navy" />
          ) : (
            <ChevronDown className="w-5 h-5 sm:w-6 sm:h-6 text-wedding-navy" />
          )}
        </div>
      </button>
      
      {isOpen && (
        <div className="px-4 sm:px-6 pb-4 sm:pb-6 border-t border-border/20">
          {children}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen px-3 sm:px-5 pt-6 sm:pt-8 pb-6 relative">
      <div className="container max-w-3xl mx-auto">
        {/* Page Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-wedding-navy mb-2 sm:mb-3 tracking-tight">
            Venues & Locations
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground font-normal">
            All the places where we'll be celebrating
          </p>
        </div>

        {/* Venues Section */}
        <AccordionSection
          title="Event Venues"
          icon="📍"
          isOpen={openSections.venues}
          onToggle={() => toggleSection('venues')}
        >
          <div className="space-y-3 sm:space-y-4 mt-4 sm:mt-6">
            {venues.map((venue, index) => (
              <Link 
                key={venue.id}
                to={venue.path}
                className="glass-secondary block p-4 sm:p-5 rounded-xl transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1"
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
                  <div className="flex-1 space-y-2 sm:space-y-3">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div 
                        className="w-3 h-3 sm:w-4 sm:h-4 rounded-full relative flex-shrink-0"
                        style={{
                          background: venue.dotColor === 'dot-pink' 
                            ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
                            : venue.dotColor === 'dot-blue'
                            ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                            : 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)'
                        }}
                      />
                      <h3 className="text-base sm:text-lg font-semibold text-wedding-navy">
                        {venue.title}
                      </h3>
                    </div>
                    <p className="text-sm sm:text-base text-glass-blue font-medium">
                      {venue.subtitle}
                    </p>
                    
                    <div className="space-y-1 sm:space-y-2">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="glass-primary w-5 h-5 sm:w-6 sm:h-6 rounded-lg flex items-center justify-center text-xs sm:text-sm flex-shrink-0">
                          📅
                        </div>
                        <span className="text-xs sm:text-sm text-muted-foreground">{venue.date}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="glass-primary w-5 h-5 sm:w-6 sm:h-6 rounded-lg flex items-center justify-center text-xs sm:text-sm flex-shrink-0">
                          🕐
                        </div>
                        <span className="text-xs sm:text-sm text-muted-foreground">{venue.time}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="glass-primary w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300">
                    <svg width="14" height="14" viewBox="0 0 24 24" className="text-glass-blue">
                      <path fill="currentColor" d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
                    </svg>
                  </div>
                </div>
                
                <div className="glass-primary p-3 sm:p-4 rounded-lg">
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {venue.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </AccordionSection>

        {/* Dress Code Section */}
        <AccordionSection
          title="Dress Code"
          icon="💗"
          isOpen={openSections.dressCode}
          onToggle={() => toggleSection('dressCode')}
        >
          <div className="mt-4 sm:mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
              {[
                {
                  icon: '👔',
                  title: 'For Him:',
                  description: 'Suits, dress chinos, button up shirt and optional tie. We love a pocket kerchief!'
                },
                {
                  icon: '👗', 
                  title: 'For Her:',
                  description: 'Classy dress, pantsuit or jumpsuit.'
                }
              ].map((item, index) => (
                <div key={index} className="glass-secondary p-4 sm:p-5 rounded-xl">
                  <div className="flex items-center gap-2 sm:gap-3 mb-3">
                    <div className="glass-primary w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-sm sm:text-base flex-shrink-0">
                      {item.icon}
                    </div>
                    <h3 className="text-sm sm:text-base font-semibold text-wedding-navy">
                      {item.title}
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>

            <div className="glass-secondary p-4 sm:p-5 rounded-xl text-center bg-gradient-to-r from-glass-pink/10 to-glass-purple/10 border border-glass-pink/20">
              <p className="text-base sm:text-lg font-semibold text-glass-pink tracking-wide">
                ✨ Dapper/Cocktail Attire ✨
              </p>
            </div>
          </div>
        </AccordionSection>

        {/* Accommodation Section */}
        <AccordionSection
          title="Accommodation Recommendations"
          icon="🏨"
          isOpen={openSections.accommodation}
          onToggle={() => toggleSection('accommodation')}
        >
          <div className="mt-4 sm:mt-6 space-y-6">
            {/* Newcastle Area */}
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-wedding-navy mb-3 pb-2 border-b border-border/20">
                Newcastle Area
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground mb-4 italic">
                Cooks Hill and Newcastle (East/West) are the most central suburbs.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {['Ibis Newcastle', 'Holiday Inn Newcastle', 'Kingsley Crystalbrook', 'QT Newcastle'].map((hotel, index) => (
                  <div key={index} className="glass-secondary p-3 sm:p-4 rounded-lg flex items-center justify-between">
                    <span className="text-xs sm:text-sm text-wedding-navy font-medium">{hotel}</span>
                    <div className="w-2 h-2 bg-glass-blue rounded-full"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hunter Valley */}
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-wedding-navy mb-3 pb-2 border-b border-border/20">
                Hunter Valley
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {['Elfin Hill Vineyard Accommodation', 'Oaks Cypress Lakes Resort', 'Chateau Elan'].map((hotel, index) => (
                  <div key={index} className={`glass-secondary p-3 sm:p-4 rounded-lg flex items-center justify-between ${hotel === 'Chateau Elan' ? 'sm:col-span-2' : ''}`}>
                    <span className="text-xs sm:text-sm text-wedding-navy font-medium">{hotel}</span>
                    <div className="w-2 h-2 bg-glass-blue rounded-full"></div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-primary p-4 rounded-lg flex items-center gap-3">
              <span className="text-lg">💡</span>
              <p className="text-xs sm:text-sm text-muted-foreground">
                <strong>Tip:</strong> For houses or apartments, check Stayz, Airbnb, or Follow
              </p>
            </div>
          </div>
        </AccordionSection>

        {/* Location Details Section */}
        <AccordionSection
          title="Location & Transport"
          icon="🚗"
          isOpen={openSections.location}
          onToggle={() => toggleSection('location')}
        >
          <div className="mt-4 sm:mt-6 space-y-4">
            <div className="glass-secondary p-4 sm:p-5 rounded-xl">
              <h3 className="text-sm sm:text-base font-semibold text-wedding-navy mb-3">Ben Ean Pokolbin</h3>
              <p className="text-xs sm:text-sm text-muted-foreground mb-3">
                198 McDonalds Road, Pokolbin NSW 2320
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Ben Ean is located in the heart of the Hunter Valley wine region, approximately 2 hours drive from Sydney and 45 minutes from Newcastle.
              </p>
            </div>
            
            <div className="glass-primary p-4 rounded-lg">
              <h4 className="text-sm font-semibold text-wedding-navy mb-2">Free Coach Service</h4>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Free coach transport available from Newcastle City and Hunter Valley accommodation. Please indicate your needs in the RSVP.
              </p>
            </div>
          </div>
        </AccordionSection>
      </div>
    </div>
  );
};

export default VenueAccordion;