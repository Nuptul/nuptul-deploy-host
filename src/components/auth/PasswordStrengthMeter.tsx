import React from 'react';
import { getPasswordStrength } from '@/lib/auth-validation';
import { Progress } from '@/components/ui/progress';

interface PasswordStrengthMeterProps {
  password: string;
}

export const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({ password }) => {
  const { score, feedback, color } = getPasswordStrength(password);
  const percentage = (score / 6) * 100;

  if (!password) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Password strength:</span>
        <span style={{ color }} className="font-medium">
          {feedback}
        </span>
      </div>
      <Progress 
        value={percentage} 
        className="h-2"
        style={{
          '--progress-background': color
        } as React.CSSProperties}
      />
    </div>
  );
};