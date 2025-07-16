import React from 'react';
import { motion } from 'framer-motion';

interface TypingIndicatorProps {
  users: string[];
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({ users }) => {
  const getTypingText = () => {
    if (users.length === 0) return '';
    
    if (users.length === 1) {
      return `${users[0]} is typing...`;
    } else if (users.length === 2) {
      return `${users[0]} and ${users[1]} are typing...`;
    } else {
      return `${users.slice(0, 2).join(', ')} and ${users.length - 2} other${users.length - 2 > 1 ? 's' : ''} are typing...`;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex items-center space-x-3"
    >
      <div className="flex-shrink-0">
        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
          <div className="flex space-x-1">
            <motion.div
              className="w-1 h-1 bg-gray-500 rounded-full"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity, delay: 0 }}
            />
            <motion.div
              className="w-1 h-1 bg-gray-500 rounded-full"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
            />
            <motion.div
              className="w-1 h-1 bg-gray-500 rounded-full"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
            />
          </div>
        </div>
      </div>
      
      <div className="flex-1">
        <div className="bg-gray-100 px-4 py-2 rounded-2xl rounded-bl-md">
          <p className="text-sm text-gray-600 italic">{getTypingText()}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default TypingIndicator;