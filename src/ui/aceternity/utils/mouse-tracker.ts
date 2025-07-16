import { useCallback, useEffect, useState } from 'react';

export interface MousePosition {
  x: number;
  y: number;
}

export interface RelativeMousePosition extends MousePosition {
  relativeX: number;
  relativeY: number;
}

/**
 * Hook for tracking mouse position relative to a target element
 */
export const useMouseTracker = () => {
  const [mousePosition, setMousePosition] = useState<MousePosition>({ x: 0, y: 0 });

  const updateMousePosition = useCallback((e: MouseEvent) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', updateMousePosition);
    return () => window.removeEventListener('mousemove', updateMousePosition);
  }, [updateMousePosition]);

  return mousePosition;
};

/**
 * Hook for tracking mouse position relative to a specific element
 */
export const useRelativeMouseTracker = (elementRef: React.RefObject<HTMLElement>) => {
  const [relativePosition, setRelativePosition] = useState<RelativeMousePosition>({
    x: 0,
    y: 0,
    relativeX: 0,
    relativeY: 0,
  });

  const updateRelativePosition = useCallback((e: MouseEvent) => {
    if (!elementRef.current) return;

    const rect = elementRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const relativeX = x / rect.width;
    const relativeY = y / rect.height;

    setRelativePosition({ x, y, relativeX, relativeY });
  }, [elementRef]);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    element.addEventListener('mousemove', updateRelativePosition);
    return () => element.removeEventListener('mousemove', updateRelativePosition);
  }, [elementRef, updateRelativePosition]);

  return relativePosition;
};

/**
 * Creates a spotlight effect gradient based on mouse position
 */
export const createSpotlightGradient = (
  mousePos: MousePosition,
  spotlightSize: number = 600,
  color: string = 'rgba(255, 255, 255, 0.15)'
): string => {
  return `radial-gradient(${spotlightSize}px circle at ${mousePos.x}px ${mousePos.y}px, ${color}, transparent 40%)`;
};

/**
 * Creates a glare effect based on mouse position and element dimensions
 */
export const createGlareEffect = (
  relativePos: RelativeMousePosition,
  intensity: number = 0.3
): { background: string; opacity: number } => {
  const { relativeX, relativeY } = relativePos;
  
  // Create diagonal glare effect
  const angle = Math.atan2(relativeY - 0.5, relativeX - 0.5) * (180 / Math.PI);
  const distance = Math.sqrt(Math.pow(relativeX - 0.5, 2) + Math.pow(relativeY - 0.5, 2));
  
  return {
    background: `linear-gradient(${angle + 90}deg, 
      transparent 0%, 
      rgba(255, 255, 255, ${intensity}) 50%, 
      transparent 100%)`,
    opacity: Math.max(0, 1 - distance * 2), // Fade based on distance from center
  };
};

/**
 * Calculate 3D rotation based on mouse position
 */
export const calculateRotation = (
  relativePos: RelativeMousePosition,
  maxRotation: number = 20
): { rotateX: number; rotateY: number } => {
  const { relativeX, relativeY } = relativePos;
  
  const rotateX = (relativeY - 0.5) * maxRotation;
  const rotateY = (relativeX - 0.5) * maxRotation * -1;
  
  return { rotateX, rotateY };
};

/**
 * Wedding-specific mouse effects with romantic timing
 */
export const useWeddingMouseEffects = (elementRef: React.RefObject<HTMLElement>) => {
  const relativePos = useRelativeMouseTracker(elementRef);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handleMouseEnter = () => setIsHovered(true);
    const handleMouseLeave = () => setIsHovered(false);

    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [elementRef]);

  return {
    ...relativePos,
    isHovered,
    spotlight: createSpotlightGradient(
      { x: relativePos.x, y: relativePos.y },
      600,
      'hsla(330, 68%, 60%, 0.15)' // Wedding pink
    ),
    glare: createGlareEffect(relativePos, 0.2),
    rotation: calculateRotation(relativePos, 15),
  };
};