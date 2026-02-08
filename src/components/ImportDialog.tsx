import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { ScrollArea } from "./ui/scroll-area";
import { Badge } from "./ui/badge";
import {
  Upload,
  FileUp,
  Link2,
  Cloud,
  Folder,
  File,
  Check,
  X,
  Search,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner@2.0.3";

interface CloudFile {
  id: string;
  name: string;
  size: string;
  modifiedDate: string;
  type: "file" | "folder";
  mimeType?: string;
}

interface ImportDialogProps {
  open: boolean;
  onClose: () => void;
  onImport: (data: Map<string, any>) => void;
}

export function ImportDialog({ open, onClose, onImport }: ImportDialogProps) {
  const [selectedTab, setSelectedTab] = useState("local");
  const [isLoading, setIsLoading] = useState(false);
  const [googleDriveConnected, setGoogleDriveConnected] = useState(false);
  const [dropboxConnected, setDropboxConnected] = useState(false);
  const [googleDriveFiles, setGoogleDriveFiles] = useState<CloudFile[]>([]);
  const [dropboxFiles, setDropboxFiles] = useState<CloudFile[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFile, setSelectedFile] = useState<CloudFile | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mock Google Drive files
  const mockGoogleDriveFiles: CloudFile[] = [
    {
      id: "gd-1",
      name: "Budget 2025.csv",
      size: "15 KB",
      modifiedDate: "2 days ago",
      type: "file",
      mimeType: "text/csv",
    },
    {
      id: "gd-2",
      name: "Sales Data Q4.csv",
      size: "28 KB",
      modifiedDate: "1 week ago",
      type: "file",
      mimeType: "text/csv",
    },
    {
      id: "gd-3",
      name: "Spreadsheets",
      size: "—",
      modifiedDate: "3 weeks ago",
      type: "folder",
    },
    {
      id: "gd-4",
      name: "Expenses January.csv",
      size: "12 KB",
      modifiedDate: "1 month ago",
      type: "file",
      mimeType: "text/csv",
    },
  ];

  // Mock Dropbox files
  const mockDropboxFiles: CloudFile[] = [
    {
      id: "db-1",
      name: "Team Budget.csv",
      size: "22 KB",
      modifiedDate: "3 days ago",
      type: "file",
      mimeType: "text/csv",
    },
    {
      id: "db-2",
      name: "Project Data.csv",
      size: "35 KB",
      modifiedDate: "5 days ago",
      type: "file",
      mimeType: "text/csv",
    },
    {
      id: "db-3",
      name: "Work Files",
      size: "—",
      modifiedDate: "2 weeks ago",
      type: "folder",
    },
    {
      id: "db-4",
      name: "Student Grades.csv",
      size: "18 KB",
      modifiedDate: "3 weeks ago",
      type: "file",
      mimeType: "text/csv",
    },
  ];

  const handleLocalFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".csv")) {
      toast.error("Please select a CSV file");
      return;
    }

    setIsLoading(true);
    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const text = event.target?.result as string;
          const rows = text.split("\n").map((row) =>
            row.split(",").map((cell) => cell.replace(/^"|"$/g, "").trim())
          );

          const cells = new Map();
          rows.forEach((row, rowIndex) => {
            row.forEach((value, colIndex) => {
              if (value) {
                const cellId = `${String.fromCharCode(65 + colIndex)}${rowIndex + 1}`;
                cells.set(cellId, { value });
              }
            });
          });

          onImport(cells);
          toast.success(`Imported ${file.name} successfully!`);
          onClose();
        } catch (err) {
          toast.error("Failed to parse CSV file");
        } finally {
          setIsLoading(false);
        }
      };
      reader.onerror = () => {
        toast.error("Failed to read file");
        setIsLoading(false);
      };
      reader.readAsText(file);
    } catch (err) {
      toast.error("Failed to import file");
      setIsLoading(false);
    }
  };

  const handleConnectGoogleDrive = () => {
    // In production, this would open OAuth flow
    toast.info("Opening Google Drive authorization...");
    setTimeout(() => {
      setGoogleDriveConnected(true);
      setGoogleDriveFiles(mockGoogleDriveFiles);
      toast.success("Connected to Google Drive!");
    }, 1500);
  };

  const handleConnectDropbox = () => {
    // In production, this would open OAuth flow
    toast.info("Opening Dropbox authorization...");
    setTimeout(() => {
      setDropboxConnected(true);
      setDropboxFiles(mockDropboxFiles);
      toast.success("Connected to Dropbox!");
    }, 1500);
  };

  const handleImportCloudFile = (file: CloudFile, source: "google" | "dropbox") => {
    if (file.type === "folder") {
      toast.info(`Opening folder: ${file.name}`);
      return;
    }

    setIsLoading(true);
    // In production, this would call the backend API to fetch and import the file
    setTimeout(() => {
      // Mock imported data
      const mockCells = new Map();
      mockCells.set("A1", { value: "Imported from " + source });
      mockCells.set("A2", { value: file.name });
      mockCells.set("B1", { value: "Size", bold: true });
      mockCells.set("B2", { value: file.size });

      onImport(mockCells);
      toast.success(`Imported ${file.name} from ${source === "google" ? "Google Drive" : "Dropbox"}!`);
      onClose();
      setIsLoading(false);
    }, 1000);
  };

  const filteredGoogleFiles = googleDriveFiles.filter((file) =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredDropboxFiles = dropboxFiles.filter((file) =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileUp className="w-5 h-5" />
            Import Data
          </DialogTitle>
        </DialogHeader>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="local">
              <Upload className="w-4 h-4 mr-2" />
              Local File
            </TabsTrigger>
            <TabsTrigger value="google">
              <Cloud className="w-4 h-4 mr-2" />
              Google Drive
            </TabsTrigger>
            <TabsTrigger value="dropbox">
              <Cloud className="w-4 h-4 mr-2" />
              Dropbox
            </TabsTrigger>
          </TabsList>

          {/* Local File Upload */}
          <TabsContent value="local" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Upload CSV File</CardTitle>
                <CardDescription>
                  Import data from a CSV file on your computer
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div
                  className="border-2 border-dashed border-border rounded-lg p-12 text-center hover:border-primary/50 transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg font-medium mb-2">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-sm text-muted-foreground">
                    CSV files only (max 10MB)
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleLocalFileSelect}
                    className="hidden"
                  />
                </div>

                <div className="flex items-center gap-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <FileUp className="w-4 h-4 text-blue-500" />
                  <p className="text-sm text-muted-foreground">
                    CSV format: Comma-separated values with headers in the first row
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Or import from URL</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="https://example.com/data.csv"
                      className="flex-1"
                    />
                    <Button variant="outline">
                      <Link2 className="w-4 h-4 mr-2" />
                      Import
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Google Drive */}
          <TabsContent value="google" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Google Drive</CardTitle>
                <CardDescription>
                  Import CSV files from your Google Drive
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!googleDriveConnected ? (
                  <div className="text-center py-8">
                    <Cloud className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-medium mb-2">
                      Connect to Google Drive
                    </h3>
                    <p className="text-sm text-muted-foreground mb-6">
                      Access your CSV files stored in Google Drive
                    </p>
                    <Button onClick={handleConnectGoogleDrive} size="lg">
                      <Cloud className="w-4 h-4 mr-2" />
                      Connect Google Drive
                    </Button>
                    <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg mt-6">
                      <p className="text-xs text-muted-foreground">
                        We'll request read-only access to your CSV files
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="gap-1">
                          <Check className="w-3 h-3" />
                          Connected
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {filteredGoogleFiles.length} files
                        </span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setGoogleDriveConnected(false)}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Disconnect
                      </Button>
                    </div>

                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Search files..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>

                    <ScrollArea className="h-[300px] border rounded-lg">
                      <div className="p-2 space-y-1">
                        {filteredGoogleFiles.map((file) => (
                          <div
                            key={file.id}
                            className={`flex items-center justify-between p-3 rounded-lg hover:bg-accent cursor-pointer transition-colors ${
                              selectedFile?.id === file.id ? "bg-accent" : ""
                            }`}
                            onClick={() => setSelectedFile(file)}
                            onDoubleClick={() => handleImportCloudFile(file, "google")}
                          >
                            <div className="flex items-center gap-3 flex-1">
                              {file.type === "folder" ? (
                                <Folder className="w-5 h-5 text-blue-500" />
                              ) : (
                                <File className="w-5 h-5 text-green-500" />
                              )}
                              <div>
                                <p className="font-medium">{file.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {file.size} • {file.modifiedDate}
                                </p>
                              </div>
                            </div>
                            {file.type === "file" && (
                              <Button
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleImportCloudFile(file, "google");
                                }}
                              >
                                Import
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </ScrollArea>

                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        toast.info("Refreshing files...");
                        setTimeout(() => toast.success("Files refreshed"), 1000);
                      }}
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Refresh Files
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Dropbox */}
          <TabsContent value="dropbox" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Dropbox</CardTitle>
                <CardDescription>
                  Import CSV files from your Dropbox account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!dropboxConnected ? (
                  <div className="text-center py-8">
                    <Cloud className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-medium mb-2">Connect to Dropbox</h3>
                    <p className="text-sm text-muted-foreground mb-6">
                      Access your CSV files stored in Dropbox
                    </p>
                    <Button onClick={handleConnectDropbox} size="lg">
                      <Cloud className="w-4 h-4 mr-2" />
                      Connect Dropbox
                    </Button>
                    <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg mt-6">
                      <p className="text-xs text-muted-foreground">
                        We'll request read-only access to your CSV files
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="gap-1">
                          <Check className="w-3 h-3" />
                          Connected
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {filteredDropboxFiles.length} files
                        </span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDropboxConnected(false)}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Disconnect
                      </Button>
                    </div>

                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Search files..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>

                    <ScrollArea className="h-[300px] border rounded-lg">
                      <div className="p-2 space-y-1">
                        {filteredDropboxFiles.map((file) => (
                          <div
                            key={file.id}
                            className={`flex items-center justify-between p-3 rounded-lg hover:bg-accent cursor-pointer transition-colors ${
                              selectedFile?.id === file.id ? "bg-accent" : ""
                            }`}
                            onClick={() => setSelectedFile(file)}
                            onDoubleClick={() => handleImportCloudFile(file, "dropbox")}
                          >
                            <div className="flex items-center gap-3 flex-1">
                              {file.type === "folder" ? (
                                <Folder className="w-5 h-5 text-blue-500" />
                              ) : (
                                <File className="w-5 h-5 text-orange-500" />
                              )}
                              <div>
                                <p className="font-medium">{file.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {file.size} • {file.modifiedDate}
                                </p>
                              </div>
                            </div>
                            {file.type === "file" && (
                              <Button
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleImportCloudFile(file, "dropbox");
                                }}
                              >
                                Import
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </ScrollArea>

                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        toast.info("Refreshing files...");
                        setTimeout(() => toast.success("Files refreshed"), 1000);
                      }}
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Refresh Files
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}