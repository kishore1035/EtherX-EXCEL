import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { motion } from "motion/react";
import { useState, useEffect } from "react";
import * as Icons from "lucide-react";
import { getAllTemplates, Template } from "../services/templateService";

interface TemplatesProps {
  open: boolean;
  onClose: () => void;
  onSelect: (template: string) => void;
}

// Icon color mapping for templates - All use white-gold gradient
const ICON_COLORS: Record<string, string> = {
  'business-report': 'linear-gradient(135deg, #FFFACD 0%, #FFD700 25%, #FFFACD 50%, #FFD700 75%, #FFFACD 100%)',
  'attendance': 'linear-gradient(135deg, #FFFACD 0%, #FFD700 25%, #FFFACD 50%, #FFD700 75%, #FFFACD 100%)',
  'gradebook': 'linear-gradient(135deg, #FFFACD 0%, #FFD700 25%, #FFFACD 50%, #FFD700 75%, #FFFACD 100%)',
  'inventory': 'linear-gradient(135deg, #FFFACD 0%, #FFD700 25%, #FFFACD 50%, #FFD700 75%, #FFFACD 100%)',
  'invoice': 'linear-gradient(135deg, #FFFACD 0%, #FFD700 25%, #FFFACD 50%, #FFD700 75%, #FFFACD 100%)',
  'sales-tracker': 'linear-gradient(135deg, #FFFACD 0%, #FFD700 25%, #FFFACD 50%, #FFD700 75%, #FFFACD 100%)',
  'project-tracker': 'linear-gradient(135deg, #FFFACD 0%, #FFD700 25%, #FFFACD 50%, #FFD700 75%, #FFFACD 100%)',
  'budget': 'linear-gradient(135deg, #FFFACD 0%, #FFD700 25%, #FFFACD 50%, #FFD700 75%, #FFFACD 100%)',
  'study': 'linear-gradient(135deg, #FFFACD 0%, #FFD700 25%, #FFFACD 50%, #FFD700 75%, #FFFACD 100%)',
  'workout': 'linear-gradient(135deg, #FFFACD 0%, #FFD700 25%, #FFFACD 50%, #FFD700 75%, #FFFACD 100%)',
  'meal': 'linear-gradient(135deg, #FFFACD 0%, #FFD700 25%, #FFFACD 50%, #FFD700 75%, #FFFACD 100%)',
  'habit': 'linear-gradient(135deg, #FFFACD 0%, #FFD700 25%, #FFFACD 50%, #FFD700 75%, #FFFACD 100%)',
  'social': 'linear-gradient(135deg, #FFFACD 0%, #FFD700 25%, #FFFACD 50%, #FFD700 75%, #FFFACD 100%)',
  'playlist': 'linear-gradient(135deg, #FFFACD 0%, #FFD700 25%, #FFFACD 50%, #FFD700 75%, #FFFACD 100%)',
  'selfcare': 'linear-gradient(135deg, #FFFACD 0%, #FFD700 25%, #FFFACD 50%, #FFD700 75%, #FFFACD 100%)',
};

// Icon mapping for templates
const getIconComponent = (iconName: string | undefined) => {
  if (!iconName) return Icons.FileText;
  
  const iconMap: Record<string, any> = {
    'TrendingUp': Icons.TrendingUp,
    'Users': Icons.Users,
    'BookOpen': Icons.BookOpen,
    'Boxes': Icons.Boxes,
    'FileText': Icons.FileText,
    'BarChart3': Icons.BarChart3,
    'Briefcase': Icons.Briefcase,
    'Wallet': Icons.Wallet,
    'GraduationCap': Icons.GraduationCap,
    'Dumbbell': Icons.Dumbbell,
    'ShoppingCart': Icons.ShoppingCart,
    'Calendar': Icons.Calendar,
    'Music': Icons.Music,
    'Flame': Icons.Flame,
    'Heart': Icons.Heart,
  };
  
  return iconMap[iconName] || Icons.FileText;
};

