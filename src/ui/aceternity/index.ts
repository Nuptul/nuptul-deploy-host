/**
 * Aceternity UI Components for Wedding App
 * 
 * Enhanced glassmorphism and neumorphism components with sophisticated animations
 * specifically designed for luxury wedding planning applications.
 */

// Core Components

export { 
  AnimatedModal, 
  type AnimatedModalProps 
} from './animated-modal';

export {
  default as AnimatedTooltip
} from './animated-tooltip';

export { 
  GlareCard, 
  type GlareCardProps 
} from './glare-card';

export { 
  TextGenerate,
  WeddingAnnouncement,
  LoadingText,
  SubtitleReveal,
  type TextGenerateProps 
} from './text-generate';

export {
  default as HeroParallax,
  type HeroParallaxProps,
  type ParallaxImage
} from './hero-parallax';

export {
  default as Sparkles,
  type SparklesProps,
  type SparkleConfig
} from './sparkles';

export {
  default as Card3D,
  type Card3DProps
} from './card-3d';

// Utility Functions
export {
  useMouseTracker,
  useRelativeMouseTracker,
  useWeddingMouseEffects,
  createSpotlightGradient,
  createGlareEffect,
  calculateRotation,
  type MousePosition,
  type RelativeMousePosition
} from './utils/mouse-tracker';

// Animation Variants
export {
  cardVariants,
  modalVariants,
  overlayVariants,
  containerVariants,
  slideVariants,
  romanticVariants,
  hoverVariants,
  listItemVariants,
  weddingEasing,
  weddingDurations
} from './utils/animation-variants';

// TypeScript Types
export type {
  WeddingTheme,
  AnimationSpeed,
  SpotlightVariant,
  BaseAceternityProps,
  AnimatedProps,
  InteractiveProps,
  SpotlightProps,
  GlareProps,
  ModalProps,
  TextAnimationProps,
  WeddingColors,
  WeddingEasing,
  ComponentSize,
  WeddingAnimationConfig,
  MouseEffects,
  WeddingThemeConfig
} from './types/aceternity';

// Component Collections for easier imports
export const AceternityCards = {
  Glare: GlareCard,
  Card3D: Card3D,
} as const;

export const AceternityModals = {
  Animated: AnimatedModal,
} as const;

export const AceternityText = {
  Generate: TextGenerate,
  Announcement: WeddingAnnouncement,
  Loading: LoadingText,
  Subtitle: SubtitleReveal,
} as const;

export const AceternityHero = {
  Parallax: HeroParallax,
} as const;

export const AceternityEffects = {
  Sparkles: Sparkles,
} as const;

export const AceternityUtils = {
  mouseTracker: useMouseTracker,
  relativeMouseTracker: useRelativeMouseTracker,
  weddingMouseEffects: useWeddingMouseEffects,
  spotlightGradient: createSpotlightGradient,
  glareEffect: createGlareEffect,
  calculateRotation,
} as const;

export const AceternityAnimations = {
  variants: {
    card: cardVariants,
    modal: modalVariants,
    overlay: overlayVariants,
    container: containerVariants,
    slide: slideVariants,
    romantic: romanticVariants,
    hover: hoverVariants,
    listItem: listItemVariants,
  },
  easing: weddingEasing,
  durations: weddingDurations,
} as const;

// Default export for convenience
const Aceternity = {
  ...AceternityCards,
  ...AceternityModals,
  ...AceternityText,
  ...AceternityHero,
  ...AceternityEffects,
  Utils: AceternityUtils,
  Animations: AceternityAnimations,
} as const;

export default Aceternity;