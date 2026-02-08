import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "./ui/dialog";
import { Wand2 } from "lucide-react";

interface DemoDataProps {
  open: boolean;
  onClose: () => void;
  onGenerate: (type: "sales" | "expenses" | "grades") => void;
}

export function DemoData({ open, onClose, onGenerate }: DemoDataProps) {
  const demoTypes = [
    {
      id: "sales" as const,
      title: "Sales Data",
      description: "Monthly sales figures with products and revenue",
      icon: "📊",
    },
    {
      id: "expenses" as const,
      title: "Expense Tracker",
      description: "Categories and monthly expenses breakdown",
      icon: "💰",
    },
    {
      id: "grades" as const,
      title: "Student Grades",
      description: "Student names with test scores and averages",
      icon: "🎓",
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="w-5 h-5" />
            Load Sample Data
          </DialogTitle>
          <DialogDescription>
            Choose a sample dataset to populate your spreadsheet
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 py-4">
          {demoTypes.map((demo) => (
            <button
              key={demo.id}
              onClick={() => {
                onGenerate(demo.id);
                onClose();
              }}
              className="w-full p-4 text-left border border-border rounded-lg hover:bg-accent transition-colors"
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{demo.icon}</span>
                <div className="flex-1">
                  <h3 className="mb-1">{demo.title}</h3>
                  <p className="text-sm text-muted-foreground">{demo.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function generateDemoData(type: "sales" | "expenses" | "grades"): Map<string, any> {
  const cells = new Map();

  switch (type) {
    case "sales":
      cells.set("A1", { value: "Month" });
      cells.set("B1", { value: "Product" });
      cells.set("C1", { value: "Revenue" });
      
      const months = ["January", "February", "March", "April", "May", "June"];
      const products = ["Widget A", "Widget B", "Widget C"];
      
      months.forEach((month, i) => {
        cells.set(`A${i + 2}`, { value: month });
        cells.set(`B${i + 2}`, { value: products[i % 3] });
        cells.set(`C${i + 2}`, { value: (Math.random() * 10000 + 5000).toFixed(2) });
      });
      
      cells.set("A8", { value: "Total" });
      cells.set("C8", { value: "=SUM(C2:C7)", formula: "=SUM(C2:C7)" });
      break;

    case "expenses":
      cells.set("A1", { value: "Category" });
      cells.set("B1", { value: "Amount" });
      cells.set("C1", { value: "Budget" });
      
      const categories = ["Rent", "Utilities", "Food", "Transport", "Entertainment"];
      
      categories.forEach((category, i) => {
        cells.set(`A${i + 2}`, { value: category });
        cells.set(`B${i + 2}`, { value: (Math.random() * 500 + 200).toFixed(2) });
        cells.set(`C${i + 2}`, { value: (Math.random() * 600 + 300).toFixed(2) });
      });
      
      cells.set("A8", { value: "Total" });
      cells.set("B8", { value: "=SUM(B2:B7)", formula: "=SUM(B2:B7)" });
      cells.set("C8", { value: "=SUM(C2:C7)", formula: "=SUM(C2:C7)" });
      break;

    case "grades":
      cells.set("A1", { value: "Student" });
      cells.set("B1", { value: "Math" });
      cells.set("C1", { value: "Science" });
      cells.set("D1", { value: "English" });
      cells.set("E1", { value: "Average" });
      
      const students = ["Alice", "Bob", "Charlie", "Diana", "Eve"];
      
      students.forEach((student, i) => {
        cells.set(`A${i + 2}`, { value: student });
        cells.set(`B${i + 2}`, { value: Math.floor(Math.random() * 30 + 70).toString() });
        cells.set(`C${i + 2}`, { value: Math.floor(Math.random() * 30 + 70).toString() });
        cells.set(`D${i + 2}`, { value: Math.floor(Math.random() * 30 + 70).toString() });
        cells.set(`E${i + 2}`, { value: "=AVERAGE(B" + (i + 2) + ":D" + (i + 2) + ")", formula: "=AVERAGE(B" + (i + 2) + ":D" + (i + 2) + ")" });
      });
      break;
  }

  return cells;
}
