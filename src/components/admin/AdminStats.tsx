import React from 'react';
import GlassCard from '@/components/GlassCard';
import { Users, Calendar, Clock, Check, MessageSquare, Activity, TrendingUp } from 'lucide-react';

interface AdminStats {
  totalUsers: number;
  totalRSVPs: number;
  pendingPhotos: number;
  totalMessages: number;
  approvedPhotos: number;
  activeUsers: number;
}

interface AdminStatsProps {
  stats: AdminStats;
}

const AdminStats: React.FC<AdminStatsProps> = ({ stats }) => {
  const statsData = [
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-glass-blue' },
    { label: 'Total RSVPs', value: stats.totalRSVPs, icon: Calendar, color: 'text-glass-green' },
    { label: 'Pending Photos', value: stats.pendingPhotos, icon: Clock, color: 'text-glass-pink' },
    { label: 'Approved Photos', value: stats.approvedPhotos, icon: Check, color: 'text-glass-purple' },
    { label: 'Messages', value: stats.totalMessages, icon: MessageSquare, color: 'text-glass-blue' },
    { label: 'Active Users', value: stats.activeUsers, icon: Activity, color: 'text-glass-green' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
      {statsData.map((stat, index) => (
        <GlassCard 
          key={stat.label}
          className="p-4 animate-fade-up" 
          style={{ animationDelay: `${0.1 * (index + 1)}s` }}
        >
          <div className="flex items-center justify-between mb-2">
            <stat.icon className={`w-5 h-5 ${stat.color}`} />
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-light text-wedding-navy mb-1">
            {stat.value}
          </div>
          <div className="text-sm text-muted-foreground">
            {stat.label}
          </div>
        </GlassCard>
      ))}
    </div>
  );
};

export default AdminStats;