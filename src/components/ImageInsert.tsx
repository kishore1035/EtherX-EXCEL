import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { ImagePlus, Link2, Search } from "lucide-react";
import { toast } from "sonner@2.0.3";

interface ImageInsertProps {
  open: boolean;
  onClose: () => void;
  onInsert: (imageUrl: string) => void;
}

export function ImageInsert({ open, onClose, onInsert }: ImageInsertProps) {
  const [imageUrl, setImageUrl] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Popular GIF categories
  const popularGifs = [
    { label: "✅ Success", url: "https://media.giphy.com/media/kyLYXonQYYfwYDIeZl/giphy.gif" },
    { label: "🎉 Celebrate", url: "https://media.giphy.com/media/g9582DNuQppxC/giphy.gif" },
    { label: "👍 Thumbs Up", url: "https://media.giphy.com/media/111ebonMs90YLu/giphy.gif" },
    { label: "💪 Strong", url: "https://media.giphy.com/media/26FPy3QZQqGtDcrja/giphy.gif" },
    { label: "🔥 Fire", url: "https://media.giphy.com/media/l0IypeKl9NJhPFMrK/giphy.gif" },
    { label: "⭐ Star", url: "https://media.giphy.com/media/3o7abGQa0aRJUurpII/giphy.gif" },
    { label: "💯 100", url: "https://media.giphy.com/media/lNByEO1uTi8P6JQZLm/giphy.gif" },
    { label: "⏳ Loading", url: "https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif" },
  ];

  const handleInsertUrl = () => {
    if (imageUrl.trim()) {
      onInsert(imageUrl);
      setImageUrl("");
      onClose();
      toast.success("Image inserted!");
    }
  };

  const handleInsertGif = (url: string) => {
    onInsert(url);
    onClose();
    toast.success("GIF inserted!");
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImagePlus className="w-5 h-5" />
            Insert Image or GIF
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="url" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="url">
              <Link2 className="w-4 h-4 mr-2" />
              URL
            </TabsTrigger>
            <TabsTrigger value="gifs">
              <Search className="w-4 h-4 mr-2" />
              Popular GIFs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="url" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Image URL</Label>
              <Input
                placeholder="https://example.com/image.jpg or .gif"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleInsertUrl();
                  }
                }}
              />
              <p className="text-xs text-muted-foreground">
                Enter a direct link to an image or GIF (jpg, png, gif, webp)
              </p>
            </div>

            {imageUrl && (
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">Preview:</p>
                <div className="max-h-[200px] overflow-hidden rounded border border-border">
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="w-full h-auto object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "";
                      (e.target as HTMLImageElement).alt = "Failed to load image";
                    }}
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleInsertUrl} disabled={!imageUrl.trim()}>
                Insert Image
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="gifs" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-3">
              {popularGifs.map((gif, index) => (
                <button
                  key={index}
                  onClick={() => handleInsertGif(gif.url)}
                  className="group relative aspect-video rounded-lg overflow-hidden border border-border hover:border-primary transition-colors"
                >
                  <img
                    src={gif.url}
                    alt={gif.label}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white font-medium">{gif.label}</span>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex justify-end">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
