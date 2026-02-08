import { useEffect, useRef } from "react";
import {
  Copy,
  Scissors,
  Clipboard,
  Trash2,
  Bold,
  Italic,
  Underline,
  Palette,
  MessageSquare,
  ImagePlus,
} from "lucide-react";

interface CellContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onCopy: () => void;
  onCut: () => void;
  onPaste: () => void;
  onDelete: () => void;
  onBold: () => void;
  onItalic: () => void;
  onUnderline: () => void;
  onColor: () => void;
  onComment: () => void;
  onInsertImage: () => void;
}

export function CellContextMenu({
  x,
  y,
  onClose,
  onCopy,
  onCut,
  onPaste,
  onDelete,
  onBold,
  onItalic,
  onUnderline,
  onColor,
  onComment,
  onInsertImage,
}: CellContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const menuItems = [
    { icon: Copy, label: "Copy", action: onCopy, shortcut: "Ctrl+C" },
    { icon: Scissors, label: "Cut", action: onCut, shortcut: "Ctrl+X" },
    { icon: Clipboard, label: "Paste", action: onPaste, shortcut: "Ctrl+V" },
    { icon: Trash2, label: "Delete", action: onDelete, shortcut: "Del" },
    { divider: true },
    { icon: Bold, label: "Bold", action: onBold, shortcut: "Ctrl+B" },
    { icon: Italic, label: "Italic", action: onItalic, shortcut: "Ctrl+I" },
    { icon: Underline, label: "Underline", action: onUnderline, shortcut: "Ctrl+U" },
    { icon: Palette, label: "Color", action: onColor },
    { divider: true },
    { icon: MessageSquare, label: "Add Comment", action: onComment },
    { icon: ImagePlus, label: "Insert Image/GIF", action: onInsertImage },
  ];

  return (
    <div
      ref={menuRef}
      className="fixed z-50 bg-popover border border-border rounded-lg shadow-lg py-1 min-w-[200px]"
      style={{ left: x, top: y }}
    >
      {menuItems.map((item, index) =>
        item.divider ? (
          <div key={index} className="h-px bg-border my-1" />
        ) : (
          <button
            key={index}
            onClick={() => {
              item.action();
              onClose();
            }}
            className="w-full px-3 py-2 flex items-center gap-3 hover:bg-accent transition-colors text-left"
          >
            {item.icon && <item.icon className="w-4 h-4" />}
            <span className="flex-1">{item.label}</span>
            {item.shortcut && (
              <span className="text-sm text-muted-foreground">{item.shortcut}</span>
            )}
          </button>
        )
      )}
    </div>
  );
}
