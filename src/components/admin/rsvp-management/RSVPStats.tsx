import React from 'react';
import { Target, CheckCircle, Users, MapPin, Utensils, Clock } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import type { RSVPStats } from './types';

interface RSVPStatsProps {
  stats: RSVPStats;
}

const RSVPStatsComponent: React.FC<RSVPStatsProps> = ({ stats }) => {
  return (
    <div className="space-y-4">
      {/* Header Section - Total Guests / Confirmed / Pending / Events */}
      <div className="glass-card p-4 bg-gradient-to-r from-wedding-gold/10 to-wedding-navy/10 border border-wedding-gold/20">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-wedding-navy flex items-center gap-2">
            <Users className="w-5 h-5" />
            RSVP Management Overview
          </h3>
          <div className="text-xs text-muted-foreground">
            Response Rate: {stats.responseRate}%
          </div>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="neu-card p-4 text-center hover:shadow-lg transition-shadow cursor-pointer group">
            <Users className="w-6 h-6 mx-auto text-glass-purple mb-2" />
            <div className="text-xl font-bold text-wedding-navy group-hover:text-wedding-gold transition-colors">
              {stats.totalGuests}
            </div>
            <div className="text-sm text-muted-foreground">Total Guests</div>
            <div className="text-xs text-glass-purple mt-1">
              {stats.registeredUsers || 0} Registered + {stats.unregisteredGuests || 0} RSVPs
            </div>
          </div>
          
          <div className="neu-card p-4 text-center hover:shadow-lg transition-shadow cursor-pointer group">
            <CheckCircle className="w-6 h-6 mx-auto text-glass-green mb-2" />
            <div className="text-xl font-bold text-wedding-navy group-hover:text-glass-green transition-colors">
              {stats.attending}
            </div>
            <div className="text-sm text-muted-foreground">Confirmed</div>
            <div className="text-xs text-glass-green mt-1">Attending</div>
          </div>
          
          <div className="neu-card p-4 text-center hover:shadow-lg transition-shadow cursor-pointer group">
            <Clock className="w-6 h-6 mx-auto text-glass-pink mb-2" />
            <div className="text-xl font-bold text-wedding-navy group-hover:text-glass-pink transition-colors">
              {stats.pending}
            </div>
            <div className="text-sm text-muted-foreground">Pending</div>
            <div className="text-xs text-glass-pink mt-1">Need Response</div>
          </div>
          
          <div className="neu-card p-4 text-center hover:shadow-lg transition-shadow cursor-pointer group">
            <Target className="w-6 h-6 mx-auto text-glass-blue mb-2" />
            <div className="text-xl font-bold text-wedding-navy group-hover:text-glass-blue transition-colors">
              {stats.total}
            </div>
            <div className="text-sm text-muted-foreground">Total RSVPs</div>
            <div className="text-xs text-glass-blue mt-1">All Events</div>
          </div>
        </div>
      </div>

      {/* Secondary Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="glass-card p-3 text-center hover:scale-105 transition-transform">
          <div className="flex items-center justify-center gap-1 mb-2">
            <MapPin className="w-4 h-4 text-glass-pink" />
            <span className="text-xs text-muted-foreground">Venue Capacity</span>
          </div>
          <div className="text-lg font-semibold text-wedding-navy">{stats.capacityUsed}%</div>
          <Progress value={stats.capacityUsed} className="h-2 mt-2" />
        </div>
        
        <div className="glass-card p-3 text-center hover:scale-105 transition-transform">
          <Utensils className="w-4 h-4 mx-auto text-glass-green mb-2" />
          <div className="text-lg font-semibold text-wedding-navy">{stats.dietaryRestrictions}</div>
          <div className="text-xs text-muted-foreground">Dietary Needs</div>
        </div>
        
        <div className="glass-card p-3 text-center hover:scale-105 transition-transform">
          <Users className="w-4 h-4 mx-auto text-glass-blue mb-2" />
          <div className="text-lg font-semibold text-wedding-navy">{stats.plusOnes}</div>
          <div className="text-xs text-muted-foreground">Plus Ones</div>
        </div>
        
        <div className="glass-card p-3 text-center hover:scale-105 transition-transform">
          <MapPin className="w-4 h-4 mx-auto text-glass-purple mb-2" />
          <div className="text-lg font-semibold text-wedding-navy">{stats.needAccommodation}</div>
          <div className="text-xs text-muted-foreground">Need Stay</div>
        </div>
      </div>
    </div>
  );
};

export default RSVPStatsComponent;