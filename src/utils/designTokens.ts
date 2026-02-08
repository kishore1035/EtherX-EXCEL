/**
 * Design System Tokens
 * Extracted from Login/Signup Auth Theme
 * Used consistently across Dashboard and other components
 */

// Color Palette
export const colors = {
  // Primary Colors
  primary: {
    yellow: 'rgb(255, 207, 64)', // #ffcf40
    yellowHover: 'rgb(230, 184, 0)', // #e6b800
    yellowLight: 'rgba(255, 207, 64, 0.1)',
    yellowGlow: 'rgba(255, 207, 64, 0.3)',
    // Soft Gold for 3D Glassmorphism Icons
    softGold: '#E6C45A', // For 3D UI icons
    softGoldRgba: 'rgba(230, 196, 90, 0.85)', // Alternative soft gold
    iconGold: 'rgba(255, 215, 120, 0.85)', // Warm gold for icons
  },

  // Secondary Colors
  secondary: {
    blue: 'rgb(59, 130, 246)', // #3b82f6
    blueLight: 'rgba(59, 130, 246, 0.1)',
    blueGlow: 'rgba(59, 130, 246, 0.3)',
  },

  // Backgrounds
  background: {
    dark: '#000000',
    darkCard: 'linear-gradient(135deg, rgba(0, 0, 0, 0.95) 0%, rgba(0, 0, 0, 0.85) 100%)',
    darkInput: 'rgba(15, 15, 15, 0.85)',
    darkSecondary: 'rgba(20, 20, 20, 0.6)',
  },

  // Borders
  border: {
    primary: 'rgba(255, 207, 64, 0.2)',
    primaryLight: 'rgba(255, 207, 64, 0.1)',
    secondary: 'rgba(40, 40, 40, 0.6)',
    light: 'rgba(255, 255, 255, 0.05)',
    muted: 'rgba(180, 180, 180, 0.2)',
  },

  // Text
  text: {
    primary: '#ffffff',
    secondary: 'rgba(180, 180, 180, 0.7)',
    muted: 'rgba(140, 140, 140, 0.6)',
  },

  // Shadows & Glows
  shadow: {
    sm: '0 2px 8px rgba(255, 207, 64, 0.1)',
    md: '0 4px 14px rgba(255, 207, 64, 0.2)',
    lg: '0 6px 20px rgba(255, 207, 64, 0.3)',
    xl: '0 20px 60px rgba(0, 0, 0, 0.3)',
    button: '0 4px 14px rgba(255, 207, 64, 0.3)',
    buttonHover: '0 6px 20px rgba(255, 207, 64, 0.4)',
  },

  // Gradients
  gradient: {
    background: 'radial-gradient(ellipse 120% 80% at 50% 10%, rgba(255, 207, 64, 0.08) 0%, rgba(0, 0, 0, 0.4) 40%, transparent 60%), radial-gradient(ellipse 120% 80% at 50% 90%, rgba(59, 130, 246, 0.08) 0%, rgba(0, 0, 0, 0.4) 40%, transparent 60%), radial-gradient(ellipse 150% 100% at 50% 50%, rgba(0, 0, 0, 0.6) 0%, rgba(0, 0, 0, 0.9) 100%), #000000',
    card: 'linear-gradient(135deg, rgba(0, 0, 0, 0.95) 0%, rgba(0, 0, 0, 0.85) 100%)',
    button: 'linear-gradient(135deg, rgb(255, 207, 64) 0%, rgb(230, 184, 0) 100%)',
    title: 'linear-gradient(135deg, #ffcf40 0%, #e6b800 50%, #ffcf40 100%)',
  },
};

// Typography
export const typography = {
  // Font families
  fontFamily: {
    base: 'inherit',
  },

  // Font sizes
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
  },

  // Font weights
  fontWeight: {
    normal: 400,
    semibold: 600,
    bold: 700,
  },

  // Line heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

// Spacing (8px scale)
export const spacing = {
  0: '0px',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
};

// Border Radius
export const borderRadius = {
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  '2xl': '20px',
  full: '9999px',
};

// Transitions
export const transitions = {
  fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
  base: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
  slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
};

// Shadow presets
export const shadows = {
  card: '0 20px 60px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.05) inset, 0 0 40px rgba(255, 207, 64, 0.1)',
  cardHover: '0 25px 70px rgba(255, 207, 64, 0.15)',
  button: '0 4px 14px rgba(255, 207, 64, 0.3)',
  buttonHover: '0 6px 20px rgba(255, 207, 64, 0.4)',
};

// Utility class generators
export const classNames = {
  // Card base
  cardBase: 'rounded-lg border transition-all duration-200',

  // Button base
  buttonBase: 'inline-flex items-center justify-center font-semibold rounded-md border-none cursor-pointer transition-all duration-150 outline-none',

  // Input base
  inputBase: 'w-full px-4 py-2 rounded-lg bg-black border-2 text-white outline-none transition-all duration-150',

  // Link
  link: 'cursor-pointer transition-colors duration-150 hover:text-opacity-80',
};
