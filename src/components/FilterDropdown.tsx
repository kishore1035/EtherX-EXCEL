import { useState, useEffect } from "react";
import { Check, ChevronDown, Filter, X } from "lucide-react";
import { Button } from "./ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Checkbox } from "./ui/checkbox";
import { Cell } from "../types/spreadsheet";

interface FilterDropdownProps {
  column: string;
  cells: Map<string, Cell>;
  onFilter: (column: string, values: string[]) => void;
  activeFilters: Map<string, string[]>;
}

export function FilterDropdown({ column, cells, onFilter, activeFilters }: FilterDropdownProps) {
  const [uniqueValues, setUniqueValues] = useState<string[]>([]);
  const [selectedValues, setSelectedValues] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(true);

  useEffect(() => {
    // Extract unique values from the column
    const values = new Set<string>();
    
    // Get values from cells in this column
    for (let row = 1; row <= 100; row++) {
      const cellId = `${column}${row}`;
      const cell = cells.get(cellId);
      if (cell?.value) {
        values.add(cell.value.toString());
      }
    }
    
    const sortedValues = Array.from(values).sort();
    setUniqueValues(sortedValues);
    
    // Initialize selected values
    const currentFilter = activeFilters.get(column);
    if (currentFilter) {
      setSelectedValues(new Set(currentFilter));
      setSelectAll(currentFilter.length === sortedValues.length);
    } else {
      setSelectedValues(new Set(sortedValues));
      setSelectAll(true);
    }
  }, [column, cells, activeFilters]);

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      setSelectedValues(new Set(uniqueValues));
    } else {
      setSelectedValues(new Set());
    }
  };

  const handleValueToggle = (value: string, checked: boolean) => {
    const newSelected = new Set(selectedValues);
    if (checked) {
      newSelected.add(value);
    } else {
      newSelected.delete(value);
    }
    setSelectedValues(newSelected);
    setSelectAll(newSelected.size === uniqueValues.length);
  };

  const applyFilter = () => {
    onFilter(column, Array.from(selectedValues));
  };

  const clearFilter = () => {
    setSelectedValues(new Set(uniqueValues));
    setSelectAll(true);
    onFilter(column, []);
  };

  const hasActiveFilter = activeFilters.has(column) && activeFilters.get(column)!.length < uniqueValues.length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className={`h-6 w-6 p-0 ${hasActiveFilter ? 'text-blue-600' : 'text-muted-foreground'}`}
        >
          <Filter className="w-3 h-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="start">
        <div className="p-2">
          <div className="flex items-center justify-between mb-3">
            <span className="font-medium text-sm">Filter Column {column}</span>
            {hasActiveFilter && (
              <Button variant="ghost" size="sm" onClick={clearFilter}>
                <X className="w-3 h-3" />
              </Button>
            )}
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center space-x-2 p-2 rounded hover:bg-accent">
              <Checkbox
                id="select-all"
                checked={selectAll}
                onCheckedChange={handleSelectAll}
              />
              <label htmlFor="select-all" className="text-sm font-medium cursor-pointer flex-1">
                Select All
              </label>
            </div>
            
            <DropdownMenuSeparator />
            
            <div className="max-h-48 overflow-y-auto space-y-1">
              {uniqueValues.map((value) => (
                <div key={value} className="flex items-center space-x-2 p-2 rounded hover:bg-accent">
                  <Checkbox
                    id={`filter-${value}`}
                    checked={selectedValues.has(value)}
                    onCheckedChange={(checked) => handleValueToggle(value, checked as boolean)}
                  />
                  <label 
                    htmlFor={`filter-${value}`} 
                    className="text-sm cursor-pointer flex-1 truncate"
                    title={value}
                  >
                    {value}
                  </label>
                </div>
              ))}
            </div>
            
            {uniqueValues.length === 0 && (
              <div className="text-sm text-muted-foreground text-center py-4">
                No data to filter
              </div>
            )}
          </div>
          
          <DropdownMenuSeparator />
          
          <div className="flex gap-2 pt-2">
            <Button size="sm" onClick={applyFilter} className="flex-1">
              Apply Filter
            </Button>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}