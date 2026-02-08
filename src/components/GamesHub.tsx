import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import {
  Trophy,
  Star,
  Target,
  BookOpen,
  TrendingUp,
  Zap,
  Lock,
  Play,
  GraduationCap,
} from "lucide-react";

interface Game {
  id: string;
  title: string;
  description: string;
  icon: any;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  skillsLearned: string[];
  locked: boolean;
  progress?: number;
  color: string;
}

const games: Game[] = [
  {
    id: "gradebook-guru",
    title: "The Gradebook Guru",
    description: "Help calculate student grades using SUM, AVERAGE, and IF formulas",
    icon: GraduationCap,
    difficulty: "Beginner",
    skillsLearned: ["SUM", "AVERAGE", "IF"],
    locked: false,
    progress: 0,
    color: "linear-gradient(135deg, #FFFACD 0%, #FFD700 25%, #FFFACD 50%, #FFD700 75%, #FFFACD 100%)",
  },
  {
    id: "budget-buster",
    title: "The Budget Buster",
    description: "Track expenses and income to balance a monthly budget",
    icon: Target,
    difficulty: "Beginner",
    skillsLearned: ["SUM", "SUMIF", "Basic Math"],
    locked: false,
    progress: 0,
    color: "linear-gradient(135deg, #FFFACD 0%, #FFD700 25%, #FFFACD 50%, #FFD700 75%, #FFFACD 100%)",
  },
  {
    id: "sales-sleuth",
    title: "The Sales Sleuth",
    description: "Analyze sales data with VLOOKUP and PivotTables",
    icon: TrendingUp,
    difficulty: "Intermediate",
    skillsLearned: ["VLOOKUP", "PivotTables", "Charts"],
    locked: true,
    color: "linear-gradient(135deg, #FFFACD 0%, #FFD700 25%, #FFFACD 50%, #FFD700 75%, #FFFACD 100%)",
  },
  {
    id: "data-detective",
    title: "The Data Detective",
    description: "Find patterns and insights using advanced formulas",
    icon: Star,
    difficulty: "Advanced",
    skillsLearned: ["INDEX/MATCH", "Array Formulas", "Conditional Formatting"],
    locked: true,
    color: "linear-gradient(135deg, #FFFACD 0%, #FFD700 25%, #FFFACD 50%, #FFD700 75%, #FFFACD 100%)",
  },
];

interface GamesHubProps {
  open: boolean;
  onClose: () => void;
  onStartGame: (gameId: string) => void;
}

export function GamesHub({ open, onClose, onStartGame }: GamesHubProps) {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);

  const completedGames = games.filter((g) => (g.progress || 0) === 100).length;
  const totalGames = games.length;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-4xl p-0 gap-0 max-h-[90vh] overflow-hidden">
        <DialogTitle className="sr-only">Formula Games Hub</DialogTitle>
        <DialogDescription className="sr-only">
          Learn spreadsheet skills through fun challenges and interactive games
        </DialogDescription>
        
        {/* Header */}
        <div className="relative p-8 text-black" style={{background: 'linear-gradient(135deg, #FFFACD 0%, #FFD700 25%, #FFFACD 50%, #FFD700 75%, #FFFACD 100%)'}}>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Trophy className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <h2 className="text-3xl font-bold mb-1">Formula Games</h2>
              <p className="text-white/90">Learn spreadsheet skills through fun challenges</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-white/80 mb-1">Progress</p>
              <p className="text-2xl font-bold">
                {completedGames}/{totalGames}
              </p>
            </div>
          </div>
          <Progress value={(completedGames / totalGames) * 100} className="h-2 bg-white/20" />
        </div>

        {/* Games Grid */}
        <div className="p-8 overflow-auto">
          <div className="grid grid-cols-2 gap-6">
            {games.map((game) => (
              <button
                key={game.id}
                onClick={() => !game.locked && setSelectedGame(game.id)}
                disabled={game.locked}
                className={`group relative p-6 rounded-2xl border-2 transition-all text-left ${
                  selectedGame === game.id
                    ? "border-primary bg-accent scale-[1.02]"
                    : game.locked
                    ? "border-border bg-card/50 opacity-60 cursor-not-allowed"
                    : "border-border bg-card hover:border-primary/50 hover:bg-accent/50 hover:scale-[1.02]"
                }`}
              >
                {/* Lock Badge */}
                {game.locked && (
                  <div className="absolute top-4 right-4">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                      <Lock className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                )}

                {/* Icon */}
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                  style={{ background: game.color }}
                >
                  <game.icon className="w-8 h-8 text-black" />
                </div>

                {/* Content */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-bold text-lg">{game.title}</h3>
                    <Badge
                      variant={
                        game.difficulty === "Beginner"
                          ? "secondary"
                          : game.difficulty === "Intermediate"
                          ? "default"
                          : "destructive"
                      }
                      className="text-xs"
                    >
                      {game.difficulty}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {game.description}
                  </p>

                  {/* Skills */}
                  <div className="flex flex-wrap gap-2">
                    {game.skillsLearned.map((skill) => (
                      <Badge key={skill} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Progress or Start Button */}
                {!game.locked && (
                  <>
                    {game.progress && game.progress > 0 ? (
                      <div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                          <span>Progress</span>
                          <span>{game.progress}%</span>
                        </div>
                        <Progress value={game.progress} className="h-2" />
                      </div>
                    ) : (
                      <Button
                        className="w-full gap-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          onStartGame(game.id);
                        }}
                      >
                        <Play className="w-4 h-4" />
                        Start Challenge
                      </Button>
                    )}
                  </>
                )}

                {game.locked && (
                  <div className="text-center py-2">
                    <p className="text-xs text-muted-foreground">
                      Complete previous games to unlock
                    </p>
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Info Box */}
          <div className="mt-8 p-6 rounded-xl border-2" style={{background: 'linear-gradient(135deg, rgba(255, 250, 205, 0.1) 0%, rgba(255, 215, 0, 0.1) 25%, rgba(255, 250, 205, 0.1) 50%, rgba(255, 215, 0, 0.1) 75%, rgba(255, 250, 205, 0.1) 100%)', borderColor: 'rgba(255, 215, 0, 0.2)'}}>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{background: 'linear-gradient(135deg, #FFFACD 0%, #FFD700 25%, #FFFACD 50%, #FFD700 75%, #FFFACD 100%)'}}>
                <Zap className="w-6 h-6 text-black" />
              </div>
              <div>
                <h4 className="font-medium mb-2">How It Works</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Complete challenges to learn formulas step-by-step</li>
                  <li>• Earn badges and unlock new games as you progress</li>
                  <li>• Get hints from the AI assistant when you're stuck</li>
                  <li>• Track your learning streak and compete with friends</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
