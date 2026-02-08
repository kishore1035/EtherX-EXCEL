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
        border: "1px solid #ccc",
        padding: "8px 0",
        borderRadius: "4px",
        boxShadow: "0 3px 8px rgba(0,0,0,0.2)",
        minWidth: "180px",
      }}
    >
      {children}
    </div>,
    document.body
  );
}
