// Nuptily Icon System with Standardized Sizes, Colors, and Glass Tints

export const iconSystem = {
  // ===========================================
  // ICON SIZES (consistent across the app)
  // ===========================================
  sizes: {
    // Core sizes
    xs: 16,      // 16px - Tiny icons (inline text)
    sm: 18,      // 18px - Small icons (buttons, inputs)
    md: 20,      // 20px - Default icon size
    lg: 24,      // 24px - Large icons (headers)
    xl: 32,      // 32px - Extra large (hero sections)
    xxl: 48,     // 48px - Display size
    
    // Touch-friendly sizes (minimum 44px touch target)
    touch: {
      sm: 36,    // Small touchable icon
      md: 44,    // Default touchable icon
      lg: 52,    // Large touchable icon
    },
    
    // Specific use cases
    button: 18,        // Icons in buttons
    input: 20,         // Icons in inputs
    navigation: 24,    // Navigation icons
    social: 24,        // Social media icons
    emoji: 24,         // Emoji-style icons
  },

  // ===========================================
  // ICON COLORS (matching typography system)
  // ===========================================
  colors: {
    // Primary colors
    primary: '#000000',                    // Black icons
    primaryMuted: 'rgba(0, 0, 0, 0.6)',   // 60% black
    primaryLight: 'rgba(0, 0, 0, 0.4)',   // 40% black
    
    // Inverse colors (on dark backgrounds)
    inverse: '#FFFFFF',                    // White icons
    inverseMuted: 'rgba(255, 255, 255, 0.8)', // 80% white
    inverseLight: 'rgba(255, 255, 255, 0.6)', // 60% white
    
    // Brand colors (matching glass tints)
    blue: '#45B7D1',      // Sky blue
    turquoise: '#4ECDC4', // Turquoise
    coral: '#FF6B6B',     // Coral
    purple: '#9B59B6',    // Purple
    orange: '#FF9A00',    // Orange
    green: '#2ED573',     // Green
    
    // Interactive states
    hover: '#007AFF',     // iOS blue
    active: '#0051D5',    // Darker blue
    disabled: 'rgba(0, 0, 0, 0.38)', // 38% black
    error: '#FF3B30',     // iOS red
    success: '#34C759',   // iOS green
  },

  // ===========================================
  // GLASS TINT SETTINGS (for icon containers)
  // ===========================================
  glassTints: {
    // Light backgrounds
    light: {
      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.15) 100%)',
      backdropFilter: 'blur(20px) saturate(2)',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08), inset 0 1px 1px rgba(255, 255, 255, 0.5)',
    },
    
    // Colored tints (matching auth page style)
    blue: {
      background: 'linear-gradient(135deg, rgba(69, 183, 209, 0.2) 0%, rgba(78, 205, 196, 0.15) 100%)',
      backdropFilter: 'blur(15px) saturate(2)',
      border: '1px solid rgba(69, 183, 209, 0.3)',
      boxShadow: '0 2px 8px rgba(69, 183, 209, 0.15), inset 0 1px 1px rgba(255, 255, 255, 0.4)',
    },
    
    purple: {
      background: 'linear-gradient(135deg, rgba(155, 89, 182, 0.2) 0%, rgba(139, 89, 246, 0.15) 100%)',
      backdropFilter: 'blur(15px) saturate(2)',
      border: '1px solid rgba(155, 89, 182, 0.3)',
      boxShadow: '0 2px 8px rgba(155, 89, 182, 0.15), inset 0 1px 1px rgba(255, 255, 255, 0.4)',
    },
    
    coral: {
      background: 'linear-gradient(135deg, rgba(255, 107, 107, 0.2) 0%, rgba(255, 154, 0, 0.15) 100%)',
      backdropFilter: 'blur(15px) saturate(2)',
      border: '1px solid rgba(255, 107, 107, 0.3)',
      boxShadow: '0 2px 8px rgba(255, 107, 107, 0.15), inset 0 1px 1px rgba(255, 255, 255, 0.4)',
    },
    
    gradient: {
      background: 'linear-gradient(135deg, rgba(69, 183, 209, 0.15) 0%, rgba(78, 205, 196, 0.1) 50%, rgba(255, 107, 107, 0.12) 100%)',
      backdropFilter: 'blur(20px) saturate(2)',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1), inset 0 1px 1px rgba(255, 255, 255, 0.5)',
    }
  },
  
  // Helper function to get containers without circular reference
  getContainers: function() {
    return {
      // Round glass button (like auth page)
      glassButton: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '50%',
        minWidth: '44px',
        minHeight: '44px',
        transition: 'all 0.2s ease',
        cursor: 'pointer',
        ...this.glassTints.light,
      },
      
      // Square glass container
      glassSquare: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '12px',
        padding: '12px',
        transition: 'all 0.2s ease',
        ...this.glassTints.light,
      },
      
      // Input icon container
      inputIcon: {
        position: 'absolute' as const,
        left: '12px',
        top: '50%',
        transform: 'translateY(-50%)',
        pointerEvents: 'none' as const,
      },
      
      // Badge icon container
      badgeIcon: {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        ...this.glassTints.gradient,
      }
    };
  },

  // ===========================================
  // ICON CONTAINER STYLES
  // ===========================================
  // Use getContainers() method to avoid circular reference

  // ===========================================
  // ICON ANIMATIONS
  // ===========================================
  animations: {
    // Hover effects
    hover: {
      transform: 'scale(1.05)',
      transition: 'transform 0.2s ease',
    },
    
    // Active/pressed effect
    active: {
      transform: 'scale(0.95)',
      transition: 'transform 0.1s ease',
    },
    
    // Spin animation
    spin: {
      animation: 'spin 1s linear infinite',
      '@keyframes spin': {
        from: { transform: 'rotate(0deg)' },
        to: { transform: 'rotate(360deg)' },
      },
    },
    
    // Pulse animation
    pulse: {
      animation: 'pulse 2s ease-in-out infinite',
      '@keyframes pulse': {
        '0%': { opacity: 1 },
        '50%': { opacity: 0.5 },
        '100%': { opacity: 1 },
      },
    },
  },

  // ===========================================
  // STANDARDIZED ICON SETS
  // ===========================================
  standardIcons: {
    // Navigation
    menu: 'Menu',
    close: 'X',
    back: 'ChevronLeft',
    forward: 'ChevronRight',
    up: 'ChevronUp',
    down: 'ChevronDown',
    
    // Actions
    add: 'Plus',
    edit: 'Edit',
    delete: 'Trash2',
    save: 'Save',
    share: 'Share2',
    download: 'Download',
    upload: 'Upload',
    
    // Communication
    message: 'MessageCircle',
    email: 'Mail',
    phone: 'Phone',
    video: 'Video',
    
    // User
    user: 'User',
    users: 'Users',
    settings: 'Settings',
    logout: 'LogOut',
    
    // Status
    info: 'Info',
    warning: 'AlertTriangle',
    error: 'AlertCircle',
    success: 'CheckCircle',
    
    // Social (Font Awesome)
    facebook: 'Facebook',
    instagram: 'Instagram',
    twitter: 'Twitter',
    youtube: 'Youtube',
  }
};

