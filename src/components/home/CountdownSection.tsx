import React, { useState, useEffect } from 'react';

interface TimeToWedding {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const CountdownSection: React.FC = () => {
  const [timeToWedding, setTimeToWedding] = useState<TimeToWedding>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  // Tim & Kirsten's Wedding Date - October 5th, 2025
  const weddingDate = new Date('2025-10-05T16:00:00');

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date().getTime();
      const distance = weddingDate.getTime() - now;

      if (distance > 0) {
        setTimeToWedding({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  const countdownItems = [
    { value: timeToWedding.days, label: 'DAYS' },
    { value: timeToWedding.hours, label: 'HOURS' },
    { value: timeToWedding.minutes, label: 'MINUTES' },
    { value: timeToWedding.seconds, label: 'SECONDS' }
  ];

  return (
    <div className="glass-card responsive-card-padding mb-6 sm:mb-8 lg:mb-10 text-center animate-fade-up">
      <div className="flex items-center justify-center gap-3 sm:gap-4 mb-2 sm:mb-3">
        <span className="text-xl sm:text-2xl lg:text-3xl animate-glass-float">⏰</span>
        <h1 className="responsive-heading-lg font-dolly font-bold text-wedding-navy tracking-tight">
          Countdown to Forever
        </h1>
      </div>
      <p className="responsive-text-lg text-muted-foreground mb-6 sm:mb-8">
        Every second brings us closer to celebrating with you!
      </p>
      
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5 mb-6">
        {countdownItems.map((item) => (
          <div 
            key={item.label}
            className="glass-secondary p-4 sm:p-6 text-center transition-all duration-300 hover:scale-105 min-h-[120px] sm:min-h-[140px] flex flex-col justify-center"
          >
            <div className="text-4xl sm:text-5xl lg:text-6xl font-bold text-wedding-navy leading-none mb-2 bg-gradient-to-r from-glass-blue to-glass-purple bg-clip-text text-transparent">
              {item.value}
            </div>
            <div className="text-sm sm:text-base text-muted-foreground uppercase tracking-wider font-medium">
              {item.label}
            </div>
          </div>
        ))}
      </div>
      
      <div className="inline-flex items-center gap-2 text-xs sm:text-sm text-glass-green font-semibold uppercase tracking-wider">
        <div className="w-2 h-2 bg-glass-green rounded-full animate-pulse"></div>
        Live
      </div>
    </div>
  );
};

export default CountdownSection;