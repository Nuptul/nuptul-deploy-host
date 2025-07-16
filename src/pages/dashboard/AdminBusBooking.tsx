import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bus } from 'lucide-react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import { Button } from '@/components/ui/button';
import BusBooking from '@/components/admin/BusBooking';

const AdminBusBooking: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <GlassCard className="p-6 mb-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate('/admin')}
                  className="hover:bg-white/20"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Bus className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold">Bus Booking Management</h1>
                    <p className="text-sm text-gray-600">
                      Manage shuttle services and guest transportation
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <BusBooking />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminBusBooking;