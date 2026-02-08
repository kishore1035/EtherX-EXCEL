import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { colors, spacing, borderRadius, transitions } from '../utils/designTokens';
import { useTheme } from '../contexts/ThemeContext';

interface Template {
  id: string;
  name: string;
  description: string;
  icon?: string;
}

interface PinnedTemplatesRowProps {
  onUseTemplate?: (templateId: string) => void;
  onViewAll?: () => void;
  favoriteTemplateIds?: Set<string>;
  onToggleFavorite?: (templateId: string) => void;
}

export function PinnedTemplatesRow({ 
  onUseTemplate, 
  onViewAll,
  favoriteTemplateIds = new Set(),
  onToggleFavorite,
}: PinnedTemplatesRowProps) {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const pinnedTemplates: Template[] = [
    {
      id: 'budget',
      name: 'Monthly Budget',
      description: 'Track income and expenses',
    },
    {
      id: 'attendance',
      name: 'Attendance Tracker',
      description: 'Manage attendance records',
    },
    {
      id: 'invoice',
      name: 'Invoice',
      description: 'Create professional invoices',
    },
    {
      id: 'project',
      name: 'Project Tracker',
      description: 'Organize tasks and timeline',
    },
    {
      id: 'sales',
      name: 'Sales Tracker',
      description: 'Monitor sales performance',
    },
    {
      id: 'inventory',
      name: 'Inventory Manager',
      description: 'Track stock and supplies',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.25 }}
      style={{ marginBottom: spacing[12] }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: spacing[4],
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
          <img src="/icons/3d/star.svg" alt="Star" style={{ width: '20px', height: '20px' }} />
          <h3
            style={{
              fontSize: '1.125rem',
              fontWeight: 600,
              color: colors.text.primary,
              margin: 0,
            }}
          >
            Recommended Templates
          </h3>
        </div>
        <button
          onClick={() => onViewAll?.()}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: spacing[1],
            padding: `${spacing[1]} ${spacing[2]}`,
            fontSize: '0.75rem',
            color: colors.primary.yellow,
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            transition: transitions.fast,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '0.8';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '1';
          }}
        >
          View all <ArrowRight size={14} />
        </button>
      </div>

      {/* Horizontal Scroll Container */}
      <div
        style={{
          display: 'flex',
          gap: spacing[4],
          overflowX: 'auto',
          paddingBottom: spacing[2],
          scrollBehavior: 'smooth',
          scrollbarWidth: 'thin',
          scrollbarColor: `${colors.border.primary} transparent`,
        }}
        className="hide-scrollbar"
      >
        {pinnedTemplates.map((template, index) => (
          <motion.div
            key={template.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + index * 0.05 }}
            style={{
              flex: '0 0 240px',
              minWidth: '240px',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                padding: spacing[4],
                borderRadius: borderRadius.lg,
                background: 'var(--surface)', // always use theme surface
                  border: '1px solid var(--border)',
                  boxShadow: 'var(--shadow)',
                transition: transitions.base,
                cursor: 'pointer',
                position: 'relative',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = colors.primary.yellow;
                e.currentTarget.style.boxShadow = isDarkMode ? '0 4px 16px 0 rgba(0,0,0,0.28)' : colors.shadow.md;
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.boxShadow = isDarkMode ? '0 2px 8px 0 rgba(0,0,0,0.18)' : colors.shadow.sm;
                (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
              }}
            >
              {/* Icon/Badge */}
              <div
                style={{
                  width: spacing[10],
                  height: spacing[10],
                  borderRadius: borderRadius.md,
                  background: `linear-gradient(135deg, ${colors.primary.yellowLight} 0%, rgba(59, 130, 246, 0.1) 100%)`,
                  border: '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: spacing[3],
                }}
              >
                <img src="/icons/3d/star.svg" alt="Template" style={{ width: '20px', height: '20px' }} />
              </div>

              {/* Content */}
              <h4
                style={{
                  fontSize: '0.9375rem',
                  fontWeight: 600,
                  color: 'var(--text)',
                  margin: 0,
                  marginBottom: spacing[1],
                  lineHeight: 1.2,
                }}
              >
                {template.name}
              </h4>
              <p
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--muted)',
                  margin: 0,
                  marginBottom: spacing[3],
                  lineHeight: 1.4,
                  flex: 1,
                }}
              >
                {template.description}
              </p>

              {/* Button */}
              <button
                onClick={() => onUseTemplate?.(template.id)}
                style={{
                  padding: `${spacing[1]} ${spacing[3]}`,
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: '#0a0a0a',
                  background: colors.primary.yellow,
                  border: 'none',
                  borderRadius: borderRadius.md,
                  cursor: 'pointer',
                  transition: transitions.fast,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = colors.primary.yellowHover;
                  e.currentTarget.style.boxShadow = colors.shadow.buttonHover;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = colors.primary.yellow;
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                Use Template
              </button>

              {/* Add to Favorite Button */}
              <button
                className="favorite-button-white-text"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite?.(template.id);
                }}
                style={{
                  marginTop: spacing[2],
                  padding: `${spacing[1]} ${spacing[3]}`,
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  color: '#000000',
                  background: '#FFCF40',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: borderRadius.md,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: spacing[1],
                  transition: transitions.fast,
                  WebkitTextFillColor: '#000000',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#FFD700';
                  e.currentTarget.style.opacity = '0.9';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#FFCF40';
                  e.currentTarget.style.opacity = '1';
                }}
              >
                <img 
                  src="/icons/3d/star.svg" 
                  alt="Favorite" 
                  style={{
                    width: '12px',
                    height: '12px',
                    opacity: favoriteTemplateIds.has(template.id) ? '1' : '0.7',
                  }}
                />
                <span style={{ color: '#000000' }}>
                  {favoriteTemplateIds.has(template.id) ? 'Remove from Favorites' : 'Add to Favorites'}
                </span>
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <style>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .favorite-button-white-text,
        .favorite-button-white-text *,
        .favorite-button-white-text span {
          color: #000000 !important;
          -webkit-text-fill-color: #000000 !important;
        }
      `}</style>
    </motion.div>
  );
}
