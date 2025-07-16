// Nuptily Glass System - Pastel Vibrant Colors with Liquid Effects

// CSS for liquid animation keyframes (add to global CSS)
export const liquidAnimationCSS = `
  @keyframes liquidShift {
    0%, 100% {
      background-position: 0% 50%;
      transform: translateZ(0) scale(1);
    }
    25% {
      background-position: 50% 30%;
      transform: translateZ(0) scale(1.02);
    }
    50% {
      background-position: 100% 50%;
      transform: translateZ(0) scale(1);
    }
    75% {
      background-position: 50% 70%;
      transform: translateZ(0) scale(1.01);
    }
  }
  
  @keyframes liquidBubble {
    0%, 100% {
      transform: translateY(0) scale(1);
      opacity: 0.4;
    }
    50% {
      transform: translateY(-10px) scale(1.1);
      opacity: 0.6;
    }
  }
  
  @keyframes liquidWave {
    0% {
      transform: translateX(-100%) translateZ(0);
    }
    100% {
      transform: translateX(100%) translateZ(0);
    }
  }
`;

export const glassSystem = {
  // ===========================================
  // PASTEL VIBRANT GLASS TINTS
  // ===========================================
  tints: {
    // Pure glass (subtle white)
    pure: {
      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0.25) 100%)',
      backdropFilter: 'blur(25px) saturate(1.8)',
      border: '1px solid rgba(255, 255, 255, 0.4)',
      boxShadow: '0 8px 32px rgba(31, 38, 135, 0.12), inset 0 1px 1px rgba(255, 255, 255, 0.6)',
    },
    
    // Pastel Blue (like auth form)
    pastelBlue: {
      background: 'linear-gradient(135deg, rgba(173, 216, 230, 0.35) 0%, rgba(135, 206, 235, 0.25) 100%)',
      backdropFilter: 'blur(25px) saturate(1.8)',
      border: '1px solid rgba(173, 216, 230, 0.4)',
      boxShadow: '0 8px 32px rgba(135, 206, 235, 0.15), inset 0 1px 1px rgba(255, 255, 255, 0.6)',
    },
    
    // Pastel Pink
    pastelPink: {
      background: 'linear-gradient(135deg, rgba(255, 182, 193, 0.35) 0%, rgba(255, 192, 203, 0.25) 100%)',
      backdropFilter: 'blur(25px) saturate(1.8)',
      border: '1px solid rgba(255, 182, 193, 0.4)',
      boxShadow: '0 8px 32px rgba(255, 192, 203, 0.15), inset 0 1px 1px rgba(255, 255, 255, 0.6)',
    },
    
    // Pastel Purple
    pastelPurple: {
      background: 'linear-gradient(135deg, rgba(221, 160, 221, 0.35) 0%, rgba(216, 191, 216, 0.25) 100%)',
      backdropFilter: 'blur(25px) saturate(1.8)',
      border: '1px solid rgba(221, 160, 221, 0.4)',
      boxShadow: '0 8px 32px rgba(216, 191, 216, 0.15), inset 0 1px 1px rgba(255, 255, 255, 0.6)',
    },
    
    // Pastel Peach
    pastelPeach: {
      background: 'linear-gradient(135deg, rgba(255, 218, 185, 0.35) 0%, rgba(255, 228, 181, 0.25) 100%)',
      backdropFilter: 'blur(25px) saturate(1.8)',
      border: '1px solid rgba(255, 218, 185, 0.4)',
      boxShadow: '0 8px 32px rgba(255, 228, 181, 0.15), inset 0 1px 1px rgba(255, 255, 255, 0.6)',
    },
    
    // Pastel Mint
    pastelMint: {
      background: 'linear-gradient(135deg, rgba(152, 255, 208, 0.35) 0%, rgba(192, 255, 228, 0.25) 100%)',
      backdropFilter: 'blur(25px) saturate(1.8)',
      border: '1px solid rgba(152, 255, 208, 0.4)',
      boxShadow: '0 8px 32px rgba(192, 255, 228, 0.15), inset 0 1px 1px rgba(255, 255, 255, 0.6)',
    },
    
    // Multi-color pastel gradient (like the auth screenshot)
    pastelGradient: {
      background: 'linear-gradient(135deg, rgba(173, 216, 230, 0.3) 0%, rgba(221, 160, 221, 0.25) 25%, rgba(255, 182, 193, 0.2) 50%, rgba(255, 218, 185, 0.25) 75%, rgba(176, 224, 230, 0.3) 100%)',
      backdropFilter: 'blur(30px) saturate(1.8)',
      border: '1px solid rgba(255, 255, 255, 0.5)',
      boxShadow: '0 12px 40px rgba(31, 38, 135, 0.1), inset 0 1px 1px rgba(255, 255, 255, 0.7)',
    },
    
    // Button gradient (vibrant but soft)
    buttonPrimary: {
      background: 'linear-gradient(135deg, rgba(135, 206, 235, 0.8) 0%, rgba(152, 255, 208, 0.7) 50%, rgba(255, 182, 193, 0.75) 100%)',
      backdropFilter: 'blur(15px) saturate(2)',
      border: '1px solid rgba(255, 255, 255, 0.5)',
      boxShadow: '0 4px 16px rgba(135, 206, 235, 0.25), inset 0 1px 1px rgba(255, 255, 255, 0.8)',
    },
  },

  // ===========================================
  // GLASS INTENSITIES
  // ===========================================
  intensity: {
    light: {
      blur: '15px',
      saturate: '1.5',
      opacity: 0.2,
    },
    medium: {
      blur: '25px',
      saturate: '1.8',
      opacity: 0.3,
    },
    strong: {
      blur: '35px',
      saturate: '2',
      opacity: 0.4,
    },
  },

  // ===========================================
  // LIQUID EFFECTS
  // ===========================================
  liquid: {
    // Subtle liquid movement
    subtle: {
      backgroundSize: '400% 400%',
      animation: 'liquidShift 20s ease-in-out infinite',
      '&::before': {
        content: '""',
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(circle at 20% 80%, rgba(173, 216, 230, 0.15) 0%, transparent 50%)',
        backgroundSize: '150% 150%',
        animation: 'liquidBubble 8s ease-in-out infinite',
        pointerEvents: 'none',
        borderRadius: 'inherit',
      },
    },
    
    // Medium liquid movement
    medium: {
      backgroundSize: '600% 600%',
      animation: 'liquidShift 15s ease-in-out infinite',
      '&::before': {
        content: '""',
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(circle at 30% 70%, rgba(221, 160, 221, 0.2) 0%, transparent 60%)',
        backgroundSize: '200% 200%',
        animation: 'liquidBubble 6s ease-in-out infinite',
        pointerEvents: 'none',
        borderRadius: 'inherit',
      },
      '&::after': {
        content: '""',
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(circle at 70% 30%, rgba(255, 182, 193, 0.15) 0%, transparent 50%)',
        backgroundSize: '180% 180%',
        animation: 'liquidBubble 7s ease-in-out infinite reverse',
        pointerEvents: 'none',
        borderRadius: 'inherit',
      },
    },
    
    // Strong liquid movement
    strong: {
      backgroundSize: '800% 800%',
      animation: 'liquidShift 10s ease-in-out infinite',
      '&::before': {
        content: '""',
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(90deg, transparent 0%, rgba(135, 206, 235, 0.1) 50%, transparent 100%)',
        animation: 'liquidWave 4s linear infinite',
        pointerEvents: 'none',
        borderRadius: 'inherit',
      },
    },
  },

  // ===========================================
  // COMPONENT PRESETS
  // ===========================================
  components: {
    // Card container (like auth form)
    card: {
      ...glassSystem.tints.pastelGradient,
      borderRadius: '24px',
      padding: '32px',
    },
    
    // Input field
    input: {
      background: 'rgba(255, 255, 255, 0.45)',
      backdropFilter: 'blur(20px) saturate(1.8)',
      border: '1px solid rgba(255, 255, 255, 0.5)',
      boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.7), inset 0 -1px 1px rgba(0, 0, 0, 0.05)',
      borderRadius: '12px',
    },
    
    // Primary button
    buttonPrimary: {
      ...glassSystem.tints.buttonPrimary,
      borderRadius: '12px',
      minHeight: '48px',
    },
    
    // Secondary button
    buttonSecondary: {
      background: 'rgba(255, 255, 255, 0.35)',
      backdropFilter: 'blur(20px) saturate(1.8)',
      border: '1px solid rgba(255, 255, 255, 0.5)',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08), inset 0 1px 1px rgba(255, 255, 255, 0.7)',
      borderRadius: '12px',
    },
    
    // Navigation bar
    navigation: {
      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.3) 100%)',
      backdropFilter: 'blur(30px) saturate(1.8)',
      border: '1px solid rgba(255, 255, 255, 0.5)',
      boxShadow: '0 8px 32px rgba(31, 38, 135, 0.08)',
    },
  },
};

