import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Checkbox } from "./ui/checkbox";
import { useState } from "react";
import { ArrowUpDown, Filter, X, Plus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

interface SortFilterProps {
  open: boolean;
  onClose: () => void;
  columns: string[];
  onSort: (columns: Array<{ column: string; direction: 'asc' | 'desc' }>) => void;
  onFilter: (column: string, values: string[]) => void;
  onClearFilter: () => void;
  availableValues?: Map<string, string[]>; // column -> unique values
}

export function SortFilter({
  open,
  onClose,
  columns,
  onSort,
  onFilter,
  onClearFilter,
  availableValues = new Map(),
}: SortFilterProps) {
  const [sortColumns, setSortColumns] = useState<Array<{ column: string; direction: 'asc' | 'desc' }>>([
    { column: columns[0] || 'A', direction: 'asc' }
  ]);
  const [filterColumn, setFilterColumn] = useState(columns[0] || 'A');
  const [selectedValues, setSelectedValues] = useState<Set<string>>(new Set());

  const handleAddSortLevel = () => {
    setSortColumns([...sortColumns, { column: columns[0] || 'A', direction: 'asc' }]);
  };

  const handleRemoveSortLevel = (index: number) => {
    setSortColumns(sortColumns.filter((_, i) => i !== index));
  };

  const handleUpdateSortColumn = (index: number, column: string) => {
    const updated = [...sortColumns];
    updated[index].column = column;
    setSortColumns(updated);
  };

  const handleUpdateSortDirection = (index: number, direction: 'asc' | 'desc') => {
    const updated = [...sortColumns];
    updated[index].direction = direction;
    setSortColumns(updated);
  };

  const handleApplySort = () => {
    onSort(sortColumns);
    onClose();
  };

  const handleToggleValue = (value: string) => {
    const updated = new Set(selectedValues);
    if (updated.has(value)) {
      updated.delete(value);
    } else {
      updated.add(value);
    }
    setSelectedValues(updated);
  };

  const handleSelectAll = () => {
    const values = availableValues.get(filterColumn) || [];
    setSelectedValues(new Set(values));
  };

  const handleSelectNone = () => {
    setSelectedValues(new Set());
  };

  const handleApplyFilter = () => {
    onFilter(filterColumn, Array.from(selectedValues));
    onClose();
  };

  const filterValues = availableValues.get(filterColumn) || [];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Sort & Filter</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="sort" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="sort">
              <ArrowUpDown className="w-4 h-4 mr-2" />
              Sort
            </TabsTrigger>
            <TabsTrigger value="filter">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sort" className="space-y-4 mt-4">
            <p className="text-sm text-muted-foreground">
              Sort data by one or more columns
            </p>

            {sortColumns.map((sort, index) => (
              <div key={index} className="flex items-end gap-2">
                <div className="flex-1">
                  <Label>Column {index + 1}</Label>
                  <Select
                    value={sort.column}
                    onValueChange={(v) => handleUpdateSortColumn(index, v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {columns.map((col) => (
                        <SelectItem key={col} value={col}>
                          Column {col}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="w-32">
                  <Label>Order</Label>
                  <Select
                    value={sort.direction}
                    onValueChange={(v: 'asc' | 'desc') => handleUpdateSortDirection(index, v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asc">A → Z</SelectItem>
                      <SelectItem value="desc">Z → A</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {sortColumns.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveSortLevel(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}

            <Button variant="outline" onClick={handleAddSortLevel} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Add Sort Level
            </Button>

            <Button onClick={handleApplySort} className="w-full">
              Apply Sort
            </Button>
          </TabsContent>

          <TabsContent value="filter" className="space-y-4 mt-4">
            <div>
              <Label>Filter Column</Label>
              <Select value={filterColumn} onValueChange={setFilterColumn}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {columns.map((col) => (
                    <SelectItem key={col} value={col}>
                      Column {col}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-between items-center">
              <Label>Select Values to Show</Label>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={handleSelectAll}>
                  Select All
                </Button>
                <Button variant="ghost" size="sm" onClick={handleSelectNone}>
                  Clear
                </Button>
              </div>
            </div>

            <div className="border border-border rounded-md p-4 max-h-64 overflow-y-auto space-y-2">
              {filterValues.length > 0 ? (
                filterValues.map((value) => (
                  <div key={value} className="flex items-center gap-2">
                    <Checkbox
                      checked={selectedValues.has(value)}
                      onCheckedChange={() => handleToggleValue(value)}
                    />
                    <label className="text-sm cursor-pointer flex-1">
                      {value || "(Blank)"}
                    </label>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No data available for filtering
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={onClearFilter} className="flex-1">
                Clear Filter
              </Button>
              <Button onClick={handleApplyFilter} className="flex-1">
                Apply Filter
              </Button>
            </div>
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
