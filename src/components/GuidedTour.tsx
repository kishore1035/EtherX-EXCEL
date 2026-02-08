import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import {
  ArrowRight,
  ArrowLeft,
  X,
  Sparkles,
  Check,
} from "lucide-react";

interface TourStep {
  id: string;
  title: string;
  description: string;
  target: string; // CSS selector for element to highlight
  position: "top" | "bottom" | "left" | "right";
  action?: "type" | "click" | "none";
  actionTarget?: string;
  expectedValue?: string;
}

interface GuidedTourProps {
  active: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

const tourSteps: TourStep[] = [
  {
    id: "step1",
    title: "Welcome to the Grid!",
    description: "This is your spreadsheet. Each box is called a 'cell' where you can enter data.",
    target: "[data-cell-id='A1']",
    position: "right",
    action: "none",
  },
  {
    id: "step2",
    title: "Select a Cell",
    description: "Click on cell A1 to select it. You'll see it highlighted with a border.",
    target: "[data-cell-id='A1']",
    position: "right",
    action: "click",
    actionTarget: "[data-cell-id='A1']",
  },
  {
    id: "step3",
    title: "Type a Number",
    description: "Great! Now type the number '100' in this cell and press Enter.",
    target: "[data-cell-id='A1']",
    position: "right",
    action: "type",
    expectedValue: "100",
  },
  {
    id: "step4",
    title: "Add More Numbers",
    description: "Now click cell A2 and type '200', then press Enter.",
    target: "[data-cell-id='A2']",
    position: "right",
    action: "type",
    expectedValue: "200",
  },
  {
    id: "step5",
    title: "The Formula Bar",
    description: "This is the formula bar. You'll use it to create calculations and formulas.",
    target: "[data-tour-formula-bar]",
    position: "bottom",
    action: "none",
  },
  {
    id: "step6",
    title: "Use AutoSum",
    description: "Click the AutoSum button (Σ) in the toolbar to automatically sum your numbers!",
    target: "[data-tour-autosum]",
    position: "bottom",
    action: "click",
    actionTarget: "[data-tour-autosum]",
  },
];

export function GuidedTour({ active, onComplete, onSkip }: GuidedTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [highlightPosition, setHighlightPosition] = useState({ top: 0, left: 0, width: 0, height: 0 });

  const step = tourSteps[currentStep];
  const progress = ((currentStep + 1) / tourSteps.length) * 100;

  useEffect(() => {
    if (!active || !step) return;

    // Find and highlight the target element
    const targetElement = document.querySelector(step.target);
    if (targetElement) {
      const rect = targetElement.getBoundingClientRect();
      setHighlightPosition({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      });

      // Scroll element into view
      targetElement.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [active, currentStep, step]);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setCompleted(true);
      setTimeout(() => {
        onComplete();
      }, 1500);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (!active || !step) return null;

  if (completed) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/95 backdrop-blur-sm">
        <div className="text-center animate-in zoom-in duration-500">
          <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6" style={{background: 'linear-gradient(135deg, #FFFACD 0%, #FFD700 25%, #FFFACD 50%, #FFD700 75%, #FFFACD 100%)'}}>
            <Check className="w-12 h-12 text-black" />
          </div>
          <h2 className="text-3xl font-bold mb-3">Congratulations! 🎉</h2>
          <p className="text-lg text-muted-foreground mb-6">
            You've completed the guided tour!
          </p>
          <Badge className="text-lg px-6 py-2">
            <Trophy className="w-5 h-5 mr-2" />
            First Steps Badge Unlocked
          </Badge>
        </div>
      </div>
    );
  }

  // Get tooltip position
  const getTooltipStyle = () => {
    const padding = 20;
    const tooltipWidth = 400;
    const tooltipHeight = 200;

    switch (step.position) {
      case "right":
        return {
          top: highlightPosition.top,
          left: highlightPosition.left + highlightPosition.width + padding,
        };
      case "bottom":
        return {
          top: highlightPosition.top + highlightPosition.height + padding,
          left: highlightPosition.left,
        };
      case "left":
        return {
          top: highlightPosition.top,
          left: highlightPosition.left - tooltipWidth - padding,
        };
      case "top":
        return {
          top: highlightPosition.top - tooltipHeight - padding,
          left: highlightPosition.left,
        };
      default:
        return { top: 0, left: 0 };
    }
  };

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-[90] bg-background/80 backdrop-blur-sm" />

      {/* Highlight cutout */}
      <div
        className="fixed z-[95] pointer-events-none"
        style={{
          top: highlightPosition.top - 4,
          left: highlightPosition.left - 4,
          width: highlightPosition.width + 8,
          height: highlightPosition.height + 8,
        }}
      >
        <div className="absolute inset-0 rounded-lg border-4 border-blue-500 shadow-2xl animate-pulse" />
        <div className="absolute inset-0 rounded-lg bg-blue-500/10" />
      </div>

      {/* Tooltip */}
      <div
        className="fixed z-[100] w-[400px] animate-in fade-in slide-in-from-bottom-4 duration-300"
        style={getTooltipStyle()}
      >
        <div className="bg-card border-2 border-border rounded-xl shadow-2xl p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{background: 'linear-gradient(135deg, #FFFACD 0%, #FFD700 25%, #FFFACD 50%, #FFD700 75%, #FFFACD 100%)'}}>
                <Sparkles className="w-4 h-4 text-black" />
              </div>
              <Badge variant="secondary" className="text-xs">
                Step {currentStep + 1} of {tourSteps.length}
              </Badge>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onSkip}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Progress */}
          <Progress value={progress} className="mb-4 h-1.5" />

          {/* Content */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">{step.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {step.description}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </Button>
            <Button size="sm" onClick={handleNext} className="gap-2">
              {currentStep === tourSteps.length - 1 ? "Finish" : "Next"}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

function Trophy({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  );
}
