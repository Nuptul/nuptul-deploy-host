import React from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { motion } from 'framer-motion';

interface ChartContainerProps {
  children: React.ReactNode;
  title: string;
  className?: string;
  isDarkMode?: boolean;
}

const ChartContainer: React.FC<ChartContainerProps> = ({ children, title, className = '', isDarkMode = false }) => (
  <motion.div
    initial={{ opacity: 0, y: 20, scale: 0.95 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    whileHover={{ 
      y: -8,
      transition: { duration: 0.3, ease: "easeOut" }
    }}
    transition={{ duration: 0.5, ease: "easeOut" }}
    className={`p-6 rounded-2xl backdrop-blur-[40px] border transition-all duration-500 ${className} ${
      isDarkMode 
        ? 'bg-gradient-to-br from-gray-800/80 via-gray-800/70 to-gray-900/60 border-gray-700/50 hover:border-gray-600/60' 
        : 'bg-gradient-to-br from-white/90 via-white/80 to-gray-50/30 border-white/60 hover:border-blue-200/50'
    }`}
    style={{
      backdropFilter: 'blur(40px) saturate(2)',
      WebkitBackdropFilter: 'blur(40px) saturate(2)',
      transform: 'perspective(1000px) rotateX(0deg)',
      transformStyle: 'preserve-3d',
      boxShadow: isDarkMode 
        ? `0 25px 50px -12px rgba(0, 0, 0, 0.5),
           0 12px 24px -8px rgba(0, 0, 0, 0.3),
           inset 0 1px 1px rgba(255, 255, 255, 0.1),
           inset 0 -1px 1px rgba(0, 0, 0, 0.2),
           0 0 0 1px rgba(255, 255, 255, 0.05) inset`
        : `0 20px 40px -12px rgba(31, 38, 135, 0.15),
           0 10px 20px -8px rgba(31, 38, 135, 0.1),
           inset 0 1px 1px rgba(255, 255, 255, 0.9),
           inset 0 -1px 1px rgba(0, 0, 0, 0.05),
           0 0 0 1px rgba(255, 255, 255, 0.8) inset`,
      background: isDarkMode
        ? `linear-gradient(145deg, rgba(31, 41, 55, 0.95) 0%, rgba(17, 24, 39, 0.85) 100%),
           radial-gradient(ellipse at top left, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
           radial-gradient(ellipse at bottom right, rgba(139, 92, 246, 0.1) 0%, transparent 50%)`
        : `linear-gradient(145deg, rgba(255, 255, 255, 0.95) 0%, rgba(249, 250, 251, 0.85) 100%),
           radial-gradient(ellipse at top left, rgba(59, 130, 246, 0.05) 0%, transparent 50%),
           radial-gradient(ellipse at bottom right, rgba(139, 92, 246, 0.05) 0%, transparent 50%)`
    }}
  >
    <div className="relative">
      <h3 
        className={`text-lg font-semibold mb-4 tracking-wide ${
          isDarkMode 
            ? '' 
            : 'text-gray-900'
        }`}
        style={isDarkMode ? { color: '#ffffff !important' } : {}}
      >
        {title}
      </h3>
      <div className={`absolute -top-1 -left-1 w-12 h-12 rounded-full opacity-20 blur-2xl ${
        isDarkMode ? 'bg-blue-400' : 'bg-blue-500'
      }`} />
    </div>
    <div className="relative">
      {children}
    </div>
  </motion.div>
);

interface RSVPPieChartProps {
  data: {
    name: string;
    value: number;
    color: string;
  }[];
  isDarkMode?: boolean;
}

export const RSVPPieChart: React.FC<RSVPPieChartProps> = ({ data, isDarkMode = false }) => {
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className={`backdrop-blur-md p-3 rounded-lg border transition-all duration-200 ${isDarkMode ? 'bg-gray-800/95 border-gray-700/60' : 'bg-white/95 border-white/60'}`}
          style={{
            boxShadow: isDarkMode
              ? '0 8px 16px rgba(0, 0, 0, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.1)'
              : '0 8px 16px rgba(0, 0, 0, 0.1), inset 0 1px 1px rgba(255, 255, 255, 0.9)'
          }}>
          <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{data.name}</p>
          <p className={`text-sm ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>{data.value} guests</p>
        </div>
      );
    }
    return null;
  };

  return (
    <ChartContainer title="RSVP Status Breakdown" isDarkMode={isDarkMode}>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex justify-center gap-4 mt-4">
        {data.map((entry, index) => (
          <motion.div 
            key={index} 
            className="flex items-center gap-2 cursor-pointer"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.05 }}
          >
            <motion.div 
              className="w-3 h-3 rounded-full shadow-sm" 
              style={{ 
                backgroundColor: entry.color,
                boxShadow: `0 2px 4px ${entry.color}40`
              }}
              whileHover={{ scale: 1.2 }}
            />
            <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{entry.name}</span>
          </motion.div>
        ))}
      </div>
    </ChartContainer>
  );
};

interface GuestEngagementChartProps {
  data: {
    date: string;
    guests: number;
    rsvps: number;
  }[];
}

export const GuestEngagementChart: React.FC<GuestEngagementChartProps> = ({ data, isDarkMode = false }) => {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className={`${isDarkMode ? 'bg-gray-800/90 border-gray-700/50' : 'bg-white/90 border-white/50'} backdrop-blur-sm p-3 rounded-lg border shadow-lg`}>
          <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <ChartContainer title="Guest Engagement Over Time" isDarkMode={isDarkMode}>
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorGuests" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0066CC" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#0066CC" stopOpacity={0.1}/>
            </linearGradient>
            <linearGradient id="colorRsvps" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke={isDarkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"} 
            vertical={false}
          />
          <XAxis 
            dataKey="date" 
            stroke={isDarkMode ? "#9CA3AF" : "#7a736b"}
            fontSize={12}
            tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          />
          <YAxis stroke={isDarkMode ? "#9CA3AF" : "#7a736b"} fontSize={12} />
          <Tooltip content={<CustomTooltip />} />
          <Area 
            type="monotone" 
            dataKey="guests" 
            stackId="1" 
            stroke="#0066CC" 
            fill="url(#colorGuests)" 
            strokeWidth={2}
            name="Total Guests"
          />
          <Area 
            type="monotone" 
            dataKey="rsvps" 
            stackId="1" 
            stroke="#10B981" 
            fill="url(#colorRsvps)"
            strokeWidth={2}
            name="RSVPs"
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

interface ActivityBarChartProps {
  data: {
    name: string;
    messages: number;
    photos: number;
    rsvps: number;
  }[];
}

export const ActivityBarChart: React.FC<ActivityBarChartProps> = ({ data, isDarkMode = false }) => {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className={`${isDarkMode ? 'bg-gray-800/90 border-gray-700/50' : 'bg-white/90 border-white/50'} backdrop-blur-sm p-3 rounded-lg border shadow-lg`}>
          <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <ChartContainer title="Daily Activity" isDarkMode={isDarkMode}>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data}>
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke={isDarkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"} 
            vertical={false}
          />
          <XAxis dataKey="name" stroke={isDarkMode ? "#9CA3AF" : "#7a736b"} fontSize={12} />
          <YAxis stroke={isDarkMode ? "#9CA3AF" : "#7a736b"} fontSize={12} />
          <Tooltip content={<CustomTooltip />} />
          <Bar 
            dataKey="messages" 
            fill="#8B5CF6" 
            name="Messages" 
            radius={[8, 8, 0, 0]}
            animationDuration={800}
          />
          <Bar 
            dataKey="photos" 
            fill="#F59E0B" 
            name="Photos" 
            radius={[8, 8, 0, 0]}
            animationDuration={1000}
          />
          <Bar 
            dataKey="rsvps" 
            fill="#10B981" 
            name="RSVPs" 
            radius={[8, 8, 0, 0]}
            animationDuration={1200}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

interface EventTimelineChartProps {
  events: {
    id: string;
    title: string;
    date: string;
    status: 'completed' | 'upcoming' | 'in-progress';
  }[];
  isDarkMode?: boolean;
}

export const EventTimelineChart: React.FC<EventTimelineChartProps> = ({ events, isDarkMode = false }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#10B981';
      case 'in-progress': return '#F59E0B';
      case 'upcoming': return '#6B7280';
      default: return '#6B7280';
    }
  };

  return (
    <ChartContainer title="Wedding Timeline" className="col-span-full" isDarkMode={isDarkMode}>
      <div className="space-y-4">
        {events.map((event, index) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`flex items-center gap-4 p-3 rounded-lg backdrop-blur-sm ${
              isDarkMode ? 'bg-gray-700/20' : 'bg-white/20'
            }`}
          >
            <div 
              className="w-4 h-4 rounded-full flex-shrink-0"
              style={{ backgroundColor: getStatusColor(event.status) }}
            />
            <div className="flex-1">
              <h4 className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{event.title}</h4>
              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {new Date(event.date).toLocaleDateString('en-US', { 
                  month: 'long', 
                  day: 'numeric',
                  year: 'numeric'
                })}
              </p>
            </div>
            <div className={`text-xs px-2 py-1 rounded-full capitalize ${
              isDarkMode ? 'bg-gray-700/30 text-gray-200' : 'bg-white/30 text-gray-900'
            }`}>
              {event.status.replace('-', ' ')}
            </div>
          </motion.div>
        ))}
      </div>
    </ChartContainer>
  );
};
