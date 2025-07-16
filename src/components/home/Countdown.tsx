import React from 'react';
import WeddingCeremonyClock from '@/components/ui/wedding-ceremony-clock';

interface CountdownProps {
  targetDate: string;
  className?: string;
  onRSVPClick?: () => void;
}

const Countdown: React.FC<CountdownProps> = ({ 
  targetDate, 
  className,
  onRSVPClick
}) => {
  return (
    <WeddingCeremonyClock 
      targetDate={targetDate}
      className={className}
      onRSVPClick={onRSVPClick}
    />
  );
};

export default Countdown;
