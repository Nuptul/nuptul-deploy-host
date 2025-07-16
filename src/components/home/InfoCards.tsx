import React from 'react';

interface InfoCardsProps {
  isAdmin: boolean;
}

const InfoCards: React.FC<InfoCardsProps> = ({ isAdmin }) => {
  const infoCards = [
    {
      icon: '📅',
      title: 'When',
      primary: 'October 5, 2025',
      secondary: 'Arrive 2:30 PM for 3:00 PM start'
    },
    {
      icon: '📍',
      title: 'Where',
      primary: 'Ben Ean',
      secondary: '119 McDonalds Rd, Pokolbin NSW'
    },
    {
      icon: '👫',
      title: 'Who',
      primary: 'Family & Friends',
      secondary: isAdmin ? 'You have admin access' : 'You\'re invited!'
    }
  ];

  return (
    <div className="responsive-grid-3 mb-6 sm:mb-8 lg:mb-10">
      {infoCards.map((card, index) => (
        <div key={card.title} className="glass-card responsive-card-padding text-center transition-all duration-300 hover:scale-105 animate-fade-up">
          <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 mx-auto mb-3 sm:mb-4 glass-secondary rounded-xl sm:rounded-2xl flex items-center justify-center text-xl sm:text-2xl lg:text-3xl">
            {card.icon}
          </div>
          <h3 className="responsive-text-lg font-dolly font-semibold text-wedding-navy mb-2">
            {card.title}
          </h3>
          <div className="space-y-1">
            <div className="responsive-text-base text-glass-blue font-medium">
              {card.primary}
            </div>
            <div className="responsive-text-base text-muted-foreground">
              {card.secondary}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default InfoCards;