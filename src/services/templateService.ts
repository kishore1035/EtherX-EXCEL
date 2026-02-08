import config from '../config';

const API_URL = config.api.baseUrl;

export interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
}

export interface TemplateData {
  cells: Record<string, any>;
  template: {
    id: string;
    name: string;
    headers: string[];
    columns: string[];
    formulas?: Record<string, any>;
    conditionalFormatting?: any[];
    chart?: any;
  };
}

/**
 * Get authentication token from localStorage
 */
function getAuthToken(): string | null {
  return localStorage.getItem('authToken');
}

/**
 * Fetch all available templates
 */
export async function getAllTemplates(): Promise<Template[]> {
  try {
    const response = await fetch(`${API_URL}/api/templates`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch templates: ${response.statusText}`);
    }

    const data = await response.json();
    return data.templates || [];
  } catch (error) {
    console.error('Error fetching templates:', error);
    throw error;
  }
}

/**
 * Fetch a specific template by ID
 */
export async function getTemplateById(templateId: string): Promise<any> {
  try {
    const response = await fetch(`${API_URL}/api/templates/${templateId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch template: ${response.statusText}`);
    }

    const data = await response.json();
    return data.template;
  } catch (error) {
    console.error('Error fetching template:', error);
    throw error;
  }
}

/**
 * Generate spreadsheet data from a template
 */
export async function generateTemplate(templateId: string, token?: string): Promise<TemplateData> {
  try {
    const response = await fetch(`${API_URL}/api/templates/${templateId}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to generate template: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error generating template from backend, using hardcoded fallback:', error);
    // Return hardcoded template data as fallback
    return getHardcodedTemplateData(templateId);
  }
}

/**
 * Hardcoded template data for production use
 * Ensures templates work even if backend is unavailable
 */
function getHardcodedTemplateData(templateId: string): TemplateData {
  const templates: Record<string, TemplateData> = {
    'attendance': {
      cells: {
        'A1': { value: 'Employee Name', bold: true, backgroundColor: '#4CAF50', color: '#FFFFFF' },
        'B1': { value: 'Date', bold: true, backgroundColor: '#4CAF50', color: '#FFFFFF' },
        'C1': { value: 'Status', bold: true, backgroundColor: '#4CAF50', color: '#FFFFFF' },
        'D1': { value: 'Hours', bold: true, backgroundColor: '#4CAF50', color: '#FFFFFF' },
        'A2': { value: 'John Doe' },
        'B2': { value: '2024-01-15' },
        'C2': { value: 'Present' },
        'D2': { value: '8' },
        'A3': { value: 'Jane Smith' },
        'B3': { value: '2024-01-15' },
        'C3': { value: 'Present' },
        'D3': { value: '8' },
        'A4': { value: 'Bob Johnson' },
        'B4': { value: '2024-01-15' },
        'C4': { value: 'Absent' },
        'D4': { value: '0' },
      },
      template: {
        id: 'attendance',
        name: 'Attendance Template',
        headers: ['Employee Name', 'Date', 'Status', 'Hours'],
        columns: ['A', 'B', 'C', 'D'],
      },
    },
    'invoice': {
      cells: {
        'A1': { value: 'INVOICE', bold: true, fontSize: 24 },
        'A3': { value: 'Bill To:', bold: true },
        'A4': { value: 'Customer Name' },
        'A6': { value: 'Item', bold: true, backgroundColor: '#2196F3', color: '#FFFFFF' },
        'B6': { value: 'Quantity', bold: true, backgroundColor: '#2196F3', color: '#FFFFFF' },
        'C6': { value: 'Price', bold: true, backgroundColor: '#2196F3', color: '#FFFFFF' },
        'D6': { value: 'Total', bold: true, backgroundColor: '#2196F3', color: '#FFFFFF' },
        'A7': { value: 'Product 1' },
        'B7': { value: '2' },
        'C7': { value: '$50.00' },
        'D7': { value: '=B7*C7', formula: '=B7*C7' },
        'A8': { value: 'Product 2' },
        'B8': { value: '1' },
        'C8': { value: '$75.00' },
        'D8': { value: '=B8*C8', formula: '=B8*C8' },
        'C10': { value: 'Subtotal:', bold: true },
        'D10': { value: '=SUM(D7:D9)', formula: '=SUM(D7:D9)' },
        'C11': { value: 'Tax (10%):', bold: true },
        'D11': { value: '=D10*0.1', formula: '=D10*0.1' },
        'C12': { value: 'TOTAL:', bold: true, fontSize: 14 },
        'D12': { value: '=D10+D11', formula: '=D10+D11', bold: true },
      },
      template: {
        id: 'invoice',
        name: 'Invoice Template',
        headers: ['Item', 'Quantity', 'Price', 'Total'],
        columns: ['A', 'B', 'C', 'D'],
        formulas: {
          'D7': '=B7*C7',
          'D8': '=B8*C8',
          'D10': '=SUM(D7:D9)',
          'D11': '=D10*0.1',
          'D12': '=D10+D11',
        },
      },
    },
    'budget-planner': {
      cells: {
        'A1': { value: 'Monthly Budget Planner', bold: true, fontSize: 18 },
        'A3': { value: 'Income', bold: true, backgroundColor: '#4CAF50', color: '#FFFFFF' },
        'A4': { value: 'Salary' },
        'B4': { value: '$5000' },
        'A5': { value: 'Other Income' },
        'B5': { value: '$500' },
        'A6': { value: 'Total Income', bold: true },
        'B6': { value: '=SUM(B4:B5)', formula: '=SUM(B4:B5)', bold: true },
        'A8': { value: 'Expenses', bold: true, backgroundColor: '#F44336', color: '#FFFFFF' },
        'A9': { value: 'Rent' },
        'B9': { value: '$1500' },
        'A10': { value: 'Food' },
        'B10': { value: '$600' },
        'A11': { value: 'Utilities' },
        'B11': { value: '$200' },
        'A12': { value: 'Transportation' },
        'B12': { value: '$300' },
        'A13': { value: 'Total Expenses', bold: true },
        'B13': { value: '=SUM(B9:B12)', formula: '=SUM(B9:B12)', bold: true },
        'A15': { value: 'Savings', bold: true, backgroundColor: '#2196F3', color: '#FFFFFF' },
        'B15': { value: '=B6-B13', formula: '=B6-B13', bold: true },
      },
      template: {
        id: 'budget-planner',
        name: 'Monthly Budget Template',
        headers: ['Category', 'Amount'],
        columns: ['A', 'B'],
        formulas: {
          'B6': '=SUM(B4:B5)',
          'B13': '=SUM(B9:B12)',
          'B15': '=B6-B13',
        },
      },
    },
    'project-tracker': {
      cells: {
        'A1': { value: 'Task Name', bold: true, backgroundColor: '#9C27B0', color: '#FFFFFF' },
        'B1': { value: 'Assignee', bold: true, backgroundColor: '#9C27B0', color: '#FFFFFF' },
        'C1': { value: 'Status', bold: true, backgroundColor: '#9C27B0', color: '#FFFFFF' },
        'D1': { value: 'Due Date', bold: true, backgroundColor: '#9C27B0', color: '#FFFFFF' },
        'E1': { value: 'Priority', bold: true, backgroundColor: '#9C27B0', color: '#FFFFFF' },
        'A2': { value: 'Design Homepage' },
        'B2': { value: 'Alice' },
        'C2': { value: 'In Progress' },
        'D2': { value: '2024-02-15' },
        'E2': { value: 'High' },
        'A3': { value: 'Build API' },
        'B3': { value: 'Bob' },
        'C3': { value: 'Not Started' },
        'D3': { value: '2024-02-20' },
        'E3': { value: 'High' },
        'A4': { value: 'Write Tests' },
        'B4': { value: 'Carol' },
        'C4': { value: 'Completed' },
        'D4': { value: '2024-02-10' },
        'E4': { value: 'Medium' },
      },
      template: {
        id: 'project-tracker',
        name: 'Project Tracker Template',
        headers: ['Task Name', 'Assignee', 'Status', 'Due Date', 'Priority'],
        columns: ['A', 'B', 'C', 'D', 'E'],
      },
    },
    'sales-tracker': {
      cells: {
        'A1': { value: 'Product', bold: true, backgroundColor: '#FF5722', color: '#FFFFFF' },
        'B1': { value: 'Units Sold', bold: true, backgroundColor: '#FF5722', color: '#FFFFFF' },
        'C1': { value: 'Price', bold: true, backgroundColor: '#FF5722', color: '#FFFFFF' },
        'D1': { value: 'Revenue', bold: true, backgroundColor: '#FF5722', color: '#FFFFFF' },
        'E1': { value: 'Region', bold: true, backgroundColor: '#FF5722', color: '#FFFFFF' },
        'A2': { value: 'Widget A' },
        'B2': { value: '150' },
        'C2': { value: '$25' },
        'D2': { value: '=B2*C2', formula: '=B2*C2' },
        'E2': { value: 'North' },
        'A3': { value: 'Widget B' },
        'B3': { value: '200' },
        'C3': { value: '$30' },
        'D3': { value: '=B3*C3', formula: '=B3*C3' },
        'E3': { value: 'South' },
        'A4': { value: 'Widget C' },
        'B4': { value: '100' },
        'C4': { value: '$45' },
        'D4': { value: '=B4*C4', formula: '=B4*C4' },
        'E4': { value: 'East' },
        'A6': { value: 'Total Revenue', bold: true },
        'D6': { value: '=SUM(D2:D4)', formula: '=SUM(D2:D4)', bold: true },
      },
      template: {
        id: 'sales-tracker',
        name: 'Sales Tracker Template',
        headers: ['Product', 'Units Sold', 'Price', 'Revenue', 'Region'],
        columns: ['A', 'B', 'C', 'D', 'E'],
        formulas: {
          'D2': '=B2*C2',
          'D3': '=B3*C3',
          'D4': '=B4*C4',
          'D6': '=SUM(D2:D4)',
        },
      },
    },
    'inventory-management': {
      cells: {
        'A1': { value: 'Item Name', bold: true, backgroundColor: '#FF9800', color: '#FFFFFF' },
        'B1': { value: 'SKU', bold: true, backgroundColor: '#FF9800', color: '#FFFFFF' },
        'C1': { value: 'Quantity', bold: true, backgroundColor: '#FF9800', color: '#FFFFFF' },
        'D1': { value: 'Unit Price', bold: true, backgroundColor: '#FF9800', color: '#FFFFFF' },
        'E1': { value: 'Total Value', bold: true, backgroundColor: '#FF9800', color: '#FFFFFF' },
        'A2': { value: 'Laptop' },
        'B2': { value: 'LAP001' },
        'C2': { value: '50' },
        'D2': { value: '$800' },
        'E2': { value: '=C2*D2', formula: '=C2*D2' },
        'A3': { value: 'Mouse' },
        'B3': { value: 'MOU001' },
        'C3': { value: '200' },
        'D3': { value: '$15' },
        'E3': { value: '=C3*D3', formula: '=C3*D3' },
        'A4': { value: 'Keyboard' },
        'B4': { value: 'KEY001' },
        'C4': { value: '150' },
        'D4': { value: '$45' },
        'E4': { value: '=C4*D4', formula: '=C4*D4' },
        'A6': { value: 'Total Inventory Value', bold: true },
        'E6': { value: '=SUM(E2:E4)', formula: '=SUM(E2:E4)', bold: true },
      },
      template: {
        id: 'inventory-management',
        name: 'Inventory Management Template',
        headers: ['Item Name', 'SKU', 'Quantity', 'Unit Price', 'Total Value'],
        columns: ['A', 'B', 'C', 'D', 'E'],
        formulas: {
          'E2': '=C2*D2',
          'E3': '=C3*D3',
          'E4': '=C4*D4',
          'E6': '=SUM(E2:E4)',
        },
      },
    },
    'timesheet': {
      cells: {
        'A1': { value: 'Employee', bold: true, backgroundColor: '#3F51B5', color: '#FFFFFF' },
        'B1': { value: 'Monday', bold: true, backgroundColor: '#3F51B5', color: '#FFFFFF' },
        'C1': { value: 'Tuesday', bold: true, backgroundColor: '#3F51B5', color: '#FFFFFF' },
        'D1': { value: 'Wednesday', bold: true, backgroundColor: '#3F51B5', color: '#FFFFFF' },
        'E1': { value: 'Thursday', bold: true, backgroundColor: '#3F51B5', color: '#FFFFFF' },
        'F1': { value: 'Friday', bold: true, backgroundColor: '#3F51B5', color: '#FFFFFF' },
        'G1': { value: 'Total', bold: true, backgroundColor: '#3F51B5', color: '#FFFFFF' },
        'A2': { value: 'John Doe' },
        'B2': { value: '8' },
        'C2': { value: '8' },
        'D2': { value: '8' },
        'E2': { value: '8' },
        'F2': { value: '8' },
        'G2': { value: '=SUM(B2:F2)', formula: '=SUM(B2:F2)' },
        'A3': { value: 'Jane Smith' },
        'B3': { value: '8' },
        'C3': { value: '7' },
        'D3': { value: '8' },
        'E3': { value: '8' },
        'F3': { value: '8' },
        'G3': { value: '=SUM(B3:F3)', formula: '=SUM(B3:F3)' },
      },
      template: {
        id: 'timesheet',
        name: 'Employee Timesheet Template',
        headers: ['Employee', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Total'],
        columns: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
        formulas: {
          'G2': '=SUM(B2:F2)',
          'G3': '=SUM(B3:F3)',
        },
      },
    },
    'school-gradebook': {
      cells: {
        'A1': { value: 'Student Name', bold: true, backgroundColor: '#673AB7', color: '#FFFFFF' },
        'B1': { value: 'Math', bold: true, backgroundColor: '#673AB7', color: '#FFFFFF' },
        'C1': { value: 'Science', bold: true, backgroundColor: '#673AB7', color: '#FFFFFF' },
        'D1': { value: 'English', bold: true, backgroundColor: '#673AB7', color: '#FFFFFF' },
        'E1': { value: 'Average', bold: true, backgroundColor: '#673AB7', color: '#FFFFFF' },
        'F1': { value: 'Grade', bold: true, backgroundColor: '#673AB7', color: '#FFFFFF' },
        'A2': { value: 'Alice Johnson' },
        'B2': { value: '92' },
        'C2': { value: '88' },
        'D2': { value: '95' },
        'E2': { value: '=AVERAGE(B2:D2)', formula: '=AVERAGE(B2:D2)' },
        'F2': { value: 'A' },
        'A3': { value: 'Bob Smith' },
        'B3': { value: '85' },
        'C3': { value: '90' },
        'D3': { value: '87' },
        'E3': { value: '=AVERAGE(B3:D3)', formula: '=AVERAGE(B3:D3)' },
        'F3': { value: 'B' },
        'A4': { value: 'Carol Lee' },
        'B4': { value: '78' },
        'C4': { value: '82' },
        'D4': { value: '80' },
        'E4': { value: '=AVERAGE(B4:D4)', formula: '=AVERAGE(B4:D4)' },
        'F4': { value: 'B' },
      },
      template: {
        id: 'school-gradebook',
        name: 'School Gradebook Template',
        headers: ['Student Name', 'Math', 'Science', 'English', 'Average', 'Grade'],
        columns: ['A', 'B', 'C', 'D', 'E', 'F'],
        formulas: {
          'E2': '=AVERAGE(B2:D2)',
          'E3': '=AVERAGE(B3:D3)',
          'E4': '=AVERAGE(B4:D4)',
        },
      },
    },
    'business-report': {
      cells: {
        'A1': { value: 'Business Performance Report', bold: true, fontSize: 18 },
        'A3': { value: 'Metric', bold: true, backgroundColor: '#4CAF50', color: '#FFFFFF' },
        'B3': { value: 'Q1', bold: true, backgroundColor: '#4CAF50', color: '#FFFFFF' },
        'C3': { value: 'Q2', bold: true, backgroundColor: '#4CAF50', color: '#FFFFFF' },
        'D3': { value: 'Q3', bold: true, backgroundColor: '#4CAF50', color: '#FFFFFF' },
        'E3': { value: 'Q4', bold: true, backgroundColor: '#4CAF50', color: '#FFFFFF' },
        'F3': { value: 'Total', bold: true, backgroundColor: '#4CAF50', color: '#FFFFFF' },
        'A4': { value: 'Revenue' },
        'B4': { value: '$125,000' },
        'C4': { value: '$150,000' },
        'D4': { value: '$175,000' },
        'E4': { value: '$200,000' },
        'F4': { value: '=SUM(B4:E4)', formula: '=SUM(B4:E4)' },
        'A5': { value: 'Expenses' },
        'B5': { value: '$75,000' },
        'C5': { value: '$85,000' },
        'D5': { value: '$95,000' },
        'E5': { value: '$105,000' },
        'F5': { value: '=SUM(B5:E5)', formula: '=SUM(B5:E5)' },
        'A6': { value: 'Profit', bold: true },
        'B6': { value: '=B4-B5', formula: '=B4-B5' },
        'C6': { value: '=C4-C5', formula: '=C4-C5' },
        'D6': { value: '=D4-D5', formula: '=D4-D5' },
        'E6': { value: '=E4-E5', formula: '=E4-E5' },
        'F6': { value: '=SUM(B6:E6)', formula: '=SUM(B6:E6)', bold: true },
      },
      template: {
        id: 'business-report',
        name: 'Business Report Template',
        headers: ['Metric', 'Q1', 'Q2', 'Q3', 'Q4', 'Total'],
        columns: ['A', 'B', 'C', 'D', 'E', 'F'],
        formulas: {
          'F4': '=SUM(B4:E4)',
          'F5': '=SUM(B5:E5)',
          'B6': '=B4-B5',
          'C6': '=C4-C5',
          'D6': '=D4-D5',
          'E6': '=E4-E5',
          'F6': '=SUM(B6:E6)',
        },
      },
    },
  };

  // Return the requested template or a default one
  const templateData = templates[templateId];
  if (!templateData) {
    console.warn(`Template ${templateId} not found, returning default blank template`);
    return {
      cells: {
        'A1': { value: 'Template Not Found' },
      },
      template: {
        id: templateId,
        name: 'Default Template',
        headers: [],
        columns: [],
      },
    };
  }

  console.log(`✅ Using hardcoded template data for: ${templateId}`);
  return templateData;
}

/**
 * Apply template data to spreadsheet format
 */
export function applyTemplateToSpreadsheet(templateData: TemplateData) {
  const { cells, template } = templateData;
  
  return {
    cellData: cells,
    metadata: {
      templateId: template.id,
      templateName: template.name,
      headers: template.headers,
      formulas: template.formulas,
      conditionalFormatting: template.conditionalFormatting,
      chart: template.chart,
    },
  };
}
