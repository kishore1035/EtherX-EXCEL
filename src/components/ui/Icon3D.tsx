import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from './utils';

interface Icon3DProps {
  icon: LucideIcon;
  size?: number | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
  className?: string;
  glowIntensity?: 'none' | 'subtle' | 'medium' | 'strong';
}

const sizeMap = {
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
  '2xl': 40,
};

const variantColors = {
  default: {
    from: '#6366f1',
    to: '#8b5cf6',
    glow: 'rgba(99, 102, 241, 0.5)',
  },
  primary: {
    from: '#3b82f6',
    to: '#2563eb',
    glow: 'rgba(59, 130, 246, 0.5)',
  },
  success: {
    from: '#10b981',
    to: '#059669',
    glow: 'rgba(16, 185, 129, 0.5)',
  },
  warning: {
    from: '#f59e0b',
    to: '#d97706',
    glow: 'rgba(245, 158, 11, 0.5)',
  },
  danger: {
    from: '#ef4444',
    to: '#dc2626',
    glow: 'rgba(239, 68, 68, 0.5)',
  },
  info: {
    from: '#06b6d4',
    to: '#0891b2',
    glow: 'rgba(6, 182, 212, 0.5)',
  },
};

const glowIntensityMap = {
  none: 0,
  subtle: 0.3,
  medium: 0.6,
  strong: 1,
};

/**
 * 3D Neumorphic Icon Component
 * Wraps lucide-react icons with soft 3D styling, gradients, and glow effects
 */
export function Icon3D({ 
  icon: IconComponent, 
  size = 'md', 
  variant = 'default',
  className,
  glowIntensity = 'medium',
}: Icon3DProps) {
  const iconSize = typeof size === 'number' ? size : sizeMap[size];
  const colors = variantColors[variant];
  const glowOpacity = glowIntensityMap[glowIntensity];
  
  return (
    <div 
      className={cn(
        "icon-3d-wrapper inline-flex items-center justify-center relative",
        className
      )}
      style={{
        width: iconSize + 8,
        height: iconSize + 8,
      }}
    >
      {/* Glow layer */}
      {glowIntensity !== 'none' && (
        <div 
          className="absolute inset-0 rounded-full blur-md -z-10"
          style={{
            background: `radial-gradient(circle, ${colors.glow.replace('0.5', String(glowOpacity))} 0%, transparent 70%)`,
          }}
        />
      )}
      
      {/* Icon with gradient */}
      <div 
        className="relative flex items-center justify-center"
        style={{
          filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2)) drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3))',
        }}
      >
        <IconComponent
          size={iconSize}
          strokeWidth={2}
          style={{
            stroke: `url(#icon-gradient-${variant})`,
            filter: 'drop-shadow(0 0 1px rgba(255, 255, 255, 0.3))',
          }}
        />
      </div>
      
      {/* SVG Gradient Definition */}
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <linearGradient id={`icon-gradient-${variant}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colors.from} />
            <stop offset="100%" stopColor={colors.to} />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

/**
 * 3D Neumorphic Icon Button
 * Interactive button with icon that has soft 3D styling
 */
interface IconButton3DProps extends Icon3DProps {
  onClick?: () => void;
  disabled?: boolean;
  tooltip?: string;
  active?: boolean;
}

export function IconButton3D({
  icon,
  size = 'md',
  variant = 'default',
  className,
  glowIntensity = 'medium',
  onClick,
  disabled = false,
  tooltip,
  active = false,
}: IconButton3DProps) {
  const colors = variantColors[variant];
  const iconSize = typeof size === 'number' ? size : sizeMap[size];
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={tooltip}
      className={cn(
        "icon-3d-button relative rounded-xl transition-all duration-200",
        "hover:scale-105 active:scale-95",
        disabled && "opacity-50 cursor-not-allowed hover:scale-100 active:scale-100",
        active && "scale-105",
        className
      )}
      style={{
        padding: iconSize * 0.4,
        background: active 
          ? `linear-gradient(145deg, ${colors.from}20, ${colors.to}20)`
          : 'linear-gradient(145deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02))',
        boxShadow: active
          ? `inset 2px 2px 5px rgba(0, 0, 0, 0.3), inset -2px -2px 5px rgba(255, 255, 255, 0.05)`
          : `2px 2px 5px rgba(0, 0, 0, 0.3), -2px -2px 5px rgba(255, 255, 255, 0.05)`,
      }}
    >
      <Icon3D 
        icon={icon} 
        size={size} 
        variant={variant} 
        glowIntensity={glowIntensity}
      />
    </button>
  );
}

/**
 * 3D Neumorphic Icon Badge
 * Rounded badge with icon for status indicators, notifications, etc.
 */
interface IconBadge3DProps extends Icon3DProps {
  count?: number;
  pulse?: boolean;
}

export function IconBadge3D({
  icon,
  size = 'md',
  variant = 'default',
  className,
  glowIntensity = 'medium',
  count,
  pulse = false,
}: IconBadge3DProps) {
  const colors = variantColors[variant];
  
  return (
    <div className={cn("relative inline-flex", className)}>
      <div 
        className={cn(
          "rounded-full p-2",
          pulse && "animate-pulse"
        )}
        style={{
          background: `linear-gradient(145deg, ${colors.from}30, ${colors.to}30)`,
          boxShadow: `
            2px 2px 6px rgba(0, 0, 0, 0.3),
            -2px -2px 6px rgba(255, 255, 255, 0.05),
            inset 1px 1px 2px rgba(255, 255, 255, 0.1)
          `,
        }}
      >
        <Icon3D 
          icon={icon} 
          size={size} 
          variant={variant} 
          glowIntensity={glowIntensity}
        />
      </div>
      
      {count !== undefined && count > 0 && (
        <div 
          className="absolute -top-1 -right-1 min-w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white"
          style={{
            background: `linear-gradient(145deg, ${colors.from}, ${colors.to})`,
            boxShadow: `0 2px 4px rgba(0, 0, 0, 0.3), 0 0 8px ${colors.glow}`,
          }}
        >
          {count > 99 ? '99+' : count}
        </div>
      )}
    </div>
  );
}

/**
 * 3D Neumorphic Icon Container
 * Pill-shaped container for icons with soft depth
 */
interface IconContainer3DProps extends Icon3DProps {
  label?: string;
}

export function IconContainer3D({
  icon,
  size = 'md',
  variant = 'default',
  className,
  glowIntensity = 'subtle',
  label,
}: IconContainer3DProps) {
  const colors = variantColors[variant];
  
  return (
    <div 
      className={cn(
        "inline-flex items-center gap-2 px-4 py-2 rounded-full",
        className
      )}
      style={{
        background: `linear-gradient(145deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02))`,
        boxShadow: `
          2px 2px 6px rgba(0, 0, 0, 0.3),
          -2px -2px 6px rgba(255, 255, 255, 0.05),
          inset 1px 1px 2px rgba(255, 255, 255, 0.05)
        `,
      }}
    >
      <Icon3D 
        icon={icon} 
        size={size} 
        variant={variant} 
        glowIntensity={glowIntensity}
      />
      {label && (
        <span 
          className="text-sm font-medium"
          style={{
            background: `linear-gradient(145deg, ${colors.from}, ${colors.to})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          {label}
        </span>
      )}
    </div>
  );
}
