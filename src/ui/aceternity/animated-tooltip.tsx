import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface TooltipItem {
  id: string;
  name: string;
  designation?: string;
  image: string;
}

interface AnimatedTooltipProps {
  items: TooltipItem[];
  className?: string;
}

export const AnimatedTooltip: React.FC<AnimatedTooltipProps> = ({ 
  items, 
  className 
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div className={cn("flex flex-row items-center justify-center", className)}>
      {items.map((item, idx) => (
        <div
          className="relative group -mr-2"
          key={item.id}
          onMouseEnter={() => setHoveredIndex(idx)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <AnimatePresence>
            {hoveredIndex === idx && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.6 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  transition: {
                    type: "spring",
                    stiffness: 260,
                    damping: 10,
                  },
                }}
                exit={{ opacity: 0, y: 20, scale: 0.6 }}
                className="absolute -top-16 -left-1/2 translate-x-1/2 flex text-xs flex-col items-center justify-center rounded-md bg-black z-50 shadow-xl px-4 py-2"
              >
                <div className="absolute inset-x-10 z-30 w-[20%] -bottom-px bg-gradient-to-r from-transparent via-emerald-500 to-transparent h-px" />
                <div className="absolute left-10 w-[40%] z-30 -bottom-px bg-gradient-to-r from-transparent via-sky-500 to-transparent h-px" />
                <div className="font-bold text-white relative z-30 text-base">
                  {item.name}
                </div>
                {item.designation && (
                  <div className="text-white text-xs">{item.designation}</div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
          <img
            height={40}
            width={40}
            src={item.image}
            alt={item.name}
            className="object-cover !m-0 !p-0 object-top rounded-full h-10 w-10 border-2 group-hover:scale-105 group-hover:z-30 border-white relative transition duration-500"
          />
        </div>
      ))}
    </div>
  );
};

export default AnimatedTooltip;