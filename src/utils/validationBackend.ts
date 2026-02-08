import { CellValidation } from '../types/spreadsheet';

export interface ValidationResult {
  valid: boolean;
  errorMessage?: string;
  errorTitle?: string;
  errorStyle?: 'stop' | 'warning' | 'information';
}

// Core validation function
export function validateCellValue(value: string, validation: CellValidation): ValidationResult {
  // Allow blank if specified
  if (validation.allowBlank && (!value || value.trim() === '')) {
    return { valid: true };
  }

  // If blank not allowed and value is empty
  if (!validation.allowBlank && (!value || value.trim() === '')) {
    return {
      valid: false,
      errorMessage: validation.errorMessage || 'This cell cannot be blank',
      errorTitle: validation.errorTitle || 'Invalid Entry',
      errorStyle: validation.errorStyle || 'stop'
    };
  }

  switch (validation.type) {
    case 'wholeNumber':
      return validateWholeNumber(value, validation);
    
    case 'decimal':
      return validateDecimal(value, validation);
    
    case 'list':
      return validateList(value, validation);
    
    case 'date':
      return validateDate(value, validation);
    
    case 'time':
      return validateTime(value, validation);
    
    case 'textLength':
      return validateTextLength(value, validation);
    
    case 'custom':
      return validateCustomFormula(value, validation);
    
    default:
      return { valid: true };
  }
}

function validateWholeNumber(value: string, validation: CellValidation): ValidationResult {
  const num = parseInt(value, 10);
  
  if (isNaN(num) || !Number.isInteger(parseFloat(value))) {
    return {
      valid: false,
      errorMessage: validation.errorMessage || 'Please enter a whole number',
      errorTitle: validation.errorTitle || 'Invalid Number',
      errorStyle: validation.errorStyle || 'stop'
    };
  }

  if (validation.min !== undefined && num < validation.min) {
    return {
      valid: false,
      errorMessage: validation.errorMessage || `Value must be at least ${validation.min}`,
      errorTitle: validation.errorTitle || 'Value Too Small',
      errorStyle: validation.errorStyle || 'stop'
    };
  }

  if (validation.max !== undefined && num > validation.max) {
    return {
      valid: false,
      errorMessage: validation.errorMessage || `Value must be at most ${validation.max}`,
      errorTitle: validation.errorTitle || 'Value Too Large',
      errorStyle: validation.errorStyle || 'stop'
    };
  }

  return { valid: true };
}

function validateDecimal(value: string, validation: CellValidation): ValidationResult {
  const num = parseFloat(value);
  
  if (isNaN(num)) {
    return {
      valid: false,
      errorMessage: validation.errorMessage || 'Please enter a valid decimal number',
      errorTitle: validation.errorTitle || 'Invalid Number',
      errorStyle: validation.errorStyle || 'stop'
    };
  }

  if (validation.min !== undefined && num < validation.min) {
    return {
      valid: false,
      errorMessage: validation.errorMessage || `Value must be at least ${validation.min}`,
      errorTitle: validation.errorTitle || 'Value Too Small',
      errorStyle: validation.errorStyle || 'stop'
    };
  }

  if (validation.max !== undefined && num > validation.max) {
    return {
      valid: false,
      errorMessage: validation.errorMessage || `Value must be at most ${validation.max}`,
      errorTitle: validation.errorTitle || 'Value Too Large',
      errorStyle: validation.errorStyle || 'stop'
    };
  }

  return { valid: true };
}

function validateList(value: string, validation: CellValidation): ValidationResult {
  if (!validation.options || validation.options.length === 0) {
    return { valid: true };
  }

  const isValid = validation.options.includes(value);

  if (!isValid) {
    return {
      valid: false,
      errorMessage: validation.errorMessage || `Value must be one of: ${validation.options.join(', ')}`,
      errorTitle: validation.errorTitle || 'Invalid Selection',
      errorStyle: validation.errorStyle || 'stop'
    };
  }

  return { valid: true };
}

