import { useState } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Flame, Calendar, TrendingUp, Award } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";

interface LearningStreakProps {
  currentStreak: number;
  longestStreak: number;
  totalDays: number;
  lastActivityDate?: Date;
}

export function LearningStreak({
  currentStreak = 3,
  longestStreak = 7,
  totalDays = 15,
  lastActivityDate = new Date(),
}: LearningStreakProps) {
  const isActive = currentStreak > 0;

  // Generate calendar data for the last 30 days
  const getCalendarDays = () => {
    const days = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const isActive = i < currentStreak; // Simplified - would check actual activity
      days.push({
        date,
        active: isActive,
        day: date.getDate(),
      });
    }
    return days;
  };

  const calendarDays = getCalendarDays();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={isActive ? "default" : "outline"}
          size="sm"
          className={`gap-2 relative ${
            isActive
              ? "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
              : ""
          }`}
        >
          <Flame className={`w-4 h-4 ${isActive ? "animate-pulse" : ""}`} />
          <span className="font-bold">{currentStreak}</span>
          <span className="hidden md:inline">day streak</span>

          {/* Streak Badge */}
          {currentStreak >= 7 && (
            <Badge
              className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center p-0 bg-yellow-500 text-white border-2 border-background"
            >
              🔥
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Flame className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Learning Streak</h3>
              <p className="text-white/90 text-sm">Keep it going!</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-white/10 rounded-lg p-2 text-center backdrop-blur-sm">
              <p className="text-2xl font-bold">{currentStreak}</p>
              <p className="text-xs text-white/80">Current</p>
            </div>
            <div className="bg-white/10 rounded-lg p-2 text-center backdrop-blur-sm">
              <p className="text-2xl font-bold">{longestStreak}</p>
              <p className="text-xs text-white/80">Longest</p>
            </div>
            <div className="bg-white/10 rounded-lg p-2 text-center backdrop-blur-sm">
              <p className="text-2xl font-bold">{totalDays}</p>
              <p className="text-xs text-white/80">Total</p>
            </div>
          </div>
        </div>

        {/* Calendar */}
        <div className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <h4 className="text-sm font-medium">Last 30 Days</h4>
          </div>

          <div className="grid grid-cols-10 gap-1">
            {calendarDays.map((day, index) => (
              <div
                key={index}
                className={`aspect-square rounded-sm transition-all ${
                  day.active
                    ? "bg-gradient-to-br from-orange-500 to-red-500"
                    : "bg-accent"
                } hover:scale-110`}
                title={day.date.toLocaleDateString()}
              />
            ))}
          </div>

          <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
            <span>Less</span>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-sm bg-accent" />
              <div className="w-3 h-3 rounded-sm bg-orange-300" />
              <div className="w-3 h-3 rounded-sm bg-orange-500" />
              <div className="w-3 h-3 rounded-sm bg-red-500" />
            </div>
            <span>More</span>
          </div>
        </div>

        {/* Motivation */}
        <div className="p-4 border-t border-border bg-accent/30">
          <div className="flex items-start gap-2">
            <TrendingUp className="w-4 h-4 text-green-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium mb-1">
                {currentStreak >= 7
                  ? "Amazing! You're on fire! 🔥"
                  : currentStreak >= 3
                  ? "Great job! Keep it up! ⭐"
                  : "Start building your streak today! 💪"}
              </p>
              <p className="text-xs text-muted-foreground">
                {currentStreak >= 7
                  ? "You've earned the Week Warrior badge!"
                  : `${7 - currentStreak} more days to earn Week Warrior badge`}
              </p>
            </div>
          </div>
        </div>

        {/* Milestones */}
        <div className="p-4 border-t border-border">
          <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
            <Award className="w-4 h-4" />
            Upcoming Milestones
          </h4>
          <div className="space-y-2">
            {[
              { days: 7, label: "Week Warrior", unlocked: currentStreak >= 7 },
              { days: 14, label: "Two Week Champion", unlocked: currentStreak >= 14 },
              { days: 30, label: "Monthly Master", unlocked: currentStreak >= 30 },
            ].map((milestone) => (
              <div
                key={milestone.days}
                className={`flex items-center justify-between text-xs ${
                  milestone.unlocked ? "text-green-600" : "text-muted-foreground"
                }`}
              >
                <span>
                  {milestone.unlocked ? "✓" : "○"} {milestone.label}
                </span>
                <Badge variant="outline" className="text-xs">
                  {milestone.days} days
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
