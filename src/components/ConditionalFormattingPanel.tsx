import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { X, Plus, ChevronUp, ChevronDown, Edit2, Copy, Trash2 } from 'lucide-react';

export interface ConditionalFormattingRule {
  id: string;
  sheetId?: string;
  range: string;
  ruleType: 'highlight' | 'topBottom' | 'aboveBelow' | 'dataBars' | 'colorScales' | 'iconSets' | 'duplicates' | 'unique' | 'customFormula';
  criteria: {
    operator?: 'greaterThan' | 'lessThan' | 'between' | 'equalTo' | 'contains' | 'notContains';
    value1?: string;
    value2?: string;
    formula?: string;
    topN?: number;
    bottomN?: number;
    aboveAverage?: boolean;
    belowAverage?: boolean;
  };
  format: {
    bgColor?: string;
    textColor?: string;
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    borderColor?: string;
    borderWidth?: string;
    icon?: string;
    dataBarColor?: string;
    colorScale?: {
      type: '2color' | '3color';
      minColor: string;
      midColor?: string;
      maxColor: string;
    };
  };
  priority: number;
  appliesTo: 'cell' | 'row' | 'column' | 'dynamic';
  enabled: boolean;
}

interface ConditionalFormattingPanelProps {
  open: boolean;
  onClose: () => void;
  selectedRange: string;
  existingRules: ConditionalFormattingRule[];
  onApplyRule: (rule: ConditionalFormattingRule) => void;
  onUpdateRule: (id: string, rule: ConditionalFormattingRule) => void;
  onDeleteRule: (id: string) => void;
  onReorderRule: (id: string, direction: 'up' | 'down') => void;
  onToggleRule: (id: string, enabled: boolean) => void;
}