function validateDate(value: string, validation: CellValidation): ValidationResult {
  // Try to parse the date
  const date = new Date(value);
  
  if (isNaN(date.getTime())) {
    return {
      valid: false,
      errorMessage: validation.errorMessage || 'Please enter a valid date',
      errorTitle: validation.errorTitle || 'Invalid Date',
      errorStyle: validation.errorStyle || 'stop'
    };
  }

  if (validation.startDate) {
    const startDate = new Date(validation.startDate);
    if (date < startDate) {
      return {
        valid: false,
        errorMessage: validation.errorMessage || `Date must be on or after ${validation.startDate}`,
        errorTitle: validation.errorTitle || 'Date Out of Range',
        errorStyle: validation.errorStyle || 'stop'
      };
    }
  }

  if (validation.endDate) {
    const endDate = new Date(validation.endDate);
    if (date > endDate) {
      return {
        valid: false,
        errorMessage: validation.errorMessage || `Date must be on or before ${validation.endDate}`,
        errorTitle: validation.errorTitle || 'Date Out of Range',
        errorStyle: validation.errorStyle || 'stop'
      };
    }
  }

  return { valid: true };
}

function validateTime(value: string, validation: CellValidation): ValidationResult {
  // Time format: HH:MM or HH:MM:SS
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;
  
  if (!timeRegex.test(value)) {
    return {
      valid: false,
      errorMessage: validation.errorMessage || 'Please enter a valid time (HH:MM)',
      errorTitle: validation.errorTitle || 'Invalid Time',
      errorStyle: validation.errorStyle || 'stop'
    };
  }

  const [hours, minutes] = value.split(':').map(Number);
  const timeInMinutes = hours * 60 + minutes;

  if (validation.startTime) {
    const [startHours, startMinutes] = validation.startTime.split(':').map(Number);
    const startTimeInMinutes = startHours * 60 + startMinutes;
    
    if (timeInMinutes < startTimeInMinutes) {
      return {
        valid: false,
        errorMessage: validation.errorMessage || `Time must be at or after ${validation.startTime}`,
        errorTitle: validation.errorTitle || 'Time Out of Range',
        errorStyle: validation.errorStyle || 'stop'
      };
    }
  }

  if (validation.endTime) {
    const [endHours, endMinutes] = validation.endTime.split(':').map(Number);
    const endTimeInMinutes = endHours * 60 + endMinutes;
    
    if (timeInMinutes > endTimeInMinutes) {
      return {
        valid: false,
        errorMessage: validation.errorMessage || `Time must be at or before ${validation.endTime}`,
        errorTitle: validation.errorTitle || 'Time Out of Range',
        errorStyle: validation.errorStyle || 'stop'
      };
    }
  }

  return { valid: true };
}

function validateTextLength(value: string, validation: CellValidation): ValidationResult {
  const length = value.length;

  if (validation.minLength !== undefined && length < validation.minLength) {
    return {
      valid: false,
      errorMessage: validation.errorMessage || `Text must be at least ${validation.minLength} characters`,
      errorTitle: validation.errorTitle || 'Text Too Short',
      errorStyle: validation.errorStyle || 'stop'
    };
  }

  if (validation.maxLength !== undefined && length > validation.maxLength) {
    return {
      valid: false,
      errorMessage: validation.errorMessage || `Text must be at most ${validation.maxLength} characters`,
      errorTitle: validation.errorTitle || 'Text Too Long',
      errorStyle: validation.errorStyle || 'stop'
    };
  }

  return { valid: true };
}

function validateCustomFormula(value: string, validation: CellValidation): ValidationResult {
  if (!validation.formula) {
    return { valid: true };
  }

  try {
    // Replace cell reference with actual value
    const formula = validation.formula.replace(/\$VALUE/g, `"${value}"`);
    
    // Basic formula evaluation (simplified)
    // In production, use a proper formula parser
    const result = eval(formula);
    
    if (result === true) {
      return { valid: true };
    } else {
      return {
        valid: false,
        errorMessage: validation.errorMessage || 'Value does not meet the custom validation criteria',
        errorTitle: validation.errorTitle || 'Validation Failed',
        errorStyle: validation.errorStyle || 'stop'
      };
    }
  } catch (error) {
    return {
      valid: false,
      errorMessage: validation.errorMessage || 'Invalid formula or value',
      errorTitle: validation.errorTitle || 'Formula Error',
      errorStyle: validation.errorStyle || 'stop'
    };
  }
}

// Apply validation rule to a cell or range
export function applyValidationRule(
  cellData: { [key: string]: any },
  range: string,
  validation: CellValidation
): { [key: string]: any } {
  const updatedCells = { ...cellData };
  
  // Parse range (e.g., "A1:B10" or "A1")
  const cells = parseRange(range);
  
  cells.forEach(cellId => {
    if (!updatedCells[cellId]) {
      updatedCells[cellId] = { value: '' };
    }
    updatedCells[cellId] = {
      ...updatedCells[cellId],
      validation
    };
  });

  return updatedCells;
}

