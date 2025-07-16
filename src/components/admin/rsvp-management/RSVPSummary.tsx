import React from 'react';
import { Clock } from 'lucide-react';
import type { RSVPStats, RSVPEvent } from './types';

interface RSVPSummaryProps {
  stats: RSVPStats;
  events: RSVPEvent[];
}

const RSVPSummary: React.FC<RSVPSummaryProps> = ({ stats, events }) => {
  return (
    <div className="glass-card p-3 space-y-2">
      <h4 className="text-sm font-medium text-wedding-navy">Live Summary</h4>
      <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
        <div className="space-y-1">
          <div>Total Expected: {stats.totalGuests} guests</div>
          <div>Response Rate: {stats.responseRate}%</div>
          <div>Venue Capacity: {stats.capacityUsed}% used</div>
        </div>
        <div className="space-y-1">
          <div>Special Dietary: {stats.dietaryRestrictions}</div>
          <div>Need Accommodation: {stats.needAccommodation}</div>
          <div>Plus Ones: {stats.plusOnes}</div>
        </div>
      </div>
      
      {events.some(event => new Date(event.rsvp_deadline || '') < new Date()) && (
        <div className="flex items-center gap-2 text-xs text-glass-pink mt-2">
          <Clock className="w-3 h-3" />
          Some RSVP deadlines have passed
        </div>
      )}
    </div>
  );
};

export default RSVPSummary;