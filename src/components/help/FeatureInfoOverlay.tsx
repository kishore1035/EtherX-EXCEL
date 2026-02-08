import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { colors, spacing } from "../../utils/designTokens";

interface FeatureStep {
  title: string;
  description: string;
  icon: any;
  benefits?: string[];
  howTo?: string[];
}

interface FeatureInfoOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  featureTitle: string;
  steps: FeatureStep[];
  isDarkMode?: boolean;
}

export function FeatureInfoOverlay({
  isOpen,
  onClose,
  featureTitle,
  steps,
  isDarkMode = false,
}: FeatureInfoOverlayProps) {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const step = steps[currentStep];
  const IconComponent = step.icon;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
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

  return (
    <div
      className="fixed inset-0 z-50"
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
    >
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "90%",
          maxWidth: "550px",
          background: isDarkMode
            ? "linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)"
            : "linear-gradient(135deg, #ffffff 0%, #fafafa 100%)",
          borderRadius: "4px",
          border: `2px solid ${colors.primary.yellow}`,
          boxShadow: `0 25px 70px rgba(0, 0, 0, 0.6), 0 0 0 1px ${colors.primary.yellow}20, 0 0 40px ${colors.primary.yellowGlow}`,
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            background: `linear-gradient(90deg, ${colors.primary.yellow} 0%, ${colors.primary.yellowHover} 100%)`,
            padding: `${spacing[2]} ${spacing[4]}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: spacing[2] }}>
            <div style={{ display: "flex", alignItems: "center", gap: spacing[1] }}>
              {steps.map((_, idx) => (
                <div
                  key={idx}
                  style={{
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                    backgroundColor: idx === currentStep ? "#000" : "rgba(0,0,0,0.2)",
                    transition: "all 0.3s ease",
                  }}
                />
              ))}
            </div>
            <span style={{ fontSize: "14px", fontWeight: 600, color: "#000" }}>
              {featureTitle}
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "#000",
              padding: spacing[1],
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: spacing[4] }}>
          <div style={{ textAlign: "center", marginBottom: spacing[3] }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                background: `linear-gradient(135deg, ${colors.primary.yellow} 0%, ${colors.primary.yellowHover} 100%)`,
                marginBottom: spacing[3],
                boxShadow: `0 8px 24px ${colors.primary.yellowGlow}`,
              }}
            >
              <IconComponent size={32} color="#000" />
            </div>
            <h2
              style={{
                fontSize: "22px",
                fontWeight: 700,
                color: isDarkMode ? "#fff" : "#000",
                marginBottom: spacing[2],
              }}
            >
              {step.title}
            </h2>
            <p
              style={{
                fontSize: "14px",
                lineHeight: "1.5",
                color: isDarkMode ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.6)",
                maxWidth: "500px",
                margin: "0 auto",
              }}
            >
              {step.description}
            </p>
          </div>

          {/* Benefits Section */}
          {step.benefits && step.benefits.length > 0 && (
            <div style={{ marginBottom: spacing[4] }}>
              <h3
                style={{
                  fontSize: "16px",
                  fontWeight: 600,
                  color: isDarkMode ? "#fff" : "#000",
                  marginBottom: spacing[2],
                }}
              >
                ✨ Benefits
              </h3>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {step.benefits.map((benefit, idx) => (
                  <li
                    key={idx}
                    style={{
                      fontSize: "13px",
                      color: isDarkMode ? "rgba(255,255,255,0.8)" : "rgba(0,0,0,0.7)",
                      marginBottom: spacing[1],
                      paddingLeft: spacing[4],
                      position: "relative",
                    }}
                  >
                    <span
                      style={{
                        position: "absolute",
                        left: 0,
                        color: colors.primary.yellow,
                        fontWeight: "bold",
                      }}
                    >
                      •
                    </span>
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* How To Section */}
          {step.howTo && step.howTo.length > 0 && (
            <div>
              <h3
                style={{
                  fontSize: "18px",
                  fontWeight: 600,
                  color: isDarkMode ? "#fff" : "#000",
                  marginBottom: spacing[3],
                }}
              >
                📝 How to Use
              </h3>
              <ol style={{ padding: 0, margin: 0, paddingLeft: spacing[4] }}>
                {step.howTo.map((instruction, idx) => (
                  <li
                    key={idx}
                    style={{
                      fontSize: "14px",
                      color: isDarkMode ? "rgba(255,255,255,0.8)" : "rgba(0,0,0,0.7)",
                      marginBottom: spacing[2],
                      lineHeight: "1.5",
                    }}
                  >
                    {instruction}
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: spacing[4],
            borderTop: `1px solid ${isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            style={{
              padding: `${spacing[2]} ${spacing[4]}`,
              background: currentStep === 0 ? "rgba(128,128,128,0.2)" : "#fff",
              border: `1px solid ${isDarkMode ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.1)"}`,
              borderRadius: "4px",
              cursor: currentStep === 0 ? "not-allowed" : "pointer",
              fontSize: "14px",
              fontWeight: 500,
              color: currentStep === 0 ? "#999" : "#000",
              display: "flex",
              alignItems: "center",
              gap: spacing[1],
            }}
          >
            <ChevronLeft size={16} />
            Previous
          </button>

          <span
            style={{
              fontSize: "14px",
              color: isDarkMode ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.5)",
            }}
          >
            {currentStep + 1} of {steps.length}
          </span>

          <button
            onClick={handleNext}
            style={{
              padding: `${spacing[2]} ${spacing[4]}`,
              background: `linear-gradient(90deg, ${colors.primary.yellow} 0%, ${colors.primary.yellowHover} 100%)`,
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: 600,
              color: "#000",
              display: "flex",
              alignItems: "center",
              gap: spacing[1],
              boxShadow: `0 4px 12px ${colors.primary.yellowGlow}`,
            }}
          >
            {currentStep === steps.length - 1 ? "Done" : "Next"}
            {currentStep < steps.length - 1 && <ChevronRight size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
}
