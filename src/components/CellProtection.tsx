import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Checkbox } from "./ui/checkbox";
import { useState } from "react";
import { Lock, Unlock, Shield } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

interface CellProtectionProps {
  open: boolean;
  onClose: () => void;
  onProtectCell: (locked: boolean) => void;
  onProtectSheet: (password?: string) => void;
  onUnprotectSheet: (password?: string) => void;
  isSheetProtected: boolean;
  isCellLocked: boolean;
}

export function CellProtection({
  open,
  onClose,
  onProtectCell,
  onProtectSheet,
  onUnprotectSheet,
  isSheetProtected,
  isCellLocked,
}: CellProtectionProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [unlockPassword, setUnlockPassword] = useState("");
  const [requirePassword, setRequirePassword] = useState(false);

  const handleProtectSheet = () => {
    if (requirePassword) {
      if (password !== confirmPassword) {
        alert("Passwords do not match!");
        return;
      }
      if (password.length < 4) {
        alert("Password must be at least 4 characters");
        return;
      }
    }
    
    onProtectSheet(requirePassword ? password : undefined);
    setPassword("");
    setConfirmPassword("");
    onClose();
  };

  const handleUnprotectSheet = () => {
    onUnprotectSheet(unlockPassword || undefined);
    setUnlockPassword("");
    onClose();
  };

  const handleToggleCellLock = () => {
    onProtectCell(!isCellLocked);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Cell & Sheet Protection
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="cell" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="cell">
              <Lock className="w-4 h-4 mr-2" />
              Cell Lock
            </TabsTrigger>
            <TabsTrigger value="sheet">
              <Shield className="w-4 h-4 mr-2" />
              Sheet Protection
            </TabsTrigger>
          </TabsList>

          <TabsContent value="cell" className="space-y-4 mt-4">
            <p className="text-sm text-muted-foreground">
              Lock individual cells to prevent editing when the sheet is protected
            </p>

            <div className="bg-accent/50 p-4 rounded-md space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Current cell status:</span>
                <span className="text-sm font-medium">
                  {isCellLocked ? (
                    <>
                      <Lock className="w-4 h-4 inline mr-1" />
                      Locked
                    </>
                  ) : (
                    <>
                      <Unlock className="w-4 h-4 inline mr-1" />
                      Unlocked
                    </>
                  )}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-md text-sm" style={{background: 'linear-gradient(135deg, #FFFACD20 0%, #FFD70020 100%)'}}>
              <p>
                💡 Note: Locking cells only takes effect when the sheet is protected
              </p>
            </div>

            <Button onClick={handleToggleCellLock} className="w-full">
              {isCellLocked ? (
                <>
                  <Unlock className="w-4 h-4 mr-2" />
                  Unlock Cell
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 mr-2" />
                  Lock Cell
                </>
              )}
            </Button>
          </TabsContent>

          <TabsContent value="sheet" className="space-y-4 mt-4">
            {!isSheetProtected ? (
              <>
                <p className="text-sm text-muted-foreground">
                  Protect the sheet to prevent editing of locked cells
                </p>

                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={requirePassword}
                    onCheckedChange={(checked) => setRequirePassword(checked as boolean)}
                  />
                  <Label>Require password to unprotect</Label>
                </div>

                {requirePassword && (
                  <div className="space-y-3">
                    <div>
                      <Label>Password</Label>
                      <Input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter password (min 4 characters)"
                      />
                    </div>
                    <div>
                      <Label>Confirm Password</Label>
                      <Input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter password"
                      />
                    </div>
                  </div>
                )}

                <div className="bg-amber-500/10 p-3 rounded-md text-sm">
                  <p className="text-amber-500">
                    ⚠️ Remember your password! There's no recovery option.
                  </p>
                </div>

                <Button onClick={handleProtectSheet} className="w-full">
                  <Shield className="w-4 h-4 mr-2" />
                  Protect Sheet
                </Button>
              </>
            ) : (
              <>
                <div className="p-4 rounded-md" style={{background: 'linear-gradient(135deg, #FFFACD20 0%, #FFD70020 100%)'}}>
                  <p className="text-sm">
                    ✓ This sheet is currently protected
                  </p>
                </div>

                <div>
                  <Label>Enter Password to Unprotect</Label>
                  <Input
                    type="password"
                    value={unlockPassword}
                    onChange={(e) => setUnlockPassword(e.target.value)}
                    placeholder="Enter protection password"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Leave empty if no password was set
                  </p>
                </div>

                <Button onClick={handleUnprotectSheet} className="w-full" variant="destructive">
                  <Unlock className="w-4 h-4 mr-2" />
                  Unprotect Sheet
                </Button>
              </>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
