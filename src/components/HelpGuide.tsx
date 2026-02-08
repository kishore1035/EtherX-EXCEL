import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";
import {
  Keyboard,
  Mouse,
  Palette,
  Table,
  Calculator,
  Users,
  Sparkles,
  FileDown,
  ChevronRight,
} from "lucide-react";

interface HelpGuideProps {
  open: boolean;
  onClose: () => void;
}

export function HelpGuide({ open, onClose }: HelpGuideProps) {
  const [activeTab, setActiveTab] = useState("getting-started");

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            EtherX Excel Help Guide
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="getting-started">Getting Started</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="shortcuts">Shortcuts</TabsTrigger>
            <TabsTrigger value="tips">Pro Tips</TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[500px] mt-4">
            {/* Getting Started */}
            <TabsContent value="getting-started" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mouse className="w-5 h-5" />
                    Basic Navigation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-start gap-3">
                      <ChevronRight className="w-4 h-4 mt-1 text-blue-500" />
                      <div>
                        <p className="font-medium">Select a Cell</p>
                        <p className="text-sm text-muted-foreground">Click on any cell to select it</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <ChevronRight className="w-4 h-4 mt-1 text-blue-500" />
                      <div>
                        <p className="font-medium">Select Entire Row</p>
                        <p className="text-sm text-muted-foreground">Click on the row number on the left side</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <ChevronRight className="w-4 h-4 mt-1 text-blue-500" />
                      <div>
                        <p className="font-medium">Select Entire Column</p>
                        <p className="text-sm text-muted-foreground">Click on the column letter at the top</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <ChevronRight className="w-4 h-4 mt-1 text-blue-500" />
                      <div>
                        <p className="font-medium">Type in a Cell</p>
                        <p className="text-sm text-muted-foreground">Just select a cell and start typing! No double-click needed</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <ChevronRight className="w-4 h-4 mt-1 text-blue-500" />
                      <div>
                        <p className="font-medium">Navigate with Arrow Keys</p>
                        <p className="text-sm text-muted-foreground">Use ↑↓←→ keys to move between cells</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Table className="w-5 h-5" />
                    Working with Data
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-start gap-3">
                      <ChevronRight className="w-4 h-4 mt-1 text-green-500" />
                      <div>
                        <p className="font-medium">Enter Data</p>
                        <p className="text-sm text-muted-foreground">Type text or numbers, then press Enter</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <ChevronRight className="w-4 h-4 mt-1 text-green-500" />
                      <div>
                        <p className="font-medium">Edit Data</p>
                        <p className="text-sm text-muted-foreground">Press F2 or click the formula bar to edit existing content</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <ChevronRight className="w-4 h-4 mt-1 text-green-500" />
                      <div>
                        <p className="font-medium">Copy & Paste</p>
                        <p className="text-sm text-muted-foreground">Ctrl+C to copy, Ctrl+V to paste (or use right-click menu)</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <ChevronRight className="w-4 h-4 mt-1 text-green-500" />
                      <div>
                        <p className="font-medium">Add Comments</p>
                        <p className="text-sm text-muted-foreground">Right-click on a cell and select "Add Comment"</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="w-5 h-5" />
                    Formulas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-start gap-3">
                      <ChevronRight className="w-4 h-4 mt-1 text-purple-500" />
                      <div>
                        <p className="font-medium">Start with =</p>
                        <p className="text-sm text-muted-foreground">All formulas begin with an equals sign</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <ChevronRight className="w-4 h-4 mt-1 text-purple-500" />
                      <div>
                        <p className="font-medium">Basic Operations</p>
                        <p className="text-sm text-muted-foreground">=A1+B1 (add), =A1-B1 (subtract), =A1*B1 (multiply), =A1/B1 (divide)</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <ChevronRight className="w-4 h-4 mt-1 text-purple-500" />
                      <div>
                        <p className="font-medium">Common Functions</p>
                        <p className="text-sm text-muted-foreground">=SUM(A1:A10), =AVERAGE(A1:A10), =MAX(A1:A10), =MIN(A1:A10)</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Features */}
            <TabsContent value="features" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="w-5 h-5" />
                    Formatting & Styling
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-start gap-3">
                      <ChevronRight className="w-4 h-4 mt-1 text-pink-500" />
                      <div>
                        <p className="font-medium">Text Formatting</p>
                        <p className="text-sm text-muted-foreground">Use toolbar buttons for Bold (Ctrl+B), Italic (Ctrl+I), Underline (Ctrl+U)</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <ChevronRight className="w-4 h-4 mt-1 text-pink-500" />
                      <div>
                        <p className="font-medium">Colors</p>
                        <p className="text-sm text-muted-foreground">96 preset colors + custom color picker for text and background</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <ChevronRight className="w-4 h-4 mt-1 text-pink-500" />
                      <div>
                        <p className="font-medium">Emojis</p>
                        <p className="text-sm text-muted-foreground">Click the emoji button in toolbar to add 200+ emojis</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <ChevronRight className="w-4 h-4 mt-1 text-pink-500" />
                      <div>
                        <p className="font-medium">Quick Actions</p>
                        <p className="text-sm text-muted-foreground">Add status icons like ✅ Done, ⏳ In Progress, 🔥 Urgent</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    Gen Z Features
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-start gap-3">
                      <ChevronRight className="w-4 h-4 mt-1 text-yellow-500" />
                      <div>
                        <p className="font-medium">Templates</p>
                        <p className="text-sm text-muted-foreground">Budget tracker, study schedule, workout planner, meal prep, and more!</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <ChevronRight className="w-4 h-4 mt-1 text-yellow-500" />
                      <div>
                        <p className="font-medium">Aesthetic Themes</p>
                        <p className="text-sm text-muted-foreground">Vaporwave, Cyberpunk, Pastel Dreams, Neon Night, and more!</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <ChevronRight className="w-4 h-4 mt-1 text-yellow-500" />
                      <div>
                        <p className="font-medium">Insert Images & GIFs</p>
                        <p className="text-sm text-muted-foreground">Right-click a cell → Insert Image to add visuals</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Collaboration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-start gap-3">
                      <ChevronRight className="w-4 h-4 mt-1 text-cyan-500" />
                      <div>
                        <p className="font-medium">Comments</p>
                        <p className="text-sm text-muted-foreground">Add notes and collaborate with team members on cells</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <ChevronRight className="w-4 h-4 mt-1 text-cyan-500" />
                      <div>
                        <p className="font-medium">Live Cursors</p>
                        <p className="text-sm text-muted-foreground">See where other users are working in real-time</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <ChevronRight className="w-4 h-4 mt-1 text-cyan-500" />
                      <div>
                        <p className="font-medium">Auto-Save</p>
                        <p className="text-sm text-muted-foreground">Your work is automatically saved every few seconds</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileDown className="w-5 h-5" />
                    Import & Export
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-start gap-3">
                      <ChevronRight className="w-4 h-4 mt-1 text-orange-500" />
                      <div>
                        <p className="font-medium">Export to CSV</p>
                        <p className="text-sm text-muted-foreground">Download your spreadsheet as CSV for Excel/Google Sheets</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <ChevronRight className="w-4 h-4 mt-1 text-orange-500" />
                      <div>
                        <p className="font-medium">Export to JSON</p>
                        <p className="text-sm text-muted-foreground">Export data as JSON for developers</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Keyboard Shortcuts */}
            <TabsContent value="shortcuts" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Keyboard className="w-5 h-5" />
                    Essential Shortcuts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center py-2 border-b border-border">
                      <span>Edit cell</span>
                      <kbd className="px-2 py-1 bg-muted rounded">F2</kbd>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-border">
                      <span>Bold</span>
                      <kbd className="px-2 py-1 bg-muted rounded">Ctrl+B</kbd>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-border">
                      <span>Italic</span>
                      <kbd className="px-2 py-1 bg-muted rounded">Ctrl+I</kbd>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-border">
                      <span>Underline</span>
                      <kbd className="px-2 py-1 bg-muted rounded">Ctrl+U</kbd>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-border">
                      <span>Copy</span>
                      <kbd className="px-2 py-1 bg-muted rounded">Ctrl+C</kbd>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-border">
                      <span>Paste</span>
                      <kbd className="px-2 py-1 bg-muted rounded">Ctrl+V</kbd>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-border">
                      <span>Undo</span>
                      <kbd className="px-2 py-1 bg-muted rounded">Ctrl+Z</kbd>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-border">
                      <span>Redo</span>
                      <kbd className="px-2 py-1 bg-muted rounded">Ctrl+Y</kbd>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-border">
                      <span>Find</span>
                      <kbd className="px-2 py-1 bg-muted rounded">Ctrl+F</kbd>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-border">
                      <span>Save</span>
                      <kbd className="px-2 py-1 bg-muted rounded">Ctrl+S</kbd>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-border">
                      <span>Select all</span>
                      <kbd className="px-2 py-1 bg-muted rounded">Ctrl+A</kbd>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span>Delete cell content</span>
                      <kbd className="px-2 py-1 bg-muted rounded">Delete</kbd>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Pro Tips */}
            <TabsContent value="tips" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>💡 Pro Tips</CardTitle>
                  <CardDescription>Get the most out of EtherX Excel</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                      <p className="font-medium text-blue-400">Use Templates</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Start with pre-built templates to save time on common tasks
                      </p>
                    </div>
                    <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                      <p className="font-medium text-purple-400">Conditional Formatting</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Highlight cells based on their values to spot trends quickly
                      </p>
                    </div>
                    <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <p className="font-medium text-green-400">Use Keyboard Shortcuts</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Master shortcuts to work 10x faster
                      </p>
                    </div>
                    <div className="p-3 bg-pink-500/10 border border-pink-500/20 rounded-lg">
                      <p className="font-medium text-pink-400">Freeze Headers</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Right-click row numbers to keep headers visible while scrolling
                      </p>
                    </div>
                    <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                      <p className="font-medium text-yellow-400">Add Comments</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Use comments to leave notes for yourself or collaborate with others
                      </p>
                    </div>
                    <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
                      <p className="font-medium text-cyan-400">Customize Themes</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Switch between aesthetic themes to match your vibe
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <div className="flex justify-end gap-2 mt-4">
          <Button onClick={onClose}>Got it!</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
