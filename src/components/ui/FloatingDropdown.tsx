import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

interface FloatingDropdownProps {
  anchorRect: DOMRect | null;
  onClose: () => void;
  children: React.ReactNode;
}

export default function FloatingDropdown({ anchorRect, onClose, children }: FloatingDropdownProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    window.addEventListener("mousedown", handler);
    return () => window.removeEventListener("mousedown", handler);
  }, []);

  if (!anchorRect) return null;

  return createPortal(
    <div
      ref={ref}
      style={{
        position: "absolute",
        top: anchorRect.bottom + 4,
        left: anchorRect.left,
        zIndex: 9999,
        background: "white",
        border: "2px solid",
        borderImage: "linear-gradient(135deg, #FFFACD 0%, #FFD700 25%, #FFFACD 50%, #FFD700 75%, #FFFACD 100%) 1",
        padding: "8px 0",
        borderRadius: "8px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        minWidth: "180px",
      }}
    >
      {children}
    </div>,
    document.body
  );
}
