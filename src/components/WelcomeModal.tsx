import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  Sparkles,
  BookOpen,
  Trophy,
  Zap,
  ArrowRight,
  X,
  GraduationCap,
} from "lucide-react";

interface WelcomeModalProps {
  open: boolean;
  onClose: () => void;
  onStartTour: () => void;
  onOpenGames: () => void;
  userName?: string;
}

export function WelcomeModal({
  open,
  onClose,
  onStartTour,
  onOpenGames,
  userName = "there",
}: WelcomeModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden">
        {/* Header with gradient */}
        <div className="relative p-8" style={{background: 'linear-gradient(135deg, #FFFACD 0%, #FFD700 25%, #FFFACD 50%, #FFD700 75%, #FFFACD 100%)'}}>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-white hover:bg-white/20"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Sparkles className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-3xl font-bold">Welcome to EtherX Excel!</h2>
              <p className="text-white/90 mt-1">Hi {userName}, let's get you started</p>
            </div>
          </div>
          <p className="text-white/80 max-w-lg">
            The most powerful spreadsheet app designed for students and professionals.
            Learn formulas, analyze data, and level up your skills!
          </p>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          {/* Quick Start Options */}
          <div className="grid grid-cols-2 gap-4">
            {/* Guided Tour */}
            <button
              onClick={() => {
                onStartTour();
                onClose();
              }}
              className="group relative p-6 rounded-xl border-2 border-border hover:border-blue-500 transition-all text-left bg-card hover:bg-accent/50"
            >
              <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <BookOpen className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="font-medium mb-2">Take a Guided Tour</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Learn the basics in just 5 minutes with our interactive walkthrough
              </p>
              <Badge variant="secondary" className="gap-1">
                <Zap className="w-3 h-3" />
                Recommended
              </Badge>
            </button>

            {/* Games */}
            <button
              onClick={() => {
                onOpenGames();
                onClose();
              }}
              className="group relative p-6 rounded-xl border-2 border-border hover:border-purple-500 transition-all text-left bg-card hover:bg-accent/50"
            >
              <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Trophy className="w-6 h-6 text-purple-500" />
              </div>
              <h3 className="font-medium mb-2">Play Formula Games</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Master formulas through fun, interactive challenges
              </p>
              <Badge variant="secondary" className="gap-1">
                <GraduationCap className="w-3 h-3" />
                Learn & Play
              </Badge>
            </button>
          </div>

          {/* Features Preview */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">What you'll learn:</h4>
            <div className="grid gap-3">
              {[
                { icon: "📊", text: "Create powerful charts and visualizations" },
                { icon: "🔢", text: "Master essential formulas like SUM, AVERAGE, VLOOKUP" },
                { icon: "🎯", text: "Analyze data with PivotTables and filters" },
                { icon: "✨", text: "Use AI assistance for instant help" },
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 rounded-lg bg-accent/50"
                >
                  <span className="text-2xl">{item.icon}</span>
                  <span className="text-sm">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <Button variant="outline" onClick={onClose}>
              Skip for now
            </Button>
            <Button onClick={() => { onStartTour(); onClose(); }} className="gap-2">
              Start Learning
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
