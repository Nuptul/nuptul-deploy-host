import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Heart, Calendar, Clock, MapPin } from 'lucide-react';
import { nuptulColors, glassEffects } from '@/styles/nuptul-design-system';
interface WeddingCeremonyClockProps {
  targetDate: string;
  className?: string;
}

interface TimeState {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
}

interface ClockAngles {
  hour: number;
  minute: number;
  second: number;
}

const WeddingCeremonyClock: React.FC<WeddingCeremonyClockProps> = ({
  targetDate,
  className
}) => {
  const [timeState, setTimeState] = useState<TimeState | null>(null);
  const [clockAngles, setClockAngles] = useState<ClockAngles>({ hour: 0, minute: 0, second: 0 });
  const [currentTime, setCurrentTime] = useState<string>('');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!targetDate) return;

    const updateCountdown = () => {
      const now = new Date().getTime();
      const target = new Date(targetDate).getTime();
      const difference = target - now;

      if (difference > 0) {
        setTimeState({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
          isPast: false,
        });
      } else {
        setTimeState({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true });
      }
    };

    const updateClock = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const seconds = now.getSeconds();
      const milliseconds = now.getMilliseconds();

      // Calculate smooth angles
      const secondAngle = (seconds * 6) + (milliseconds * 0.006);
      const minuteAngle = (minutes * 6) + (seconds * 0.1);
      const hourAngle = ((hours % 12) * 30) + (minutes * 0.5);

      setClockAngles({
        hour: hourAngle,
        minute: minuteAngle,
        second: secondAngle
      });

      // Update digital time
      const digitalHours = hours.toString().padStart(2, '0');
      const digitalMinutes = minutes.toString().padStart(2, '0');
      const digitalSeconds = seconds.toString().padStart(2, '0');
      setCurrentTime(`${digitalHours}:${digitalMinutes}:${digitalSeconds}`);
    };

    updateCountdown();
    updateClock();
    setIsVisible(true);

    const countdownInterval = setInterval(updateCountdown, 1000);
    const clockInterval = setInterval(updateClock, 50);

    return () => {
      clearInterval(countdownInterval);
      clearInterval(clockInterval);
    };
  }, [targetDate]);



  // Background orbs animation
  const BackgroundOrbs = () => (
    <div className="absolute inset-0 overflow-hidden">
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full filter blur-3xl opacity-20"
          style={{
            width: `${300 + i * 50}px`,
            height: `${300 + i * 50}px`,
            background: i === 0 
              ? 'radial-gradient(circle, hsl(var(--wedding-navy)) 0%, transparent 70%)'
              : i === 1
              ? 'radial-gradient(circle, hsl(var(--wedding-gold)) 0%, transparent 70%)'
              : 'radial-gradient(circle, hsl(var(--wedding-cream)) 0%, transparent 70%)',
            top: i === 0 ? '-150px' : i === 1 ? 'auto' : '50%',
            bottom: i === 1 ? '-150px' : 'auto',
            left: i === 0 ? '-150px' : i === 1 ? 'auto' : '50%',
            right: i === 1 ? '-150px' : 'auto',
            transform: i === 2 ? 'translate(-50%, -50%)' : 'none'
          }}
          animate={{
            x: [0, 50, -30, -50, 0],
            y: [0, -50, 30, -30, 0],
            scale: [1, 1.1, 0.9, 1.05, 1]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            delay: i * 5,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );

  // Hour markers for the clock
  const HourMarkers = () => (
    <>
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          className="absolute w-full h-full flex justify-center"
          style={{ transform: `rotate(${i * 30}deg)` }}
        >
          <div 
            className={cn(
              "rounded-full bg-gradient-to-b from-wedding-navy/60 to-wedding-navy/30 shadow-sm",
              i % 3 === 0 ? "w-1.5 h-8" : "w-1 h-5"
            )}
          />
        </div>
      ))}
    </>
  );

  // Clock hands
  const ClockHands = () => (
    <>
      {/* Hour hand */}
      <motion.div
        className="absolute w-2 bg-gradient-to-t from-wedding-navy to-wedding-navy/70 rounded-full shadow-lg"
        style={{
          height: '80px',
          bottom: '50%',
          left: '50%',
          marginLeft: '-4px',
          transformOrigin: 'bottom center',
          transform: `rotate(${clockAngles.hour}deg)`
        }}
      />
      
      {/* Minute hand */}
      <motion.div
        className="absolute w-1.5 bg-gradient-to-t from-wedding-navy to-wedding-navy/80 rounded-full shadow-lg"
        style={{
          height: '110px',
          bottom: '50%',
          left: '50%',
          marginLeft: '-3px',
          transformOrigin: 'bottom center',
          transform: `rotate(${clockAngles.minute}deg)`
        }}
      />
      
      {/* Second hand */}
      <motion.div
        className="absolute w-0.5 bg-gradient-to-t from-wedding-gold to-wedding-gold/70 rounded-full shadow-lg"
        style={{
          height: '120px',
          bottom: '50%',
          left: '50%',
          marginLeft: '-1px',
          transformOrigin: 'bottom center',
          transform: `rotate(${clockAngles.second}deg)`,
          filter: 'drop-shadow(0 0 10px hsl(var(--wedding-gold) / 0.5))'
        }}
      />
      
      {/* Center dot */}
      <div className="absolute w-4 h-4 bg-gradient-to-br from-wedding-navy to-wedding-navy/80 rounded-full shadow-lg border border-wedding-gold/20" />
    </>
  );

  if (timeState === null) {
    return (
      <div className={cn("flex justify-center items-center p-8", className)}>
        <div className="animate-pulse glass-card p-8 rounded-3xl">
          <div className="w-80 h-80 bg-wedding-navy/10 rounded-full mx-auto" />
        </div>
      </div>
    );
  }

  if (timeState.isPast) {
    return (
      <motion.div 
        className={cn("relative glass-card rounded-3xl overflow-hidden p-8", className)}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
      >
        <BackgroundOrbs />
        <div className="relative z-10 text-center space-y-6">
          <motion.div
            className="text-4xl font-bold text-wedding-navy mb-4"
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            💍 We're Married! 💍
          </motion.div>
          <p className="text-wedding-navy/70">Thank you for celebrating with us!</p>
          
          <div className="flex justify-center gap-2">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  y: [0, -10, 0],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: "easeInOut"
                }}
              >
                <Heart className="w-5 h-5 text-wedding-gold fill-current" />
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          className={cn("relative space-y-8", className)}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -30 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
        >
          {/* Main container */}
          <div className={cn(
            "relative rounded-3xl overflow-hidden p-8",
            "bg-white/10 dark:bg-black/20",
            "backdrop-blur-2xl border border-white/10"
          )}>
            <BackgroundOrbs />
            
            <div className="relative z-10 space-y-8">
              {/* Ceremony info */}
              <motion.div 
                className="text-center space-y-2"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h2
                  className="text-3xl sm:text-4xl font-semibold mb-4"
                  style={{
                    fontFamily: '"Great Vibes", cursive',
                    fontWeight: '400',
                    letterSpacing: '0.02em',
                    textRendering: 'optimizeLegibility',
                    WebkitFontSmoothing: 'antialiased',
                    MozOsxFontSmoothing: 'grayscale',
                    color: '#C9A961',
                    textShadow: `
                      2px 2px 6px rgba(0, 0, 0, 0.8),
                      -1px -1px 3px rgba(201, 169, 97, 0.4),
                      0 0 12px rgba(201, 169, 97, 0.3)
                    `,
                    filter: 'drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.5))',
                    position: 'relative',
                    lineHeight: '1.2'
                  }}
                >
                  Until We Say "I Do"
                </h2>
                <div
                  className="flex items-center justify-center gap-2"
                  style={{ color: nuptulColors.ring[600] }}
                >
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(targetDate).toLocaleDateString('en-AU', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</span>
                </div>
              </motion.div>

              {/* Clean Standard Countdown */}
              <div className="flex justify-center">
                <motion.div
                  className="w-full max-w-4xl"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                >
                  {/* Countdown Grid */}
                  <div className="grid grid-cols-3 gap-6 sm:gap-8 md:gap-12">
                    {/* Heart shadow */}
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-48 h-16 sm:w-64 sm:h-20"
                      style={{
                        background: 'radial-gradient(ellipse at center, rgba(0, 0, 0, 0.3) 0%, transparent 70%)',
                        filter: 'blur(20px)',
                      }}
                    />
                    
                    {/* Glass heart */}
                    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
                      <svg width="180" height="160" viewBox="0 0 180 160" className="w-44 h-40 sm:w-52 sm:h-48">
                        <defs>
                          <linearGradient id="heartGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor={nuptulColors.heart[400]} />
                            <stop offset="50%" stopColor={nuptulColors.heart[500]} />
                            <stop offset="100%" stopColor={nuptulColors.heart[600]} />
                          </linearGradient>
                          <radialGradient id="heartHighlight" cx="30%" cy="30%">
                            <stop offset="0%" stopColor="rgba(255, 255, 255, 0.5)" />
                            <stop offset="50%" stopColor="rgba(255, 255, 255, 0.2)" />
                            <stop offset="100%" stopColor="rgba(255, 255, 255, 0)" />
                          </radialGradient>
                          <filter id="heartShadow">
                            <feGaussianBlur in="SourceAlpha" stdDeviation="4"/>
                            <feOffset dx="0" dy="4" result="offsetblur"/>
                            <feFlood floodColor="rgba(0,0,0,0.3)"/>
                            <feComposite in2="offsetblur" operator="in"/>
                            <feMerge>
                              <feMergeNode/>
                              <feMergeNode in="SourceGraphic"/>
                            </feMerge>
                          </filter>
                        </defs>
                        <path
                          d="M90,145 C90,145 10,85 10,45 C10,20 25,5 45,5 C65,5 80,15 90,30 C100,15 115,5 135,5 C155,5 170,20 170,45 C170,85 90,145 90,145 Z"
                          fill="url(#heartGradient)"
                          filter="url(#heartShadow)"
                          style={{
                            fillOpacity: 0.95,
                          }}
                        />
                        <path
                          d="M90,145 C90,145 10,85 10,45 C10,20 25,5 45,5 C65,5 80,15 90,30 C100,15 115,5 135,5 C155,5 170,20 170,45 C170,85 90,145 90,145 Z"
                          fill="url(#heartHighlight)"
                          style={{
                            fillOpacity: 0.3,
                          }}
                        />
                      </svg>
                    </div>
                    
                    {/* Two rings on top of heart - Days and Hours */}
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 flex gap-4">
                      {[
                        { label: 'DAYS', value: timeState.days },
                        { label: 'HOURS', value: timeState.hours }
                      ].map((item, index) => (
                        <motion.div
                          key={item.label}
                          className="relative"
                          initial={{ opacity: 0, y: -20, scale: 0.8 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ delay: 0.7 + index * 0.1, type: "spring" }}
                          whileHover={{ scale: 1.05 }}
                        >
                          <div className="relative w-20 h-20 sm:w-24 sm:h-24">
                            {/* Ring shadow */}
                            <div className="absolute inset-0 rounded-full"
                              style={{
                                background: 'radial-gradient(circle at 50% 60%, rgba(0, 0, 0, 0.2) 40%, transparent 70%)',
                                filter: 'blur(4px)',
                                transform: 'translateY(2px)',
                              }}
                            />
                            
                            {/* Ring body */}
                            <div className="absolute inset-0 rounded-full"
                              style={{
                                background: 'linear-gradient(135deg, #C9A961 0%, #B8985F 10%, #A78B56 20%, #9B7F4E 30%, #8F7347 40%, #85693F 50%, #7B5F37 60%, #8F7347 70%, #A78B56 80%, #B8985F 90%, #C9A961 100%)',
                                boxShadow: '0 8px 16px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(201, 169, 97, 0.5), inset 0 -1px 0 rgba(74, 60, 40, 0.5), inset 2px 2px 3px rgba(255, 255, 255, 0.1), inset -2px -2px 3px rgba(0, 0, 0, 0.2)',
                              }}
                            >
                              <div className="absolute inset-x-0 top-0 h-1/2 rounded-t-full"
                                style={{
                                  background: 'radial-gradient(ellipse at center top, rgba(255, 255, 255, 0.3) 0%, transparent 60%)',
                                }}
                              />
                            </div>
                            
                            {/* Inner circle */}
                            <div className="absolute inset-4 rounded-full"
                              style={{
                                background: '#f7fafc',
                                boxShadow: 'inset 0 2px 6px rgba(0, 0, 0, 0.1)',
                              }}
                            >
                              <div className="h-full flex flex-col items-center justify-center">
                                <span className="block text-2xl sm:text-3xl font-bold leading-none"
                                  style={{
                                    fontFamily: '"Montserrat", sans-serif',
                                    color: '#4A3C28',
                                    textShadow: '0 1px 0 rgba(218, 184, 133, 0.5), 0 -1px 0 rgba(0, 0, 0, 0.5)',
                                  }}
                                >
                                  {item.value.toString().padStart(2, '0')}
                                </span>
                                <span className="text-[9px] sm:text-[10px] font-semibold mt-0.5"
                                  style={{
                                    color: '#4A3C28',
                                    fontFamily: '"Montserrat", sans-serif',
                                    letterSpacing: '0.8px',
                                    textShadow: '0 1px 0 rgba(218, 184, 133, 0.3)'
                                  }}
                                >
                                  {item.label}
                                </span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                    
                    {/* Minutes display in the heart center */}
                    <motion.div 
                      className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2"
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.9, type: "spring" }}
                    >
                      <div className="text-center">
                        <span className="block text-4xl sm:text-5xl font-light text-white"
                          style={{
                            fontFamily: '"Helvetica Neue", Arial, sans-serif',
                            textShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                          }}
                        >
                          {timeState.minutes.toString().padStart(2, '0')}
                        </span>
                        <span className="block text-xs sm:text-sm font-normal text-white/80 mt-1"
                          style={{
                            fontFamily: '"Helvetica Neue", Arial, sans-serif',
                            letterSpacing: '1px',
                            textShadow: '0 1px 4px rgba(0, 0, 0, 0.3)',
                          }}
                        >
                          MINUTES
                        </span>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              </div>

              {/* Analog clock - Luxury Nuptul design */}
              <motion.div 
                className="flex justify-center mt-8"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8, type: "spring", stiffness: 200, damping: 20 }}
              >
                <div className="relative w-64 h-64">
                  {/* Subtle outer glow */}
                  <div className="absolute inset-0 rounded-full"
                    style={{
                      background: 'radial-gradient(circle, rgba(220, 38, 38, 0.1) 0%, transparent 70%)',
                      filter: 'blur(30px)',
                    }}
                  />
                  
                  {/* Clock base with luxury finish */}
                  <div className="absolute inset-2 rounded-full"
                    style={{
                      background: 'linear-gradient(135deg, #0f0f1e 0%, #1a1a2e 50%, #16213e 100%)',
                      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.1), inset 0 -2px 4px rgba(0, 0, 0, 0.3)',
                    }}
                  >
                    {/* Glossy overlay */}
                    <div className="absolute inset-0 rounded-full"
                      style={{
                        background: 'radial-gradient(ellipse at top, rgba(255, 255, 255, 0.15) 0%, transparent 50%)',
                      }}
                    />
                    
                    {/* Clock face */}
                    <div className="absolute inset-4 rounded-full flex items-center justify-center">
                      {/* Refined hour markers */}
                      {[...Array(12)].map((_, i) => (
                        <div
                          key={i}
                          className="absolute w-full h-full flex justify-center"
                          style={{ transform: `rotate(${i * 30}deg)` }}
                        >
                          <div 
                            style={{
                              width: i % 3 === 0 ? '2px' : '1px',
                              height: i % 3 === 0 ? '12px' : '6px',
                              backgroundColor: 'rgba(255, 255, 255, 0.6)',
                              borderRadius: '1px',
                              boxShadow: '0 0 2px rgba(255, 255, 255, 0.3)'
                            }}
                          />
                        </div>
                      ))}
                      
                      {/* Digital time display - minimalist luxury */}
                      <div className="absolute top-20 px-3 py-1 rounded-full"
                        style={{
                          background: 'rgba(0, 0, 0, 0.5)',
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                        }}
                      >
                        <span className="text-xs font-light text-white/80" style={{ fontFamily: '"Helvetica Neue", Arial, sans-serif' }}>
                          {currentTime}
                        </span>
                      </div>
                      
                      {/* Premium clock hands */}
                      {/* Hour hand */}
                      <div
                        className="absolute rounded-full"
                        style={{
                          width: '4px',
                          height: '60px',
                          bottom: '50%',
                          left: '50%',
                          marginLeft: '-2px',
                          transformOrigin: 'bottom center',
                          transform: `rotate(${clockAngles.hour}deg)`,
                          background: 'linear-gradient(to top, #ffffff 0%, #e0e0e0 100%)',
                          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
                        }}
                      />
                      
                      {/* Minute hand */}
                      <div
                        className="absolute rounded-full"
                        style={{
                          width: '3px',
                          height: '80px',
                          bottom: '50%',
                          left: '50%',
                          marginLeft: '-1.5px',
                          transformOrigin: 'bottom center',
                          transform: `rotate(${clockAngles.minute}deg)`,
                          background: 'linear-gradient(to top, #ffffff 0%, #e0e0e0 100%)',
                          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
                        }}
                      />
                      
                      {/* Second hand - elegant red accent */}
                      <div
                        className="absolute"
                        style={{
                          width: '1px',
                          height: '90px',
                          bottom: '50%',
                          left: '50%',
                          marginLeft: '-0.5px',
                          transformOrigin: 'bottom center',
                          transform: `rotate(${clockAngles.second}deg)`,
                          background: '#dc2626',
                          boxShadow: '0 0 4px rgba(220, 38, 38, 0.5)'
                        }}
                      />
                      
                      {/* Center cap - glossy finish */}
                      <div className="absolute w-4 h-4 rounded-full"
                        style={{
                          background: `radial-gradient(circle at 30% 30%, ${nuptulColors.heart[500]}, ${nuptulColors.heart[700]})`,
                          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.4), inset 0 1px 2px rgba(255, 255, 255, 0.3)',
                        }}
                      />
                    </div>
                    
                    {/* Premium edge detail */}
                    <div className="absolute inset-2 rounded-full"
                      style={{
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        boxShadow: 'inset 0 0 20px rgba(0, 0, 0, 0.3)',
                      }}
                    />
                  </div>
                </div>
              </motion.div>
            </div>
          </div>


        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WeddingCeremonyClock;