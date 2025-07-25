import React from 'react';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';

interface HashtagChipProps {
  tag: string;
  onRemove?: () => void;
  onClick?: () => void;
  removable?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'trending' | 'muted';
  count?: number;
}

const HashtagChip: React.FC<HashtagChipProps> = ({
  tag,
  onRemove,
  onClick,
  removable = false,
  size = 'md',
  variant = 'default',
  count
}) => {
  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base'
  };

  const variantStyles = {
    default: {
      background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.05) 100%)',
      border: '1px solid rgba(59, 130, 246, 0.2)',
      color: '#2563eb',
      hoverBg: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(37, 99, 235, 0.1) 100%)'
    },
    trending: {
      background: 'linear-gradient(135deg, rgba(255, 193, 7, 0.1) 0%, rgba(255, 160, 0, 0.05) 100%)',
      border: '1px solid rgba(255, 193, 7, 0.2)',
      color: '#f59e0b',
      hoverBg: 'linear-gradient(135deg, rgba(255, 193, 7, 0.15) 0%, rgba(255, 160, 0, 0.1) 100%)'
    },
    muted: {
      background: 'linear-gradient(135deg, rgba(107, 114, 128, 0.1) 0%, rgba(75, 85, 99, 0.05) 100%)',
      border: '1px solid rgba(107, 114, 128, 0.2)',
      color: '#6b7280',
      hoverBg: 'linear-gradient(135deg, rgba(107, 114, 128, 0.15) 0%, rgba(75, 85, 99, 0.1) 100%)'
    }
  };

  const style = variantStyles[variant];

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`inline-flex items-center gap-1 rounded-full font-medium transition-all duration-200 cursor-pointer ${sizeStyles[size]}`}
      style={{
        background: style.background,
        border: style.border,
        color: style.color,
        backdropFilter: 'blur(10px) saturate(1.5)',
        WebkitBackdropFilter: 'blur(10px) saturate(1.5)',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05), inset 0 1px 1px rgba(255, 255, 255, 0.5)',
        fontFamily: '"Montserrat", sans-serif'
      }}
      onClick={onClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = style.hoverBg;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = style.background;
      }}
    >
      <span>#{tag}</span>
      
      {count !== undefined && (
        <span className="opacity-75 text-xs">
          ({count.toLocaleString()})
        </span>
      )}
      
      {removable && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove?.();
          }}
          className="ml-1 rounded-full p-0.5 hover:bg-black/10 transition-colors"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </motion.span>
  );
};

export default HashtagChip;