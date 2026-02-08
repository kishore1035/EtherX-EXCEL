/**
 * Icon Replacement Guide for 3D Neumorphic Icons
 * 
 * This file provides guidance on replacing flat icons with 3D neumorphic icons
 * across the entire application.
 * 
 * PATTERN REPLACEMENTS:
 * 
 * 1. Simple Icon in JSX:
 *    BEFORE: <Save className="w-4 h-4" />
 *    AFTER:  <Icon3D icon={Save} size="sm" variant="primary" glowIntensity="subtle" />
 * 
 * 2. Icon with Color:
 *    BEFORE: <Trash2 className="w-4 h-4 text-red-500" />
 *    AFTER:  <Icon3D icon={Trash2} size="sm" variant="danger" glowIntensity="medium" />
 * 
 * 3. Icon in Button:
 *    BEFORE: <Button><Save className="w-4 h-4" />Save</Button>
 *    AFTER:  <Button><Icon3D icon={Save} size="sm" variant="primary" />Save</Button>
 * 
 * 4. Standalone Icon Button:
 *    BEFORE: <button><Undo className="w-4 h-4" /></button>
 *    AFTER:  <IconButton3D icon={Undo} size="sm" variant="default" onClick={...} />
 * 
 * 5. Icon with Badge/Count:
 *    BEFORE: <div><Bell className="w-5 h-5" /><span>5</span></div>
 *    AFTER:  <IconBadge3D icon={Bell} size="md" variant="info" count={5} />
 * 
 * 6. Icon with Label:
 *    BEFORE: <div><Settings className="w-4 h-4" /><span>Settings</span></div>
 *    AFTER:  <IconContainer3D icon={Settings} size="sm" variant="default" label="Settings" />
 * 
 * VARIANT MAPPING:
 * - default: Purple/indigo gradient (general purpose)
 * - primary: Blue gradient (primary actions, save, confirm)
 * - success: Green gradient (success states, checkmarks, complete)
 * - warning: Orange/amber gradient (warnings, alerts, sun/moon)
 * - danger: Red gradient (delete, error, critical actions)
 * - info: Cyan gradient (information, help, neutral actions)
 * 
 * SIZE MAPPING:
 * - className="w-3 h-3" → size="sm" (16px)
 * - className="w-4 h-4" → size="sm" (16px)
 * - className="w-5 h-5" → size="md" (20px)
 * - className="w-6 h-6" → size="lg" (24px)
 * - className="w-8 h-8" → size="xl" (32px)
 * - className="w-10 h-10" → size="2xl" (40px)
 * 
 * GLOW INTENSITY:
 * - none: No glow effect
 * - subtle: Minimal glow (buttons, subtle indicators)
 * - medium: Moderate glow (default for most icons)
 * - strong: Strong glow (emphasis, active states)
 * 
 * ICON SEMANTIC MAPPING:
 * 
 * Navigation & Actions:
 * - Save, Download, Upload → variant="primary"
 * - Delete, Trash, Remove → variant="danger"
 * - Edit, Pencil, Settings → variant="default"
 * - Info, Help, Question → variant="info"
 * - Check, Success, Complete → variant="success"
 * - Warning, Alert, Error → variant="warning"
 * 
 * UI Elements:
 * - Sun, Moon → variant="warning"
 * - Bell, Notification → variant="info"
 * - User, Profile → variant="primary"
 * - Search, Filter → variant="default"
 * - Plus, Add → variant="primary"
 * - Minus, Remove → variant="danger"
 * 
 * Data & Charts:
 * - Chart, Graph, Analytics → variant="info"
 * - Table, Database → variant="default"
 * - File, Document → variant="primary"
 * 
 * COMPONENTS TO UPDATE:
 * 
 * ✅ Header.tsx - DONE
 * ✅ Dashboard.tsx - DONE
 * ⏳ LoginPage.tsx - IN PROGRESS
 * ⏳ SignupPage.tsx - IN PROGRESS
 * ⏳ ForgotPasswordPage.tsx - IN PROGRESS
 * ❌ FormulaBar.tsx
 * ❌ RibbonTabs.tsx
 * ❌ NotificationCenter.tsx
 * ❌ ProfileMenu.tsx
 * ❌ Templates.tsx
 * ❌ ExportDialog.tsx
 * ❌ ImportDialog.tsx
 * ❌ ChartDialog.tsx
 * ❌ FindReplace.tsx
 * ❌ NamedRanges.tsx
 * ❌ Hyperlinks.tsx
 * ❌ ImageInsert.tsx
 * ❌ All Ribbon Tabs (Home, Insert, Formulas, View, Review)
 * ❌ All UI Components (buttons, dialogs, modals)
 * 
 * USAGE EXAMPLES:
 * 
 * import { Icon3D, IconButton3D, IconBadge3D, IconContainer3D } from './ui/Icon3D';
 * import { Save, Trash2, Settings, Bell } from 'lucide-react';
 * 
 * // Simple icon
 * <Icon3D icon={Save} size="md" variant="primary" glowIntensity="medium" />
 * 
 * // Interactive button
 * <IconButton3D 
 *   icon={Trash2} 
 *   size="sm" 
 *   variant="danger" 
 *   onClick={handleDelete}
 *   tooltip="Delete item"
 * />
 * 
 * // Badge with count
 * <IconBadge3D 
 *   icon={Bell} 
 *   size="md" 
 *   variant="info" 
 *   count={5}
 *   pulse={true}
 * />
 * 
 * // Icon with label
 * <IconContainer3D 
 *   icon={Settings} 
 *   size="sm" 
 *   variant="default" 
 *   label="Settings"
 * />
 */

export const ICON_REPLACEMENT_GUIDE = {
  components: {
    Icon3D: 'Basic 3D icon with gradient and glow',
    IconButton3D: 'Interactive button with neumorphic styling',
    IconBadge3D: 'Icon with notification badge/count',
    IconContainer3D: 'Pill-shaped container with icon and label',
  },
  
  variants: {
    default: { colors: ['#6366f1', '#8b5cf6'], use: 'General purpose' },
    primary: { colors: ['#3b82f6', '#2563eb'], use: 'Primary actions' },
    success: { colors: ['#10b981', '#059669'], use: 'Success states' },
    warning: { colors: ['#f59e0b', '#d97706'], use: 'Warnings, alerts' },
    danger: { colors: ['#ef4444', '#dc2626'], use: 'Delete, errors' },
    info: { colors: ['#06b6d4', '#0891b2'], use: 'Information' },
  },
  
  sizes: {
    sm: '16px',
    md: '20px',
    lg: '24px',
    xl: '32px',
    '2xl': '40px',
  },
  
  glowIntensity: {
    none: 'No glow',
    subtle: 'Minimal glow',
    medium: 'Moderate glow',
    strong: 'Strong glow',
  },
};

export default ICON_REPLACEMENT_GUIDE;