// Helper function to apply glass styling
export const applyGlassStyle = (
  tint: keyof typeof glassSystem.tints = 'pure',
  intensity: keyof typeof glassSystem.intensity = 'medium'
) => {
  const tintStyle = glassSystem.tints[tint];
  const intensityLevel = glassSystem.intensity[intensity];
  
  return {
    ...tintStyle,
    backdropFilter: `blur(${intensityLevel.blur}) saturate(${intensityLevel.saturate})`,
    WebkitBackdropFilter: `blur(${intensityLevel.blur}) saturate(${intensityLevel.saturate})`,
  };
};

// Helper function to apply liquid glass styling
export const applyLiquidGlass = (
  tint: keyof typeof glassSystem.tints = 'pastelGradient',
  liquidEffect: keyof typeof glassSystem.liquid = 'medium',
  intensity: keyof typeof glassSystem.intensity = 'medium'
) => {
  const baseGlass = applyGlassStyle(tint, intensity);
  const liquid = glassSystem.liquid[liquidEffect];
  
  return {
    ...baseGlass,
    position: 'relative' as const,
    overflow: 'hidden' as const,
    backgroundSize: liquid.backgroundSize,
    animation: liquid.animation,
    '&::before': liquid['&::before'],
    '&::after': liquid['&::after'],
  };
};