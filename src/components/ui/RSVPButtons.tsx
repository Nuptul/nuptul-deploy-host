import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface RSVPButtonsProps {
  value: 'attending' | 'not_attending' | 'pending';
  onChange: (value: 'attending' | 'not_attending') => void;
  disabled?: boolean;
  size?: 'default' | 'large';
  className?: string;
}

export const RSVPButtons: React.FC<RSVPButtonsProps> = ({
  value,
  onChange,
  disabled = false,
  size = 'default',
  className
}) => {
  const isLarge = size === 'large';
  
  return (
    <div className={cn("grid grid-cols-2 gap-4", className)}>
      <Button
        type="button"
        variant={value === 'attending' ? 'default' : 'outline'}
        onClick={() => onChange('attending')}
        disabled={disabled}
        className={cn(
          "relative overflow-hidden transition-all duration-300",
          isLarge ? "h-20 flex-col gap-2" : "h-14",
          value === 'attending' 
            ? "bg-green-600 hover:bg-green-700 text-white border-green-600" 
            : "border-green-600 text-green-700 hover:bg-green-50 bg-white/80"
        )}
      >
        <CheckCircle className={cn("transition-transform", isLarge ? "w-6 h-6" : "w-5 h-5 mr-2 inline")} />
        <span className={cn("font-medium", isLarge && "text-center")}>
          Yes, I'll be there!
        </span>
      </Button>
      
      <Button
        type="button"
        variant={value === 'not_attending' ? 'default' : 'outline'}
        onClick={() => onChange('not_attending')}
        disabled={disabled}
        className={cn(
          "relative overflow-hidden transition-all duration-300",
          isLarge ? "h-20 flex-col gap-2" : "h-14",
          value === 'not_attending' 
            ? "bg-red-600 hover:bg-red-700 text-white border-red-600" 
            : "border-red-600 text-red-700 hover:bg-red-50 bg-white/80"
        )}
      >
        <XCircle className={cn("transition-transform", isLarge ? "w-6 h-6" : "w-5 h-5 mr-2 inline")} />
        <span className={cn("font-medium", isLarge && "text-center")}>
          Sorry, can't make it
        </span>
      </Button>
    </div>
  );
};

interface RSVPRadioButtonsProps {
  name: string;
  defaultValue?: 'yes' | 'no';
  className?: string;
}

export const RSVPRadioButtons: React.FC<RSVPRadioButtonsProps> = ({
  name,
  defaultValue = 'yes',
  className
}) => {
  return (
    <div className={cn("flex gap-4", className)}>
      <label className="flex items-center space-x-2 cursor-pointer group">
        <input
          type="radio"
          name={name}
          value="yes"
          defaultChecked={defaultValue === 'yes'}
          className="w-4 h-4 text-green-600 focus:ring-green-500/20 border-gray-300"
        />
        <span className="text-sm font-medium text-green-700 group-hover:text-green-800 transition-colors">
          Yes, I'll be there! 🎉
        </span>
      </label>
      <label className="flex items-center space-x-2 cursor-pointer group">
        <input
          type="radio"
          name={name}
          value="no"
          defaultChecked={defaultValue === 'no'}
          className="w-4 h-4 text-red-600 focus:ring-red-500/20 border-gray-300"
        />
        <span className="text-sm font-medium text-red-700 group-hover:text-red-800 transition-colors">
          Sorry, can't make it
        </span>
      </label>
    </div>
  );
};