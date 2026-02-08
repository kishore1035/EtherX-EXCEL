import { useState } from "react";
import { Button } from "./ui/button";
import { Plus, X, Edit2 } from "lucide-react";
import { Sheet } from "../types/spreadsheet";
import { Input } from "./ui/input";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "./ui/context-menu";

interface SheetTabsProps {
  sheets: Sheet[];
  activeSheetId: string;
  onSheetSelect: (sheetId: string) => void;
  onSheetAdd: () => void;
  onSheetDelete: (sheetId: string) => void;
  onSheetRename: (sheetId: string, newName: string) => void;
}

export function SheetTabs({
  sheets,
  activeSheetId,
  onSheetSelect,
  onSheetAdd,
  onSheetDelete,
  onSheetRename,
}: SheetTabsProps) {
  const [editingSheet, setEditingSheet] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const handleRename = (sheetId: string) => {
    const sheet = sheets.find((s) => s.id === sheetId);
    if (sheet) {
      setEditingSheet(sheetId);
      setEditName(sheet.name);
    }
  };

  const handleRenameComplete = (sheetId: string) => {
    if (editName.trim()) {
      onSheetRename(sheetId, editName.trim());
    }
    setEditingSheet(null);
    setEditName("");
  };

  return (
    <div className="border-t border-border bg-card px-2 py-2 flex items-center gap-2 overflow-x-auto">
      <div className="flex items-center gap-1">
        {sheets.map((sheet) => (
          <ContextMenu key={sheet.id}>
            <ContextMenuTrigger>
              <div
                className={`px-4 py-2 rounded transition-colors cursor-pointer flex items-center gap-2 min-w-[120px] ${
                  activeSheetId === sheet.id
                    ? "bg-accent text-accent-foreground"
                    : "hover:bg-accent/50"
                }`}
                onClick={() => onSheetSelect(sheet.id)}
              >
                {sheet.color && (
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: sheet.color }}
                  />
                )}
                {editingSheet === sheet.id ? (
                  <Input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onBlur={() => handleRenameComplete(sheet.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleRenameComplete(sheet.id);
                      } else if (e.key === "Escape") {
                        setEditingSheet(null);
                        setEditName("");
                      }
                    }}
                    className="h-6 px-2 py-0 w-24"
                    autoFocus
                  />
                ) : (
                  <span className="flex-1">{sheet.name}</span>
                )}
              </div>
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuItem onClick={() => handleRename(sheet.id)}>
                <Edit2 className="w-4 h-4 mr-2" />
                Rename
              </ContextMenuItem>
              <ContextMenuItem
                onClick={() => onSheetDelete(sheet.id)}
                disabled={sheets.length === 1}
                className="text-destructive"
              >
                <X className="w-4 h-4 mr-2" />
                Delete
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        ))}
      </div>

      <Button variant="ghost" size="icon" onClick={onSheetAdd} className="ml-2">
        <Plus className="w-4 h-4" />
      </Button>
    </div>
  );
}
