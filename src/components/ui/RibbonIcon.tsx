import { LucideIcon } from 'lucide-react';
import { CSSProperties } from 'react';

interface RibbonIconProps {
  icon: LucideIcon;
  size?: number;
  containerSize?: number;
  withBackground?: boolean;
  glowIntensity?: 'none' | 'subtle' | 'medium' | 'strong';
  style?: CSSProperties;
}

/**
 * RibbonIcon - Dashboard-style 3D icon component for spreadsheet ribbons
 * Matches the exact styling from DashboardCard icons
 */
export function RibbonIcon({
  icon: Icon,
  size = 20,
  containerSize = 40,
  withBackground = true,
  glowIntensity = 'medium',
  style,
}: RibbonIconProps) {
  const glowOpacity = {
    none: 0,
    subtle: 0.15,
    medium: 0.25,
    strong: 0.35,
  }[glowIntensity];

  if (!withBackground) {
    return (
      <Icon
        size={size}
        style={{
          color: '#FFCF40',
          filter: `drop-shadow(0 2px 3px rgba(255, 207, 64, ${glowOpacity}))`,
          ...style,
        }}
        strokeWidth={1.5}
      />
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: containerSize,
        height: containerSize,
        borderRadius: '0.75rem',
        background: 'linear-gradient(135deg, rgba(255, 207, 64, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)',
        border: '1px solid rgba(255, 207, 64, 0.15)',
        boxShadow: `0 2px 8px rgba(255, 207, 64, ${glowOpacity}), 0 1px 3px rgba(0, 0, 0, 0.1)`,
        transition: 'all 0.2s ease',
        ...style,
      }}
      className="ribbon-icon-container"
    >
      <Icon
        size={size}
        style={{
          color: '#FFCF40',
          filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.15))',
        }}
        strokeWidth={1.5}
      />
    </div>
  );
}

/**
 * RibbonIconButton - Interactive button with dashboard-style icon
 */
interface RibbonIconButtonProps extends RibbonIconProps {
  onClick?: () => void;
  disabled?: boolean;
  active?: boolean;
  tooltip?: string;
  label?: string;
}

export function RibbonIconButton({
  icon,
  size = 20,
  containerSize = 40,
  onClick,
  disabled = false,
  active = false,
  tooltip,
  label,
  glowIntensity = 'medium',
}: RibbonIconButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={tooltip}
      className={`ribbon-icon-button ${active ? 'active' : ''}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.25rem',
        padding: '0.5rem',
        background: active
          ? 'linear-gradient(145deg, rgba(255, 207, 64, 0.15) 0%, rgba(59, 130, 246, 0.1) 100%)'
          : 'transparent',
        border: 'none',
        borderRadius: '0.5rem',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.background =
            'linear-gradient(145deg, rgba(255, 207, 64, 0.12) 0%, rgba(59, 130, 246, 0.08) 100%)';
          e.currentTarget.style.transform = 'translateY(-1px)';
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.currentTarget.style.background = active
            ? 'linear-gradient(145deg, rgba(255, 207, 64, 0.15) 0%, rgba(59, 130, 246, 0.1) 100%)'
            : 'transparent';
          e.currentTarget.style.transform = 'translateY(0)';
        }
      }}
    >
      <RibbonIcon
        icon={icon}
        size={size}
        containerSize={containerSize}
        withBackground={true}
        glowIntensity={glowIntensity}
      />
      {label && (
        <span
          style={{
            fontSize: '0.75rem',
            color: active ? '#FFCF40' : '#9ca3af',
            fontWeight: active ? 600 : 400,
            transition: 'color 0.2s ease',
          }}
        >
          {label}
        </span>
      )}
    </button>
  );
}

/**
 * SmallRibbonIcon - Compact version for toolbar buttons
 */
export function SmallRibbonIcon({
  icon: Icon,
  size = 16,
  style,
}: Omit<RibbonIconProps, 'containerSize' | 'withBackground'>) {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 28,
        height: 28,
        borderRadius: '0.5rem',
        background: 'linear-gradient(135deg, rgba(255, 207, 64, 0.08) 0%, rgba(59, 130, 246, 0.08) 100%)',
        border: '1px solid rgba(255, 207, 64, 0.1)',
        boxShadow: '0 1px 3px rgba(255, 207, 64, 0.15)',
        transition: 'all 0.2s ease',
        ...style,
      }}
      className="small-ribbon-icon"
    >
      <Icon
        size={size}
        style={{
          color: '#FFCF40',
          filter: 'drop-shadow(0 0.5px 1px rgba(0, 0, 0, 0.1))',
        }}
        strokeWidth={1.5}
      />
    </div>
  );
}