export function Templates({ open, onClose, onSelect }: TemplatesProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setLoading(true);
      setError(null);
      getAllTemplates()
        .then((data) => {
          setTemplates(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error('Failed to load templates:', err);
          setError('Failed to load templates');
          setLoading(false);
        });
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Choose a Template</DialogTitle>
          <DialogDescription>
            Start with a pre-made template to jumpstart your spreadsheet
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {loading ? (
            <div className="col-span-full text-center py-8">
              <p className="text-muted-foreground">Loading templates...</p>
            </div>
          ) : error ? (
            <div className="col-span-full text-center py-8">
              <p className="text-destructive">{error}</p>
            </div>
          ) : templates.length === 0 ? (
            <div className="col-span-full text-center py-8">
              <p className="text-muted-foreground">No templates available</p>
            </div>
          ) : (
            templates.map((template, index) => {
              const IconComponent = getIconComponent(template.icon);
              const color = ICON_COLORS[template.id] || 'linear-gradient(135deg, #FFFACD 0%, #FFD700 25%, #FFFACD 50%, #FFD700 75%, #FFFACD 100%)';

              return (
                <motion.button
                  key={template.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => {
                    onSelect(template.id);
                    onClose();
                  }}
                  className="text-left p-4 rounded-lg border-2 border-border hover:border-primary transition-all group"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform"
                      style={{ background: color }}
                    >
                      <IconComponent className="w-7 h-7" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="mb-1">{template.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {template.description}
                      </p>
                      {template.category && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {template.category}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.button>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function generateTemplate(type: string): Map<string, any> {
  const cells = new Map();

  switch (type) {
    case "budget":
      cells.set("A1", { value: "💰 Monthly Budget", bold: true, backgroundColor: "#10b981", color: "#ffffff" });
      cells.set("A3", { value: "Income", bold: true });
      cells.set("B3", { value: "Amount", bold: true });
      cells.set("A4", { value: "Salary" });
      cells.set("B4", { value: "0" });
      cells.set("A5", { value: "Side Hustle" });
      cells.set("B5", { value: "0" });
      cells.set("A6", { value: "Other" });
      cells.set("B6", { value: "0" });
      cells.set("A7", { value: "Total Income", bold: true });
      cells.set("B7", { value: "=SUM(B4:B6)", formula: "=SUM(B4:B6)", bold: true });
      
      cells.set("A9", { value: "Expenses", bold: true });
      cells.set("B9", { value: "Amount", bold: true });
      cells.set("A10", { value: "Rent" });
      cells.set("B10", { value: "0" });
      cells.set("A11", { value: "Food" });
      cells.set("B11", { value: "0" });
      cells.set("A12", { value: "Transport" });
      cells.set("B12", { value: "0" });
      cells.set("A13", { value: "Entertainment" });
      cells.set("B13", { value: "0" });
      cells.set("A14", { value: "Shopping" });
      cells.set("B14", { value: "0" });
      cells.set("A15", { value: "Total Expenses", bold: true });
      cells.set("B15", { value: "=SUM(B10:B14)", formula: "=SUM(B10:B14)", bold: true });
      
      cells.set("A17", { value: "Savings", bold: true, backgroundColor: "#dbeafe" });
      cells.set("B17", { value: "=B7-B15", formula: "=B7-B15", bold: true, backgroundColor: "#dbeafe" });
      break;

    case "study":
      cells.set("A1", { value: "📚 Study Schedule", bold: true, backgroundColor: "#3b82f6", color: "#ffffff" });
      cells.set("A3", { value: "Day", bold: true });
      cells.set("B3", { value: "Subject", bold: true });
      cells.set("C3", { value: "Time", bold: true });
      cells.set("D3", { value: "Status", bold: true });
      
      const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
      const subjects = ["Math", "Science", "English", "History", "Art"];
      
      days.forEach((day, i) => {
        cells.set(`A${i + 4}`, { value: day });
        cells.set(`B${i + 4}`, { value: subjects[i] });
        cells.set(`C${i + 4}`, { value: "2 hours" });
        cells.set(`D${i + 4}`, { value: "⏳" });
      });
      break;

    case "workout":
      cells.set("A1", { value: "💪 Workout Planner", bold: true, backgroundColor: "#ef4444", color: "#ffffff" });
      cells.set("A3", { value: "Exercise", bold: true });
      cells.set("B3", { value: "Sets", bold: true });
      cells.set("C3", { value: "Reps", bold: true });
      cells.set("D3", { value: "Done", bold: true });
      
      const exercises = ["Push-ups", "Squats", "Planks", "Lunges", "Burpees"];
      exercises.forEach((exercise, i) => {
        cells.set(`A${i + 4}`, { value: exercise });
        cells.set(`B${i + 4}`, { value: "3" });
        cells.set(`C${i + 4}`, { value: "12" });
        cells.set(`D${i + 4}`, { value: "☐" });
      });
      break;

    case "meal":
      cells.set("A1", { value: "🍱 Meal Prep", bold: true, backgroundColor: "#ec4899", color: "#ffffff" });
      cells.set("A3", { value: "Day", bold: true });
      cells.set("B3", { value: "Breakfast", bold: true });
      cells.set("C3", { value: "Lunch", bold: true });
      cells.set("D3", { value: "Dinner", bold: true });
      
      const mealDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      mealDays.forEach((day, i) => {
        cells.set(`A${i + 4}`, { value: day });
      });
      break;

    case "habit":
      cells.set("A1", { value: "⚡ Habit Tracker", bold: true, backgroundColor: "#f59e0b", color: "#ffffff" });
      cells.set("A3", { value: "Habit", bold: true });
      
      for (let i = 1; i <= 7; i++) {
        cells.set(`${String.fromCharCode(65 + i)}3`, { value: `Day ${i}`, bold: true });
      }
      
      const habits = ["Drink Water 💧", "Exercise 🏃", "Read 📖", "Meditate 🧘", "Sleep 8hrs 😴"];
      habits.forEach((habit, i) => {
        cells.set(`A${i + 4}`, { value: habit });
        for (let j = 1; j <= 7; j++) {
          cells.set(`${String.fromCharCode(65 + j)}${i + 4}`, { value: "☐" });
        }
      });
      break;

    case "social":
      cells.set("A1", { value: "📱 Content Calendar", bold: true, backgroundColor: "#8b5cf6", color: "#ffffff" });
      cells.set("A3", { value: "Date", bold: true });
      cells.set("B3", { value: "Platform", bold: true });
      cells.set("C3", { value: "Content Idea", bold: true });
      cells.set("D3", { value: "Status", bold: true });
      
      const platforms = ["Instagram", "TikTok", "Twitter", "YouTube", "LinkedIn"];
      platforms.forEach((platform, i) => {
        cells.set(`B${i + 4}`, { value: platform });
        cells.set(`D${i + 4}`, { value: "📝 Draft" });
      });
      break;

    case "playlist":
      cells.set("A1", { value: "🎵 Playlist Tracker", bold: true, backgroundColor: "#06b6d4", color: "#ffffff" });
      cells.set("A3", { value: "Song", bold: true });
      cells.set("B3", { value: "Artist", bold: true });
      cells.set("C3", { value: "Mood", bold: true });
      cells.set("D3", { value: "Rating", bold: true });
      break;

    case "selfcare":
      cells.set("A1", { value: "💖 Self-Care Log", bold: true, backgroundColor: "#a855f7", color: "#ffffff" });
      cells.set("A3", { value: "Date", bold: true });
      cells.set("B3", { value: "Mood", bold: true });
      cells.set("C3", { value: "Activity", bold: true });
      cells.set("D3", { value: "Notes", bold: true });
      
      const moods = ["😊 Great", "🙂 Good", "😐 Okay", "😔 Low", "😌 Calm"];
      moods.forEach((mood, i) => {
        cells.set(`B${i + 4}`, { value: mood });
      });
      break;
  }

  return cells;
}

export function generateTemplate(type: string): Map<string, any> {
  const cells = new Map();

  switch (type) {
    case "budget":
      cells.set("A1", { value: "💰 Monthly Budget", bold: true, backgroundColor: "#10b981", color: "#ffffff" });
      cells.set("A3", { value: "Income", bold: true });
      cells.set("B3", { value: "Amount", bold: true });
      cells.set("A4", { value: "Salary" });
      cells.set("B4", { value: "0" });
      cells.set("A5", { value: "Side Hustle" });
      cells.set("B5", { value: "0" });
      cells.set("A6", { value: "Other" });
      cells.set("B6", { value: "0" });
      cells.set("A7", { value: "Total Income", bold: true });
      cells.set("B7", { value: "=SUM(B4:B6)", formula: "=SUM(B4:B6)", bold: true });
      
      cells.set("A9", { value: "Expenses", bold: true });
      cells.set("B9", { value: "Amount", bold: true });
      cells.set("A10", { value: "Rent" });
      cells.set("B10", { value: "0" });
      cells.set("A11", { value: "Food" });
      cells.set("B11", { value: "0" });
      cells.set("A12", { value: "Transport" });
      cells.set("B12", { value: "0" });
      cells.set("A13", { value: "Entertainment" });
      cells.set("B13", { value: "0" });
      cells.set("A14", { value: "Shopping" });
      cells.set("B14", { value: "0" });
      cells.set("A15", { value: "Total Expenses", bold: true });
      cells.set("B15", { value: "=SUM(B10:B14)", formula: "=SUM(B10:B14)", bold: true });
      
      cells.set("A17", { value: "Savings", bold: true, backgroundColor: "#dbeafe" });
      cells.set("B17", { value: "=B7-B15", formula: "=B7-B15", bold: true, backgroundColor: "#dbeafe" });
      break;

    case "study":
      cells.set("A1", { value: "📚 Study Schedule", bold: true, backgroundColor: "#3b82f6", color: "#ffffff" });
      cells.set("A3", { value: "Day", bold: true });
      cells.set("B3", { value: "Subject", bold: true });
      cells.set("C3", { value: "Time", bold: true });
      cells.set("D3", { value: "Status", bold: true });
      
      const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
      const subjects = ["Math", "Science", "English", "History", "Art"];
      
      days.forEach((day, i) => {
        cells.set(`A${i + 4}`, { value: day });
        cells.set(`B${i + 4}`, { value: subjects[i] });
        cells.set(`C${i + 4}`, { value: "2 hours" });
        cells.set(`D${i + 4}`, { value: "⏳" });
      });
      break;

    case "workout":
      cells.set("A1", { value: "💪 Workout Planner", bold: true, backgroundColor: "#ef4444", color: "#ffffff" });
      cells.set("A3", { value: "Exercise", bold: true });
      cells.set("B3", { value: "Sets", bold: true });
      cells.set("C3", { value: "Reps", bold: true });
      cells.set("D3", { value: "Done", bold: true });
      
      const exercises = ["Push-ups", "Squats", "Planks", "Lunges", "Burpees"];
      exercises.forEach((exercise, i) => {
        cells.set(`A${i + 4}`, { value: exercise });
        cells.set(`B${i + 4}`, { value: "3" });
        cells.set(`C${i + 4}`, { value: "12" });
        cells.set(`D${i + 4}`, { value: "☐" });
      });
      break;

    case "meal":
      cells.set("A1", { value: "🍱 Meal Prep", bold: true, backgroundColor: "#ec4899", color: "#ffffff" });
      cells.set("A3", { value: "Day", bold: true });
      cells.set("B3", { value: "Breakfast", bold: true });
      cells.set("C3", { value: "Lunch", bold: true });
      cells.set("D3", { value: "Dinner", bold: true });
      
      const mealDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      mealDays.forEach((day, i) => {
        cells.set(`A${i + 4}`, { value: day });
      });
      break;

    case "habit":
      cells.set("A1", { value: "⚡ Habit Tracker", bold: true, backgroundColor: "#f59e0b", color: "#ffffff" });
      cells.set("A3", { value: "Habit", bold: true });
      
      for (let i = 1; i <= 7; i++) {
        cells.set(`${String.fromCharCode(65 + i)}3`, { value: `Day ${i}`, bold: true });
      }
      
      const habits = ["Drink Water 💧", "Exercise 🏃", "Read 📖", "Meditate 🧘", "Sleep 8hrs 😴"];
      habits.forEach((habit, i) => {
        cells.set(`A${i + 4}`, { value: habit });
        for (let j = 1; j <= 7; j++) {
          cells.set(`${String.fromCharCode(65 + j)}${i + 4}`, { value: "☐" });
        }
      });
      break;

    case "social":
      cells.set("A1", { value: "📱 Content Calendar", bold: true, backgroundColor: "#8b5cf6", color: "#ffffff" });
      cells.set("A3", { value: "Date", bold: true });
      cells.set("B3", { value: "Platform", bold: true });
      cells.set("C3", { value: "Content Idea", bold: true });
      cells.set("D3", { value: "Status", bold: true });
      
      const platforms = ["Instagram", "TikTok", "Twitter", "YouTube", "LinkedIn"];
      platforms.forEach((platform, i) => {
        cells.set(`B${i + 4}`, { value: platform });
        cells.set(`D${i + 4}`, { value: "📝 Draft" });
      });
      break;

    case "playlist":
      cells.set("A1", { value: "🎵 Playlist Tracker", bold: true, backgroundColor: "#06b6d4", color: "#ffffff" });
      cells.set("A3", { value: "Song", bold: true });
      cells.set("B3", { value: "Artist", bold: true });
      cells.set("C3", { value: "Mood", bold: true });
      cells.set("D3", { value: "Rating", bold: true });
      break;

    case "selfcare":
      cells.set("A1", { value: "💖 Self-Care Log", bold: true, backgroundColor: "#a855f7", color: "#ffffff" });
      cells.set("A3", { value: "Date", bold: true });
      cells.set("B3", { value: "Mood", bold: true });
      cells.set("C3", { value: "Activity", bold: true });
      cells.set("D3", { value: "Notes", bold: true });
      
      const moods = ["😊 Great", "🙂 Good", "😐 Okay", "😔 Low", "😌 Calm"];
      moods.forEach((mood, i) => {
        cells.set(`B${i + 4}`, { value: mood });
      });
      break;
  }

  return cells;
}