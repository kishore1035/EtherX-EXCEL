import { useState } from "react";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import {
  Sparkles,
  Palette,
  CheckSquare,
  Link,
  Users,
} from "lucide-react";
import { QuickTourOverlay } from "../help/QuickTourOverlay";
import { FeatureInfoOverlay } from "../help/FeatureInfoOverlay";
import { trackHelpAction } from "../../services/helpService";
import {
  conditionalFormattingSteps,
  dataValidationSteps,
  linksSteps,
  collaborationSteps
} from "../help/featureContent";

interface HelpTabProps {
  isDarkMode?: boolean;
  userId?: string;
  spreadsheetId?: string;
}

export function HelpTab({ isDarkMode = false, userId = "guest", spreadsheetId = "" }: HelpTabProps) {
  const [showQuickTour, setShowQuickTour] = useState(false);
  const [showConditionalFormattingInfo, setShowConditionalFormattingInfo] = useState(false);
  const [showDataValidationInfo, setShowDataValidationInfo] = useState(false);
  const [showLinksInfo, setShowLinksInfo] = useState(false);
  const [showCollaborationInfo, setShowCollaborationInfo] = useState(false);

  const buttonClass = `hover:bg-gray-100 dark:hover:bg-gray-800 ${
    isDarkMode ? "text-white" : "text-gray-900"
  }`;

  const handleHelpClick = (topic: string) => {
    trackHelpAction("help_click", { topic });
    
    if (topic === "quick-tour") {
      setShowQuickTour(true);
    }
  };

  return (
    <>
      <div className="flex justify-center w-full">
        <div className="flex items-center justify-center gap-4 sm:gap-6 px-2 sm:px-4 py-3" style={{ transform: 'scale(0.75)', transformOrigin: 'center top' }}>
          {/* Getting Started Group */}
          <div className="flex flex-col gap-1 min-w-fit">
            <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-700'} mb-1`}>Getting Started</div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className={`h-9 px-3 flex-col gap-0.5 ${buttonClass}`}
                onClick={() => handleHelpClick("quick-tour")}
              >
                <Sparkles className="w-5 h-5" />
                <span className="text-xs">Quick Tour</span>
              </Button>
            </div>
          </div>

          <Separator orientation="vertical" className={`h-12 ${isDarkMode ? 'bg-gray-700' : ''}`} />

          {/* Feature Guides */}
          <div className="flex flex-col gap-1 min-w-fit">
            <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-700'} mb-1`}>Feature Guides</div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className={`h-9 px-3 flex-col gap-0.5 ${buttonClass}`}
                onClick={() => setShowConditionalFormattingInfo(true)}
              >
                <Palette className="w-5 h-5" />
                <span className="text-xs">Conditional Formatting</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`h-9 px-3 flex-col gap-0.5 ${buttonClass}`}
                onClick={() => setShowDataValidationInfo(true)}
              >
                <CheckSquare className="w-5 h-5" />
                <span className="text-xs">Data Validation</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`h-9 px-3 flex-col gap-0.5 ${buttonClass}`}
                onClick={() => setShowLinksInfo(true)}
              >
                <Link className="w-5 h-5" />
                <span className="text-xs">Links</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`h-9 px-3 flex-col gap-0.5 ${buttonClass}`}
                onClick={() => setShowCollaborationInfo(true)}
              >
                <Users className="w-5 h-5" />
                <span className="text-xs">Collaboration</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <QuickTourOverlay
        isOpen={showQuickTour}
        onClose={() => setShowQuickTour(false)}
        isDarkMode={isDarkMode}
      />
      
      {/* Feature Info Overlays */}
      <FeatureInfoOverlay
        isOpen={showConditionalFormattingInfo}
        onClose={() => setShowConditionalFormattingInfo(false)}
        featureTitle="Conditional Formatting"
        steps={conditionalFormattingSteps}
        isDarkMode={isDarkMode}
      />
      <FeatureInfoOverlay
        isOpen={showDataValidationInfo}
        onClose={() => setShowDataValidationInfo(false)}
        featureTitle="Data Validation"
        steps={dataValidationSteps}
        isDarkMode={isDarkMode}
      />
      <FeatureInfoOverlay
        isOpen={showLinksInfo}
        onClose={() => setShowLinksInfo(false)}
        featureTitle="Links"
        steps={linksSteps}
        isDarkMode={isDarkMode}
      />
      <FeatureInfoOverlay
        isOpen={showCollaborationInfo}
        onClose={() => setShowCollaborationInfo(false)}
        featureTitle="Real-Time Collaboration"
        steps={collaborationSteps}
        isDarkMode={isDarkMode}
      />
    </>
  );
}
