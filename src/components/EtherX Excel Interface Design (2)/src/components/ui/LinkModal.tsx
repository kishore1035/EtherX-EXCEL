import { useState, useEffect } from 'react';
import { Link, X } from 'lucide-react';

interface LinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (url: string, displayText: string) => void;
}

export function LinkModal({ isOpen, onClose, onInsert }: LinkModalProps) {
  const [url, setUrl] = useState('');
  const [displayText, setDisplayText] = useState('');

  // ↓↓↓ Ctrl+V PASTE LISTENER ↓↓↓
  useEffect(() => {
    if (!isOpen) return;

    const handlePasteShortcut = async (e: KeyboardEvent) => {
      const isPaste = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v';

      if (isPaste) {
        try {
          const text = await navigator.clipboard.readText();
          if (text) {
            setUrl(text); // Paste clipboard text directly
          }
        } catch (err) {
          console.error("Clipboard read failed:", err);
        }
      }
    };

    window.addEventListener('keydown', handlePasteShortcut);
    return () => window.removeEventListener('keydown', handlePasteShortcut);
  }, [isOpen]);
  // ↑↑↑ Ctrl+V PASTE LISTENER ENDS ↑↑↑

  if (!isOpen) return null;

  const handleInsert = () => {
    if (url.trim()) {
      onInsert(url.trim(), displayText.trim() || url.trim());
      setUrl('');
      setDisplayText('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[99999]">

      {/* MAIN MODAL */}
      <div className="bg-white rounded-lg shadow-xl w-[400px] overflow-hidden relative">

        {/* HEADER */}
        <div className="relative bg-gradient-to-r from-[#FFD700] via-[#FFF8DC] to-[#FFD700] p-4 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"></div>

          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link className="w-5 h-5 text-black" />
              <h2 className="text-lg font-semibold text-black">Insert Link</h2>
            </div>

            <button
              onClick={onClose}
              className="p-1 rounded hover:bg-black/10 transition-colors"
            >
              <X className="w-5 h-5 text-black" />
            </button>
          </div>
        </div>

        {/* CONTENT */}
        <div className="p-6 space-y-4 bg-white">

          {/* URL FIELD */}
          <div>
            <label className="block text-sm font-medium mb-1 text-black">
              URL or File Path
            </label>

            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com or C:\\path\\to\\file"
              className="w-full px-3 py-2 border rounded-md bg-white border-gray-300 focus:border-[#FFD700] focus:ring-2 focus:ring-[#FFD700]"
              style={{
                color: "#2143eeff",
                WebkitTextFillColor: "#2143eeff",
                opacity: 1
              }}
            />
          </div>

          {/* DISPLAY TEXT FIELD */}
          <div>
            <label className="block text-sm font-medium mb-1 text-black">
              Display Text (Optional)
            </label>

            <input
              type="text"
              value={displayText}
              onChange={(e) => setDisplayText(e.target.value)}
              placeholder="Text to display in cell"
              className="w-full px-3 py-2 border rounded-md bg-white border-gray-300 focus:border-[#FFD700] focus:ring-2 focus:ring-[#FFD700]"
              style={{
                color: "#2143eeff",
                WebkitTextFillColor: "#2143eeff",
                opacity: 1
              }}
            />
          </div>

          {/* BUTTONS */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded bg-gray-100 text-black hover:bg-gray-200 font-bold"
              style={{ color: "#000", opacity: 1 }}
            >
              Cancel
            </button>

            <button
              onClick={handleInsert}
              disabled={!url.trim()}
              className={`px-4 py-2 rounded bg-gray-100 text-black hover:bg-gray-200 font-bold ${
                url.trim()
                  ? "bg-[#FFD700] text-black hover:bg-[#B8860B]"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
              style={{ color: "#000", opacity: 1 }}
            >
              <span>Insert Link</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

