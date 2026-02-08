import { useState } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import {
  X,
  Lightbulb,
  CheckCircle2,
  Trophy,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner@2.0.3";

interface Student {
  name: string;
  assignment1: number;
  assignment2: number;
  assignment3: number;
  finalGrade?: string;
  userFormula?: string;
}

interface GradebookGuruGameProps {
  onComplete: () => void;
  onClose: () => void;
}

export function GradebookGuruGame({ onComplete, onClose }: GradebookGuruGameProps) {
  const [step, setStep] = useState(1);
  const [showHint, setShowHint] = useState(false);
  const [students, setStudents] = useState<Student[]>([
    { name: "Alice Johnson", assignment1: 85, assignment2: 92, assignment3: 88 },
    { name: "Bob Smith", assignment1: 78, assignment2: 85, assignment3: 80 },
    { name: "Carol White", assignment1: 95, assignment2: 98, assignment3: 96 },
    { name: "David Brown", assignment1: 72, assignment2: 68, assignment3: 75 },
    { name: "Emma Davis", assignment1: 90, assignment2: 87, assignment3: 93 },
  ]);

  const totalSteps = 3;
  const progress = (step / totalSteps) * 100;

  const challenges = [
    {
      title: "Calculate Total Points",
      description: "Use the SUM function to add up all assignment scores for Alice",
      hint: "Try using =SUM(B2:D2) to add all three assignments",
      correctFormula: "=SUM(B2:D2)",
    },
    {
      title: "Calculate Average Grade",
      description: "Use the AVERAGE function to find Alice's average score",
      hint: "Use =AVERAGE(B2:D2) to get the mean of all assignments",
      correctFormula: "=AVERAGE(B2:D2)",
    },
    {
      title: "Assign Letter Grade",
      description: "Use the IF function to assign a letter grade (A if ≥90, B if ≥80, else C)",
      hint: "Try =IF(AVERAGE(B2:D2)>=90, \"A\", IF(AVERAGE(B2:D2)>=80, \"B\", \"C\"))",
      correctFormula: "=IF(AVERAGE(B2:D2)>=90,\"A\",IF(AVERAGE(B2:D2)>=80,\"B\",\"C\"))",
    },
  ];

  const currentChallenge = challenges[step - 1];

  const checkAnswer = (formula: string) => {
    // Simplified formula checking (normalize spacing)
    const normalized = formula.replace(/\s+/g, "").toUpperCase();
    const correct = currentChallenge.correctFormula.replace(/\s+/g, "").toUpperCase();

    if (normalized === correct) {
      toast.success("Correct! Great job! 🎉");
      if (step < totalSteps) {
        setTimeout(() => setStep(step + 1), 1000);
      } else {
        setTimeout(() => onComplete(), 1000);
      }
    } else {
      toast.error("Not quite right. Try again or use a hint!");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Header */}
      <div className="p-6 text-black" style={{background: 'linear-gradient(135deg, #FFFACD 0%, #FFD700 25%, #FFFACD 50%, #FFD700 75%, #FFFACD 100%)'}}>
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">The Gradebook Guru</h2>
                <p className="text-white/90 text-sm">Master SUM, AVERAGE, and IF formulas</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={onClose}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Step {step} of {totalSteps}</span>
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                {Math.round(progress)}% Complete
              </Badge>
            </div>
            <Progress value={progress} className="h-2 bg-white/20" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto" style={{background: 'linear-gradient(135deg, rgba(255, 250, 205, 0.05) 0%, rgba(255, 215, 0, 0.05) 50%, rgba(255, 250, 205, 0.05) 100%)'}}>
        <div className="max-w-6xl mx-auto p-6 space-y-6">
          {/* Challenge Card */}
          <div className="bg-card border-2 border-green-500 rounded-xl p-6 shadow-xl">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-10 h-10 rounded-lg bg-green-500 text-white flex items-center justify-center font-bold text-lg">
                {step}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">{currentChallenge.title}</h3>
                <p className="text-muted-foreground">{currentChallenge.description}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => setShowHint(!showHint)}
              >
                <Lightbulb className="w-4 h-4" />
                Hint
              </Button>
            </div>

            {/* Hint */}
            {showHint && (
              <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mt-4">
                <div className="flex items-start gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-yellow-900 dark:text-yellow-100 mb-1">Hint</p>
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      {currentChallenge.hint}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Spreadsheet */}
          <div className="bg-card border-2 border-border rounded-xl overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-accent border-b-2 border-border">
                    <th className="px-4 py-3 text-left text-sm font-medium">Student Name</th>
                    <th className="px-4 py-3 text-center text-sm font-medium">Assignment 1</th>
                    <th className="px-4 py-3 text-center text-sm font-medium">Assignment 2</th>
                    <th className="px-4 py-3 text-center text-sm font-medium">Assignment 3</th>
                    <th className="px-4 py-3 text-center text-sm font-medium bg-green-500/10">
                      Final Grade
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student, index) => (
                    <tr key={index} className="border-b border-border hover:bg-accent/50">
                      <td className="px-4 py-3 font-medium">{student.name}</td>
                      <td className="px-4 py-3 text-center">{student.assignment1}</td>
                      <td className="px-4 py-3 text-center">{student.assignment2}</td>
                      <td className="px-4 py-3 text-center">{student.assignment3}</td>
                      <td className="px-4 py-3 text-center bg-green-500/5">
                        {index === 0 ? (
                          <input
                            type="text"
                            placeholder="Enter formula..."
                            className="w-full px-3 py-2 bg-background border-2 border-green-500 rounded text-center font-mono text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                checkAnswer(e.currentTarget.value);
                              }
                            }}
                          />
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Formula Bar Helper */}
          <div className="bg-card border-2 border-border rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-blue-500 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium mb-1">Formula Bar Tips</p>
                <p className="text-sm text-muted-foreground">
                  Start with <code className="px-2 py-1 bg-accent rounded text-xs">=</code> to begin a formula.
                  Reference cells like <code className="px-2 py-1 bg-accent rounded text-xs">B2</code> or ranges like{" "}
                  <code className="px-2 py-1 bg-accent rounded text-xs">B2:D2</code>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-border bg-card p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Type your formula in the green cell and press Enter
          </p>
          <Button variant="outline" onClick={onClose}>
            Exit Game
          </Button>
        </div>
      </div>
    </div>
  );
}
