import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { useState } from "react";
import { Link, ExternalLink, Trash2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

interface HyperlinksProps {
  open: boolean;
  onClose: () => void;
  currentLink?: string;
  onAdd: (url: string, display?: string) => void;
  onRemove: () => void;
}

export function Hyperlinks({
  open,
  onClose,
  currentLink,
  onAdd,
  onRemove,
}: HyperlinksProps) {
  const [linkType, setLinkType] = useState<'url' | 'email' | 'cell'>('url');
  const [url, setUrl] = useState(currentLink || "");
  const [displayText, setDisplayText] = useState("");
  const [email, setEmail] = useState("");
  const [cellRef, setCellRef] = useState("");

  const handleAdd = () => {
    let finalUrl = "";
    
    switch (linkType) {
      case 'url':
        finalUrl = url.startsWith('http') ? url : `https://${url}`;
        break;
      case 'email':
        finalUrl = `mailto:${email}`;
        break;
      case 'cell':
        finalUrl = `#${cellRef}`;
        break;
    }

    if (finalUrl) {
      onAdd(finalUrl, displayText || undefined);
      onClose();
    }
  };

  const handleRemove = () => {
    onRemove();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link className="w-5 h-5" />
            Insert Hyperlink
          </DialogTitle>
        </DialogHeader>

        {currentLink ? (
          <div className="space-y-4">
            <div className="bg-accent/50 p-4 rounded-md">
              <p className="text-sm mb-2">Current Link:</p>
              <div className="flex items-center gap-2">
                <ExternalLink className="w-4 h-4 text-blue-500" />
                <a
                  href={currentLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-500 hover:underline flex-1 truncate"
                >
                  {currentLink}
                </a>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleRemove} variant="destructive" className="flex-1">
                <Trash2 className="w-4 h-4 mr-2" />
                Remove Link
              </Button>
              <Button
                onClick={() => {
                  setUrl(currentLink);
                  // Continue to edit mode
                }}
                variant="outline"
                className="flex-1"
              >
                Edit Link
              </Button>
            </div>
          </div>
        ) : (
          <Tabs value={linkType} onValueChange={(v: any) => setLinkType(v)} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="url">Web URL</TabsTrigger>
              <TabsTrigger value="email">Email</TabsTrigger>
              <TabsTrigger value="cell">Cell</TabsTrigger>
            </TabsList>

            <TabsContent value="url" className="space-y-4 mt-4">
              <div>
                <Label>URL</Label>
                <Input
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Enter the web address (https:// is optional)
                </p>
              </div>

              <div>
                <Label>Display Text (optional)</Label>
                <Input
                  placeholder="Click here"
                  value={displayText}
                  onChange={(e) => setDisplayText(e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Leave empty to show the URL
                </p>
              </div>
            </TabsContent>

            <TabsContent value="email" className="space-y-4 mt-4">
              <div>
                <Label>Email Address</Label>
                <Input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <Label>Display Text (optional)</Label>
                <Input
                  placeholder="Send Email"
                  value={displayText}
                  onChange={(e) => setDisplayText(e.target.value)}
                />
              </div>

              <div className="bg-blue-500/10 p-3 rounded-md text-sm">
                <p className="text-blue-500">
                  💡 Clicking this link will open the default email client
                </p>
              </div>
            </TabsContent>

            <TabsContent value="cell" className="space-y-4 mt-4">
              <div>
                <Label>Cell Reference</Label>
                <Input
                  placeholder="A1 or Sheet2!B5"
                  value={cellRef}
                  onChange={(e) => setCellRef(e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Navigate to a cell in the current or another sheet
                </p>
              </div>

              <div>
                <Label>Display Text (optional)</Label>
                <Input
                  placeholder="Go to cell"
                  value={displayText}
                  onChange={(e) => setDisplayText(e.target.value)}
                />
              </div>

              <div className="bg-blue-500/10 p-3 rounded-md text-sm">
                <p className="text-blue-500">
                  💡 Examples: A1, B10, Sheet2!C5
                </p>
              </div>
            </TabsContent>
          </Tabs>
        )}

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          {!currentLink && (
            <Button onClick={handleAdd}>
              <Link className="w-4 h-4 mr-2" />
              Insert Link
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
