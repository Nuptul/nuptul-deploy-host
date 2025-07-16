import React from 'react';
import { MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { SeatingTable, RealTimeStats } from './types';

interface SeatingPlanProps {
  showSeatingPlan: boolean;
  setShowSeatingPlan: (show: boolean) => void;
  seatingTables: SeatingTable[];
  realTimeStats: RealTimeStats;
}

const SeatingPlan: React.FC<SeatingPlanProps> = ({
  showSeatingPlan,
  setShowSeatingPlan,
  seatingTables,
  realTimeStats
}) => {
  return (
    <>
      <Button 
        size="sm" 
        variant="outline"
        onClick={() => setShowSeatingPlan(!showSeatingPlan)}
        className="text-xs"
      >
        <MapPin className="w-3 h-3 mr-1" />
        Seating Plan
      </Button>

      {/* Seating Plan View */}
      {showSeatingPlan && (
        <div className="glass-card p-4 space-y-3">
          <h4 className="text-sm font-medium text-wedding-navy">Seating Plan Overview</h4>
          <div className="grid grid-cols-5 gap-2">
            {seatingTables.slice(0, 15).map((table) => (
              <div 
                key={table.id}
                className={`glass-card p-2 text-center cursor-pointer transition-colors ${
                  table.assigned_guests >= table.capacity ? 'bg-glass-pink' : 
                  table.assigned_guests > table.capacity * 0.8 ? 'bg-glass-blue' : 
                  'bg-glass-green'
                }`}
              >
                <div className="text-xs font-semibold">Table {table.table_number}</div>
                <div className="text-xs">{table.assigned_guests}/{table.capacity}</div>
                {table.special_requirements && (
                  <div className="text-xs text-muted-foreground">
                    {table.special_requirements}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-glass-green rounded"></div>
                <span>Available</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-glass-blue rounded"></div>
                <span>Nearly Full</span>  
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-glass-pink rounded"></div>
                <span>Full</span>
              </div>
            </div>
            <div className="text-muted-foreground">
              Last updated: {realTimeStats.lastUpdated.toLocaleTimeString()}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SeatingPlan;