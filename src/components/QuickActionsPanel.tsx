import { motion } from 'motion/react';
import { Plus, Download, Grid3x3, Zap, Settings, HelpCircle, TrendingUp, Star, X } from 'lucide-react';
import { spacing, borderRadius, transitions } from '../utils/designTokens';
import { useEffect } from 'react';

interface QuickActionsPanelProps {
  onNewSheet?: () => void;
  onImport?: () => void;
  onBrowseTemplates?: () => void;
  onClose?: () => void;
  recentSheetCount?: number;
  favoriteTemplateIds?: Set<string>;
  isDarkMode?: boolean;
}

// Template data for favorites display
const TEMPLATES_DATA = [
  { id: 'monthly-budget', name: 'Monthly Budget' },
  { id: 'attendance-tracker', name: 'Attendance Tracker' },
  { id: 'invoice', name: 'Invoice' },
  { id: 'project-tracker', name: 'Project Tracker' },
  { id: 'sales-tracker', name: 'Sales Tracker' },
];

export function QuickActionsPanel({
  onNewSheet,
  onImport,
  onBrowseTemplates,
  onClose,
  recentSheetCount = 0,
  favoriteTemplateIds = new Set(),
  isDarkMode = true,
}: QuickActionsPanelProps) {
  const favoriteCount = favoriteTemplateIds.size;
  const favoriteTemplates = TEMPLATES_DATA.filter(t => favoriteTemplateIds.has(t.id));
  
  // Force white color on all quick action buttons
  useEffect(() => {
    const buttons = document.querySelectorAll('.quick-action-btn');
    buttons.forEach(button => {
      (button as HTMLElement).style.setProperty('color', '#FFFFFF', 'important');
      button.querySelectorAll('*').forEach(child => {
        (child as HTMLElement).style.setProperty('color', '#FFFFFF', 'important');
      });
    });
  }, []);
  
  const stats = [
    { label: 'Favorites', value: favoriteCount, icon: Star },
    { label: 'Recent Sheets', value: recentSheetCount, icon: Download },
    { label: 'Features', value: 8, icon: Zap },
  ];

  // Theme tokens
  const themeColors = {
    background: 'var(--surface)',
    border: 'var(--border)',
    text: 'var(--text)',
    textSecondary: 'var(--muted)',
    surface: 'var(--surface-alt)',
    primary: 'var(--primary)',
    primarySoft: 'var(--primary-soft)',
    shadow: 'var(--shadow)',
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: spacing[6],
      }}
      className="quick-actions-panel"
    >
      {/* Quick Actions Section */}
      <div
        style={{
          padding: spacing[5],
          borderRadius: borderRadius.lg,
          background: themeColors.background,
          border: `1px solid ${themeColors.border}`,
          boxShadow: `${themeColors.shadow}, 0 0 40px rgba(255, 207, 64, 0.15), inset 0 0 60px rgba(255, 207, 64, 0.08)`,
          transition: 'background-color 0.25s, color 0.25s, border-color 0.25s, box-shadow 0.25s',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: spacing[4],
          }}
        >
          <h3
            style={{
              fontSize: '0.9375rem',
              fontWeight: 600,
              color: themeColors.text,
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: spacing[2],
              transition: 'color 0.25s',
            }}
          >
            <Zap size={16} strokeWidth={2.5} style={{ color: 'var(--primary)', filter: 'drop-shadow(0 2px 4px rgba(255, 207, 64, 0.3))' }} />
            Quick Actions
          </h3>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onClose?.()}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '24px',
              height: '24px',
              borderRadius: '6px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              cursor: 'pointer',
              transition: transitions.fast,
              padding: 0,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 207, 64, 0.3)';
              e.currentTarget.style.borderColor = 'rgba(255, 207, 64, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
            }}
          >
            <X size={14} strokeWidth={2.5} style={{ color: themeColors.text }} />
          </motion.button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[2] }}>
          {/* New Sheet Button */}
          <motion.button
            whileHover={{ x: 4 }}
            onClick={() => onNewSheet?.()}
            className="quick-action-btn"
            ref={(el) => {
              if (el) {
                el.style.setProperty('color', '#FFFFFF', 'important');
                el.querySelectorAll('*').forEach((child: any) => {
                  child.style.setProperty('color', '#FFFFFF', 'important');
                });
              }
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: spacing[3],
              padding: `${spacing[2]} ${spacing[3]}`,
              background: '#FFCF40',
              border: `1px solid rgba(255, 207, 64, 0.3)`,
              borderRadius: borderRadius.md,
              fontWeight: 600,
              fontSize: '0.875rem',
              cursor: 'pointer',
              transition: transitions.fast,
              color: '#000000',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255, 207, 64, 0.5)';
              e.currentTarget.style.boxShadow = '0 0 10px rgba(255, 207, 64, 0.2)';
              e.currentTarget.style.setProperty('color', '#000000', 'important');
              e.currentTarget.style.background = '#FFD700';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255, 207, 64, 0.3)';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.setProperty('color', '#000000', 'important');
              e.currentTarget.style.background = '#FFCF40';
            }}
          >
            <Plus size={16} strokeWidth={2.5} style={{ filter: 'drop-shadow(0 2px 4px rgba(255, 207, 64, 0.3))' }} /> <span style={{ color: '#000000' }}>New Sheet</span>
          </motion.button>

          {/* Import Button */}
          <motion.button
            whileHover={{ x: 4 }}
            onClick={() => onImport?.()}
            className="quick-action-btn"
            ref={(el) => {
              if (el) {
                el.style.setProperty('color', '#FFFFFF', 'important');
                el.querySelectorAll('*').forEach((child: any) => {
                  child.style.setProperty('color', '#FFFFFF', 'important');
                });
              }
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: spacing[3],
              padding: `${spacing[2]} ${spacing[3]}`,
              background: '#FFCF40',
              border: `1px solid rgba(255, 207, 64, 0.3)`,
              borderRadius: borderRadius.md,
              fontWeight: 600,
              fontSize: '0.875rem',
              cursor: 'pointer',
              transition: transitions.fast,
              color: '#000000',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255, 207, 64, 0.5)';
              e.currentTarget.style.setProperty('color', '#000000', 'important');
              e.currentTarget.style.background = '#FFD700';
              e.currentTarget.style.boxShadow = '0 0 10px rgba(255, 207, 64, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255, 207, 64, 0.3)';
              e.currentTarget.style.setProperty('color', '#000000', 'important');
              e.currentTarget.style.background = '#FFCF40';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <Download size={16} strokeWidth={2.5} style={{ filter: 'drop-shadow(0 2px 4px rgba(255, 207, 64, 0.3))' }} /> <span style={{ color: '#000000' }}>Import Sheet</span>
          </motion.button>

          {/* Browse Templates Button */}
          <motion.button
            whileHover={{ x: 4 }}
            onClick={() => onBrowseTemplates?.()}
            className="quick-action-btn"
            ref={(el) => {
              if (el) {
                el.style.setProperty('color', '#FFFFFF', 'important');
                el.querySelectorAll('*').forEach((child: any) => {
                  child.style.setProperty('color', '#FFFFFF', 'important');
                });
              }
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: spacing[3],
              padding: `${spacing[2]} ${spacing[3]}`,
              background: '#FFCF40',
              border: `1px solid rgba(255, 207, 64, 0.3)`,
              borderRadius: borderRadius.md,
              fontWeight: 600,
              fontSize: '0.875rem',
              cursor: 'pointer',
              transition: transitions.fast,
              color: '#000000',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255, 207, 64, 0.5)';
              e.currentTarget.style.setProperty('color', '#000000', 'important');
              e.currentTarget.style.background = '#FFD700';
              e.currentTarget.style.boxShadow = '0 0 10px rgba(255, 207, 64, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255, 207, 64, 0.3)';
              e.currentTarget.style.setProperty('color', '#000000', 'important');
              e.currentTarget.style.background = '#FFCF40';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <Grid3x3 size={16} strokeWidth={2.5} style={{ filter: 'drop-shadow(0 2px 4px rgba(255, 207, 64, 0.3))' }} /> <span style={{ color: '#000000' }}>Browse Templates</span>
          </motion.button>
        </div>
      </div>

      {/* Stats Section */}
      <div
        style={{
          padding: spacing[5],
          borderRadius: borderRadius.lg,
          background: themeColors.background,
          border: `1px solid ${themeColors.border}`,
          boxShadow: `${themeColors.shadow}, 0 0 40px rgba(255, 207, 64, 0.15), inset 0 0 60px rgba(255, 207, 64, 0.08)`,
          transition: 'background-color 0.25s, color 0.25s, border-color 0.25s, box-shadow 0.25s',
        }}
      >
        <h3
          style={{
            fontSize: '0.9375rem',
            fontWeight: 600,
            color: themeColors.text,
            margin: 0,
            marginBottom: spacing[3],
            display: 'flex',
            alignItems: 'center',
            gap: spacing[2],
          }}
        >
          <TrendingUp size={16} strokeWidth={2.5} style={{ color: 'var(--primary)', filter: 'drop-shadow(0 2px 4px rgba(255, 207, 64, 0.3))' }} />
          Activity
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[2] }}>
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 + index * 0.05 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: `${spacing[2]} 0`,
                  borderBottom:
                    index < stats.length - 1 ? `1px solid ${themeColors.border}` : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
                  <Icon size={14} strokeWidth={2.5} style={{ color: 'var(--primary)', filter: 'drop-shadow(0 2px 4px rgba(255, 207, 64, 0.3))' }} />
                  <span
                    style={{
                      fontSize: '0.75rem',
                      color: themeColors.textSecondary,
                      fontWeight: 500,
                    }}
                  >
                    {stat.label}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    color: 'var(--primary)',
                  }}
                >
                  {stat.value}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Favorites Section - Only show if there are favorites */}
      {favoriteTemplates.length > 0 && (
        <div
          style={{
            padding: spacing[5],
            borderRadius: borderRadius.lg,
            background: themeColors.background,
            border: `1px solid ${themeColors.border}`,
            boxShadow: `${themeColors.shadow}, 0 0 40px rgba(255, 207, 64, 0.15), inset 0 0 60px rgba(255, 207, 64, 0.08)`,
            transition: 'background-color 0.25s, color 0.25s, border-color 0.25s, box-shadow 0.25s',
          }}
        >
          <h3
            style={{
              fontSize: '0.9375rem',
              fontWeight: 600,
              color: themeColors.text,
              margin: 0,
              marginBottom: spacing[3],
              display: 'flex',
              alignItems: 'center',
              gap: spacing[2],
            }}
          >
            <Star size={16} strokeWidth={2.5} style={{ color: 'var(--primary)', filter: 'drop-shadow(0 2px 4px rgba(255, 207, 64, 0.3))' }} />
            Your Favorites
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[2] }}>
            {favoriteTemplates.map((template, index) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.05 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: `${spacing[2]} ${spacing[3]}`,
                  borderRadius: borderRadius.md,
                  background: 'var(--primary-soft)',
                  border: '1px solid var(--border)',
                }}
              >
                <span
                  style={{
                    fontSize: '0.875rem',
                    color: themeColors.text,
                    fontWeight: 500,
                  }}
                >
                  {template.name}
                </span>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: spacing[1],
                    padding: `${spacing[1]} ${spacing[2]}`,
                    borderRadius: borderRadius.md,
                    background: 'var(--primary)',
                    border: 'none',
                    color: 'var(--text)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: transitions.fast,
                  }}
                  onClick={() => {
                    // Trigger use template action
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '0.9';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '1';
                  }}
                >
                  Use
                </motion.button>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Tips Section */}
      <div
        style={{
          padding: spacing[4],
          borderRadius: borderRadius.lg,
          background: themeColors.surface,
          border: `1px solid var(--border)`,
          boxShadow: `${themeColors.shadow}, 0 0 40px rgba(255, 207, 64, 0.15), inset 0 0 60px rgba(255, 207, 64, 0.08)`,
          transition: 'background-color 0.25s, color 0.25s, border-color 0.25s, box-shadow 0.25s',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: spacing[3] }}>
          <HelpCircle size={16} strokeWidth={2.5} style={{ color: 'var(--primary)', marginTop: spacing[1], filter: 'drop-shadow(0 2px 4px rgba(255, 207, 64, 0.3))' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[1] }}>
            <h4
              style={{
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: themeColors.text,
                margin: 0,
                transition: 'color 0.25s',
              }}
            >
              Pro Tip
            </h4>
            <p
              style={{
                fontSize: '0.75rem',
                color: themeColors.textSecondary,
                margin: 0,
                lineHeight: 1.4,
                transition: 'color 0.25s',
              }}
            >
              Use templates to get started faster. They come pre-formatted with all the formulas
              and structure you need.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
