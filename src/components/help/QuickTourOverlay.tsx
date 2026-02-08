import { useState } from "react";
import { X, ChevronLeft, ChevronRight, Check, Sparkles, Calculator, Layout, Grid3x3, Palette, BarChart3, Users, Database, FileSpreadsheet, Trophy } from "lucide-react";
import { Button } from "../ui/button";
import { colors, spacing, borderRadius, transitions } from "../../utils/designTokens";
import logoImage from "../../assets/Logo.png";

interface QuickTourOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode?: boolean;
}

interface TourStep {
  title: string;
  description: string;
  icon: any;
  target?: string;
  position?: "top" | "bottom" | "left" | "right";
}

export function QuickTourOverlay({ isOpen, onClose, isDarkMode = false }: QuickTourOverlayProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const tourSteps: TourStep[] = [
    {
      title: "Welcome to EtherX Excel",
      description: "Let's take a quick tour of the main features. This will only take a minute.",
      icon: Sparkles
    },
    {
      title: "Formula Bar",
      description: "Enter formulas and functions here. Start with '=' to create a formula. We support 100+ Excel-compatible functions.",
      icon: Calculator,
      target: "formula-bar"
    },
    {
      title: "Ribbon Tabs",
      description: "All features are organized into tabs: Home for formatting, Insert for charts and shapes, View for display options, and Help for support.",
      icon: Layout,
      target: "ribbon-tabs"
    },
    {
      title: "Cell Grid",
      description: "Your data lives here. Click any cell to select it, double-click to edit, or drag to select multiple cells.",
      icon: Grid3x3,
      target: "cell-grid"
    },
    {
      title: "Formatting Tools",
      description: "Use the Home tab to format cells: change fonts, colors, alignment, number formats, and more.",
      icon: Palette,
      target: "home-tab"
    },
    {
      title: "Insert Charts",
      description: "Create beautiful visualizations from your data. Select cells and choose from bar, line, pie, scatter, and more chart types.",
      icon: BarChart3,
      target: "insert-tab"
    },
    {
      title: "Collaboration",
      description: "Click the share button to invite others. Generate view-only or edit links for real-time collaboration.",
      icon: Users,
      target: "collaboration-button"
    },
    {
      title: "Auto-Save to IPFS",
      description: "Your work is automatically saved to IPFS (decentralized storage) every 30 seconds. Watch the status indicator in the top right.",
      icon: Database,
      target: "save-status"
    },
    {
      title: "Templates",
      description: "Start fast with pre-built templates for budgets, invoices, project tracking, and more. Click 'Templates' in the dashboard.",
      icon: FileSpreadsheet,
      target: "templates"
    },
    {
      title: "You're All Set",
      description: "You now know the basics. Explore the Help tab anytime for detailed guides, keyboard shortcuts, and support.",
      icon: Trophy
    }
  ];

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  if (!isOpen) return null;

  const step = tourSteps[currentStep];
  const IconComponent = step.icon;

  return (
    <div 
      className="fixed inset-0 z-50"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      {/* Tour Card */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90%',
          maxWidth: '650px',
          background: isDarkMode
            ? 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)'
            : 'linear-gradient(135deg, #ffffff 0%, #fafafa 100%)',
          borderRadius: '4px',
          border: `2px solid ${colors.primary.yellow}`,
          boxShadow: `0 25px 70px rgba(0, 0, 0, 0.6), 0 0 0 1px ${colors.primary.yellow}20, 0 0 40px ${colors.primary.yellowGlow}`,
          overflow: 'hidden',
        }}
      >
        {/* Header with Yellow Accent */}
        <div
          style={{
            background: `linear-gradient(90deg, ${colors.primary.yellow} 0%, ${colors.primary.yellowHover} 100%)`,
            padding: `${spacing[3]} ${spacing[5]}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing[1] }}>
              {tourSteps.map((_, idx) => (
                <div
                  key={idx}
                  style={{
                    height: '6px',
                    borderRadius: '1px',
                    transition: transitions.fast,
                    width: idx === currentStep ? '28px' : '6px',
                    background:
                      idx === currentStep
                        ? '#000000'
                        : idx < currentStep
                        ? '#059669'
                        : 'rgba(0, 0, 0, 0.25)',
                  }}
                />
              ))}
            </div>
            <span
              style={{
                fontSize: '13px',
                fontWeight: '700',
                color: '#000000',
                letterSpacing: '0.5px',
              }}
            >
              {currentStep + 1} / {tourSteps.length}
            </span>
          </div>
          <button
            onClick={handleSkip}
            style={{
              background: 'rgba(0, 0, 0, 0.1)',
              border: 'none',
              cursor: 'pointer',
              padding: spacing[1],
              borderRadius: '2px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#000000',
              transition: transitions.fast,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(0, 0, 0, 0.2)';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(0, 0, 0, 0.1)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: `${spacing[7]} ${spacing[6]}`, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          {/* Icon or Logo */}
          {currentStep === 0 ? (
            // Show logo for the first step
            <div
              style={{
                width: '140px',
                height: '64px',
                marginBottom: spacing[4],
              }}
            >
              <img 
                src={logoImage} 
                alt="EtherX Excel" 
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'contain',
                }} 
              />
            </div>
          ) : (
            // Show icon for other steps
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '4px',
                background: `linear-gradient(135deg, ${colors.primary.yellow} 0%, ${colors.primary.yellowHover} 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: spacing[4],
                boxShadow: `0 8px 24px ${colors.primary.yellowGlow}`,
              }}
            >
              <IconComponent size={32} strokeWidth={2} color="#000000" />
            </div>
          )}

          <h2
            style={{
              fontSize: '22px',
              fontWeight: '700',
              marginBottom: spacing[3],
              color: isDarkMode ? '#ffffff' : '#000000',
              letterSpacing: '-0.5px',
            }}
          >
            {step.title}
          </h2>
          <p
            style={{
              fontSize: '14px',
              lineHeight: '1.6',
              color: isDarkMode ? 'rgba(255, 255, 255, 0.75)' : 'rgba(0, 0, 0, 0.65)',
              maxWidth: '480px',
            }}
          >
            {step.description}
          </p>
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: `${spacing[4]} ${spacing[5]}`,
            borderTop: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'}`,
            gap: spacing[3],
          }}
        >
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            style={{
              padding: `${spacing[2]} ${spacing[5]}`,
              background: 'transparent',
              border: `1.5px solid ${currentStep === 0 
                ? (isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)')
                : (isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)')}`,
              borderRadius: '2px',
              color: isDarkMode ? '#ffffff' : '#000000',
              fontSize: '11px',
              fontWeight: '600',
              cursor: currentStep === 0 ? 'not-allowed' : 'pointer',
              opacity: currentStep === 0 ? 0.4 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: spacing[1],
              transition: 'all 0.2s ease',
              letterSpacing: '0.3px',
            }}
            onMouseEnter={(e) => {
              if (currentStep !== 0) {
                e.currentTarget.style.background = isDarkMode
                  ? 'rgba(255, 207, 64, 0.1)'
                  : 'rgba(255, 207, 64, 0.15)';
                e.currentTarget.style.borderColor = colors.primary.yellow;
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.color = isDarkMode ? colors.primary.yellow : '#000000';
              }
            }}
            onMouseLeave={(e) => {
              if (currentStep !== 0) {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.borderColor = isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.color = isDarkMode ? '#ffffff' : '#000000';
              }
            }}
          >
            <ChevronLeft size={16} strokeWidth={2.5} />
            PREVIOUS
          </button>

          <button
            onClick={handleSkip}
            style={{
              padding: `${spacing[2]} ${spacing[4]}`,
              background: 'transparent',
              border: 'none',
              color: isDarkMode ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              letterSpacing: '0.3px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = colors.primary.yellow;
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = isDarkMode
                ? 'rgba(255, 255, 255, 0.4)'
                : 'rgba(0, 0, 0, 0.4)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            SKIP TOUR
          </button>

          <button
            onClick={handleNext}
            style={{
              padding: `${spacing[2]} ${spacing[5]}`,
              background: `linear-gradient(135deg, ${colors.primary.yellow} 0%, ${colors.primary.yellowHover} 100%)`,
              border: 'none',
              borderRadius: '2px',
              color: '#000000',
              fontSize: '11px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: spacing[1],
              transition: 'all 0.2s ease',
              letterSpacing: '0.5px',
              boxShadow: `0 4px 12px ${colors.primary.yellowGlow}`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = `0 8px 24px ${colors.primary.yellowGlow}`;
              e.currentTarget.style.background = `linear-gradient(135deg, ${colors.primary.yellowHover} 0%, #d4a200 100%)`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = `0 4px 12px ${colors.primary.yellowGlow}`;
              e.currentTarget.style.background = `linear-gradient(135deg, ${colors.primary.yellow} 0%, ${colors.primary.yellowHover} 100%)`;
            }}
          >
            {currentStep === tourSteps.length - 1 ? (
              <>
                <Check size={16} strokeWidth={2.5} />
                FINISH
              </>
            ) : (
              <>
                NEXT
                <ChevronRight size={16} strokeWidth={2.5} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
