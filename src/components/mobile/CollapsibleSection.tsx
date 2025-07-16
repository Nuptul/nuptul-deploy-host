import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface CollapsibleSectionProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  variant?: 'primary' | 'secondary';
  className?: string;
}

export const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  icon,
  children,
  defaultOpen = false,
  variant = 'primary',
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const toggleOpen = () => setIsOpen(!isOpen);

  return (
    <div className={`glass-card overflow-hidden transition-all duration-300 ${className}`}>
      {/* Collapsible Header */}
      <button
        onClick={toggleOpen}
        className={`
          w-full p-4 flex items-center justify-between text-left transition-all duration-200
          min-h-[56px] touch-manipulation hover:bg-wedding-navy/5
          ${variant === 'primary' ? 'bg-wedding-navy/5' : 'bg-transparent'}
        `}
      >
        <div className="flex items-center gap-3">
          {icon && (
            <div className="flex-shrink-0 w-5 h-5 text-wedding-navy">
              {icon}
            </div>
          )}
          <h3 className="text-base sm:text-lg font-dolly font-semibold text-wedding-navy">
            {title}
          </h3>
        </div>
        
        <div className={`
          flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full
          transition-all duration-300 bg-wedding-navy/10
          ${isOpen ? 'rotate-180' : 'rotate-0'}
        `}>
          <ChevronDown className="w-4 h-4 text-wedding-navy" />
        </div>
      </button>

      {/* Collapsible Content */}
      <div 
        className={`
          transition-all duration-300 ease-in-out overflow-hidden
          ${isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}
        `}
      >
        <div className="p-4 pt-0 border-t border-wedding-navy/10">
          {children}
        </div>
      </div>
    </div>
  );
};