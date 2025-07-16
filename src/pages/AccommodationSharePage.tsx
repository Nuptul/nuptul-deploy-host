import React from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import AccommodationShare from '@/components/guest/AccommodationShare';
import { Home } from 'lucide-react';

const AccommodationSharePage: React.FC = () => {
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
                <Home className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Accommodation Sharing</h1>
                <p className="text-sm text-gray-600">
                  Find or share accommodation with other wedding guests
                </p>
              </div>
            </div>
          </GlassCard>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <AccommodationShare />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default AccommodationSharePage;