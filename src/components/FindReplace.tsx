import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Search, Replace } from "lucide-react";
import { toast } from "sonner@2.0.3";

interface FindReplaceProps {
  open: boolean;
  onClose: () => void;
  cells: Map<string, any>;
  onReplace: (updates: Map<string, any>) => void;
}

export function FindReplace({ open, onClose, cells, onReplace }: FindReplaceProps) {
  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [matches, setMatches] = useState<string[]>([]);
  const [currentMatch, setCurrentMatch] = useState(0);

  const handleFind = () => {
    if (!findText) {
      toast.error("Please enter text to find");
      return;
    }

    const found: string[] = [];
    cells.forEach((cell, cellId) => {
      if (cell.value && cell.value.toLowerCase().includes(findText.toLowerCase())) {
        found.push(cellId);
      }
    });

    setMatches(found);
    setCurrentMatch(0);

    if (found.length === 0) {
      toast.info("No matches found");
    } else {
      toast.success(`Found ${found.length} match${found.length > 1 ? "es" : ""}`);
    }
  };

  const handleReplace = () => {
    if (matches.length === 0) {
      toast.error("No matches to replace");
      return;
    }

    const cellId = matches[currentMatch];
    const cell = cells.get(cellId);
    if (cell) {
      const newValue = cell.value.replace(
        new RegExp(findText, "gi"),
        replaceText
      );
      const updates = new Map(cells);
      updates.set(cellId, { ...cell, value: newValue });
      onReplace(updates);
      toast.success(`Replaced in ${cellId}`);

      // Move to next match
      if (currentMatch < matches.length - 1) {
        setCurrentMatch(currentMatch + 1);
      }
    }
  };

  const handleReplaceAll = () => {
    if (matches.length === 0) {
      toast.error("No matches to replace");
      return;
    }

    const updates = new Map(cells);
    let count = 0;

    matches.forEach((cellId) => {
      const cell = cells.get(cellId);
      if (cell) {
        const newValue = cell.value.replace(
          new RegExp(findText, "gi"),
          replaceText
        );
        updates.set(cellId, { ...cell, value: newValue });
        count++;
      }
    });

    onReplace(updates);
    setMatches([]);
    setCurrentMatch(0);
    toast.success(`Replaced ${count} occurrence${count > 1 ? "s" : ""}`);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Find and Replace
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label>Find</Label>
            <Input
              type="text"
              value={findText}
              onChange={(e) => setFindText(e.target.value)}
              placeholder="Enter text to find"
              className="mt-2"
              onKeyDown={(e) => e.key === "Enter" && handleFind()}
            />
          </div>

          <div>
            <Label>Replace with</Label>
            <Input
              type="text"
              value={replaceText}
              onChange={(e) => setReplaceText(e.target.value)}
              placeholder="Enter replacement text"
              className="mt-2"
            />
          </div>

          {matches.length > 0 && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm">
                Match {currentMatch + 1} of {matches.length}: {matches[currentMatch]}
              </p>
              <div className="flex gap-2 mt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCurrentMatch(Math.max(0, currentMatch - 1))}
                  disabled={currentMatch === 0}
                >
                  Previous
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    setCurrentMatch(Math.min(matches.length - 1, currentMatch + 1))
                  }
                  disabled={currentMatch === matches.length - 1}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={handleFind}>
            <Search className="w-4 h-4 mr-2" />
            Find
          </Button>
          <Button variant="outline" onClick={handleReplace} disabled={matches.length === 0}>
            <Replace className="w-4 h-4 mr-2" />
            Replace
          </Button>
          <Button onClick={handleReplaceAll} disabled={matches.length === 0}>
            Replace All
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