// Remove validation from a cell or range
export function removeValidation(
  cellData: { [key: string]: any },
  range: string
): { [key: string]: any } {
  const updatedCells = { ...cellData };
  const cells = parseRange(range);
  
  cells.forEach(cellId => {
    if (updatedCells[cellId]) {
      const { validation, ...rest } = updatedCells[cellId];
      updatedCells[cellId] = rest;
    }
  });

  return updatedCells;
}

// Get validation for a specific cell
export function getValidationForCell(
  cellData: { [key: string]: any },
  cellId: string
): CellValidation | null {
  return cellData[cellId]?.validation || null;
}

// Validate bulk data (for paste operations)
export function validateBulkData(
  data: string[][],
  startCellId: string,
  cellData: { [key: string]: any }
): { valid: boolean; invalidCells: string[]; errors: string[] } {
  const invalidCells: string[] = [];
  const errors: string[] = [];

  // Helper to convert column letter(s) to index
  const columnToIndex = (col: string): number => {
    let index = 0;
    for (let i = 0; i < col.length; i++) {
      index = index * 26 + (col.charCodeAt(i) - 65 + 1);
    }
    return index - 1;
  };

  // Helper to convert index to column letter(s)
  const indexToColumn = (index: number): string => {
    let label = '';
    let num = index;
    while (num >= 0) {
      label = String.fromCharCode(65 + (num % 26)) + label;
      num = Math.floor(num / 26) - 1;
    }
    return label;
  };

  const startColMatch = startCellId.match(/^([A-Z]+)(\d+)$/);
  if (!startColMatch) return { valid: true, invalidCells: [], errors: [] };
  
  const startCol = columnToIndex(startColMatch[1]);
  const startRow = parseInt(startColMatch[2]) - 1;

  data.forEach((row, rowIndex) => {
    row.forEach((value, colIndex) => {
      const cellId = indexToColumn(startCol + colIndex) + (startRow + rowIndex + 1);
      const validation = getValidationForCell(cellData, cellId);

      if (validation) {
        const result = validateCellValue(value, validation);
        if (!result.valid) {
          invalidCells.push(cellId);
          errors.push(`${cellId}: ${result.errorMessage}`);
        }
      }
    });
  });

  return {
    valid: invalidCells.length === 0,
    invalidCells,
    errors
  };
}

// Parse range string into array of cell IDs
function parseRange(range: string): string[] {
  if (!range.includes(':')) {
    // Single cell
    return [range];
  }

  // Helper to convert column letter(s) to index
  const columnToIndex = (col: string): number => {
    let index = 0;
    for (let i = 0; i < col.length; i++) {
      index = index * 26 + (col.charCodeAt(i) - 65 + 1);
    }
    return index - 1;
  };

  // Helper to convert index to column letter(s)
  const indexToColumn = (index: number): string => {
    let label = '';
    let num = index;
    while (num >= 0) {
      label = String.fromCharCode(65 + (num % 26)) + label;
      num = Math.floor(num / 26) - 1;
    }
    return label;
  };

  // Range like "A1:B10" or "AA1:AB10"
  const [start, end] = range.split(':');
  const startMatch = start.match(/^([A-Z]+)(\d+)$/);
  const endMatch = end.match(/^([A-Z]+)(\d+)$/);
  
  if (!startMatch || !endMatch) return [];
  
  const startCol = columnToIndex(startMatch[1]);
  const startRow = parseInt(startMatch[2]);
  const endCol = columnToIndex(endMatch[1]);
  const endRow = parseInt(endMatch[2]);

  const cells: string[] = [];
  for (let row = startRow; row <= endRow; row++) {
    for (let col = startCol; col <= endCol; col++) {
      cells.push(indexToColumn(col) + row);
    }
  }

  return cells;
}

// Store validation rules in localStorage (backup)
export function saveValidationRules(
  validations: { [cellId: string]: CellValidation },
  userEmail: string
): void {
  try {
    const key = `etherx_validations_${userEmail}`;
    localStorage.setItem(key, JSON.stringify(validations));
  } catch (error) {
    console.error('Failed to save validation rules:', error);
  }
}

// Load validation rules from localStorage
export function loadValidationRules(userEmail: string): { [cellId: string]: CellValidation } | null {
  try {
    const key = `etherx_validations_${userEmail}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Failed to load validation rules:', error);
    return null;
  }
}
