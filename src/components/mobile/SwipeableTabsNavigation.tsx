import React, { useState, useRef, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface SwipeableTabsProps {
  tabs: Array<{ id: string; label: string; component: React.ReactNode }>;
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export const SwipeableTabsNavigation: React.FC<SwipeableTabsProps> = ({
  tabs,
  activeTab,
  onTabChange
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const activeIndex = tabs.findIndex(tab => tab.id === activeTab);

  // Touch gesture handlers for tab switching
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    e.preventDefault();
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    
    const endX = e.changedTouches[0].clientX;
    const deltaX = startX - endX;
    const threshold = 50; // Minimum swipe distance

    if (Math.abs(deltaX) > threshold) {
      if (deltaX > 0 && activeIndex < tabs.length - 1) {
        // Swipe left - next tab
        onTabChange(tabs[activeIndex + 1].id);
      } else if (deltaX < 0 && activeIndex > 0) {
        // Swipe right - previous tab
        onTabChange(tabs[activeIndex - 1].id);
      }
    }
  };

  // Scroll tab navigation into view
  useEffect(() => {
    if (containerRef.current) {
      const activeButton = containerRef.current.querySelector(`[data-tab="${activeTab}"]`) as HTMLElement;
      if (activeButton) {
        activeButton.scrollIntoView({ behavior: 'smooth', inline: 'center' });
      }
    }
  }, [activeTab]);

  return (
    <div className="flex flex-col h-full">
      {/* Enhanced Mobile Tab Navigation */}
      <div className="flex-shrink-0 px-2 sm:px-4 pt-3 pb-2">
        <div className="relative">
          {/* Scroll indicators */}
          {activeIndex > 0 && (
            <button
              onClick={() => onTabChange(tabs[activeIndex - 1].id)}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm rounded-full p-1 shadow-lg"
            >
              <ChevronLeft className="w-4 h-4 text-wedding-navy" />
            </button>
          )}
          
          {activeIndex < tabs.length - 1 && (
            <button
              onClick={() => onTabChange(tabs[activeIndex + 1].id)}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm rounded-full p-1 shadow-lg"
            >
              <ChevronRight className="w-4 h-4 text-wedding-navy" />
            </button>
          )}

          {/* Scrollable tabs container */}
          <div 
            ref={containerRef}
            className="overflow-x-auto scrollbar-hide"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            <div className="flex gap-1 sm:gap-2 min-w-max pb-2 px-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  data-tab={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`
                    px-4 sm:px-5 py-3 text-xs sm:text-sm font-medium rounded-xl transition-all duration-300 
                    whitespace-nowrap flex-shrink-0 min-w-[85px] sm:min-w-[95px] min-h-[44px]
                    relative overflow-hidden touch-manipulation
                    ${activeTab === tab.id
                      ? 'bg-wedding-navy text-white shadow-lg scale-105 font-dolly'
                      : 'text-wedding-navy hover:bg-wedding-navy/10 glass-secondary font-dolly hover:scale-102'
                    }
                  `}
                >
                  {/* Glass effect for active tab */}
                  {activeTab === tab.id && (
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-30" />
                  )}
                  <span className="relative z-10">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Swipeable Content Area */}
      <div 
        ref={contentRef}
        className="flex-1 overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="h-full overflow-y-auto px-2 sm:px-4 pb-4" style={{ maxHeight: 'calc(80vh - 120px)' }}>
          <div className="space-y-4">
            {tabs.find(tab => tab.id === activeTab)?.component}
          </div>
        </div>
      </div>

      {/* Swipe indicator */}
      <div className="flex justify-center py-2">
        <div className="flex gap-1">
          {tabs.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === activeIndex 
                  ? 'bg-wedding-navy w-6' 
                  : 'bg-wedding-navy/30'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};