// ===========================================
// ICON COMPONENT STYLES
// ===========================================
const baseIconStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
};

export const iconStyles = {
  // Base icon style
  base: baseIconStyle,
  
  // Icon in button
  buttonIcon: {
    ...baseIconStyle,
    width: iconSystem.sizes.button,
    height: iconSystem.sizes.button,
    marginRight: '8px',
  },
  
  // Icon in input
  inputIcon: {
    ...baseIconStyle,
    width: iconSystem.sizes.input,
    height: iconSystem.sizes.input,
    color: iconSystem.colors.primaryMuted,
    position: 'absolute' as const,
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    pointerEvents: 'none' as const,
  },
  
  // Standalone icon button
  iconButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    minWidth: '44px',
    minHeight: '44px',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
    ...iconSystem.glassTints.light,
    '&:hover': iconSystem.animations.hover,
    '&:active': iconSystem.animations.active,
  },
  
  // Navigation icon
  navIcon: {
    ...baseIconStyle,
    width: iconSystem.sizes.navigation,
    height: iconSystem.sizes.navigation,
    color: iconSystem.colors.primary,
  },
  
  // Social icon
  socialIcon: {
    ...baseIconStyle,
    width: iconSystem.sizes.social,
    height: iconSystem.sizes.social,
    padding: '10px',
    borderRadius: '50%',
    ...iconSystem.glassTints.light,
    '&:hover': {
      ...iconSystem.animations.hover,
      ...iconSystem.glassTints.gradient,
    },
  },
};

// ===========================================
// UTILITY FUNCTIONS
// ===========================================
export const getIconSize = (size: keyof typeof iconSystem.sizes | number): number => {
  if (typeof size === 'number') return size;
  return iconSystem.sizes[size] || iconSystem.sizes.md;
};

export const getIconColor = (
  variant: 'primary' | 'muted' | 'light' | 'inverse' | 'brand',
  brandColor?: keyof typeof iconSystem.colors
): string => {
  switch (variant) {
    case 'primary':
      return iconSystem.colors.primary;
    case 'muted':
      return iconSystem.colors.primaryMuted;
    case 'light':
      return iconSystem.colors.primaryLight;
    case 'inverse':
      return iconSystem.colors.inverse;
    case 'brand':
      return brandColor ? iconSystem.colors[brandColor] : iconSystem.colors.primary;
    default:
      return iconSystem.colors.primary;
  }
};

export const getGlassTint = (
  color: keyof typeof iconSystem.glassTints
): typeof iconSystem.glassTints.light => {
  return iconSystem.glassTints[color] || iconSystem.glassTints.light;
};