export function ConditionalFormattingPanel({
  open,
  onClose,
  selectedRange,
  existingRules,
  onApplyRule,
  onUpdateRule,
  onDeleteRule,
  onReorderRule,
  onToggleRule
}: ConditionalFormattingPanelProps) {
  const [mode, setMode] = useState<'menu' | 'create' | 'manage'>('menu');
  const [editingRule, setEditingRule] = useState<ConditionalFormattingRule | null>(null);
  
  // Form state for creating/editing rules
  const [ruleType, setRuleType] = useState<ConditionalFormattingRule['ruleType']>('highlight');
  const [range, setRange] = useState(selectedRange);

  // Update range when selectedRange changes (e.g., when dialog opens with new selection)
  React.useEffect(() => {
    if (open) {
      setRange(selectedRange);
    }
  }, [open, selectedRange]);
  const [operator, setOperator] = useState<'greaterThan' | 'lessThan' | 'between' | 'equalTo' | 'contains'>('greaterThan');
  const [value1, setValue1] = useState('');
  const [value2, setValue2] = useState('');
  const [formula, setFormula] = useState('');
  const [topN, setTopN] = useState('10');
  const [bgColor, setBgColor] = useState('#dbeafe');
  const [textColor, setTextColor] = useState('#1e40af');
  const [bold, setBold] = useState(false);
  const [italic, setItalic] = useState(false);
  const [underline, setUnderline] = useState(false);
  const [dataBarColor, setDataBarColor] = useState('#3b82f6');
  const [colorScaleType, setColorScaleType] = useState<'2color' | '3color'>('2color');
  const [minColor, setMinColor] = useState('#ef4444');
  const [midColor, setMidColor] = useState('#fbbf24');
  const [maxColor, setMaxColor] = useState('#22c55e');

  const handleCreateRule = () => {
    // Validate required fields
    if (!range || !range.trim()) {
      alert('Please enter a valid cell range (e.g., A1:A10)');
      return;
    }

    if (ruleType === 'highlight' && !value1.trim()) {
      alert('Please enter a value for the condition');
      return;
    }

    if (ruleType === 'highlight' && operator === 'between' && !value2.trim()) {
      alert('Please enter a second value for the "between" condition');
      return;
    }

    if (ruleType === 'customFormula' && !formula.trim()) {
      alert('Please enter a formula');
      return;
    }

    const newRule: ConditionalFormattingRule = {
      id: `rule_${Date.now()}`,
      range: range.trim().toUpperCase(),
      ruleType,
      criteria: {
        operator: ruleType === 'highlight' ? operator : undefined,
        value1: ruleType === 'highlight' ? value1.trim() : undefined,
        value2: ruleType === 'highlight' && operator === 'between' ? value2.trim() : undefined,
        formula: ruleType === 'customFormula' ? formula.trim() : undefined,
        topN: ruleType === 'topBottom' ? parseInt(topN) || 10 : undefined,
        aboveAverage: ruleType === 'aboveBelow' ? true : undefined,
      },
      format: {
        bgColor: ruleType === 'highlight' ? bgColor : undefined,
        textColor: ruleType === 'highlight' ? textColor : undefined,
        bold: ruleType === 'highlight' ? bold : undefined,
        italic: ruleType === 'highlight' ? italic : undefined,
        underline: ruleType === 'highlight' ? underline : undefined,
        dataBarColor: ruleType === 'dataBars' ? dataBarColor : undefined,
        colorScale: ruleType === 'colorScales' ? {
          type: colorScaleType,
          minColor,
          midColor: colorScaleType === '3color' ? midColor : undefined,
          maxColor
        } : undefined,
      },
      priority: existingRules.length,
      appliesTo: 'cell',
      enabled: true
    };

    // Apply the rule
    onApplyRule(newRule);
    
    // Reset form and close dialog
    resetForm();
    setMode('menu');
    onClose();
  };

  const resetForm = () => {
    setRange(selectedRange);
    setRuleType('highlight');
    setOperator('greaterThan');
    setValue1('');
    setValue2('');
    setFormula('');
    setTopN('10');
    setBgColor('#dbeafe');
    setTextColor('#1e40af');
    setBold(false);
    setItalic(false);
    setUnderline(false);
    setDataBarColor('#3b82f6');
    setColorScaleType('2color');
    setMinColor('#ef4444');
    setMidColor('#fbbf24');
    setMaxColor('#22c55e');
    setEditingRule(null);
  };

  const handleQuickAction = (type: ConditionalFormattingRule['ruleType']) => {
    setRuleType(type);
    setMode('create');
  };

  const getRuleDescription = (rule: ConditionalFormattingRule): string => {
    switch (rule.ruleType) {
      case 'highlight':
        return `Highlight cells ${rule.criteria.operator} ${rule.criteria.value1}`;
      case 'topBottom':
        return `Top ${rule.criteria.topN} values`;
      case 'aboveBelow':
        return rule.criteria.aboveAverage ? 'Above average' : 'Below average';
      case 'dataBars':
        return 'Data bars';
      case 'colorScales':
        return `${rule.format.colorScale?.type === '3color' ? '3' : '2'}-color scale`;
      case 'iconSets':
        return 'Icon sets';
      case 'duplicates':
        return 'Duplicate values';
      case 'unique':
        return 'Unique values';
      case 'customFormula':
        return `Formula: ${rule.criteria.formula}`;
      default:
        return 'Custom rule';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
        {/* Hide the default close button */}
        <style>{`
          [data-slot="dialog-content"] > button[class*="absolute"] {
            display: none !important;
          }
        `}</style>
        <DialogHeader>
          <DialogTitle>
            {mode === 'menu' && 'Conditional Formatting'}
            {mode === 'create' && 'New Formatting Rule'}
            {mode === 'manage' && 'Manage Rules'}
          </DialogTitle>
        </DialogHeader>

        {/* Quick Menu */}
        {mode === 'menu' && (
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                style={{ background: 'linear-gradient(to right, #FFFEF5, #FFF9E6)', border: '1px solid #FFD700' }}
                className="h-20 flex flex-col items-start justify-center text-left"
                onClick={() => handleQuickAction('highlight')}
                onMouseEnter={(e) => e.currentTarget.style.background = 'linear-gradient(to right, #FFFACD, #FFD700)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'linear-gradient(to right, #FFFEF5, #FFF9E6)'}
              >
                <span className="font-semibold">Highlight Cells Rules</span>
                <span className="text-xs">Greater than, less than, between...</span>
              </Button>
              
              <Button
                variant="outline"
                style={{ background: 'linear-gradient(to right, #FFFEF5, #FFF9E6)', border: '1px solid #FFD700' }}
                className="h-20 flex flex-col items-start justify-center text-left"
                onClick={() => handleQuickAction('topBottom')}
                onMouseEnter={(e) => e.currentTarget.style.background = 'linear-gradient(to right, #FFFACD, #FFD700)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'linear-gradient(to right, #FFFEF5, #FFF9E6)'}
              >
                <span className="font-semibold">Top/Bottom Rules</span>
                <span className="text-xs">Top 10, bottom 10...</span>
              </Button>
              
              <Button
                variant="outline"
                style={{ background: 'linear-gradient(to right, #FFFEF5, #FFF9E6)', border: '1px solid #FFD700' }}
                className="h-20 flex flex-col items-start justify-center text-left"
                onClick={() => handleQuickAction('dataBars')}
                onMouseEnter={(e) => e.currentTarget.style.background = 'linear-gradient(to right, #FFFACD, #FFD700)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'linear-gradient(to right, #FFFEF5, #FFF9E6)'}
              >
                <span className="font-semibold">Data Bars</span>
                <span className="text-xs">Visual bars in cells</span>
              </Button>
              
              <Button
                variant="outline"
                style={{ background: 'linear-gradient(to right, #FFFEF5, #FFF9E6)', border: '1px solid #FFD700' }}
                className="h-20 flex flex-col items-start justify-center text-left"
                onClick={() => handleQuickAction('colorScales')}
                onMouseEnter={(e) => e.currentTarget.style.background = 'linear-gradient(to right, #FFFACD, #FFD700)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'linear-gradient(to right, #FFFEF5, #FFF9E6)'}
              >
                <span className="font-semibold">Color Scales</span>
                <span className="text-xs">2 or 3 color gradients</span>
              </Button>
              
              <Button
                variant="outline"
                style={{ background: 'linear-gradient(to right, #FFFEF5, #FFF9E6)', border: '1px solid #FFD700' }}
                className="h-20 flex flex-col items-start justify-center text-left"
                onClick={() => handleQuickAction('iconSets')}
                onMouseEnter={(e) => e.currentTarget.style.background = 'linear-gradient(to right, #FFFACD, #FFD700)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'linear-gradient(to right, #FFFEF5, #FFF9E6)'}
              >
                <span className="font-semibold">Icon Sets</span>
                <span className="text-xs">Traffic lights, arrows...</span>
              </Button>
              
              <Button
                variant="outline"
                style={{ background: 'linear-gradient(to right, #FFFEF5, #FFF9E6)', border: '1px solid #FFD700' }}
                className="h-20 flex flex-col items-start justify-center text-left"
                onClick={() => handleQuickAction('customFormula')}
                onMouseEnter={(e) => e.currentTarget.style.background = 'linear-gradient(to right, #FFFACD, #FFD700)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'linear-gradient(to right, #FFFEF5, #FFF9E6)'}
              >
                <span className="font-semibold">Custom Formula</span>
                <span className="text-xs">Use formula to determine...</span>
              </Button>
            </div>

            <div className="flex justify-between pt-4 border-t border-gray-300">
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  style={{ background: 'linear-gradient(to right, #FFFEF5, #FFF9E6)', border: '1px solid #FFD700' }}
                  className=""
                  onClick={() => setMode('manage')}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'linear-gradient(to right, #FFFACD, #FFD700)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'linear-gradient(to right, #FFFEF5, #FFF9E6)'}
                >
                  Manage Rules...
                </Button>
                <Button 
                  variant="outline" 
                  style={{ background: 'linear-gradient(to right, #FFFEF5, #FFF9E6)', border: '1px solid #FFD700' }}
                  className=""
                  onClick={() => {
                    const rulesToDelete = existingRules.filter(rule => rule.range === selectedRange);
                    rulesToDelete.forEach(rule => onDeleteRule(rule.id));
                    if (rulesToDelete.length > 0) {
                      alert(`Cleared ${rulesToDelete.length} rule(s) from selected cells`);
                    } else {
                      alert('No rules found for the selected range');
                    }
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'linear-gradient(to right, #FFFACD, #FFD700)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'linear-gradient(to right, #FFFEF5, #FFF9E6)'}
                >
                  Clear Rules from Selected Cells
                </Button>
              </div>
              <Button 
                variant="outline" 
                style={{ background: 'linear-gradient(to right, #FFFEF5, #FFF9E6)', border: '1px solid #FFD700' }}
                className=""
                onClick={onClose}
                onMouseEnter={(e) => e.currentTarget.style.background = 'linear-gradient(to right, #FFFACD, #FFD700)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'linear-gradient(to right, #FFFEF5, #FFF9E6)'}
              >
                Close
              </Button>
            </div>
          </div>
        )}

        {/* Create/Edit Rule Form */}
        {mode === 'create' && (
          <div className="space-y-4 py-4">
            <div>
              <Label>Apply to Range</Label>
              <Input
                value={range}
                onChange={(e) => setRange(e.target.value)}
                placeholder="e.g., A1:D10"
                className="mt-2 bg-gradient-to-r from-[#FFFEF5] to-[#FFF9E6] border-[#FFD700]"
              />
            </div>

            <div>
              <Label>Rule Type</Label>
              <Select value={ruleType} onValueChange={(val: any) => setRuleType(val)}>
                <SelectTrigger className="mt-2 bg-white border-gray-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="highlight">Highlight Cells</SelectItem>
                  <SelectItem value="topBottom">Top/Bottom</SelectItem>
                  <SelectItem value="aboveBelow">Above/Below Average</SelectItem>
                  <SelectItem value="dataBars">Data Bars</SelectItem>
                  <SelectItem value="colorScales">Color Scales</SelectItem>
                  <SelectItem value="iconSets">Icon Sets</SelectItem>
                  <SelectItem value="duplicates">Duplicates</SelectItem>
                  <SelectItem value="unique">Unique Values</SelectItem>
                  <SelectItem value="customFormula">Custom Formula</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Highlight Cells Rules */}
            {ruleType === 'highlight' && (
              <>
                <div>
                  <Label>Condition</Label>
                  <Select value={operator} onValueChange={(val: any) => setOperator(val)}>
                    <SelectTrigger className="mt-2 bg-white border-gray-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="greaterThan">Greater than</SelectItem>
                      <SelectItem value="lessThan">Less than</SelectItem>
                      <SelectItem value="between">Between</SelectItem>
                      <SelectItem value="equalTo">Equal to</SelectItem>
                      <SelectItem value="contains">Contains text</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Value</Label>
                    <Input
                      value={value1}
                      onChange={(e) => setValue1(e.target.value)}
                      placeholder="Enter value"
                      className="mt-2 bg-gradient-to-r from-[#FFFEF5] to-[#FFF9E6] border-[#FFD700]"
                    />
                  </div>
                  {operator === 'between' && (
                    <div>
                      <Label>And</Label>
                      <Input
                        value={value2}
                        onChange={(e) => setValue2(e.target.value)}
                        placeholder="Enter value"
                        className="mt-2 bg-gradient-to-r from-[#FFFEF5] to-[#FFF9E6] border-[#FFD700]"
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Background Color</Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        type="color"
                        value={bgColor}
                        onChange={(e) => setBgColor(e.target.value)}
                        className="w-20 h-10 border-[#FFD700]"
                      />
                      <Input
                        value={bgColor}
                        onChange={(e) => setBgColor(e.target.value)}
                        placeholder="#dbeafe"
                        className="bg-gradient-to-r from-[#FFFEF5] to-[#FFF9E6] border-[#FFD700]"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Text Color</Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        type="color"
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                        className="w-20 h-10 border-[#FFD700]"
                      />
                      <Input
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                        placeholder="#1e40af"
                        className="bg-gradient-to-r from-[#FFFEF5] to-[#FFF9E6] border-[#FFD700]"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={bold}
                      onChange={(e) => setBold(e.target.checked)}
                      className="border-[#FFD700]"
                    />
                    <span>Bold</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={italic}
                      onChange={(e) => setItalic(e.target.checked)}
                      className="border-[#FFD700]"
                    />
                    <span>Italic</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={underline}
                      onChange={(e) => setUnderline(e.target.checked)}
                      className="border-[#FFD700]"
                    />
                    <span>Underline</span>
                  </label>
                </div>
              </>
            )}

            {/* Top/Bottom Rules */}
            {ruleType === 'topBottom' && (
              <div>
                <Label>Number of Items</Label>
                <Input
                  type="number"
                  value={topN}
                  onChange={(e) => setTopN(e.target.value)}
                  placeholder="10"
                  className="mt-2 bg-gradient-to-r from-[#FFFEF5] to-[#FFF9E6] border-[#FFD700]"
                />
              </div>
            )}

            {/* Data Bars */}
            {ruleType === 'dataBars' && (
              <div>
                <Label>Bar Color</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    type="color"
                    value={dataBarColor}
                    onChange={(e) => setDataBarColor(e.target.value)}
                    className="w-20 h-10 border-[#FFD700]"
                  />
                  <Input
                    value={dataBarColor}
                    onChange={(e) => setDataBarColor(e.target.value)}
                    placeholder="#3b82f6"
                    className="bg-gradient-to-r from-[#FFFEF5] to-[#FFF9E6] border-[#FFD700]"
                  />
                </div>
              </div>
            )}

            {/* Color Scales */}
            {ruleType === 'colorScales' && (
              <>
                <div>
                  <Label>Scale Type</Label>
                  <Select value={colorScaleType} onValueChange={(val: any) => setColorScaleType(val)}>
                    <SelectTrigger className="mt-2 bg-white border-gray-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2color">2-Color Scale</SelectItem>
                      <SelectItem value="3color">3-Color Scale</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label>Min Color</Label>
                    <Input
                      type="color"
                      value={minColor}
                      onChange={(e) => setMinColor(e.target.value)}
                      className="w-full h-10 mt-2 border-[#FFD700]"
                    />
                  </div>
                  {colorScaleType === '3color' && (
                    <div>
                      <Label>Mid Color</Label>
                      <Input
                        type="color"
                        value={midColor}
                        onChange={(e) => setMidColor(e.target.value)}
                        className="w-full h-10 mt-2 border-[#FFD700]"
                      />
                    </div>
                  )}
                  <div>
                    <Label>Max Color</Label>
                    <Input
                      type="color"
                      value={maxColor}
                      onChange={(e) => setMaxColor(e.target.value)}
                      className="w-full h-10 mt-2 border-[#FFD700]"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Above/Below Average */}
            {ruleType === 'aboveBelow' && (
              <div className="p-4 bg-gradient-to-r from-[#FFFEF5] to-[#FFF9E6] border border-[#FFD700] rounded">
                <p className="text-sm">
                  This rule will automatically highlight cells that are above the average of all values in the selected range.
                </p>
                <p className="text-xs mt-2">
                  Default format: Light green background with dark green text
                </p>
              </div>
            )}

            {/* Icon Sets */}
            {ruleType === 'iconSets' && (
              <div className="p-4 bg-gradient-to-r from-[#FFFEF5] to-[#FFF9E6] border border-[#FFD700] rounded">
                <p className="text-sm font-semibold mb-2">Icon Sets</p>
                <p className="text-sm mb-2">
                  Values will be divided into three groups based on their position:
                </p>
                <ul className="text-sm space-y-1 ml-4">
                  <li>• <span className="text-red-700">Bottom third</span> - Red background</li>
                  <li>• <span className="text-yellow-700">Middle third</span> - Yellow background</li>
                  <li>• <span className="text-green-700">Top third</span> - Green background</li>
                </ul>
              </div>
            )}

            {/* Duplicates */}
            {ruleType === 'duplicates' && (
              <div className="p-4 bg-gradient-to-r from-[#FFFEF5] to-[#FFF9E6] border border-[#FFD700] rounded">
                <p className="text-sm">
                  This rule will highlight cells that contain duplicate values within the selected range.
                </p>
                <p className="text-xs mt-2">
                  Default format: Light orange background
                </p>
              </div>
            )}

            {/* Unique Values */}
            {ruleType === 'unique' && (
              <div className="p-4 bg-gradient-to-r from-[#FFFEF5] to-[#FFF9E6] border border-[#FFD700] rounded">
                <p className="text-sm">
                  This rule will highlight cells that contain unique values (appear only once) within the selected range.
                </p>
                <p className="text-xs mt-2">
                  Default format: Light blue background
                </p>
              </div>
            )}

            {/* Custom Formula */}
            {ruleType === 'customFormula' && (
              <div>
                <Label>Formula</Label>
                <Input
                  value={formula}
                  onChange={(e) => setFormula(e.target.value)}
                  placeholder="e.g., =A1>10"
                  className="mt-2 font-mono bg-gradient-to-r from-[#FFFEF5] to-[#FFF9E6] border-[#FFD700]"
                />
                <p className="text-xs mt-1">
                  Use cell references like =A1&gt;10. The formula will be evaluated for each cell.
                </p>
              </div>
            )}

            {/* Preview */}
            <div>
              <Label>Preview</Label>
              <div
                className="mt-2 p-4 border border-gray-300 rounded text-center"
                style={{
                  backgroundColor: ruleType === 'highlight' ? bgColor : 'transparent',
                  color: ruleType === 'highlight' ? textColor : 'inherit',
                  fontWeight: bold ? 'bold' : 'normal',
                  fontStyle: italic ? 'italic' : 'normal',
                  textDecoration: underline ? 'underline' : 'none'
                }}
              >
                Sample Cell Text
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-gray-300">
              <Button 
                variant="outline" 
                style={{ background: 'linear-gradient(to right, #FFFEF5, #FFF9E6)', border: '1px solid #FFD700' }}
                className=""
                onClick={() => { resetForm(); setMode('menu'); }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'linear-gradient(to right, #FFFACD, #FFD700)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'linear-gradient(to right, #FFFEF5, #FFF9E6)'}
              >
                Back
              </Button>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  style={{ background: 'linear-gradient(to right, #FFFEF5, #FFF9E6)', border: '1px solid #FFD700' }}
                  className=""
                  onClick={() => { resetForm(); setMode('menu'); }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'linear-gradient(to right, #FFFACD, #FFD700)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'linear-gradient(to right, #FFFEF5, #FFF9E6)'}
                >
                  Cancel
                </Button>
                <Button 
                  style={{ background: 'linear-gradient(to right, #FFFACD, #FFD700)', border: '1px solid #FFD700' }}
                  className=""
                  onClick={handleCreateRule}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'linear-gradient(to right, #FFD700, #FFFACD)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'linear-gradient(to right, #FFFACD, #FFD700)'}
                >
                  Apply Rule
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Manage Rules */}
        {mode === 'manage' && (
          <div className="space-y-4 py-4">
            <div className="text-sm mb-4">
              Rules are applied in priority order. Higher priority rules are evaluated first.
            </div>

            {existingRules.length === 0 ? (
              <div className="text-center py-8">
                No conditional formatting rules defined.
              </div>
            ) : (
              <div className="space-y-2">
                {existingRules.map((rule, index) => (
                  <div
                    key={rule.id}
                    className="flex items-center gap-3 p-3 border border-gray-300 rounded hover:bg-gradient-to-r hover:from-[#FFFEF5] hover:to-[#FFF9E6] bg-white"
                  >
                    <div className="flex flex-col gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 hover:bg-[#FFFACD]"
                        onClick={() => onReorderRule(rule.id, 'up')}
                        disabled={index === 0}
                      >
                        <ChevronUp className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 hover:bg-[#FFFACD]"
                        onClick={() => onReorderRule(rule.id, 'down')}
                        disabled={index === existingRules.length - 1}
                      >
                        <ChevronDown className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="flex-1">
                      <div className="font-medium">{getRuleDescription(rule)}</div>
                      <div className="text-xs">
                        Range: {rule.range} • Priority: {rule.priority}
                      </div>
                    </div>

                    <div
                      className="w-16 h-8 rounded border border-gray-300"
                      style={{
                        backgroundColor: rule.format.bgColor || 'transparent',
                        color: rule.format.textColor || 'inherit'
                      }}
                    />

                    <div className="flex gap-1">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={rule.enabled}
                          onChange={(e) => onToggleRule(rule.id, e.target.checked)}
                          className="w-4 h-4 border-[#FFD700]"
                        />
                      </label>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-[#FFFACD]"
                        onClick={() => {
                          // TODO: Implement edit
                        }}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-[#FFFACD]"
                        onClick={() => onDeleteRule(rule.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-between pt-4 border-t border-gray-300">
              <Button 
                variant="outline" 
                style={{ background: 'linear-gradient(to right, #FFFEF5, #FFF9E6)', border: '1px solid #FFD700' }}
                className=""
                onClick={() => setMode('menu')}
                onMouseEnter={(e) => e.currentTarget.style.background = 'linear-gradient(to right, #FFFACD, #FFD700)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'linear-gradient(to right, #FFFEF5, #FFF9E6)'}
              >
                Back
              </Button>
              <Button 
                variant="outline" 
                style={{ background: 'linear-gradient(to right, #FFFEF5, #FFF9E6)', border: '1px solid #FFD700' }}
                className=""
                onClick={onClose}
                onMouseEnter={(e) => e.currentTarget.style.background = 'linear-gradient(to right, #FFFACD, #FFD700)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'linear-gradient(to right, #FFFEF5, #FFF9E6)'}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
