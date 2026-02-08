import { motion } from 'motion/react';
import { FileSpreadsheet, Trash2 } from 'lucide-react';
import { colors, spacing, borderRadius, transitions } from '../utils/designTokens';

interface RecentSheetCardProps {
  id: string;
  title: string;
  date: string;
  statusTags?: Array<{ label: string; color: 'yellow' | 'blue' }>;
  onClick: () => void;
  onDelete?: (id: string) => void;
  delay?: number;
}

export function RecentSheetCard({
  id,
  title,
  date,
  statusTags = [],
  onClick,
  onDelete,
  delay = 0,
}: RecentSheetCardProps) {
  const getTagColors = (color: 'yellow' | 'blue') => {
    if (color === 'yellow') {
      return {
        bg: 'rgba(255, 207, 64, 0.15)',
        border: `1px solid rgba(255, 207, 64, 0.3)`,
        text: colors.primary.yellow,
      };
    }
    return {
      bg: 'rgba(59, 130, 246, 0.15)',
      border: `1px solid rgba(59, 130, 246, 0.3)`,
      text: colors.secondary.blue,
    };
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      whileHover={{ y: -2 }}
      onClick={onClick}
    >
      <div
        className="recent-sheet-card"
        style={{
          background: colors.background.darkCard,
          border: `1px solid ${colors.border.primary}`,
          borderRadius: borderRadius.lg,
          padding: spacing[4],
          backdropFilter: 'blur(32px)',
          WebkitBackdropFilter: 'blur(32px)',
          boxShadow: colors.shadow.sm,
          cursor: 'pointer',
          transition: transitions.base,
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          minHeight: '140px',
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget;
          el.style.boxShadow = colors.shadow.md;
          el.style.borderColor = colors.primary.yellow;
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget;
          el.style.boxShadow = colors.shadow.sm;
          el.style.borderColor = colors.border.primary;
        }}
      >
        {/* Background gradient */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `radial-gradient(ellipse 100% 100% at 50% 0%, ${colors.primary.yellowLight} 0%, transparent 50%)`,
            opacity: 0.2,
            pointerEvents: 'none',
          }}
        />

        {/* Header with icon and title */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: spacing[3], marginBottom: spacing[2], position: 'relative', zIndex: 1 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: spacing[8],
              height: spacing[8],
              borderRadius: borderRadius.md,
              background: `linear-gradient(135deg, ${colors.primary.yellowLight} 0%, rgba(59, 130, 246, 0.1) 100%)`,
              border: `1px solid ${colors.border.primaryLight}`,
              flexShrink: 0,
            }}
          >
            <FileSpreadsheet
              size={20}
              style={{
                color: colors.primary.yellow,
              }}
              strokeWidth={1.5}
            />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <h4
              style={{
                fontSize: '0.9375rem',
                fontWeight: 600,
                color: colors.text.primary,
                margin: 0,
                lineHeight: 1.3,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {title}
            </h4>
          </div>

          {/* Delete button (visible on hover) */}
          {onDelete && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              whileHover={{ opacity: 1, scale: 1 }}
              onClick={(e) => {
                e.stopPropagation();
                onDelete(id);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: spacing[8],
                height: spacing[8],
                borderRadius: borderRadius.md,
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                cursor: 'pointer',
                transition: transitions.fast,
                opacity: 0,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
              }}
            >
              <Trash2 size={16} style={{ color: '#ef4444' }} />
            </motion.button>
          )}
        </div>

        {/* Date and status */}
        <div style={{ position: 'relative', zIndex: 1, marginBottom: statusTags.length > 0 ? spacing[2] : 0 }}>
          <p
            style={{
              fontSize: '0.75rem',
              color: colors.text.muted,
              margin: 0,
              lineHeight: 1.4,
            }}
          >
            {date}
          </p>
        </div>

        {/* Status tags */}
        {statusTags.length > 0 && (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: spacing[2],
              marginTop: 'auto',
              position: 'relative',
              zIndex: 1,
            }}
          >
            {statusTags.map((tag, index) => {
              const tagColors = getTagColors(tag.color);
              return (
                <span
                  key={index}
                  style={{
                    fontSize: '0.65rem',
                    fontWeight: 600,
                    padding: `${spacing[1]} ${spacing[2]}`,
                    borderRadius: borderRadius.sm,
                    background: tagColors.bg,
                    border: tagColors.border,
                    color: tagColors.text,
                    whiteSpace: 'nowrap',
                    lineHeight: 1,
                  }}
                >
                  {tag.label}
                </span>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
}
