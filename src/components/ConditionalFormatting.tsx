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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface ConditionalFormattingProps {
  open: boolean;
  onClose: () => void;
  onApply: (rule: ConditionalRule) => void;
}

export interface ConditionalRule {
  condition: "greater" | "less" | "equal" | "between" | "contains";
  value: string;
  value2?: string;
  backgroundColor: string;
  textColor: string;
}

export function ConditionalFormatting({
  open,
  onClose,
  onApply,
}: ConditionalFormattingProps) {
  const [condition, setCondition] = useState<ConditionalRule["condition"]>("greater");
  const [value, setValue] = useState("");
  const [value2, setValue2] = useState("");
  const [backgroundColor, setBackgroundColor] = useState("#dbeafe");
  const [textColor, setTextColor] = useState("#1e40af");

  const handleApply = () => {
    onApply({
      condition,
      value,
      value2: condition === "between" ? value2 : undefined,
      backgroundColor,
      textColor,
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Conditional Formatting</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label>Condition</Label>
            <Select value={condition} onValueChange={(val: any) => setCondition(val)}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="greater">Greater than</SelectItem>
                <SelectItem value="less">Less than</SelectItem>
                <SelectItem value="equal">Equal to</SelectItem>
                <SelectItem value="between">Between</SelectItem>
                <SelectItem value="contains">Contains text</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Value</Label>
            <Input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Enter value"
              className="mt-2"
            />
          </div>

          {condition === "between" && (
            <div>
              <Label>Second Value</Label>
              <Input
                type="text"
                value={value2}
                onChange={(e) => setValue2(e.target.value)}
                placeholder="Enter second value"
                className="mt-2"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Background Color</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  type="color"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="w-16 h-10 p-1 cursor-pointer"
                />
                <Input
                  type="text"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>

            <div>
              <Label>Text Color</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="w-16 h-10 p-1 cursor-pointer"
                />
                <Input
                  type="text"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          <div className="p-4 rounded border border-border">
            <p className="text-sm text-muted-foreground mb-2">Preview:</p>
            <div
              className="p-3 rounded text-center"
              style={{ backgroundColor, color: textColor }}
            >
              Sample Text
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleApply}>Apply</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
