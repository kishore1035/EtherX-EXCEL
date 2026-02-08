import { X, Sparkles, CheckCircle, Calendar } from "lucide-react";
import { Button } from "../ui/button";

interface WhatsNewModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode?: boolean;
}

interface Release {
  version: string;
  date: string;
  highlights: string[];
  features: { title: string; description: string }[];
}

export function WhatsNewModal({ isOpen, onClose, isDarkMode = false }: WhatsNewModalProps) {
  const releases: Release[] = [
    {
      version: "2.5.0",
      date: "December 2024",
      highlights: ["Help System", "IPFS Integration", "Enhanced Collaboration"],
      features: [
        {
          title: "Comprehensive Help System",
          description: "New Help tab with searchable documentation, keyboard shortcuts, guided tours, and support features."
        },
        {
          title: "IPFS Primary Storage",
          description: "All spreadsheets now automatically save to IPFS with real-time status indicator and fallback to localStorage."
        },
        {
          title: "Improved Collaboration Links",
          description: "Permission-aware link generation ensures View and Edit links are always different."
        },
        {
          title: "Shape Rendering Optimization",
          description: "GPU-accelerated shape rendering eliminates flickering for smooth interactions."
        }
      ]
    },
    {
      version: "2.4.0",
      date: "November 2024",
      highlights: ["Dashboard Redesign", "Advanced Charts", "Performance"],
      features: [
        {
          title: "Modern Dashboard",
          description: "Completely redesigned dashboard with improved navigation and visual hierarchy."
        },
        {
          title: "Advanced Chart Types",
          description: "New chart types including scatter plots, bubble charts, and combo charts with customizable styling."
        },
        {
          title: "Formula Performance",
          description: "Significant improvements to formula calculation speed, especially for large datasets."
        },
        {
          title: "Real-time Collaboration",
          description: "Enhanced WebSocket-based collaboration with cursor tracking and live edits."
        }
      ]
    },
    {
      version: "2.3.0",
      date: "October 2024",
      highlights: ["Templates", "Data Validation", "Import/Export"],
      features: [
        {
          title: "Pre-built Templates",
          description: "Access professionally designed templates for budgets, invoices, project tracking, and more."
        },
        {
          title: "Advanced Data Validation",
          description: "Set validation rules for cells including dropdowns, number ranges, and custom formulas."
        },
        {
          title: "Multi-format Export",
          description: "Export to Excel (.xlsx), CSV, PDF, and JSON with customizable options."
        },
        {
          title: "Conditional Formatting",
          description: "Apply color scales, data bars, and icon sets based on cell values."
        }
      ]
    }
  ];

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div
        className={`relative w-full max-w-4xl max-h-[90vh] rounded-lg shadow-2xl ${
          isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-yellow-500" />
            <h2 className="text-2xl font-bold">What's New</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Releases */}
        <div className="px-6 py-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="space-y-8">
            {releases.map((release, idx) => (
              <div key={idx} className={`pb-8 ${idx < releases.length - 1 ? 'border-b ' + (isDarkMode ? 'border-gray-700' : 'border-gray-200') : ''}`}>
                {/* Version Header */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-yellow-500">
                      Version {release.version}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {release.date}
                      </span>
                    </div>
                  </div>
                  {idx === 0 && (
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-500 text-black">
                      LATEST
                    </span>
                  )}
                </div>

                {/* Highlights */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {release.highlights.map((highlight, hIdx) => (
                    <span
                      key={hIdx}
                      className={`px-3 py-1 text-sm rounded-full ${
                        isDarkMode 
                          ? 'bg-gray-800 text-yellow-400' 
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {highlight}
                    </span>
                  ))}
                </div>

                {/* Features */}
                <div className="space-y-4">
                  {release.features.map((feature, fIdx) => (
                    <div
                      key={fIdx}
                      className={`p-4 rounded-lg ${
                        isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-semibold mb-1">{feature.title}</h4>
                          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {feature.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
