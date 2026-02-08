import { ReactNode } from 'react';
import { motion } from 'motion/react';
import { LucideIcon } from 'lucide-react';
import { colors, spacing, borderRadius, transitions } from '../utils/designTokens';

interface DashboardCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  buttonText: string;
  onClick: () => void;
  isLoading?: boolean;
  delay?: number;
}

export function DashboardCard({
  icon: Icon,
  title,
  description,
  buttonText,
  onClick,
  isLoading = false,
  delay = 0,
}: DashboardCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      whileHover={{ y: -4 }}
      className="dashboard-card-wrapper"
    >
      <div
        className="dashboard-card"
        style={{
          background: 'var(--bg-card)',
          border: `1px solid var(--border-color)`,
          borderRadius: borderRadius.lg,
          padding: spacing[6],
          backdropFilter: 'blur(32px)',
          WebkitBackdropFilter: 'blur(32px)',
          boxShadow: 'var(--shadow)',
          cursor: 'pointer',
          transition: transitions.base,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Gradient overlay */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `radial-gradient(ellipse 100% 50% at 50% 0%, ${colors.primary.yellowLight} 0%, transparent 50%)`,
            opacity: 0.4,
            pointerEvents: 'none',
          }}
        />

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Icon */}
          <div
            style={{
              marginBottom: spacing[4],
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: spacing[12],
              height: spacing[12],
              borderRadius: borderRadius.lg,
              background: `linear-gradient(135deg, ${colors.primary.yellowLight} 0%, rgba(59, 130, 246, 0.1) 100%)`,
              border: `1px solid ${colors.border.primaryLight}`,
            }}
          >
            <Icon
              size={28}
              style={{
                color: colors.primary.yellow,
              }}
              strokeWidth={1.5}
            />
          </div>

          {/* Title */}
          <h3
            style={{
              fontSize: '1.25rem',
              fontWeight: 600,
              color: colors.text.primary,
              marginBottom: spacing[2],
              lineHeight: 1.3,
            }}
          >
            {title}
          </h3>

          {/* Description */}
          <p
            style={{
              fontSize: '0.875rem',
              color: colors.text.secondary,
              marginBottom: spacing[4],
              lineHeight: 1.5,
            }}
          >
            {description}
          </p>

          {/* Button */}
          <button
            onClick={onClick}
            disabled={isLoading}
            style={{
              width: '100%',
              padding: `${spacing[2]} ${spacing[4]}`,
              fontSize: '0.875rem',
              fontWeight: 600,
              color: '#0a0a0a',
              background: colors.primary.yellow,
              border: 'none',
              borderRadius: borderRadius.md,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: transitions.base,
              boxShadow: colors.shadow.buttonHover,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: spacing[2],
              opacity: isLoading ? 0.6 : 1,
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.currentTarget.style.background = colors.primary.yellowHover;
                e.currentTarget.style.boxShadow = colors.shadow.buttonHover;
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading) {
                e.currentTarget.style.background = colors.primary.yellow;
                e.currentTarget.style.boxShadow = colors.shadow.button;
              }
            }}
          >
            {buttonText}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
