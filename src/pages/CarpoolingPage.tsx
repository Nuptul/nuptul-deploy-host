import React from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import Carpooling from '@/components/guest/Carpooling';
import { Car } from 'lucide-react';

const CarpoolingPage: React.FC = () => {
  return (
    <div className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <GlassCard className="p-6 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Car className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Carpool & Ride Sharing</h1>
                <p className="text-sm text-gray-600">
                  Connect with other guests to share rides to the wedding
                </p>
              </div>
            </div>
          </GlassCard>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Carpooling />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default CarpoolingPage;