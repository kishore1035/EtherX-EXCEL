import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { useState } from "react";
import { Bookmark, Trash2, Edit } from "lucide-react";

interface NamedRange {
  name: string;
  range: string;
}

interface NamedRangesProps {
  open: boolean;
  onClose: () => void;
  namedRanges: Map<string, string>;
  onAdd: (name: string, range: string) => void;
  onDelete: (name: string) => void;
  onEdit: (oldName: string, newName: string, range: string) => void;
}

export function NamedRanges({
  open,
  onClose,
  namedRanges,
  onAdd,
  onDelete,
  onEdit,
}: NamedRangesProps) {
  const [newName, setNewName] = useState("");
  const [newRange, setNewRange] = useState("");
  const [editingName, setEditingName] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editRange, setEditRange] = useState("");

  const handleAdd = () => {
    if (newName && newRange) {
      // Validate name (alphanumeric and underscores only)
      if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(newName)) {
        alert("Name must start with a letter and contain only letters, numbers, and underscores");
        return;
      }
      
      onAdd(newName, newRange);
      setNewName("");
      setNewRange("");
    }
  };

  const handleStartEdit = (name: string, range: string) => {
    setEditingName(name);
    setEditName(name);
    setEditRange(range);
  };

  const handleSaveEdit = () => {
    if (editingName && editName && editRange) {
      onEdit(editingName, editName, editRange);
      setEditingName(null);
      setEditName("");
      setEditRange("");
    }
  };

  const handleCancelEdit = () => {
    setEditingName(null);
    setEditName("");
    setEditRange("");
  };

  const ranges = Array.from(namedRanges.entries()).map(([name, range]) => ({ name, range }));

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bookmark className="w-5 h-5" />
            Named Ranges
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Create named ranges to use in formulas (e.g., =SUM(Sales))
          </p>

          {/* Add new range */}
          <div className="border border-border rounded-md p-4 space-y-3">
            <h4 className="text-sm">Add New Range</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Name</Label>
                <Input
                  placeholder="e.g., Sales, TotalRevenue"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>
              <div>
                <Label>Range</Label>
                <Input
                  placeholder="e.g., A1:A10"
                  value={newRange}
                  onChange={(e) => setNewRange(e.target.value)}
                />
              </div>
            </div>
            <Button onClick={handleAdd} className="w-full">
              Add Named Range
            </Button>
          </div>

          {/* Existing ranges */}
          <div>
            <h4 className="text-sm mb-3">Existing Named Ranges ({ranges.length})</h4>
            <div className="border border-border rounded-md max-h-64 overflow-y-auto">
              {ranges.length > 0 ? (
                <div className="divide-y divide-border">
                  {ranges.map((range) => (
                    <div key={range.name} className="p-3">
                      {editingName === range.name ? (
                        <div className="space-y-2">
                          <div className="grid grid-cols-2 gap-2">
                            <Input
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              placeholder="Name"
                            />
                            <Input
                              value={editRange}
                              onChange={(e) => setEditRange(e.target.value)}
                              placeholder="Range"
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" onClick={handleSaveEdit}>
                              Save
                            </Button>
                            <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{range.name}</p>
                            <p className="text-sm text-muted-foreground">{range.range}</p>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleStartEdit(range.name, range.range)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onDelete(range.name)}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  No named ranges yet. Add one above!
                </div>
              )}
            </div>
          </div>

          <div className="bg-blue-500/10 p-3 rounded-md text-sm">
            <p className="text-blue-500">
              💡 Example: Create a range named "Sales" for A1:A10, then use =SUM(Sales) in formulas
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
