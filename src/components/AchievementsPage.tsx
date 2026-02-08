import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { ScrollArea } from "./ui/scroll-area";
import {
  Trophy,
  Star,
  Zap,
  Target,
  Award,
  Crown,
  Flame,
  TrendingUp,
  Lock,
} from "lucide-react";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: any;
  unlocked: boolean;
  unlockedAt?: Date;
  rarity: "common" | "rare" | "epic" | "legendary";
  category: string;
}

const achievements: Achievement[] = [
  {
    id: "first-steps",
    title: "First Steps",
    description: "Complete the guided tour",
    icon: Star,
    unlocked: true,
    unlockedAt: new Date(),
    rarity: "common",
    category: "Getting Started",
  },
  {
    id: "sum-superstar",
    title: "SUM Super-Star",
    description: "Use the SUM function 10 times",
    icon: Zap,
    unlocked: true,
    unlockedAt: new Date(),
    rarity: "common",
    category: "Formulas",
  },
  {
    id: "vlookup-virtuoso",
    title: "VLOOKUP Virtuoso",
    description: "Successfully use VLOOKUP 5 times",
    icon: Target,
    unlocked: false,
    rarity: "rare",
    category: "Formulas",
  },
  {
    id: "gradebook-master",
    title: "Gradebook Master",
    description: "Complete The Gradebook Guru game",
    icon: Trophy,
    unlocked: true,
    unlockedAt: new Date(),
    rarity: "rare",
    category: "Games",
  },
  {
    id: "chart-champion",
    title: "Chart Champion",
    description: "Create 20 different charts",
    icon: Award,
    unlocked: false,
    rarity: "epic",
    category: "Visualization",
  },
  {
    id: "pivot-pro",
    title: "Pivot Pro",
    description: "Master PivotTable creation",
    icon: Crown,
    unlocked: false,
    rarity: "epic",
    category: "Data Analysis",
  },
  {
    id: "seven-day-streak",
    title: "Week Warrior",
    description: "Maintain a 7-day learning streak",
    icon: Flame,
    unlocked: false,
    rarity: "rare",
    category: "Consistency",
  },
  {
    id: "formula-legend",
    title: "Formula Legend",
    description: "Master all basic and advanced formulas",
    icon: Crown,
    unlocked: false,
    rarity: "legendary",
    category: "Formulas",
  },
  {
    id: "data-wizard",
    title: "Data Wizard",
    description: "Complete all games and challenges",
    icon: Trophy,
    unlocked: false,
    rarity: "legendary",
    category: "Games",
  },
];

interface AchievementsPageProps {
  open: boolean;
  onClose: () => void;
}

export function AchievementsPage({ open, onClose }: AchievementsPageProps) {
  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const totalCount = achievements.length;
  const progressPercent = (unlockedCount / totalCount) * 100;

  const getRarityGradient = (rarity: string) => {
    // All rarities use white-gold gradient
    return 'linear-gradient(135deg, #FFFACD 0%, #FFD700 25%, #FFFACD 50%, #FFD700 75%, #FFFACD 100%)';
  };

  const getRarityBadge = (rarity: string) => {
    // All badges use white-gold gradient
    return "";
  };

  const getRarityBadgeStyle = () => {
    return { background: 'linear-gradient(135deg, #FFFACD 0%, #FFD700 25%, #FFFACD 50%, #FFD700 75%, #FFFACD 100%)' };
  };

  // Group by category
  const categories = Array.from(new Set(achievements.map((a) => a.category)));

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl p-0 gap-0 max-h-[90vh]">
        {/* Header */}
        <div className="relative p-8" style={{background: 'linear-gradient(135deg, #FFFACD 0%, #FFD700 25%, #FFFACD 50%, #FFD700 75%, #FFFACD 100%)'}}>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Trophy className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <h2 className="text-3xl font-bold mb-1">Achievements</h2>
              <p className="text-white/90">
                {unlockedCount} of {totalCount} unlocked
              </p>
            </div>
            <div className="text-center">
              <p className="text-5xl font-bold">{Math.round(progressPercent)}%</p>
              <p className="text-sm text-white/80">Complete</p>
            </div>
          </div>
          <Progress value={progressPercent} className="h-2 bg-white/20" />
        </div>

        {/* Content */}
        <ScrollArea className="max-h-[calc(90vh-180px)]">
          <div className="p-8 space-y-8">
            {categories.map((category) => (
              <div key={category}>
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  {category}
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  {achievements
                    .filter((a) => a.category === category)
                    .map((achievement) => (
                      <div
                        key={achievement.id}
                        className={`group relative p-6 rounded-xl border-2 transition-all ${
                          achievement.unlocked
                            ? "border-border bg-card hover:border-primary/50 hover:shadow-lg"
                            : "border-border/50 bg-card/50"
                        }`}
                      >
                        {/* Rarity Badge */}
                        <div className="absolute top-3 right-3">
                          <Badge
                            className={`text-xs ${getRarityBadge(achievement.rarity)}`}
                            style={getRarityBadgeStyle()}
                          >
                            {achievement.rarity}
                          </Badge>
                        </div>

                        {/* Icon */}
                        <div
                          className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-4 mx-auto ${
                            achievement.unlocked
                              ? "group-hover:scale-110"
                              : "grayscale"
                          } transition-transform`}
                          style={{ background: getRarityGradient(achievement.rarity) }}
                        >
                          {achievement.unlocked ? (
                            <achievement.icon className="w-10 h-10" />
                          ) : (
                            <Lock className="w-10 h-10" />
                          )}
                        </div>

                        {/* Title */}
                        <h4 className="font-bold text-center mb-2">
                          {achievement.title}
                        </h4>

                        {/* Description */}
                        <p className="text-sm text-muted-foreground text-center mb-3">
                          {achievement.description}
                        </p>

                        {/* Unlocked Date */}
                        {achievement.unlocked && achievement.unlockedAt && (
                          <p className="text-xs text-muted-foreground text-center">
                            Unlocked{" "}
                            {achievement.unlockedAt.toLocaleDateString()}
                          </p>
                        )}

                        {!achievement.unlocked && (
                          <p className="text-xs text-muted-foreground text-center">
                            🔒 Locked
                          </p>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
