/**
 * PRISMA Design System - PRD Implementation
 * Design tokens, accessibility constants, UI states per PRD spec.
 */

export const DESIGN_TOKENS = {
  colors: {
    light: {
      background: '#f8fafc', foreground: '#0f172a',
      primary: '#2563eb', primaryForeground: '#ffffff',
      success: '#059669', warning: '#d97706', error: '#dc2626', info: '#2563eb',
    },
    dark: {
      background: '#0c0406', foreground: '#fcf8f8',
      primary: '#f43f5e', primaryForeground: '#ffffff',
      success: '#34d399', warning: '#fbbf24', error: '#fb7185', info: '#93c5fd',
    },
  },
  typography: {
    fontFamily: { sans: 'var(--font-sans)', mono: 'var(--font-geist-mono)' },
    fontSize: { xs: '0.75rem', sm: '0.875rem', base: '1rem', lg: '1.125rem', xl: '1.25rem', '2xl': '1.5rem', '3xl': '1.875rem' },
  },
  spacing: { xs: '0.25rem', sm: '0.5rem', md: '1rem', lg: '1.5rem', xl: '2rem' },
  radius: { sm: 'calc(1rem - 4px)', md: '1rem', lg: 'calc(1rem + 4px)', full: '9999px' },
} as const;

export type UIState = 'default' | 'hover' | 'focus' | 'active' | 'loading' | 'success' | 'error' | 'disabled';

export const UI_STATES = {
  default: { description: 'Calm, focused interface', emotionalOutcome: 'clarity' },
  success: { description: 'Discreet positive feedback', duration: 3000 },
  error: { description: 'Friendly instructive messages', placement: 'near-input' as const },
  loading: { description: 'Minimal loaders in context', avoidInterrupt: true },
} as const;

export const MICRO_INTERACTIONS = {
  buttonPress: { scale: 0.98, duration: 100, easing: 'ease' },
  hoverTransition: { duration: 200, easing: 'cubic-bezier(0.4, 0, 0.2, 1)' },
  fadeIn: { duration: 500, translateY: 8, easing: 'ease-out' },
  inlineValidation: { debounce: 300, animationDuration: 200 },
  toast: { enterDuration: 300, exitDuration: 200, displayDuration: 3000 },
} as const;

export const ACCESSIBILITY = {
  contrastRatios: { normalText: 4.5, largeText: 3.0, uiComponents: 3.0 },
  minTouchTarget: { width: 44, height: 44 },
  focusIndicator: { width: 2, offset: 2 },
  skipLink: { text: 'Langsung ke konten utama', targetId: 'main-content' },
  reducedMotion: true,
  highContrast: true,
} as const;

export const PERFORMANCE = {
  maxLoadTime: 2000,
  maxBundleSize: 500,
  retryAttempts: 3,
  retryDelay: 1000,
} as const;

export const COMPONENT_PATTERNS = {
  buttonVariants: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link', 'gradient'] as const,
  cardVariants: ['default', 'gradient-primary', 'gradient-success', 'gradient-danger'] as const,
  progressTypes: ['linear', 'circular', 'stepper'] as const,
  validationTypes: ['inline', 'on-submit', 'real-time'] as const,
} as const;

export type ButtonVariant = typeof COMPONENT_PATTERNS.buttonVariants[number];
export type CardVariant = typeof COMPONENT_PATTERNS.cardVariants[number];
