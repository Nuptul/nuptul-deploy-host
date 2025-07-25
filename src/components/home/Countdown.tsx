import React from 'react';
import WeddingCeremonyClock from '@/components/ui/wedding-ceremony-clock';

interface CountdownProps {
  targetDate: string;
  className?: string;
}

const Countdown: React.FC<CountdownProps> = ({
  targetDate,
  className
}) => {
  return (
    <WeddingCeremonyClock
      targetDate={targetDate}
      className={className}
    />
  );
};

export default Countdown;
