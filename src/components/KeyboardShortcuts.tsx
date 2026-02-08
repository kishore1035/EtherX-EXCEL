import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Keyboard } from "lucide-react";

interface KeyboardShortcutsProps {
  open: boolean;
  onClose: () => void;
}

const shortcuts = [
  { category: "Navigation", items: [
    { keys: ["Arrow Keys"], description: "Move between cells" },
    { keys: ["Tab"], description: "Move to next cell" },
    { keys: ["Shift", "Tab"], description: "Move to previous cell" },
    { keys: ["Ctrl", "Home"], description: "Go to cell A1" },
  ]},
  { category: "Editing", items: [
    { keys: ["F2"], description: "Edit active cell" },
    { keys: ["Enter"], description: "Confirm entry" },
    { keys: ["Esc"], description: "Cancel entry" },
    { keys: ["Delete"], description: "Clear cell content" },
  ]},
  { category: "Formatting", items: [
    { keys: ["Ctrl", "B"], description: "Bold" },
    { keys: ["Ctrl", "I"], description: "Italic" },
    { keys: ["Ctrl", "U"], description: "Underline" },
  ]},
  { category: "Actions", items: [
    { keys: ["Ctrl", "C"], description: "Copy" },
    { keys: ["Ctrl", "X"], description: "Cut" },
    { keys: ["Ctrl", "V"], description: "Paste" },
    { keys: ["Ctrl", "Z"], description: "Undo" },
    { keys: ["Ctrl", "Y"], description: "Redo" },
    { keys: ["Ctrl", "S"], description: "Save" },
  ]},
];

export function KeyboardShortcuts({ open, onClose }: KeyboardShortcutsProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="w-5 h-5" />
            Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 mt-4">
          {shortcuts.map((category) => (
            <div key={category.category}>
              <h3 className="mb-3 text-muted-foreground">{category.category}</h3>
              <div className="space-y-2">
                {category.items.map((shortcut, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-2 border-b border-border last:border-0"
                  >
                    <span className="text-sm">{shortcut.description}</span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, keyIndex) => (
                        <span key={keyIndex} className="flex items-center gap-1">
                          <kbd className="px-2 py-1 text-xs bg-muted border border-border rounded">
                            {key}
                          </kbd>
                          {keyIndex < shortcut.keys.length - 1 && (
                            <span className="text-muted-foreground">+</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
