import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LayoutGrid, FileText, Clock, Trash2, Settings, Menu, X } from 'lucide-react';
import { colors, spacing, borderRadius, transitions } from '../utils/designTokens';

interface SidebarNavProps {
  activeItem?: string;
  onNavigate?: (item: string) => void;
  isDarkMode?: boolean;
}

export function SidebarNav({ activeItem = 'dashboard', onNavigate, isDarkMode = true }: SidebarNavProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
    { id: 'templates', label: 'Templates', icon: FileText },
    { id: 'recent', label: 'Recent Sheets', icon: Clock },
    { id: 'trash', label: 'Trash', icon: Trash2 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleItemClick = (id: string) => {
    onNavigate?.(id);
    setMobileOpen(false);
  };

  const SidebarContent = () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: spacing[2],
        padding: spacing[4],
      }}
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeItem === item.id;

        return (
          <motion.button
            key={item.id}
            onClick={() => handleItemClick(item.id)}
            whileHover={{ x: 4 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: spacing[3],
              padding: `${spacing[2]} ${spacing[3]}`,
              borderRadius: borderRadius.md,
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor: isActive ? colors.primary.yellow : 'transparent',
              background: isActive ? `rgba(255, 207, 64, 0.1)` : 'transparent',
              color: isActive ? colors.primary.yellow : colors.text.secondary,
              fontSize: '0.875rem',
              fontWeight: 500,
              cursor: 'pointer',
              transition: transitions.base,
              width: '100%',
              textAlign: 'left',
              textDecoration: 'none',
              outline: 'none',
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.borderColor = colors.border.primaryLight;
                e.currentTarget.style.background = colors.border.primary;
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.currentTarget.style.borderColor = 'transparent';
                e.currentTarget.style.background = 'transparent';
              }
            }}
          >
            <Icon size={18} strokeWidth={1.5} />
            <span>{item.label}</span>
          </motion.button>
        );
      })}
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="hidden md:flex md:flex-col"
        style={{
          width: '200px',
          background: `linear-gradient(180deg, rgba(10, 10, 10, 0.9) 0%, rgba(15, 15, 15, 0.8) 100%)`,
          border: `1px solid ${colors.border.primary}`,
          borderRadius: borderRadius.lg,
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          boxShadow: colors.shadow.sm,
          height: 'fit-content',
          position: 'sticky',
          top: spacing[8],
        }}
      >
        <SidebarContent />
      </motion.div>

      {/* Mobile Menu Button */}
      <button
        className="md:hidden fixed top-20 left-4 z-50"
        onClick={() => setMobileOpen(!mobileOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: spacing[10],
          height: spacing[10],
          borderRadius: borderRadius.md,
          background: colors.border.secondary,
          border: `1px solid ${colors.border.primaryLight}`,
          color: colors.text.primary,
          cursor: 'pointer',
          transition: transitions.base,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = colors.primary.yellow;
          e.currentTarget.style.background = colors.border.primary;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = colors.border.primaryLight;
          e.currentTarget.style.background = colors.border.secondary;
        }}
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0, 0, 0, 0.5)',
                zIndex: 40,
              }}
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              style={{
                position: 'fixed',
                left: 0,
                top: 0,
                bottom: 0,
                width: '280px',
                background: `linear-gradient(180deg, rgba(10, 10, 10, 0.95) 0%, rgba(15, 15, 15, 0.9) 100%)`,
                border: `1px solid ${colors.border.primary}`,
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                zIndex: 41,
                paddingTop: spacing[12],
              }}
            >
              <SidebarContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
