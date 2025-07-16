import React from 'react';
import GlassCard from '@/components/GlassCard';
import { BarChart3 } from 'lucide-react';

interface AdminStats {
  totalUsers: number;
  totalRSVPs: number;
  pendingPhotos: number;
  totalMessages: number;
  approvedPhotos: number;
  activeUsers: number;
}

interface AdminOverviewProps {
  stats: AdminStats;
}

const AdminOverview: React.FC<AdminOverviewProps> = ({ stats }) => {
  return (
    <GlassCard className="p-6">
      <h2 className="text-lg font-semibold mb-4 text-wedding-navy flex items-center gap-2">
        <BarChart3 className="w-5 h-5" />
        Recent Activity
      </h2>
      <div className="space-y-3">
        <div className="flex items-center gap-3 p-3 rounded-glass bg-secondary/30">
          <div className="w-2 h-2 bg-glass-green rounded-full" />
          <div className="flex-1">
            <p className="text-sm font-medium">{stats.totalUsers} users registered</p>
            <p className="text-xs text-muted-foreground">Total platform users</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 rounded-glass bg-secondary/30">
          <div className="w-2 h-2 bg-glass-blue rounded-full" />
          <div className="flex-1">
            <p className="text-sm font-medium">{stats.pendingPhotos} photos pending approval</p>
            <p className="text-xs text-muted-foreground">Require moderation</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 rounded-glass bg-secondary/30">
          <div className="w-2 h-2 bg-glass-purple rounded-full" />
          <div className="flex-1">
            <p className="text-sm font-medium">{stats.totalRSVPs} total RSVPs received</p>
            <p className="text-xs text-muted-foreground">Guest confirmations</p>
          </div>
        </div>
      </div>
    </GlassCard>
  );
};

export default AdminOverview;