import { useState, useEffect } from "react";
import { Dialog, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { CellValidation } from "../types/spreadsheet";
import { X, Plus, Info, AlertTriangle, Ban } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { cn } from "./ui/utils";

interface DataValidationProps {
  open: boolean;
  onClose: () => void;
  currentValidation?: CellValidation;
  selectedRange?: string;
  onApply: (range: string, validation: CellValidation) => void;
  onRemove: (range: string) => void;
}

export function DataValidation({
  open,
  onClose,
  currentValidation,
  selectedRange = 'A1',
  onApply,
  onRemove,
}: DataValidationProps) {
  // Main settings
  const [validationType, setValidationType] = useState<'wholeNumber' | 'decimal' | 'list' | 'date' | 'time' | 'textLength' | 'custom'>(
    currentValidation?.type || 'wholeNumber'
  );
  const [range, setRange] = useState(selectedRange);
  const [allowBlank, setAllowBlank] = useState(currentValidation?.allowBlank !== false);

  // List validation
  const [listItems, setListItems] = useState<string[]>(
    currentValidation?.options || []
  );
  const [newItem, setNewItem] = useState("");

  // Number validation
  const [minValue, setMinValue] = useState(currentValidation?.min?.toString() || "0");
  const [maxValue, setMaxValue] = useState(currentValidation?.max?.toString() || "100");

  // Date validation
  const [startDate, setStartDate] = useState(currentValidation?.startDate || "");
  const [endDate, setEndDate] = useState(currentValidation?.endDate || "");

  // Time validation
  const [startTime, setStartTime] = useState(currentValidation?.startTime || "09:00");
  const [endTime, setEndTime] = useState(currentValidation?.endTime || "17:00");

  // Text length validation
  const [minLength, setMinLength] = useState(currentValidation?.minLength?.toString() || "1");
  const [maxLength, setMaxLength] = useState(currentValidation?.maxLength?.toString() || "255");

  // Custom formula validation
  const [formula, setFormula] = useState(currentValidation?.formula || "");

  // Input message
  const [inputTitle, setInputTitle] = useState(currentValidation?.inputTitle || "");
  const [inputMessage, setInputMessage] = useState(currentValidation?.inputMessage || "");

  // Error alert
  const [errorStyle, setErrorStyle] = useState<'stop' | 'warning' | 'information'>(
    currentValidation?.errorStyle || 'stop'
  );
  const [errorTitle, setErrorTitle] = useState(currentValidation?.errorTitle || "Invalid Entry");
  const [errorMessage, setErrorMessage] = useState(currentValidation?.errorMessage || "");

  useEffect(() => {
    setRange(selectedRange);
  }, [selectedRange]);

  const handleAddItem = () => {
    if (newItem.trim() && !listItems.includes(newItem.trim())) {
      setListItems([...listItems, newItem.trim()]);
      setNewItem("");
    }
  };

  const handleRemoveItem = (index: number) => {
    setListItems(listItems.filter((_, i) => i !== index));
  };

  const handleApply = () => {
    const validation: CellValidation = {
      type: validationType,
      allowBlank,
      inputTitle,
      inputMessage,
      errorTitle,
      errorMessage: errorMessage || getDefaultErrorMessage(),
      errorStyle,
    };

    switch (validationType) {
      case 'wholeNumber':
      case 'decimal':
        validation.min = parseFloat(minValue);
        validation.max = parseFloat(maxValue);
        break;
      case 'list':
        validation.options = listItems;
        break;
      case 'date':
        validation.startDate = startDate;
        validation.endDate = endDate;
        break;
      case 'time':
        validation.startTime = startTime;
        validation.endTime = endTime;
        break;
      case 'textLength':
        validation.minLength = parseInt(minLength);
        validation.maxLength = parseInt(maxLength);
        break;
      case 'custom':
        validation.formula = formula;
        break;
    }

    onApply(range, validation);
    onClose();
  };

  const handleRemove = () => {
    onRemove(range);
    onClose();
  };

  const getDefaultErrorMessage = (): string => {
    switch (validationType) {
      case 'wholeNumber':
        return `Please enter a whole number between ${minValue} and ${maxValue}`;
      case 'decimal':
        return `Please enter a decimal number between ${minValue} and ${maxValue}`;
      case 'list':
        return `Please select a value from the dropdown list`;
      case 'date':
        return `Please enter a date between ${startDate} and ${endDate}`;
      case 'time':
        return `Please enter a time between ${startTime} and ${endTime}`;
      case 'textLength':
        return `Text length must be between ${minLength} and ${maxLength} characters`;
      case 'custom':
        return `Value does not meet the validation criteria`;
      default:
        return 'Invalid input';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50" />
        <DialogPrimitive.Content
          className={cn(
            "bg-white data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-2xl translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg p-6 shadow-lg duration-200",
            "max-h-[90vh] overflow-y-auto"
          )}
          style={{
            border: '3px solid',
            borderImage: 'linear-gradient(135deg, #FFFFFF 0%, #FFD700 100%) 1'
          }}
        >
        {/* Hide the default close button */}
        <style>{`
          [data-slot="dialog-content"] > button[class*="absolute"] {
            display: none !important;
          }
        `}</style>
        <DialogHeader>
          <DialogTitle>Data Validation</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="settings" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white" style={{ border: '2px solid', borderImage: 'linear-gradient(135deg, #FFFFFF 0%, #FFD700 100%) 1' }}>
            <TabsTrigger 
              value="settings" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#FFFACD] data-[state=active]:to-[#FFD700]"
            >
              Settings
            </TabsTrigger>
            <TabsTrigger 
              value="input-message" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#FFFACD] data-[state=active]:to-[#FFD700]"
            >
              Input Message
            </TabsTrigger>
            <TabsTrigger 
              value="error-alert" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#FFFACD] data-[state=active]:to-[#FFD700]"
            >
              Error Alert
            </TabsTrigger>
          </TabsList>

          <TabsContent value="settings" className="space-y-4 mt-4">
            <div>
              <Label>Apply to Range</Label>
              <Input 
                value={range} 
                onChange={(e) => setRange(e.target.value)}
                onKeyDown={(e) => e.stopPropagation()}
                placeholder="e.g., A1 or A1:B10"
                style={{ background: 'linear-gradient(135deg, #FFFEF5 0%, #FFF9E6 100%)', border: '1px solid #FFD700' }}
                className="mt-1"
              />
            </div>

            <div>
              <Label>Validation Type</Label>
              <Select value={validationType} onValueChange={(v: any) => setValidationType(v)}>
                <SelectTrigger className="mt-1" style={{ background: 'linear-gradient(135deg, #FFFEF5 0%, #FFF9E6 100%)', border: '1px solid #FFD700' }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white" style={{ border: '1px solid #FFD700' }}>
                  <SelectItem value="wholeNumber" className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-[#FFFACD] data-[state=checked]:to-[#FFD700] hover:bg-gradient-to-r hover:from-[#FFFACD] hover:to-[#FFD700]">Whole Number</SelectItem>
                  <SelectItem value="decimal" className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-[#FFFACD] data-[state=checked]:to-[#FFD700] hover:bg-gradient-to-r hover:from-[#FFFACD] hover:to-[#FFD700]">Decimal Number</SelectItem>
                  <SelectItem value="list" className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-[#FFFACD] data-[state=checked]:to-[#FFD700] hover:bg-gradient-to-r hover:from-[#FFFACD] hover:to-[#FFD700]">Dropdown List</SelectItem>
                  <SelectItem value="date" className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-[#FFFACD] data-[state=checked]:to-[#FFD700] hover:bg-gradient-to-r hover:from-[#FFFACD] hover:to-[#FFD700]">Date</SelectItem>
                  <SelectItem value="time" className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-[#FFFACD] data-[state=checked]:to-[#FFD700] hover:bg-gradient-to-r hover:from-[#FFFACD] hover:to-[#FFD700]">Time</SelectItem>
                  <SelectItem value="textLength" className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-[#FFFACD] data-[state=checked]:to-[#FFD700] hover:bg-gradient-to-r hover:from-[#FFFACD] hover:to-[#FFD700]">Text Length</SelectItem>
                  <SelectItem value="custom" className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-[#FFFACD] data-[state=checked]:to-[#FFD700] hover:bg-gradient-to-r hover:from-[#FFFACD] hover:to-[#FFD700]">Custom Formula</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Whole Number / Decimal */}
            {(validationType === 'wholeNumber' || validationType === 'decimal') && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Minimum Value</Label>
                  <Input 
                    type="number"
                    step={validationType === 'decimal' ? '0.01' : '1'}
                    value={minValue}
                    onChange={(e) => setMinValue(e.target.value)}
                    onKeyDown={(e) => e.stopPropagation()}
                    style={{ background: 'linear-gradient(135deg, #FFFEF5 0%, #FFF9E6 100%)', border: '1px solid #FFD700' }}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Maximum Value</Label>
                  <Input 
                    type="number"
                    step={validationType === 'decimal' ? '0.01' : '1'}
                    value={maxValue}
                    onChange={(e) => setMaxValue(e.target.value)}
                    onKeyDown={(e) => e.stopPropagation()}
                    style={{ background: 'linear-gradient(135deg, #FFFEF5 0%, #FFF9E6 100%)', border: '1px solid #FFD700' }}
                    className="mt-1"
                  />
                </div>
              </div>
            )}

            {/* List */}
            {validationType === 'list' && (
              <div>
                <Label>Dropdown Items</Label>
                <div className="space-y-2 mt-2">
                  {listItems.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input value={item} readOnly className="flex-1 bg-white border-gray-300" />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveItem(index)}
                        className="shrink-0 bg-white border border-gray-300 hover:bg-gradient-to-r hover:from-[#FFFACD] hover:to-[#FFD700]"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <Input
                      value={newItem}
                      onChange={(e) => setNewItem(e.target.value)}
                      placeholder="Add new item"
                      className="bg-white border-gray-300"
                      onKeyDown={(e) => {
                        e.stopPropagation();
                        if (e.key === 'Enter') handleAddItem();
                      }}
                    />
                    <Button onClick={handleAddItem} size="icon" className="bg-black text-white hover:bg-gray-800">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs mt-2">
                    Separate items with commas or add them one by one
                  </p>
                </div>
              </div>
            )}

            {/* Date */}
            {validationType === 'date' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Date</Label>
                  <Input 
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    onKeyDown={(e) => e.stopPropagation()}
                    style={{ background: 'linear-gradient(135deg, #FFFEF5 0%, #FFF9E6 100%)', border: '1px solid #FFD700' }} className="mt-1"
                  />
                </div>
                <div>
                  <Label>End Date</Label>
                  <Input 
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    onKeyDown={(e) => e.stopPropagation()}
                    style={{ background: 'linear-gradient(135deg, #FFFEF5 0%, #FFF9E6 100%)', border: '1px solid #FFD700' }} className="mt-1"
                  />
                </div>
              </div>
            )}

            {/* Time */}
            {validationType === 'time' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Time</Label>
                  <Input 
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    onKeyDown={(e) => e.stopPropagation()}
                    style={{ background: 'linear-gradient(135deg, #FFFEF5 0%, #FFF9E6 100%)', border: '1px solid #FFD700' }} className="mt-1"
                  />
                </div>
                <div>
                  <Label>End Time</Label>
                  <Input 
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    onKeyDown={(e) => e.stopPropagation()}
                    style={{ background: 'linear-gradient(135deg, #FFFEF5 0%, #FFF9E6 100%)', border: '1px solid #FFD700' }} className="mt-1"
                  />
                </div>
              </div>
            )}

            {/* Text Length */}
            {validationType === 'textLength' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Minimum Length</Label>
                  <Input 
                    type="number"
                    value={minLength}
                    onChange={(e) => setMinLength(e.target.value)}
                    onKeyDown={(e) => e.stopPropagation()}
                    style={{ background: 'linear-gradient(135deg, #FFFEF5 0%, #FFF9E6 100%)', border: '1px solid #FFD700' }} className="mt-1"
                  />
                </div>
                <div>
                  <Label>Maximum Length</Label>
                  <Input 
                    type="number"
                    value={maxLength}
                    onChange={(e) => setMaxLength(e.target.value)}
                    onKeyDown={(e) => e.stopPropagation()}
                    style={{ background: 'linear-gradient(135deg, #FFFEF5 0%, #FFF9E6 100%)', border: '1px solid #FFD700' }} className="mt-1"
                  />
                </div>
              </div>
            )}

            {/* Custom Formula */}
            {validationType === 'custom' && (
              <div>
                <Label>Custom Formula</Label>
                <Textarea 
                  value={formula}
                  onChange={(e) => setFormula(e.target.value)}
                  onKeyDown={(e) => e.stopPropagation()}
                  placeholder="e.g., $VALUE > 0 && $VALUE < 100"
                  className="mt-1 font-mono"
                  rows={3}
                />
                <p className="text-xs mt-2">
                  Use $VALUE to reference the cell value. Formula must return true/false.
                </p>
              </div>
            )}

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="allowBlank"
                checked={allowBlank}
                onChange={(e) => setAllowBlank(e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="allowBlank" className="cursor-pointer">
                Allow blank cells
              </Label>
            </div>
          </TabsContent>

          <TabsContent value="input-message" className="space-y-4 mt-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-2">
                <Info className="h-5 w-5 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium">Input Message</h4>
                  <p className="text-sm mt-1">
                    This message appears when a user selects a cell with validation.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <Label>Title (Optional)</Label>
              <Input 
                value={inputTitle}
                onChange={(e) => setInputTitle(e.target.value)}
                onKeyDown={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
                placeholder="e.g., Enter Age"
                style={{ background: 'linear-gradient(135deg, #FFFEF5 0%, #FFF9E6 100%)', border: '1px solid #FFD700' }} className="mt-1"
              />
            </div>

            <div>
              <Label>Message (Optional)</Label>
              <Textarea 
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
                placeholder="e.g., Please enter your age between 18 and 100"
                style={{ background: 'linear-gradient(135deg, #FFFEF5 0%, #FFF9E6 100%)', border: '1px solid #FFD700' }} className="mt-1"
                rows={4}
              />
            </div>
          </TabsContent>

          <TabsContent value="error-alert" className="space-y-4 mt-4">
            <div>
              <Label>Error Alert Style</Label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setErrorStyle('stop')}
                  style={errorStyle === 'stop' ? { 
                    background: 'linear-gradient(135deg, #FFFACD 0%, #FFD700 100%)',
                    border: '2px solid #FFD700'
                  } : {
                    background: 'white',
                    border: '2px solid #FFD700'
                  }}
                  className="p-4 rounded-lg transition-all"
                >
                  <Ban className="h-8 w-8 mx-auto mb-2" />
                  <div className="font-medium">Stop</div>
                  <div className="text-xs">Blocks entry</div>
                </button>
                <button
                  type="button"
                  onClick={() => setErrorStyle('warning')}
                  style={errorStyle === 'warning' ? { 
                    background: 'linear-gradient(135deg, #FFFACD 0%, #FFD700 100%)',
                    border: '2px solid #FFD700'
                  } : {
                    background: 'white',
                    border: '2px solid #FFD700'
                  }}
                  className="p-4 rounded-lg transition-all"
                >
                  <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
                  <div className="font-medium">Warning</div>
                  <div className="text-xs">Can continue</div>
                </button>
                <button
                  type="button"
                  onClick={() => setErrorStyle('information')}
                  style={errorStyle === 'information' ? { 
                    background: 'linear-gradient(135deg, #FFFACD 0%, #FFD700 100%)',
                    border: '2px solid #FFD700'
                  } : {
                    background: 'white',
                    border: '2px solid #FFD700'
                  }}
                  className="p-4 rounded-lg transition-all"
                >
                  <Info className="h-8 w-8 mx-auto mb-2" />
                  <div className="font-medium">Information</div>
                  <div className="text-xs">Just informs</div>
                </button>
              </div>
            </div>

            <div>
              <Label>Error Title</Label>
              <Input 
                value={errorTitle}
                onChange={(e) => setErrorTitle(e.target.value)}
                onKeyDown={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
                placeholder="e.g., Invalid Entry"
                style={{ background: 'linear-gradient(135deg, #FFFEF5 0%, #FFF9E6 100%)', border: '1px solid #FFD700' }} className="mt-1"
              />
            </div>

            <div>
              <Label>Error Message</Label>
              <Textarea 
                value={errorMessage}
                onChange={(e) => setErrorMessage(e.target.value)}
                onKeyDown={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
                placeholder={getDefaultErrorMessage()}
                style={{ background: 'linear-gradient(135deg, #FFFEF5 0%, #FFF9E6 100%)', border: '1px solid #FFD700' }} className="mt-1"
                rows={4}
              />
              <p className="text-xs mt-1">
                Leave blank to use default message
              </p>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex gap-2 justify-between">
          <Button 
            variant="destructive" 
            onClick={handleRemove}
            disabled={!currentValidation}
          >
            Remove Validation
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleApply}
              style={{
                background: 'linear-gradient(135deg, #FFFACD 0%, #FFD700 25%, #FFFACD 50%, #FFD700 75%, #FFFACD 100%)',
                color: '#000',
              }}
            >
              Apply Validation
            </Button>
          </div>
        </DialogFooter>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </Dialog>
  );
}
