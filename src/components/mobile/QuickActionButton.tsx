import React, { useState } from 'react';
import { Check, Plus, X, Edit } from 'lucide-react';

interface QuickActionButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

export const QuickActionButton: React.FC<QuickActionButtonProps> = ({
  icon,
  label,
  onClick,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  className = ''
}) => {
  const [isPressed, setIsPressed] = useState(false);

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return 'bg-wedding-navy text-white hover:bg-wedding-navy-light shadow-lg';
      case 'secondary':
        return 'bg-white text-wedding-navy border border-wedding-navy/20 hover:bg-wedding-navy/5';
      case 'success':
        return 'bg-green-600 text-white hover:bg-green-700 shadow-lg';
      case 'danger':
        return 'bg-red-600 text-white hover:bg-red-700 shadow-lg';
      default:
        return 'bg-wedding-navy text-white hover:bg-wedding-navy-light shadow-lg';
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return 'px-3 py-2 text-xs min-h-[40px] min-w-[40px]';
      case 'medium':
        return 'px-4 py-3 text-sm min-h-[48px] min-w-[48px]';
      case 'large':
        return 'px-6 py-4 text-base min-h-[56px] min-w-[56px]';
      default:
        return 'px-4 py-3 text-sm min-h-[48px] min-w-[48px]';
    }
  };

  const handleTouchStart = () => {
    setIsPressed(true);
  };

  const handleTouchEnd = () => {
    setIsPressed(false);
  };

  return (
    <button
      onClick={onClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      disabled={disabled || loading}
      className={`
        ${getVariantStyles()}
        ${getSizeStyles()}
        flex items-center gap-2 rounded-xl font-dolly font-medium
        transition-all duration-200 touch-manipulation
        transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
        ${isPressed ? 'scale-95' : 'scale-100'}
        ${className}
      `}
    >
      {loading ? (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <div className="w-4 h-4 flex items-center justify-center">
          {icon}
        </div>
      )}
      
      <span className="whitespace-nowrap">{label}</span>
    </button>
  );
};

// Pre-built quick action buttons for common operations
export const QuickActions = {
  Add: ({ onClick, label = 'Add', ...props }: Partial<QuickActionButtonProps> & { onClick: () => void }) => (
    <QuickActionButton
      icon={<Plus className="w-4 h-4" />}
      label={label}
      onClick={onClick}
      variant="primary"
      {...props}
    />
  ),
  
  Edit: ({ onClick, label = 'Edit', ...props }: Partial<QuickActionButtonProps> & { onClick: () => void }) => (
    <QuickActionButton
      icon={<Edit className="w-4 h-4" />}
      label={label}
      onClick={onClick}
      variant="secondary"
      {...props}
    />
  ),
  
  Save: ({ onClick, label = 'Save', ...props }: Partial<QuickActionButtonProps> & { onClick: () => void }) => (
    <QuickActionButton
      icon={<Check className="w-4 h-4" />}
      label={label}
      onClick={onClick}
      variant="success"
      {...props}
    />
  ),
  
  Cancel: ({ onClick, label = 'Cancel', ...props }: Partial<QuickActionButtonProps> & { onClick: () => void }) => (
    <QuickActionButton
      icon={<X className="w-4 h-4" />}
      label={label}
      onClick={onClick}
      variant="danger"
      {...props}
    />
  )
};