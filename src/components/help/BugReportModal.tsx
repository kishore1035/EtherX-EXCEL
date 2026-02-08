import { useState } from "react";
import { X, Send, Camera, AlertTriangle, Info, Bug as BugIcon } from "lucide-react";
import { Button } from "../ui/button";
import { submitBugReport } from "../../services/helpService";
import { toast } from "sonner";

interface BugReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  spreadsheetId: string;
  isDarkMode?: boolean;
}

export function BugReportModal({ isOpen, onClose, userId, spreadsheetId, isDarkMode = false }: BugReportModalProps) {
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState<"low" | "medium" | "high">("medium");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!description.trim()) {
      toast.error("Please describe the bug");
      return;
    }

    setIsSubmitting(true);

    try {
      // Capture browser info and logs
      const logs = {
        userAgent: navigator.userAgent,
        screenResolution: `${window.screen.width}x${window.screen.height}`,
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        severity,
        timestamp: new Date().toISOString()
      };

      const report = submitBugReport(
        userId,
        spreadsheetId,
        description,
        undefined, // screenshot - can be implemented later
        JSON.stringify(logs)
      );

      toast.success(`Bug report submitted! Ticket ID: ${report.id}`);
      
      // Reset form
      setDescription("");
      setSeverity("medium");
      onClose();
    } catch (error) {
      toast.error("Failed to submit bug report");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div
        className={`relative w-full max-w-2xl rounded-lg shadow-2xl ${
          isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div className="flex items-center gap-3">
            <BugIcon className="w-6 h-6 text-red-500" />
            <h2 className="text-2xl font-bold">Report a Bug</h2>
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

        {/* Content */}
        <div className="px-6 py-6 space-y-6">
          {/* Description */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Describe the bug *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What happened? What did you expect to happen? Steps to reproduce..."
              rows={6}
              className={`w-full px-4 py-3 rounded-lg border resize-none ${
                isDarkMode 
                  ? 'bg-gray-800 border-gray-700 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>

          {/* Severity */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Severity
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => setSeverity("low")}
                className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
                  severity === "low"
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-300 bg-white'
                }`}
              >
                <Info className="w-5 h-5 mx-auto mb-1 text-blue-500" />
                <div className="text-sm font-medium">Low</div>
                <div className="text-xs text-gray-500">Minor issue</div>
              </button>
              <button
                onClick={() => setSeverity("medium")}
                className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
                  severity === "medium"
                    ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
                    : isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-300 bg-white'
                }`}
              >
                <AlertTriangle className="w-5 h-5 mx-auto mb-1 text-yellow-500" />
                <div className="text-sm font-medium">Medium</div>
                <div className="text-xs text-gray-500">Affects workflow</div>
              </button>
              <button
                onClick={() => setSeverity("high")}
                className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
                  severity === "high"
                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                    : isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-300 bg-white'
                }`}
              >
                <BugIcon className="w-5 h-5 mx-auto mb-1 text-red-500" />
                <div className="text-sm font-medium">High</div>
                <div className="text-xs text-gray-500">Critical</div>
              </button>
            </div>
          </div>

          {/* Info */}
          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold mb-1">What we'll collect:</p>
                <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-1">
                  <li>Browser and OS information</li>
                  <li>Current spreadsheet ID</li>
                  <li>Screen resolution and viewport</li>
                  <li>Timestamp</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`flex items-center justify-end gap-3 px-6 py-4 border-t ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !description.trim()}
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            {isSubmitting ? (
              <>Submitting...</>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Submit Report
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
