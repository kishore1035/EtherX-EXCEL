import { useState } from "react";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback } from "./ui/avatar";
import {
  X,
  Clock,
  Eye,
  RotateCcw,
  Download,
  User,
  FileText,
} from "lucide-react";

interface Version {
  id: string;
  timestamp: Date;
  user: string;
  userInitials: string;
  changes: string;
  changeCount: number;
}

interface AdvancedVersionHistoryProps {
  open: boolean;
  onClose: () => void;
}

export function AdvancedVersionHistory({
  open,
  onClose,
}: AdvancedVersionHistoryProps) {
  const [versions] = useState<Version[]>([
    {
      id: "v7",
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      user: "John Doe",
      userInitials: "JD",
      changes: "Updated sales data for Q4",
      changeCount: 12,
    },
    {
      id: "v6",
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      user: "Jane Smith",
      userInitials: "JS",
      changes: "Added new product categories",
      changeCount: 8,
    },
    {
      id: "v5",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      user: "John Doe",
      userInitials: "JD",
      changes: "Fixed formula errors in column D",
      changeCount: 3,
    },
    {
      id: "v4",
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
      user: "Mike Johnson",
      userInitials: "MJ",
      changes: "Created pivot table analysis",
      changeCount: 15,
    },
    {
      id: "v3",
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      user: "Jane Smith",
      userInitials: "JS",
      changes: "Initial data import",
      changeCount: 250,
    },
  ]);

  const [selectedVersion, setSelectedVersion] = useState<string | null>(null);

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  if (!open) return null;

  return (
    <div className="fixed right-0 top-0 h-screen w-96 bg-card border-l border-border flex flex-col shadow-2xl z-50">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          <div>
            <h3 className="font-medium">Version History</h3>
            <p className="text-xs text-muted-foreground">
              {versions.length} versions
            </p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Timeline */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-6 top-0 bottom-0 w-px bg-border" />

            {/* Version entries */}
            <div className="space-y-6">
              {versions.map((version, index) => (
                <div
                  key={version.id}
                  className={`relative pl-14 cursor-pointer transition-all ${
                    selectedVersion === version.id
                      ? "transform scale-105"
                      : ""
                  }`}
                  onClick={() => setSelectedVersion(version.id)}
                >
                  {/* Timeline dot and avatar */}
                  <div className="absolute left-0 top-0">
                    <Avatar className="w-12 h-12 border-2 border-card bg-background">
                      <AvatarFallback className="text-xs">
                        {version.userInitials}
                      </AvatarFallback>
                    </Avatar>
                    {index === 0 && (
                      <Badge
                        variant="default"
                        className="absolute -right-2 -top-1 text-xs px-1.5 py-0"
                      >
                        Current
                      </Badge>
                    )}
                  </div>

                  {/* Version card */}
                  <div
                    className={`p-3 rounded-lg border transition-all ${
                      selectedVersion === version.id
                        ? "border-primary bg-primary/5 shadow-md"
                        : "border-border hover:border-primary/50 hover:bg-accent/50"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-sm font-medium">{version.user}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatTimestamp(version.timestamp)}
                        </p>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {version.changeCount} changes
                      </Badge>
                    </div>

                    <p className="text-sm text-muted-foreground mb-3">
                      {version.changes}
                    </p>

                    {selectedVersion === version.id && (
                      <div className="flex gap-2 pt-2 border-t border-border">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 gap-2"
                        >
                          <Eye className="w-3 h-3" />
                          Preview
                        </Button>
                        {index !== 0 && (
                          <Button size="sm" className="flex-1 gap-2">
                            <RotateCcw className="w-3 h-3" />
                            Restore
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>

      {/* Footer */}
      {selectedVersion && (
        <div className="p-4 border-t border-border space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
            <FileText className="w-4 h-4" />
            <span>
              Version {selectedVersion} selected
            </span>
          </div>
          <Button variant="outline" className="w-full gap-2">
            <Download className="w-4 h-4" />
            Export This Version
          </Button>
        </div>
      )}
    </div>
  );
}
