import { v4 as uuidv4 } from 'uuid';

// Template definitions with comprehensive configurations
const TEMPLATES = {
  'business-report': {
    id: 'business-report',
    name: 'Business Report Template',
    description: 'Professional business performance report with key metrics and analysis',
    category: 'Business',
    icon: 'TrendingUp',
    
    // Custom structure for visually appealing report
    customLayout: true,
    
    // Title section (row 1 - merged A1:D1)
    title: {
      row: 1,
      value: 'Business Performance Report',
      mergedCells: 'A1:D1',
      style: {
        fontSize: 20,
        bold: true,
        textAlign: 'center',
        backgroundColor: '#1976D2',
        color: '#FFFFFF'
      }
    },
    
    // Metadata section (row 2)
    metadata: [
      { cell: 'A2', value: 'Company:', style: { bold: true, backgroundColor: '#E3F2FD' } },
      { cell: 'B2', value: '[Your Company Name]', style: { backgroundColor: '#E3F2FD' } },
      { cell: 'C2', value: 'Reporting Period:', style: { bold: true, backgroundColor: '#E3F2FD' } },
      { cell: 'D2', value: 'Q1 2024', style: { backgroundColor: '#E3F2FD' } }
    ],
    
    // Key Metrics section
    metricsHeader: {
      row: 4,
      value: 'Key Metrics',
      mergedCells: 'A4:D4',
      style: {
        fontSize: 14,
        bold: true,
        backgroundColor: '#FFF3E0',
        color: '#E65100'
      }
    },
    
    // Metrics table headers (row 5)
    metricsTableHeaders: ['Metric', 'Current', 'Target', 'Status'],
    metricsHeaderRow: 5,
    metricsHeaderStyle: {
      bold: true,
      backgroundColor: '#4CAF50',
      color: '#FFFFFF',
      fontSize: 11
    },
    
    // Metrics data (rows 6-10)
    metricsData: [
      { metric: 'Total Revenue', current: 125000, target: 150000, status: '=IF(B6>=C6,"✓ On Track","⚠ Below Target")' },
      { metric: 'Net Profit', current: 45000, target: 50000, status: '=IF(B7>=C7,"✓ On Track","⚠ Below Target")' },
      { metric: 'Customer Growth %', current: 15, target: 20, status: '=IF(B8>=C8,"✓ On Track","⚠ Below Target")' },
      { metric: 'Operating Expenses', current: 80000, target: 75000, status: '=IF(B9<=C9,"✓ On Track","⚠ Above Target")' },
      { metric: 'Profit Margin %', current: '=ROUND((B7/B6)*100,2)', target: 33, status: '=IF(B10>=C10,"✓ On Track","⚠ Below Target")' }
    ],
    
    // Notes section
    notesHeader: {
      row: 12,
      value: 'Notes & Analysis',
      mergedCells: 'A12:D12',
      style: {
        fontSize: 12,
        bold: true,
        backgroundColor: '#F5F5F5',
        color: '#424242'
      }
    },
    
    notesContent: [
      { cell: 'A13', value: '• Revenue growth is steady but below target', style: {} },
      { cell: 'A14', value: '• Focus on cost reduction to improve profit margin', style: {} },
      { cell: 'A15', value: '• Customer acquisition performing well', style: {} },
      { cell: 'A16', value: '', style: {} }
    ],
    
    styles: {
      headerBg: '#4CAF50',
      headerColor: '#FFFFFF',
      alternateRowBg: '#F5F5F5'
    }
  },
  
  'attendance': {
    id: 'attendance',
    name: 'Attendance Template',
    description: 'Track employee attendance with conditional formatting',
    category: 'HR',
    icon: 'Users',
    customLayout: true,
    
    // Title Section
    title: {
      row: 1,
      value: 'Attendance Register',
      mergedCells: 'A1:AF1', // Spans across all columns (A-Z, AA-AF for 32 cols)
      style: {
        bold: true,
        fontSize: 18,
        textAlign: 'center',
        backgroundColor: '#2196F3',
        color: '#FFFFFF'
      }
    },
    
    // Class Information Section (Rows 3-5)
    classInfo: [
      { labelCell: 'A3', label: 'Class / Team:', valueCell: 'B3', value: 'Grade 9-A' },
      { labelCell: 'A4', label: 'Month:', valueCell: 'B4', value: 'January 2025' },
      { labelCell: 'A5', label: 'Teacher / Supervisor:', valueCell: 'B5', value: 'Mr. Robert Anderson' }
    ],
    infoStyle: {
      labelBold: true,
      backgroundColor: '#E3F2FD'
    },
    
    // Legend Row (Row 7)
    legend: {
      row: 7,
      cell: 'A7',
      value: 'Legend: P = Present  |  A = Absent  |  L = Late  |  E = Excused',
      style: {
        backgroundColor: '#FFF9C4',
        fontSize: 11,
        textAlign: 'center'
      }
    },
    
    // Attendance Grid
    attendanceGrid: {
      headerRow: 9,
      nameColumns: {
        rollNo: { col: 'A', header: 'Roll No', width: 80 },
        name: { col: 'B', header: 'Student Name', width: 150 }
      },
      // Days 1-31 in columns C through AG (31 columns)
      dayColumns: [
        'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 
        'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'AA', 'AB', 'AC', 'AD', 'AE', 'AF', 'AG'
      ],
      // Summary columns after day columns
      summaryColumns: {
        totalPresent: { col: 'AH', header: 'Total Present' },
        totalAbsent: { col: 'AI', header: 'Total Absent' },
        attendancePercent: { col: 'AJ', header: 'Attendance %' }
      },
      headerStyle: {
        bold: true,
        backgroundColor: '#42A5F5',
        color: '#FFFFFF',
        textAlign: 'center'
      },
      nameColumnStyle: {
        backgroundColor: '#BBDEFB',
        bold: true
      },
      dataStartRow: 10,
      students: [
        { rollNo: '001', name: 'Emma Thompson' },
        { rollNo: '002', name: 'Liam Anderson' },
        { rollNo: '003', name: 'Olivia Martinez' },
        { rollNo: '004', name: 'Noah Davis' },
        { rollNo: '005', name: 'Ava Garcia' },
        { rollNo: '006', name: 'Ethan Rodriguez' },
        { rollNo: '007', name: 'Sophia Wilson' },
        { rollNo: '008', name: 'Mason Taylor' },
        { rollNo: '009', name: 'Isabella Brown' },
        { rollNo: '010', name: 'Lucas Moore' },
        { rollNo: '011', name: 'Mia Jackson' },
        { rollNo: '012', name: 'Alexander White' },
        { rollNo: '013', name: 'Charlotte Harris' },
        { rollNo: '014', name: 'Benjamin Clark' },
        { rollNo: '015', name: 'Amelia Lewis' }
      ],
      // Sample attendance data for first few days
      sampleAttendance: {
        // Day 1 (Column C)
        1: ['P', 'P', 'P', 'A', 'P', 'P', 'L', 'P', 'P', 'P', 'P', 'P', 'A', 'P', 'P'],
        // Day 2 (Column D)
        2: ['P', 'P', 'A', 'P', 'P', 'L', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'E'],
        // Day 3 (Column E)
        3: ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'A', 'P', 'L', 'P', 'P', 'P', 'P', 'P']
      },
      style: {
        alternateRowBg: '#F5F5F5',
        cellBorder: true
      }
    },
    
    styles: {
      headerBg: '#2196F3',
      headerColor: '#FFFFFF'
    }
  },

  'budget-planner': {
    id: 'budget-planner',
    name: 'Monthly Budget Template',
    description: 'Structured monthly budget planner with income, expenses, and savings tracking',
    category: 'Finance',
    icon: 'DollarSign',
    customLayout: true,
    
    // Title Section
    title: {
      row: 1,
      value: 'Monthly Budget Planner',
      mergedCells: 'A1:D1',
      style: {
        bold: true,
        fontSize: 18,
        textAlign: 'center',
        backgroundColor: '#1976D2',
        color: '#FFFFFF'
      }
    },
    
    // Summary Section (Rows 3-5)
    summary: {
      startRow: 3,
      backgroundColor: '#C8E6C9',
      items: [
        { label: 'Total Income', labelCell: 'A3', valueCell: 'B3', formula: '=SUM(B9:B11)' },
        { label: 'Total Expenses', labelCell: 'A4', valueCell: 'B4', formula: '=SUM(B16:B20)' },
        { label: 'Net Savings', labelCell: 'A5', valueCell: 'B5', formula: '=B3-B4' }
      ],
      style: {
        bold: true,
        fontSize: 12
      }
    },
    
    // Income Section
    incomeSection: {
      headerRow: 7,
      headerLabel: 'INCOME',
      headerStyle: {
        bold: true,
        fontSize: 13,
        backgroundColor: '#4CAF50',
        color: '#FFFFFF'
      },
      tableHeaderRow: 8,
      headers: ['Category', 'Planned', 'Actual', 'Difference'],
      columns: ['A', 'B', 'C', 'D'],
      headerStyle: {
        bold: true,
        backgroundColor: '#81C784',
        color: '#FFFFFF',
        textAlign: 'center'
      },
      dataStartRow: 9,
      data: [
        { category: 'Salary', planned: 5000, actual: 5000, difference: '=C9-B9' },
        { category: 'Freelance', planned: 1500, actual: 1200, difference: '=C10-B10' },
        { category: 'Other', planned: 500, actual: 300, difference: '=C11-B11' }
      ],
      style: {
        alternateRowBg: '#E8F5E9'
      }
    },
    
    // Expenses Section
    expensesSection: {
      headerRow: 13,
      headerLabel: 'EXPENSES',
      headerStyle: {
        bold: true,
        fontSize: 13,
        backgroundColor: '#FF5722',
        color: '#FFFFFF'
      },
      tableHeaderRow: 14,
      headers: ['Category', 'Planned', 'Actual', 'Difference'],
      columns: ['A', 'B', 'C', 'D'],
      headerStyle: {
        bold: true,
        backgroundColor: '#FF8A65',
        color: '#FFFFFF',
        textAlign: 'center'
      },
      dataStartRow: 15,
      data: [
        { category: 'Rent', planned: 1500, actual: 1500, difference: '=C15-B15' },
        { category: 'Groceries', planned: 600, actual: 550, difference: '=C16-B16' },
        { category: 'Transport', planned: 200, actual: 220, difference: '=C17-B17' },
        { category: 'Entertainment', planned: 300, actual: 350, difference: '=C18-B18' },
        { category: 'Other', planned: 400, actual: 380, difference: '=C19-B19' }
      ],
      style: {
        alternateRowBg: '#FFEBEE'
      }
    },
    
    styles: {
      headerBg: '#1976D2',
      headerColor: '#FFFFFF'
    }
  },

  'invoice': {
    id: 'invoice',
    name: 'Invoice Template',
    description: 'Professional invoice with automatic calculations',
    category: 'Business',
    icon: 'FileText',
    customLayout: true,
    
    // Company Info Section (Top-Left, Rows 1-5)
    companyInfo: {
      companyName: { cell: 'A1', value: 'Your Company Name', style: { bold: true, fontSize: 16 } },
      address: { cell: 'A2', value: '123 Business Street, Suite 100' },
      city: { cell: 'A3', value: 'New York, NY 10001' },
      phone: { cell: 'A4', value: 'Phone: (555) 123-4567' },
      email: { cell: 'A5', value: 'Email: billing@yourcompany.com' }
    },
    
    // Invoice Header Section (Top-Right, Rows 1-5)
    invoiceHeader: {
      title: { cell: 'E1', value: 'INVOICE', style: { bold: true, fontSize: 24, color: '#673AB7' } },
      invoiceNumber: { labelCell: 'D2', label: 'Invoice #:', valueCell: 'E2', value: 'INV-2025-001' },
      invoiceDate: { labelCell: 'D3', label: 'Invoice Date:', valueCell: 'E3', value: '2025-01-15' },
      dueDate: { labelCell: 'D4', label: 'Due Date:', valueCell: 'E4', value: '2025-02-15' }
    },
    invoiceHeaderStyle: {
      labelBold: true,
      valueAlign: 'right'
    },
    
    // Bill To Section (Rows 7-10)
    billTo: {
      headerCell: 'A7',
      headerValue: 'Bill To:',
      customerName: { cell: 'A8', value: 'Acme Corporation' },
      address: { cell: 'A9', value: '456 Client Avenue' },
      city: { cell: 'A10', value: 'Los Angeles, CA 90001' },
      style: {
        backgroundColor: '#F3E5F5',
        headerBold: true,
        headerFontSize: 12
      }
    },
    
    // Line Items Table
    lineItemsTable: {
      headerRow: 12,
      headers: ['Item Description', 'Quantity', 'Unit Price', 'Tax %', 'Line Total'],
      columns: ['A', 'B', 'C', 'D', 'E'],
      headerStyle: {
        bold: true,
        backgroundColor: '#673AB7',
        color: '#FFFFFF',
        textAlign: 'center'
      },
      dataStartRow: 13,
      items: [
        {
          description: 'Website Design & Development',
          quantity: 1,
          unitPrice: 2500.00,
          taxPercent: 10,
          lineTotal: '=B13*C13*(1+D13/100)'
        },
        {
          description: 'SEO Optimization Services',
          quantity: 3,
          unitPrice: 500.00,
          taxPercent: 10,
          lineTotal: '=B14*C14*(1+D14/100)'
        },
        {
          description: 'Monthly Hosting & Maintenance',
          quantity: 12,
          unitPrice: 150.00,
          taxPercent: 10,
          lineTotal: '=B15*C15*(1+D15/100)'
        },
        {
          description: 'Logo & Brand Identity Package',
          quantity: 1,
          unitPrice: 1200.00,
          taxPercent: 10,
          lineTotal: '=B16*C16*(1+D16/100)'
        },
        {
          description: 'Content Writing (10 pages)',
          quantity: 10,
          unitPrice: 75.00,
          taxPercent: 10,
          lineTotal: '=B17*C17*(1+D17/100)'
        }
      ],
      columnAlignment: {
        A: 'left',   // Description
        B: 'center', // Quantity
        C: 'right',  // Unit Price
        D: 'center', // Tax %
        E: 'right'   // Line Total
      },
      style: {
        alternateRowBg: '#F9F9F9'
      }
    },
    
    // Totals Summary Section (Rows 19-21)
    totalsSection: {
      subtotal: {
        labelCell: 'D19',
        label: 'Subtotal:',
        valueCell: 'E19',
        formula: '=SUM(E13:E17)'
      },
      tax: {
        labelCell: 'D20',
        label: 'Total Tax:',
        valueCell: 'E20',
        formula: '=E19-SUM(B13:B17*C13:C17)'
      },
      total: {
        labelCell: 'D21',
        label: 'TOTAL DUE:',
        valueCell: 'E21',
        formula: '=E19'
      },
      style: {
        backgroundColor: '#F3E5F5',
        labelBold: true,
        totalBold: true,
        totalFontSize: 14,
        totalColor: '#673AB7'
      }
    },
    
    // Payment Terms Section (Row 23)
    paymentTerms: {
      cell: 'A23',
      value: 'Payment Terms: Net 30 days. Late payments subject to 1.5% monthly interest.',
      style: {
        fontSize: 10,
        color: '#666666'
      }
    },
    
    // Thank You Note (Row 24)
    thankYou: {
      cell: 'A24',
      value: 'Thank you for your business!',
      style: {
        fontSize: 11,
        bold: true,
        textAlign: 'center'
      }
    },
    
    styles: {
      headerBg: '#673AB7',
      headerColor: '#FFFFFF'
    }
  },

  'project-tracker': {
    id: 'project-tracker',
    name: 'Project Tracker Template',
    description: 'Track tasks, deadlines, and project status',
    category: 'Project Management',
    icon: 'CheckSquare',
    customLayout: true,
    
    // Title Section
    title: {
      row: 1,
      value: 'Project Tracker',
      mergedCells: 'A1:G1',
      style: {
        bold: true,
        fontSize: 18,
        textAlign: 'center',
        backgroundColor: '#9C27B0',
        color: '#FFFFFF'
      }
    },
    
    // Project Info Section (Rows 3-7)
    projectInfo: [
      { labelCell: 'A3', label: 'Project Name:', valueCell: 'B3', value: 'Website Redesign Project' },
      { labelCell: 'A4', label: 'Owner:', valueCell: 'B4', value: 'Sarah Johnson' },
      { labelCell: 'A5', label: 'Start Date:', valueCell: 'B5', value: '2025-01-15' },
      { labelCell: 'A6', label: 'End Date:', valueCell: 'B6', value: '2025-06-30' },
      { labelCell: 'A7', label: 'Status:', valueCell: 'B7', value: 'In Progress' }
    ],
    infoStyle: {
      labelBold: true,
      backgroundColor: '#F3E5F5'
    },
    
    // Task Table
    taskTable: {
      headerRow: 9,
      headers: ['Task', 'Owner', 'Start Date', 'Due Date', 'Status', 'Progress', 'Notes'],
      columns: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
      headerStyle: {
        bold: true,
        backgroundColor: '#CE93D8',
        color: '#FFFFFF',
        textAlign: 'center'
      },
      dataStartRow: 10,
      data: [
        {
          task: 'Requirements Gathering',
          owner: 'Sarah Johnson',
          startDate: '2025-01-15',
          dueDate: '2025-01-30',
          status: 'Done',
          progress: '100%',
          notes: 'All requirements documented'
        },
        {
          task: 'UI/UX Design',
          owner: 'Michael Chen',
          startDate: '2025-02-01',
          dueDate: '2025-02-28',
          status: 'Done',
          progress: '100%',
          notes: 'Design approved by stakeholders'
        },
        {
          task: 'Frontend Development',
          owner: 'Emily Rodriguez',
          startDate: '2025-03-01',
          dueDate: '2025-04-30',
          status: 'In Progress',
          progress: '65%',
          notes: 'React components being built'
        },
        {
          task: 'Backend API Development',
          owner: 'James Wilson',
          startDate: '2025-03-15',
          dueDate: '2025-05-15',
          status: 'In Progress',
          progress: '45%',
          notes: 'Database schema completed'
        },
        {
          task: 'Testing & QA',
          owner: 'Lisa Anderson',
          startDate: '2025-05-01',
          dueDate: '2025-06-15',
          status: 'Not Started',
          progress: '0%',
          notes: 'Waiting for dev completion'
        },
        {
          task: 'Deployment',
          owner: 'Sarah Johnson',
          startDate: '2025-06-16',
          dueDate: '2025-06-30',
          status: 'Not Started',
          progress: '0%',
          notes: 'Production environment ready'
        }
      ],
      columnAlignment: {
        A: 'left',    // Task
        B: 'left',    // Owner
        C: 'center',  // Start Date
        D: 'center',  // Due Date
        E: 'center',  // Status
        F: 'center',  // Progress
        G: 'left'     // Notes
      },
      style: {
        alternateRowBg: '#F3E5F5'
      }
    },
    
    // Conditional formatting for Status column
    conditionalFormatting: [
      {
        column: 'E',
        condition: 'equals',
        value: 'Done',
        style: { backgroundColor: '#4CAF50', color: '#FFFFFF', bold: true }
      },
      {
        column: 'E',
        condition: 'equals',
        value: 'In Progress',
        style: { backgroundColor: '#2196F3', color: '#FFFFFF', bold: true }
      },
      {
        column: 'E',
        condition: 'equals',
        value: 'Not Started',
        style: { backgroundColor: '#9E9E9E', color: '#FFFFFF' }
      }
    ],
    
    styles: {
      headerBg: '#9C27B0',
      headerColor: '#FFFFFF'
    }
  },

  'sales-tracker': {
    id: 'sales-tracker',
    name: 'Sales Tracker Template',
    description: 'Track product sales with revenue calculations and regional analysis',
    category: 'Sales',
    icon: 'ShoppingCart',
    customLayout: true,
    
    // Main Title
    title: {
      row: 1,
      value: 'Sales Tracker Dashboard',
      mergedCells: 'A1:H1',
      style: {
        bold: true,
        fontSize: 20,
        textAlign: 'center',
        backgroundColor: '#00796B',
        color: '#FFFFFF'
      }
    },
    
    // Summary Section Header
    summaryHeader: {
      row: 3,
      value: 'Sales Summary',
      mergedCells: 'A3:H3',
      style: {
        bold: true,
        fontSize: 14,
        textAlign: 'center',
        backgroundColor: '#B2DFDB',
        color: '#004D40'
      }
    },
    
    // Summary Metrics (Row 4)
    summaryMetrics: [
      { 
        cell: 'A4', 
        label: 'Total Sales:', 
        style: { bold: true, backgroundColor: '#E0F2F1', textAlign: 'right' }
      },
      { 
        cell: 'B4', 
        value: '=SUM(H9:H23)', 
        style: { bold: true, backgroundColor: '#E0F2F1', fontSize: 12 }
      },
      { 
        cell: 'D4', 
        label: 'Total Orders:', 
        style: { bold: true, backgroundColor: '#E0F2F1', textAlign: 'right' }
      },
      { 
        cell: 'E4', 
        value: '=COUNTA(B9:B23)', 
        style: { bold: true, backgroundColor: '#E0F2F1', fontSize: 12 }
      },
      { 
        cell: 'G4', 
        label: 'Avg Order Value:', 
        style: { bold: true, backgroundColor: '#E0F2F1', textAlign: 'right' }
      },
      { 
        cell: 'H4', 
        value: '=ROUND(B4/E4,2)', 
        style: { bold: true, backgroundColor: '#E0F2F1', fontSize: 12 }
      }
    ],
    
    // Main Sales Table
    salesTable: {
      headerRow: 6,
      title: {
        row: 6,
        value: 'Sales Transactions',
        mergedCells: 'A6:H6',
        style: {
          bold: true,
          fontSize: 13,
          textAlign: 'center',
          backgroundColor: '#80CBC4',
          color: '#004D40'
        }
      },
      dataHeaderRow: 8,
      headers: ['Date', 'Order ID', 'Customer', 'Region', 'Product', 'Quantity', 'Unit Price', 'Total'],
      columns: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
      headerStyle: {
        bold: true,
        backgroundColor: '#00796B',
        color: '#FFFFFF',
        textAlign: 'center',
        fontSize: 11
      },
      dataStartRow: 9,
      sampleData: [
        { date: '2024-01-05', orderId: 'ORD-1001', customer: 'Acme Corp', region: 'North', product: 'Laptop Pro', quantity: 5, unitPrice: 1200, total: '=F9*G9' },
        { date: '2024-01-08', orderId: 'ORD-1002', customer: 'Tech Solutions', region: 'South', product: 'Wireless Mouse', quantity: 25, unitPrice: 25, total: '=F10*G10' },
        { date: '2024-01-10', orderId: 'ORD-1003', customer: 'Global Industries', region: 'East', product: 'Monitor 27"', quantity: 8, unitPrice: 350, total: '=F11*G11' },
        { date: '2024-01-12', orderId: 'ORD-1004', customer: 'Prime Enterprise', region: 'West', product: 'USB-C Hub', quantity: 15, unitPrice: 45, total: '=F12*G12' },
        { date: '2024-01-15', orderId: 'ORD-1005', customer: 'Mega Corp', region: 'North', product: 'Keyboard Mechanical', quantity: 12, unitPrice: 85, total: '=F13*G13' },
        { date: '2024-01-18', orderId: 'ORD-1006', customer: 'StartUp Inc', region: 'South', product: 'Laptop Pro', quantity: 3, unitPrice: 1200, total: '=F14*G14' },
        { date: '2024-01-20', orderId: 'ORD-1007', customer: 'Elite Services', region: 'East', product: 'Webcam HD', quantity: 20, unitPrice: 75, total: '=F15*G15' },
        { date: '2024-01-22', orderId: 'ORD-1008', customer: 'Tech Innovators', region: 'West', product: 'Headset Pro', quantity: 10, unitPrice: 120, total: '=F16*G16' },
        { date: '2024-01-25', orderId: 'ORD-1009', customer: 'Digital Ventures', region: 'North', product: 'Monitor 27"', quantity: 6, unitPrice: 350, total: '=F17*G17' },
        { date: '2024-01-27', orderId: 'ORD-1010', customer: 'Future Tech', region: 'South', product: 'USB-C Hub', quantity: 30, unitPrice: 45, total: '=F18*G18' },
        { date: '2024-01-28', orderId: 'ORD-1011', customer: 'Smart Systems', region: 'East', product: 'Wireless Mouse', quantity: 40, unitPrice: 25, total: '=F19*G19' },
        { date: '2024-01-29', orderId: 'ORD-1012', customer: 'Pro Solutions', region: 'West', product: 'Laptop Pro', quantity: 4, unitPrice: 1200, total: '=F20*G20' },
        { date: '2024-01-30', orderId: 'ORD-1013', customer: 'Cloud Services', region: 'North', product: 'Keyboard Mechanical', quantity: 18, unitPrice: 85, total: '=F21*G21' },
        { date: '2024-02-01', orderId: 'ORD-1014', customer: 'Data Corp', region: 'South', product: 'Webcam HD', quantity: 15, unitPrice: 75, total: '=F22*G22' },
        { date: '2024-02-03', orderId: 'ORD-1015', customer: 'Net Solutions', region: 'East', product: 'Headset Pro', quantity: 22, unitPrice: 120, total: '=F23*G23' }
      ],
      numericColumns: ['F', 'G', 'H'], // Right-align these columns
      numericStyle: {
        textAlign: 'right'
      }
    },
    
    // Regional Analysis Section
    regionalAnalysis: {
      headerRow: 26,
      title: {
        row: 26,
        value: 'Sales by Region',
        mergedCells: 'A26:C26',
        style: {
          bold: true,
          fontSize: 13,
          textAlign: 'center',
          backgroundColor: '#FFE082',
          color: '#F57F17'
        }
      },
      dataHeaderRow: 28,
      headers: ['Region', 'Total Sales', 'Orders'],
      columns: ['A', 'B', 'C'],
      headerStyle: {
        bold: true,
        backgroundColor: '#FFA726',
        color: '#FFFFFF',
        textAlign: 'center'
      },
      dataStartRow: 29,
      regions: [
        { region: 'North', totalSales: '=SUMIF(D9:D23,"North",H9:H23)', orders: '=COUNTIF(D9:D23,"North")' },
        { region: 'South', totalSales: '=SUMIF(D9:D23,"South",H9:H23)', orders: '=COUNTIF(D9:D23,"South")' },
        { region: 'East', totalSales: '=SUMIF(D9:D23,"East",H9:H23)', orders: '=COUNTIF(D9:D23,"East")' },
        { region: 'West', totalSales: '=SUMIF(D9:D23,"West",H9:H23)', orders: '=COUNTIF(D9:D23,"West")' }
      ],
      numericColumns: ['B', 'C'],
      numericStyle: {
        textAlign: 'right'
      }
    },
    
    styles: {
      headerBg: '#00796B',
      headerColor: '#FFFFFF',
      alternateRowBg: '#F5F5F5'
    }
  },

  'inventory-management': {
    id: 'inventory-management',
    name: 'Inventory Management Template',
    description: 'Track stock levels and inventory balance',
    category: 'Operations',
    icon: 'Package',
    customLayout: true,
    
    // Header Section
    title: {
      row: 1,
      value: 'Inventory Management',
      mergedCells: 'A1:H1',
      style: {
        bold: true,
        fontSize: 18,
        textAlign: 'center',
        backgroundColor: '#795548',
        color: '#FFFFFF'
      }
    },
    
    // Metadata Row
    metadata: [
      { cell: 'A2', value: 'Warehouse:', style: { bold: true } },
      { cell: 'B2', value: 'Main Warehouse' },
      { cell: 'C2', value: 'Last Updated:', style: { bold: true } },
      { cell: 'D2', value: '=TODAY()' }
    ],
    
    // Inventory Table
    inventoryTable: {
      headerRow: 4,
      headers: ['Item ID', 'Item Name', 'Category', 'Location', 'Quantity in Stock', 'Reorder Level', 'Reorder Qty', 'Needs Reorder?'],
      columns: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
      headerStyle: {
        bold: true,
        backgroundColor: '#A1887F',
        color: '#FFFFFF',
        textAlign: 'center'
      },
      dataStartRow: 5,
      data: [
        { 
          itemId: 'INV-001', 
          itemName: 'Office Paper (Ream)', 
          category: 'Supplies', 
          location: 'Shelf A1', 
          quantity: 180, 
          reorderLevel: 100, 
          reorderQty: 200,
          needsReorder: '=IF(E5<=F5,"Yes","No")'
        },
        { 
          itemId: 'INV-002', 
          itemName: 'Printer Ink Cartridge', 
          category: 'Supplies', 
          location: 'Shelf A2', 
          quantity: 45, 
          reorderLevel: 50, 
          reorderQty: 100,
          needsReorder: '=IF(E6<=F6,"Yes","No")'
        },
        { 
          itemId: 'INV-003', 
          itemName: 'Notebooks (Pack of 5)', 
          category: 'Stationery', 
          location: 'Shelf B1', 
          quantity: 65, 
          reorderLevel: 75, 
          reorderQty: 150,
          needsReorder: '=IF(E7<=F7,"Yes","No")'
        },
        { 
          itemId: 'INV-004', 
          itemName: 'Ballpoint Pens (Box)', 
          category: 'Stationery', 
          location: 'Shelf B2', 
          quantity: 220, 
          reorderLevel: 100, 
          reorderQty: 200,
          needsReorder: '=IF(E8<=F8,"Yes","No")'
        },
        { 
          itemId: 'INV-005', 
          itemName: 'Stapler', 
          category: 'Equipment', 
          location: 'Shelf C1', 
          quantity: 25, 
          reorderLevel: 20, 
          reorderQty: 30,
          needsReorder: '=IF(E9<=F9,"Yes","No")'
        },
        { 
          itemId: 'INV-006', 
          itemName: 'File Folders (Pack)', 
          category: 'Supplies', 
          location: 'Shelf C2', 
          quantity: 15, 
          reorderLevel: 30, 
          reorderQty: 50,
          needsReorder: '=IF(E10<=F10,"Yes","No")'
        }
      ],
      columnAlignment: {
        A: 'center',  // Item ID
        B: 'left',    // Item Name
        C: 'left',    // Category
        D: 'center',  // Location
        E: 'right',   // Quantity
        F: 'right',   // Reorder Level
        G: 'right',   // Reorder Qty
        H: 'center'   // Needs Reorder
      },
      style: {
        alternateRowBg: '#EFEBE9'
      }
    },
    
    // Conditional formatting for Needs Reorder column
    conditionalFormatting: [
      {
        column: 'H',
        condition: 'equals',
        value: 'Yes',
        style: { backgroundColor: '#FF5252', color: '#FFFFFF', bold: true }
      },
      {
        column: 'H',
        condition: 'equals',
        value: 'No',
        style: { backgroundColor: '#4CAF50', color: '#FFFFFF' }
      }
    ],
    
    styles: {
      headerBg: '#795548',
      headerColor: '#FFFFFF'
    }
  },

  'timesheet': {
    id: 'timesheet',
    name: 'Employee Timesheet Template',
    description: 'Track employee hours worked with automatic total calculations',
    category: 'HR',
    icon: 'Clock',
    customLayout: true,
    
    // Title Section
    title: {
      row: 1,
      value: 'Employee Timesheet',
      mergedCells: 'A1:H1',
      style: {
        bold: true,
        fontSize: 20,
        textAlign: 'center',
        backgroundColor: '#455A64',
        color: '#FFFFFF'
      }
    },
    
    // Employee Info Section (Rows 3-6)
    employeeInfo: [
      { labelCell: 'A3', label: 'Employee Name:', valueCell: 'B3', value: 'John Doe' },
      { labelCell: 'A4', label: 'Employee ID:', valueCell: 'B4', value: 'EMP-1234' },
      { labelCell: 'A5', label: 'Department:', valueCell: 'B5', value: 'Engineering' },
      { labelCell: 'A6', label: 'Pay Period:', valueCell: 'B6', value: 'Jan 1 - Jan 15, 2025' }
    ],
    infoStyle: {
      labelBold: true,
      backgroundColor: '#CFD8DC'
    },
    
    // Timesheet Table
    timesheetTable: {
      headerRow: 8,
      headers: ['Date', 'Day', 'Time In', 'Time Out', 'Break (hrs)', 'Total Hours', 'Overtime', 'Notes'],
      columns: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
      headerStyle: {
        bold: true,
        backgroundColor: '#607D8B',
        color: '#FFFFFF',
        textAlign: 'center'
      },
      dataStartRow: 9,
      data: [
        {
          date: '2025-01-01',
          day: 'Monday',
          timeIn: '09:00',
          timeOut: '17:30',
          breakHrs: 0.5,
          totalHours: '=((TIME(17,30,0)-TIME(9,0,0))*24)-E9',
          overtime: '=IF(F9>8,F9-8,0)',
          notes: ''
        },
        {
          date: '2025-01-02',
          day: 'Tuesday',
          timeIn: '09:00',
          timeOut: '18:00',
          breakHrs: 0.5,
          totalHours: '=((TIME(18,0,0)-TIME(9,0,0))*24)-E10',
          overtime: '=IF(F10>8,F10-8,0)',
          notes: ''
        },
        {
          date: '2025-01-03',
          day: 'Wednesday',
          timeIn: '09:00',
          timeOut: '17:00',
          breakHrs: 0.5,
          totalHours: '=((TIME(17,0,0)-TIME(9,0,0))*24)-E11',
          overtime: '=IF(F11>8,F11-8,0)',
          notes: ''
        },
        {
          date: '2025-01-04',
          day: 'Thursday',
          timeIn: '09:00',
          timeOut: '17:30',
          breakHrs: 0.5,
          totalHours: '=((TIME(17,30,0)-TIME(9,0,0))*24)-E12',
          overtime: '=IF(F12>8,F12-8,0)',
          notes: ''
        },
        {
          date: '2025-01-05',
          day: 'Friday',
          timeIn: '09:00',
          timeOut: '16:00',
          breakHrs: 0.5,
          totalHours: '=((TIME(16,0,0)-TIME(9,0,0))*24)-E13',
          overtime: '=IF(F13>8,F13-8,0)',
          notes: ''
        }
      ],
      columnAlignment: {
        A: 'center',  // Date
        B: 'left',    // Day
        C: 'center',  // Time In
        D: 'center',  // Time Out
        E: 'center',  // Break
        F: 'right',   // Total Hours
        G: 'right',   // Overtime
        H: 'left'     // Notes
      },
      style: {
        alternateRowBg: '#ECEFF1'
      }
    },
    
    // Summary Section (Row 15)
    summary: {
      row: 15,
      items: [
        { labelCell: 'E15', label: 'Total Hours:', valueCell: 'F15', formula: '=SUM(F9:F13)' },
        { labelCell: 'E16', label: 'Total Overtime:', valueCell: 'F16', formula: '=SUM(G9:G13)' }
      ],
      style: {
        bold: true,
        backgroundColor: '#B0BEC5',
        fontSize: 12
      }
    },
    
    // Signature Section (Rows 18-20)
    signatures: [
      { labelCell: 'A18', label: 'Employee Signature:', valueCell: 'B18', value: '_____________________' },
      { labelCell: 'E18', label: 'Date:', valueCell: 'F18', value: '_____________________' },
      { labelCell: 'A20', label: 'Supervisor Signature:', valueCell: 'B20', value: '_____________________' },
      { labelCell: 'E20', label: 'Date:', valueCell: 'F20', value: '_____________________' }
    ],
    signatureStyle: {
      labelBold: true
    },
    
    styles: {
      headerBg: '#455A64',
      headerColor: '#FFFFFF'
    }
  },

  'school-gradebook': {
    id: 'school-gradebook',
    name: 'School Gradebook Template',
    description: 'Track student grades with automatic grade calculation',
    category: 'Education',
    icon: 'GraduationCap',
    customLayout: true,
    
    // Title Section
    title: {
      row: 1,
      value: 'Gradebook',
      mergedCells: 'A1:I1',
      style: {
        bold: true,
        fontSize: 20,
        textAlign: 'center',
        backgroundColor: '#3F51B5',
        color: '#FFFFFF'
      }
    },
    
    // Class Information Section (Rows 3-6)
    classInfo: [
      { labelCell: 'A3', label: 'Class / Section:', valueCell: 'B3', value: 'Grade 10 - Section A' },
      { labelCell: 'A4', label: 'Subject:', valueCell: 'B4', value: 'Mathematics' },
      { labelCell: 'A5', label: 'Academic Year:', valueCell: 'B5', value: '2024-2025' },
      { labelCell: 'A6', label: 'Teacher Name:', valueCell: 'B6', value: 'Ms. Jennifer Williams' }
    ],
    infoStyle: {
      labelBold: true,
      backgroundColor: '#E8EAF6'
    },
    
    // Grade Table Configuration
    gradeTable: {
      headerRow: 8,
      headers: ['Roll No', 'Student Name', 'Assignment 1', 'Assignment 2', 'Midterm', 'Final Exam', 'Total', 'Percentage', 'Grade'],
      columns: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'],
      maxScores: {
        assignment1: 20,
        assignment2: 20,
        midterm: 30,
        finalExam: 30,
        total: 100
      },
      headerStyle: {
        bold: true,
        backgroundColor: '#5C6BC0',
        color: '#FFFFFF',
        textAlign: 'center'
      },
      dataStartRow: 9,
      data: [
        {
          rollNo: '001',
          studentName: 'Emily Johnson',
          assignment1: 18,
          assignment2: 17,
          midterm: 28,
          finalExam: 27,
          total: '=C9+D9+E9+F9',
          percentage: '=G9/100*100',
          grade: '=IF(H9>=90,"A",IF(H9>=80,"B",IF(H9>=70,"C",IF(H9>=60,"D","F"))))'
        },
        {
          rollNo: '002',
          studentName: 'Michael Chen',
          assignment1: 19,
          assignment2: 20,
          midterm: 29,
          finalExam: 28,
          total: '=C10+D10+E10+F10',
          percentage: '=G10/100*100',
          grade: '=IF(H10>=90,"A",IF(H10>=80,"B",IF(H10>=70,"C",IF(H10>=60,"D","F"))))'
        },
        {
          rollNo: '003',
          studentName: 'Sarah Martinez',
          assignment1: 15,
          assignment2: 16,
          midterm: 22,
          finalExam: 24,
          total: '=C11+D11+E11+F11',
          percentage: '=G11/100*100',
          grade: '=IF(H11>=90,"A",IF(H11>=80,"B",IF(H11>=70,"C",IF(H11>=60,"D","F"))))'
        },
        {
          rollNo: '004',
          studentName: 'David Wilson',
          assignment1: 20,
          assignment2: 19,
          midterm: 27,
          finalExam: 29,
          total: '=C12+D12+E12+F12',
          percentage: '=G12/100*100',
          grade: '=IF(H12>=90,"A",IF(H12>=80,"B",IF(H12>=70,"C",IF(H12>=60,"D","F"))))'
        },
        {
          rollNo: '005',
          studentName: 'Jessica Brown',
          assignment1: 17,
          assignment2: 18,
          midterm: 25,
          finalExam: 26,
          total: '=C13+D13+E13+F13',
          percentage: '=G13/100*100',
          grade: '=IF(H13>=90,"A",IF(H13>=80,"B",IF(H13>=70,"C",IF(H13>=60,"D","F"))))'
        },
        {
          rollNo: '006',
          studentName: 'Christopher Lee',
          assignment1: 14,
          assignment2: 15,
          midterm: 20,
          finalExam: 22,
          total: '=C14+D14+E14+F14',
          percentage: '=G14/100*100',
          grade: '=IF(H14>=90,"A",IF(H14>=80,"B",IF(H14>=70,"C",IF(H14>=60,"D","F"))))'
        },
        {
          rollNo: '007',
          studentName: 'Amanda Taylor',
          assignment1: 16,
          assignment2: 17,
          midterm: 26,
          finalExam: 25,
          total: '=C15+D15+E15+F15',
          percentage: '=G15/100*100',
          grade: '=IF(H15>=90,"A",IF(H15>=80,"B",IF(H15>=70,"C",IF(H15>=60,"D","F"))))'
        },
        {
          rollNo: '008',
          studentName: 'Daniel Anderson',
          assignment1: 18,
          assignment2: 19,
          midterm: 28,
          finalExam: 30,
          total: '=C16+D16+E16+F16',
          percentage: '=G16/100*100',
          grade: '=IF(H16>=90,"A",IF(H16>=80,"B",IF(H16>=70,"C",IF(H16>=60,"D","F"))))'
        }
      ],
      columnAlignment: {
        A: 'center',  // Roll No
        B: 'left',    // Student Name
        C: 'right',   // Assignment 1
        D: 'right',   // Assignment 2
        E: 'right',   // Midterm
        F: 'right',   // Final Exam
        G: 'right',   // Total
        H: 'right',   // Percentage
        I: 'center'   // Grade
      },
      style: {
        alternateRowBg: '#E8EAF6'
      }
    },
    
    // Class Average Row
    classAverage: {
      row: 17,
      label: 'Class Average',
      labelCell: 'B17',
      percentageCell: 'H17',
      percentageFormula: '=AVERAGE(H9:H16)',
      style: {
        bold: true,
        backgroundColor: '#C5CAE9',
        fontSize: 12
      }
    },
    
    // Conditional formatting for Grade column
    conditionalFormatting: [
      {
        column: 'I',
        condition: 'equals',
        value: 'A',
        style: { backgroundColor: '#4CAF50', color: '#FFFFFF', bold: true }
      },
      {
        column: 'I',
        condition: 'equals',
        value: 'B',
        style: { backgroundColor: '#8BC34A', color: '#FFFFFF' }
      },
      {
        column: 'I',
        condition: 'equals',
        value: 'C',
        style: { backgroundColor: '#FFC107', color: '#000000' }
      },
      {
        column: 'I',
        condition: 'equals',
        value: 'D',
        style: { backgroundColor: '#FF9800', color: '#FFFFFF' }
      },
      {
        column: 'I',
        condition: 'equals',
        value: 'F',
        style: { backgroundColor: '#FF5252', color: '#FFFFFF', bold: true }
      }
    ],
    
    styles: {
      headerBg: '#3F51B5',
      headerColor: '#FFFFFF'
    }
  }
};

/**
 * Get all available templates
 */
export const getAllTemplates = async (req, res) => {
  try {
    const templateList = Object.values(TEMPLATES).map(template => ({
      id: template.id,
      name: template.name,
      description: template.description,
      category: template.category,
      icon: template.icon
    }));

    // Log template access for analytics
    console.log(`✅ Templates list requested by user: ${req.user?.email || req.user?.id || 'unknown'}`);

    res.json({
      success: true,
      templates: templateList
    });
  } catch (error) {
    console.error('❌ Error fetching templates:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch templates'
    });
  }
};

/**
 * Get specific template details
 */
export const getTemplateById = async (req, res) => {
  try {
    const { templateId } = req.params;
    const template = TEMPLATES[templateId];

    if (!template) {
      console.warn(`⚠️ Template not found: ${templateId} (requested by ${req.user?.email || 'unknown'})`);
      return res.status(404).json({
        success: false,
        error: 'Template not found'
      });
    }

    // Log template access
    console.log(`✅ Template '${template.name}' (${templateId}) requested by user: ${req.user?.email || req.user?.id || 'unknown'}`);

    res.json({
      success: true,
      template
    });
  } catch (error) {
    console.error('❌ Error fetching template:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch template'
    });
  }
};

/**
 * Generate spreadsheet data from template
 */
export const generateTemplate = async (req, res) => {
  try {
    const { templateId } = req.params;
    const template = TEMPLATES[templateId];

    if (!template) {
      console.warn(`⚠️ Template not found for generation: ${templateId} (requested by ${req.user?.email || 'unknown'})`);
      return res.status(404).json({
        success: false,
        error: 'Template not found'
      });
    }

    const spreadsheetData = await buildSpreadsheetFromTemplate(template);

    // Log successful template generation
    console.log(`🎉 Template '${template.name}' (${templateId}) successfully generated for user: ${req.user?.email || req.user?.id || 'unknown'}`);

    res.json({
      success: true,
      data: spreadsheetData,
      metadata: {
        templateId: template.id,
        templateName: template.name,
        generatedAt: new Date().toISOString(),
        generatedBy: req.user?.email || req.user?.id || 'unknown'
      }
    });
  } catch (error) {
    console.error('❌ Error generating template:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate template'
    });
  }
};

/**
 * Build spreadsheet cell data from template configuration
 */
async function buildSpreadsheetFromTemplate(template) {
  const cellData = {};
  let currentRow = 1;

  // Handle custom layout for business report
  if (template.customLayout && template.id === 'business-report') {
    // Add title row (merged A1:D1)
    cellData['A1'] = {
      value: template.title.value,
      fontSize: template.title.style.fontSize,
      bold: template.title.style.bold,
      textAlign: template.title.style.textAlign,
      backgroundColor: template.title.style.backgroundColor,
      color: template.title.style.color
    };
    
    // Add metadata row
    template.metadata.forEach(item => {
      cellData[item.cell] = {
        value: item.value,
        bold: item.style.bold || false,
        backgroundColor: item.style.backgroundColor || ''
      };
    });
    
    // Add metrics section header
    cellData['A4'] = {
      value: template.metricsHeader.value,
      fontSize: template.metricsHeader.style.fontSize,
      bold: template.metricsHeader.style.bold,
      backgroundColor: template.metricsHeader.style.backgroundColor,
      color: template.metricsHeader.style.color
    };
    
    // Add metrics table headers (row 5)
    ['A', 'B', 'C', 'D'].forEach((col, index) => {
      cellData[`${col}5`] = {
        value: template.metricsTableHeaders[index],
        bold: template.metricsHeaderStyle.bold,
        backgroundColor: template.metricsHeaderStyle.backgroundColor,
        color: template.metricsHeaderStyle.color,
        fontSize: template.metricsHeaderStyle.fontSize
      };
    });
    
    // Add metrics data (rows 6-10)
    template.metricsData.forEach((metric, index) => {
      const row = 6 + index;
      cellData[`A${row}`] = { value: metric.metric };
      cellData[`B${row}`] = { value: String(metric.current) };
      cellData[`C${row}`] = { value: String(metric.target) };
      cellData[`D${row}`] = { value: metric.status };
    });
    
    // Add notes section header
    cellData['A12'] = {
      value: template.notesHeader.value,
      fontSize: template.notesHeader.style.fontSize,
      bold: template.notesHeader.style.bold,
      backgroundColor: template.notesHeader.style.backgroundColor,
      color: template.notesHeader.style.color
    };
    
    // Add notes content
    template.notesContent.forEach(note => {
      cellData[note.cell] = {
        value: note.value
      };
    });
    
    return {
      cells: cellData,
      template: {
        id: template.id,
        name: template.name
      }
    };
  }

  // Handle custom layout for attendance register
  if (template.customLayout && template.id === 'attendance') {
    // Add title row (merged A1:AF1)
    cellData['A1'] = {
      value: template.title.value,
      fontSize: template.title.style.fontSize,
      bold: template.title.style.bold,
      textAlign: template.title.style.textAlign,
      backgroundColor: template.title.style.backgroundColor,
      color: template.title.style.color
    };
    
    // Add class info section (rows 3-5)
    template.classInfo.forEach(info => {
      // Label cell
      cellData[info.labelCell] = {
        value: info.label,
        bold: template.infoStyle.labelBold,
        backgroundColor: template.infoStyle.backgroundColor
      };
      // Value cell
      cellData[info.valueCell] = {
        value: info.value,
        backgroundColor: template.infoStyle.backgroundColor
      };
    });
    
    // Add legend row (row 7) - merge across multiple columns
    cellData['A7'] = {
      value: template.legend.value,
      backgroundColor: template.legend.style.backgroundColor,
      fontSize: template.legend.style.fontSize,
      textAlign: template.legend.style.textAlign
    };
    
    // Add attendance grid headers (row 9)
    // Roll No column
    cellData['A9'] = {
      value: template.attendanceGrid.nameColumns.rollNo.header,
      bold: template.attendanceGrid.headerStyle.bold,
      backgroundColor: template.attendanceGrid.nameColumnStyle.backgroundColor,
      color: template.attendanceGrid.headerStyle.color,
      textAlign: template.attendanceGrid.headerStyle.textAlign
    };
    
    // Student Name column
    cellData['B9'] = {
      value: template.attendanceGrid.nameColumns.name.header,
      bold: template.attendanceGrid.headerStyle.bold,
      backgroundColor: template.attendanceGrid.nameColumnStyle.backgroundColor,
      color: template.attendanceGrid.headerStyle.color,
      textAlign: template.attendanceGrid.headerStyle.textAlign
    };
    
    // Day columns (1-31)
    template.attendanceGrid.dayColumns.forEach((col, index) => {
      cellData[`${col}9`] = {
        value: String(index + 1),
        bold: template.attendanceGrid.headerStyle.bold,
        backgroundColor: template.attendanceGrid.headerStyle.backgroundColor,
        color: template.attendanceGrid.headerStyle.color,
        textAlign: template.attendanceGrid.headerStyle.textAlign
      };
    });
    
    // Summary column headers
    cellData['AH9'] = {
      value: template.attendanceGrid.summaryColumns.totalPresent.header,
      bold: template.attendanceGrid.headerStyle.bold,
      backgroundColor: template.attendanceGrid.headerStyle.backgroundColor,
      color: template.attendanceGrid.headerStyle.color,
      textAlign: template.attendanceGrid.headerStyle.textAlign,
      fontSize: 10
    };
    cellData['AI9'] = {
      value: template.attendanceGrid.summaryColumns.totalAbsent.header,
      bold: template.attendanceGrid.headerStyle.bold,
      backgroundColor: template.attendanceGrid.headerStyle.backgroundColor,
      color: template.attendanceGrid.headerStyle.color,
      textAlign: template.attendanceGrid.headerStyle.textAlign,
      fontSize: 10
    };
    cellData['AJ9'] = {
      value: template.attendanceGrid.summaryColumns.attendancePercent.header,
      bold: template.attendanceGrid.headerStyle.bold,
      backgroundColor: template.attendanceGrid.headerStyle.backgroundColor,
      color: template.attendanceGrid.headerStyle.color,
      textAlign: template.attendanceGrid.headerStyle.textAlign,
      fontSize: 10
    };
    
    // Add student rows (rows 10-24)
    template.attendanceGrid.students.forEach((student, index) => {
      const row = template.attendanceGrid.dataStartRow + index;
      const bgColor = index % 2 === 1 ? template.attendanceGrid.style.alternateRowBg : '';
      
      // Roll No (always has name column style)
      cellData[`A${row}`] = {
        value: student.rollNo,
        backgroundColor: template.attendanceGrid.nameColumnStyle.backgroundColor,
        textAlign: 'center',
        bold: template.attendanceGrid.nameColumnStyle.bold
      };
      
      // Student Name (always has name column style)
      cellData[`B${row}`] = {
        value: student.name,
        backgroundColor: template.attendanceGrid.nameColumnStyle.backgroundColor,
        textAlign: 'left',
        bold: template.attendanceGrid.nameColumnStyle.bold
      };
      
      // Day columns - add sample data for first 3 days, leave rest empty
      template.attendanceGrid.dayColumns.forEach((col, dayIndex) => {
        const dayNum = dayIndex + 1;
        let value = '';
        
        // Add sample attendance for first 3 days
        if (template.attendanceGrid.sampleAttendance[dayNum] && 
            template.attendanceGrid.sampleAttendance[dayNum][index] !== undefined) {
          value = template.attendanceGrid.sampleAttendance[dayNum][index];
        }
        
        cellData[`${col}${row}`] = {
          value: value,
          backgroundColor: bgColor,
          textAlign: 'center'
        };
      });
      
      // Summary formulas
      // Total Present: Count "P" in the row
      cellData[`AH${row}`] = {
        value: `=COUNTIF(C${row}:AG${row},"P")`,
        backgroundColor: bgColor,
        textAlign: 'center',
        bold: true
      };
      
      // Total Absent: Count "A" in the row
      cellData[`AI${row}`] = {
        value: `=COUNTIF(C${row}:AG${row},"A")`,
        backgroundColor: bgColor,
        textAlign: 'center',
        bold: true
      };
      
      // Attendance %: (Total Present / Total Days) * 100
      cellData[`AJ${row}`] = {
        value: `=IF(COUNTA(C${row}:AG${row})>0,AH${row}/COUNTA(C${row}:AG${row})*100,0)`,
        backgroundColor: bgColor,
        textAlign: 'center',
        bold: true
      };
    });
    
    return {
      cells: cellData,
      template: {
        id: template.id,
        name: template.name
      }
    };
  }

  // Handle custom layout for budget planner
  if (template.customLayout && template.id === 'budget-planner') {
    // Add title row (merged A1:D1)
    cellData['A1'] = {
      value: template.title.value,
      fontSize: template.title.style.fontSize,
      bold: template.title.style.bold,
      textAlign: template.title.style.textAlign,
      backgroundColor: template.title.style.backgroundColor,
      color: template.title.style.color
    };
    
    // Add Summary Section (rows 3-5)
    template.summary.items.forEach(item => {
      // Label cell
      cellData[item.labelCell] = {
        value: item.label,
        bold: template.summary.style.bold,
        fontSize: template.summary.style.fontSize,
        backgroundColor: template.summary.backgroundColor
      };
      // Value cell (formula)
      cellData[item.valueCell] = {
        value: item.formula,
        bold: template.summary.style.bold,
        fontSize: template.summary.style.fontSize,
        backgroundColor: template.summary.backgroundColor,
        textAlign: 'right'
      };
    });
    
    // Add Income Section Header (row 7)
    cellData['A7'] = {
      value: template.incomeSection.headerLabel,
      fontSize: template.incomeSection.headerStyle.fontSize,
      bold: template.incomeSection.headerStyle.bold,
      backgroundColor: template.incomeSection.headerStyle.backgroundColor,
      color: template.incomeSection.headerStyle.color
    };
    
    // Add Income Table Headers (row 8)
    template.incomeSection.headers.forEach((header, index) => {
      const col = template.incomeSection.columns[index];
      cellData[`${col}8`] = {
        value: header,
        bold: template.incomeSection.headerStyle.bold,
        backgroundColor: template.incomeSection.headerStyle.backgroundColor,
        color: template.incomeSection.headerStyle.color,
        textAlign: template.incomeSection.headerStyle.textAlign
      };
    });
    
    // Add Income Data (rows 9-11)
    template.incomeSection.data.forEach((item, index) => {
      const row = template.incomeSection.dataStartRow + index;
      const bgColor = index % 2 === 1 ? template.incomeSection.style.alternateRowBg : '';
      
      cellData[`A${row}`] = { value: item.category, backgroundColor: bgColor };
      cellData[`B${row}`] = { value: String(item.planned), backgroundColor: bgColor, textAlign: 'right' };
      cellData[`C${row}`] = { value: String(item.actual), backgroundColor: bgColor, textAlign: 'right' };
      cellData[`D${row}`] = { value: item.difference, backgroundColor: bgColor, textAlign: 'right' };
    });
    
    // Add Expenses Section Header (row 13)
    cellData['A13'] = {
      value: template.expensesSection.headerLabel,
      fontSize: template.expensesSection.headerStyle.fontSize,
      bold: template.expensesSection.headerStyle.bold,
      backgroundColor: template.expensesSection.headerStyle.backgroundColor,
      color: template.expensesSection.headerStyle.color
    };
    
    // Add Expenses Table Headers (row 14)
    template.expensesSection.headers.forEach((header, index) => {
      const col = template.expensesSection.columns[index];
      cellData[`${col}14`] = {
        value: header,
        bold: template.expensesSection.headerStyle.bold,
        backgroundColor: template.expensesSection.headerStyle.backgroundColor,
        color: template.expensesSection.headerStyle.color,
        textAlign: template.expensesSection.headerStyle.textAlign
      };
    });
    
    // Add Expenses Data (rows 15-19)
    template.expensesSection.data.forEach((item, index) => {
      const row = template.expensesSection.dataStartRow + index;
      const bgColor = index % 2 === 1 ? template.expensesSection.style.alternateRowBg : '';
      
      cellData[`A${row}`] = { value: item.category, backgroundColor: bgColor };
      cellData[`B${row}`] = { value: String(item.planned), backgroundColor: bgColor, textAlign: 'right' };
      cellData[`C${row}`] = { value: String(item.actual), backgroundColor: bgColor, textAlign: 'right' };
      cellData[`D${row}`] = { value: item.difference, backgroundColor: bgColor, textAlign: 'right' };
    });
    
    return {
      cells: cellData,
      template: {
        id: template.id,
        name: template.name
      }
    };
  }

  // Handle custom layout for inventory management
  if (template.customLayout && template.id === 'inventory-management') {
    // Add title row (merged A1:H1)
    cellData['A1'] = {
      value: template.title.value,
      fontSize: template.title.style.fontSize,
      bold: template.title.style.bold,
      textAlign: template.title.style.textAlign,
      backgroundColor: template.title.style.backgroundColor,
      color: template.title.style.color
    };
    
    // Add metadata row
    template.metadata.forEach(item => {
      cellData[item.cell] = {
        value: item.value,
        bold: item.style?.bold || false
      };
    });
    
    // Add inventory table headers (row 4)
    template.inventoryTable.headers.forEach((header, index) => {
      const col = template.inventoryTable.columns[index];
      cellData[`${col}4`] = {
        value: header,
        bold: template.inventoryTable.headerStyle.bold,
        backgroundColor: template.inventoryTable.headerStyle.backgroundColor,
        color: template.inventoryTable.headerStyle.color,
        textAlign: template.inventoryTable.headerStyle.textAlign
      };
    });
    
    // Add inventory data (rows 5-10)
    template.inventoryTable.data.forEach((item, index) => {
      const row = template.inventoryTable.dataStartRow + index;
      const bgColor = index % 2 === 1 ? template.inventoryTable.style.alternateRowBg : '';
      
      cellData[`A${row}`] = { 
        value: item.itemId, 
        backgroundColor: bgColor,
        textAlign: template.inventoryTable.columnAlignment.A
      };
      cellData[`B${row}`] = { 
        value: item.itemName, 
        backgroundColor: bgColor,
        textAlign: template.inventoryTable.columnAlignment.B
      };
      cellData[`C${row}`] = { 
        value: item.category, 
        backgroundColor: bgColor,
        textAlign: template.inventoryTable.columnAlignment.C
      };
      cellData[`D${row}`] = { 
        value: item.location, 
        backgroundColor: bgColor,
        textAlign: template.inventoryTable.columnAlignment.D
      };
      cellData[`E${row}`] = { 
        value: String(item.quantity), 
        backgroundColor: bgColor,
        textAlign: template.inventoryTable.columnAlignment.E
      };
      cellData[`F${row}`] = { 
        value: String(item.reorderLevel), 
        backgroundColor: bgColor,
        textAlign: template.inventoryTable.columnAlignment.F
      };
      cellData[`G${row}`] = { 
        value: String(item.reorderQty), 
        backgroundColor: bgColor,
        textAlign: template.inventoryTable.columnAlignment.G
      };
      cellData[`H${row}`] = { 
        value: item.needsReorder, 
        backgroundColor: bgColor,
        textAlign: template.inventoryTable.columnAlignment.H
      };
      
      // Apply conditional formatting for Needs Reorder column
      if (template.conditionalFormatting) {
        template.conditionalFormatting.forEach(rule => {
          if (rule.column === 'H') {
            // Since we have formulas, we'll apply the styling based on the expected values
            // The actual evaluation happens client-side
            cellData[`H${row}`] = {
              ...cellData[`H${row}`]
              // Conditional formatting will be applied by the client when formulas evaluate
            };
          }
        });
      }
    });
    
    return {
      cells: cellData,
      template: {
        id: template.id,
        name: template.name
      }
    };
  }

  // Handle custom layout for project tracker
  if (template.customLayout && template.id === 'project-tracker') {
    // Add title row (merged A1:G1)
    cellData['A1'] = {
      value: template.title.value,
      fontSize: template.title.style.fontSize,
      bold: template.title.style.bold,
      textAlign: template.title.style.textAlign,
      backgroundColor: template.title.style.backgroundColor,
      color: template.title.style.color
    };
    
    // Add project info section (rows 3-7)
    template.projectInfo.forEach(info => {
      // Label cell
      cellData[info.labelCell] = {
        value: info.label,
        bold: template.infoStyle.labelBold,
        backgroundColor: template.infoStyle.backgroundColor
      };
      // Value cell
      cellData[info.valueCell] = {
        value: info.value,
        backgroundColor: template.infoStyle.backgroundColor
      };
    });
    
    // Add task table headers (row 9)
    template.taskTable.headers.forEach((header, index) => {
      const col = template.taskTable.columns[index];
      cellData[`${col}9`] = {
        value: header,
        bold: template.taskTable.headerStyle.bold,
        backgroundColor: template.taskTable.headerStyle.backgroundColor,
        color: template.taskTable.headerStyle.color,
        textAlign: template.taskTable.headerStyle.textAlign
      };
    });
    
    // Add task data (rows 10-15)
    template.taskTable.data.forEach((task, index) => {
      const row = template.taskTable.dataStartRow + index;
      const bgColor = index % 2 === 1 ? template.taskTable.style.alternateRowBg : '';
      
      cellData[`A${row}`] = { 
        value: task.task, 
        backgroundColor: bgColor,
        textAlign: template.taskTable.columnAlignment.A
      };
      cellData[`B${row}`] = { 
        value: task.owner, 
        backgroundColor: bgColor,
        textAlign: template.taskTable.columnAlignment.B
      };
      cellData[`C${row}`] = { 
        value: task.startDate, 
        backgroundColor: bgColor,
        textAlign: template.taskTable.columnAlignment.C
      };
      cellData[`D${row}`] = { 
        value: task.dueDate, 
        backgroundColor: bgColor,
        textAlign: template.taskTable.columnAlignment.D
      };
      cellData[`E${row}`] = { 
        value: task.status, 
        backgroundColor: bgColor,
        textAlign: template.taskTable.columnAlignment.E
      };
      cellData[`F${row}`] = { 
        value: task.progress, 
        backgroundColor: bgColor,
        textAlign: template.taskTable.columnAlignment.F
      };
      cellData[`G${row}`] = { 
        value: task.notes, 
        backgroundColor: bgColor,
        textAlign: template.taskTable.columnAlignment.G
      };
      
      // Apply conditional formatting for Status column
      if (template.conditionalFormatting) {
        template.conditionalFormatting.forEach(rule => {
          if (rule.column === 'E' && task.status === rule.value) {
            cellData[`E${row}`] = {
              ...cellData[`E${row}`],
              backgroundColor: rule.style.backgroundColor,
              color: rule.style.color,
              bold: rule.style.bold || false
            };
          }
        });
      }
    });
    
    return {
      cells: cellData,
      template: {
        id: template.id,
        name: template.name
      }
    };
  }

  // Handle custom layout for employee timesheet
  if (template.customLayout && template.id === 'timesheet') {
    // Add title row (merged A1:H1)
    cellData['A1'] = {
      value: template.title.value,
      fontSize: template.title.style.fontSize,
      bold: template.title.style.bold,
      textAlign: template.title.style.textAlign,
      backgroundColor: template.title.style.backgroundColor,
      color: template.title.style.color
    };
    
    // Add employee info section (rows 3-6)
    template.employeeInfo.forEach(info => {
      // Label cell
      cellData[info.labelCell] = {
        value: info.label,
        bold: template.infoStyle.labelBold,
        backgroundColor: template.infoStyle.backgroundColor
      };
      // Value cell
      cellData[info.valueCell] = {
        value: info.value,
        backgroundColor: template.infoStyle.backgroundColor
      };
    });
    
    // Add timesheet table headers (row 8)
    template.timesheetTable.headers.forEach((header, index) => {
      const col = template.timesheetTable.columns[index];
      cellData[`${col}8`] = {
        value: header,
        bold: template.timesheetTable.headerStyle.bold,
        backgroundColor: template.timesheetTable.headerStyle.backgroundColor,
        color: template.timesheetTable.headerStyle.color,
        textAlign: template.timesheetTable.headerStyle.textAlign
      };
    });
    
    // Add timesheet data (rows 9-13)
    template.timesheetTable.data.forEach((entry, index) => {
      const row = template.timesheetTable.dataStartRow + index;
      const bgColor = index % 2 === 1 ? template.timesheetTable.style.alternateRowBg : '';
      
      cellData[`A${row}`] = { 
        value: entry.date, 
        backgroundColor: bgColor,
        textAlign: template.timesheetTable.columnAlignment.A
      };
      cellData[`B${row}`] = { 
        value: entry.day, 
        backgroundColor: bgColor,
        textAlign: template.timesheetTable.columnAlignment.B
      };
      cellData[`C${row}`] = { 
        value: entry.timeIn, 
        backgroundColor: bgColor,
        textAlign: template.timesheetTable.columnAlignment.C
      };
      cellData[`D${row}`] = { 
        value: entry.timeOut, 
        backgroundColor: bgColor,
        textAlign: template.timesheetTable.columnAlignment.D
      };
      cellData[`E${row}`] = { 
        value: String(entry.breakHrs), 
        backgroundColor: bgColor,
        textAlign: template.timesheetTable.columnAlignment.E
      };
      cellData[`F${row}`] = { 
        value: entry.totalHours, 
        backgroundColor: bgColor,
        textAlign: template.timesheetTable.columnAlignment.F
      };
      cellData[`G${row}`] = { 
        value: entry.overtime, 
        backgroundColor: bgColor,
        textAlign: template.timesheetTable.columnAlignment.G
      };
      cellData[`H${row}`] = { 
        value: entry.notes, 
        backgroundColor: bgColor,
        textAlign: template.timesheetTable.columnAlignment.H
      };
    });
    
    // Add summary section (rows 15-16)
    template.summary.items.forEach((item, index) => {
      const row = template.summary.row + index;
      
      // Label cell
      cellData[item.labelCell] = {
        value: item.label,
        bold: template.summary.style.bold,
        backgroundColor: template.summary.style.backgroundColor,
        fontSize: template.summary.style.fontSize,
        textAlign: 'right'
      };
      
      // Value cell (formula)
      cellData[item.valueCell] = {
        value: item.formula,
        bold: template.summary.style.bold,
        backgroundColor: template.summary.style.backgroundColor,
        fontSize: template.summary.style.fontSize,
        textAlign: 'right'
      };
    });
    
    // Add signature section (rows 18-20)
    template.signatures.forEach(sig => {
      // Label cell
      cellData[sig.labelCell] = {
        value: sig.label,
        bold: template.signatureStyle.labelBold
      };
      // Value cell
      cellData[sig.valueCell] = {
        value: sig.value
      };
    });
    
    return {
      cells: cellData,
      template: {
        id: template.id,
        name: template.name
      }
    };
  }

  // Handle custom layout for school gradebook
  if (template.customLayout && template.id === 'school-gradebook') {
    // Add title row (merged A1:I1)
    cellData['A1'] = {
      value: template.title.value,
      fontSize: template.title.style.fontSize,
      bold: template.title.style.bold,
      textAlign: template.title.style.textAlign,
      backgroundColor: template.title.style.backgroundColor,
      color: template.title.style.color
    };
    
    // Add class info section (rows 3-6)
    template.classInfo.forEach(info => {
      // Label cell
      cellData[info.labelCell] = {
        value: info.label,
        bold: template.infoStyle.labelBold,
        backgroundColor: template.infoStyle.backgroundColor
      };
      // Value cell
      cellData[info.valueCell] = {
        value: info.value,
        backgroundColor: template.infoStyle.backgroundColor
      };
    });
    
    // Add grade table headers (row 8)
    template.gradeTable.headers.forEach((header, index) => {
      const col = template.gradeTable.columns[index];
      cellData[`${col}8`] = {
        value: header,
        bold: template.gradeTable.headerStyle.bold,
        backgroundColor: template.gradeTable.headerStyle.backgroundColor,
        color: template.gradeTable.headerStyle.color,
        textAlign: template.gradeTable.headerStyle.textAlign
      };
    });
    
    // Add student grade data (rows 9-16)
    template.gradeTable.data.forEach((student, index) => {
      const row = template.gradeTable.dataStartRow + index;
      const bgColor = index % 2 === 1 ? template.gradeTable.style.alternateRowBg : '';
      
      cellData[`A${row}`] = { 
        value: student.rollNo, 
        backgroundColor: bgColor,
        textAlign: template.gradeTable.columnAlignment.A
      };
      cellData[`B${row}`] = { 
        value: student.studentName, 
        backgroundColor: bgColor,
        textAlign: template.gradeTable.columnAlignment.B
      };
      cellData[`C${row}`] = { 
        value: String(student.assignment1), 
        backgroundColor: bgColor,
        textAlign: template.gradeTable.columnAlignment.C
      };
      cellData[`D${row}`] = { 
        value: String(student.assignment2), 
        backgroundColor: bgColor,
        textAlign: template.gradeTable.columnAlignment.D
      };
      cellData[`E${row}`] = { 
        value: String(student.midterm), 
        backgroundColor: bgColor,
        textAlign: template.gradeTable.columnAlignment.E
      };
      cellData[`F${row}`] = { 
        value: String(student.finalExam), 
        backgroundColor: bgColor,
        textAlign: template.gradeTable.columnAlignment.F
      };
      cellData[`G${row}`] = { 
        value: student.total, 
        backgroundColor: bgColor,
        textAlign: template.gradeTable.columnAlignment.G
      };
      cellData[`H${row}`] = { 
        value: student.percentage, 
        backgroundColor: bgColor,
        textAlign: template.gradeTable.columnAlignment.H
      };
      cellData[`I${row}`] = { 
        value: student.grade, 
        backgroundColor: bgColor,
        textAlign: template.gradeTable.columnAlignment.I
      };
      
      // Note: Conditional formatting for grades will be applied by the client
      // when formulas evaluate, based on the conditionalFormatting rules
    });
    
    // Add class average row (row 17)
    cellData['A17'] = {
      value: '',
      backgroundColor: template.classAverage.style.backgroundColor
    };
    cellData['B17'] = {
      value: template.classAverage.label,
      bold: template.classAverage.style.bold,
      fontSize: template.classAverage.style.fontSize,
      backgroundColor: template.classAverage.style.backgroundColor
    };
    // Fill cells C-G with background color
    ['C', 'D', 'E', 'F', 'G'].forEach(col => {
      cellData[`${col}17`] = {
        value: '',
        backgroundColor: template.classAverage.style.backgroundColor
      };
    });
    // Add average formula in H17
    cellData['H17'] = {
      value: template.classAverage.percentageFormula,
      bold: template.classAverage.style.bold,
      fontSize: template.classAverage.style.fontSize,
      backgroundColor: template.classAverage.style.backgroundColor,
      textAlign: 'right'
    };
    cellData['I17'] = {
      value: '',
      backgroundColor: template.classAverage.style.backgroundColor
    };
    
    return {
      cells: cellData,
      template: {
        id: template.id,
        name: template.name
      }
    };
  }

  // Handle custom layout for invoice
  if (template.customLayout && template.id === 'invoice') {
    // Company Info Section (Top-Left, Rows 1-5)
    cellData['A1'] = {
      value: template.companyInfo.companyName.value,
      bold: template.companyInfo.companyName.style.bold,
      fontSize: template.companyInfo.companyName.style.fontSize
    };
    cellData['A2'] = { value: template.companyInfo.address.value };
    cellData['A3'] = { value: template.companyInfo.city.value };
    cellData['A4'] = { value: template.companyInfo.phone.value };
    cellData['A5'] = { value: template.companyInfo.email.value };
    
    // Invoice Header Section (Top-Right, Rows 1-5)
    cellData['E1'] = {
      value: template.invoiceHeader.title.value,
      bold: template.invoiceHeader.title.style.bold,
      fontSize: template.invoiceHeader.title.style.fontSize,
      color: template.invoiceHeader.title.style.color,
      textAlign: 'right'
    };
    
    // Invoice Number
    cellData['D2'] = {
      value: template.invoiceHeader.invoiceNumber.label,
      bold: template.invoiceHeaderStyle.labelBold
    };
    cellData['E2'] = {
      value: template.invoiceHeader.invoiceNumber.value,
      textAlign: template.invoiceHeaderStyle.valueAlign
    };
    
    // Invoice Date
    cellData['D3'] = {
      value: template.invoiceHeader.invoiceDate.label,
      bold: template.invoiceHeaderStyle.labelBold
    };
    cellData['E3'] = {
      value: template.invoiceHeader.invoiceDate.value,
      textAlign: template.invoiceHeaderStyle.valueAlign
    };
    
    // Due Date
    cellData['D4'] = {
      value: template.invoiceHeader.dueDate.label,
      bold: template.invoiceHeaderStyle.labelBold
    };
    cellData['E4'] = {
      value: template.invoiceHeader.dueDate.value,
      textAlign: template.invoiceHeaderStyle.valueAlign
    };
    
    // Bill To Section (Rows 7-10)
    cellData['A7'] = {
      value: template.billTo.headerValue,
      bold: template.billTo.style.headerBold,
      fontSize: template.billTo.style.headerFontSize,
      backgroundColor: template.billTo.style.backgroundColor
    };
    cellData['A8'] = {
      value: template.billTo.customerName.value,
      backgroundColor: template.billTo.style.backgroundColor
    };
    cellData['A9'] = {
      value: template.billTo.address.value,
      backgroundColor: template.billTo.style.backgroundColor
    };
    cellData['A10'] = {
      value: template.billTo.city.value,
      backgroundColor: template.billTo.style.backgroundColor
    };
    
    // Line Items Table Headers (Row 12)
    template.lineItemsTable.headers.forEach((header, index) => {
      const col = template.lineItemsTable.columns[index];
      cellData[`${col}12`] = {
        value: header,
        bold: template.lineItemsTable.headerStyle.bold,
        backgroundColor: template.lineItemsTable.headerStyle.backgroundColor,
        color: template.lineItemsTable.headerStyle.color,
        textAlign: template.lineItemsTable.headerStyle.textAlign
      };
    });
    
    // Line Items Data (Rows 13-17)
    template.lineItemsTable.items.forEach((item, index) => {
      const row = template.lineItemsTable.dataStartRow + index;
      const bgColor = index % 2 === 1 ? template.lineItemsTable.style.alternateRowBg : '';
      
      cellData[`A${row}`] = {
        value: item.description,
        backgroundColor: bgColor,
        textAlign: template.lineItemsTable.columnAlignment.A
      };
      cellData[`B${row}`] = {
        value: String(item.quantity),
        backgroundColor: bgColor,
        textAlign: template.lineItemsTable.columnAlignment.B
      };
      cellData[`C${row}`] = {
        value: String(item.unitPrice.toFixed(2)),
        backgroundColor: bgColor,
        textAlign: template.lineItemsTable.columnAlignment.C
      };
      cellData[`D${row}`] = {
        value: String(item.taxPercent),
        backgroundColor: bgColor,
        textAlign: template.lineItemsTable.columnAlignment.D
      };
      cellData[`E${row}`] = {
        value: item.lineTotal,
        backgroundColor: bgColor,
        textAlign: template.lineItemsTable.columnAlignment.E
      };
    });
    
    // Totals Section (Rows 19-21)
    // Subtotal
    cellData['D19'] = {
      value: template.totalsSection.subtotal.label,
      bold: template.totalsSection.style.labelBold,
      backgroundColor: template.totalsSection.style.backgroundColor,
      textAlign: 'right'
    };
    cellData['E19'] = {
      value: template.totalsSection.subtotal.formula,
      backgroundColor: template.totalsSection.style.backgroundColor,
      textAlign: 'right'
    };
    
    // Tax
    cellData['D20'] = {
      value: template.totalsSection.tax.label,
      bold: template.totalsSection.style.labelBold,
      backgroundColor: template.totalsSection.style.backgroundColor,
      textAlign: 'right'
    };
    cellData['E20'] = {
      value: template.totalsSection.tax.formula,
      backgroundColor: template.totalsSection.style.backgroundColor,
      textAlign: 'right'
    };
    
    // Total Due
    cellData['D21'] = {
      value: template.totalsSection.total.label,
      bold: template.totalsSection.style.totalBold,
      fontSize: template.totalsSection.style.totalFontSize,
      color: template.totalsSection.style.totalColor,
      backgroundColor: template.totalsSection.style.backgroundColor,
      textAlign: 'right'
    };
    cellData['E21'] = {
      value: template.totalsSection.total.formula,
      bold: template.totalsSection.style.totalBold,
      fontSize: template.totalsSection.style.totalFontSize,
      color: template.totalsSection.style.totalColor,
      backgroundColor: template.totalsSection.style.backgroundColor,
      textAlign: 'right'
    };
    
    // Payment Terms (Row 23)
    cellData['A23'] = {
      value: template.paymentTerms.value,
      fontSize: template.paymentTerms.style.fontSize,
      color: template.paymentTerms.style.color
    };
    
    // Thank You Note (Row 24)
    cellData['A24'] = {
      value: template.thankYou.value,
      fontSize: template.thankYou.style.fontSize,
      bold: template.thankYou.style.bold,
      textAlign: template.thankYou.style.textAlign
    };
    
    return {
      cells: cellData,
      template: {
        id: template.id,
        name: template.name
      }
    };
  }

  // Handle custom layout for Sales Tracker Dashboard
  if (template.customLayout && template.id === 'sales-tracker') {
    // Main Title (Row 1 - merged A1:H1)
    cellData['A1'] = {
      value: template.title.value,
      fontSize: template.title.style.fontSize,
      bold: template.title.style.bold,
      textAlign: template.title.style.textAlign,
      backgroundColor: template.title.style.backgroundColor,
      color: template.title.style.color
    };
    
    // Summary Section Header (Row 3 - merged A3:H3)
    cellData['A3'] = {
      value: template.summaryHeader.value,
      fontSize: template.summaryHeader.style.fontSize,
      bold: template.summaryHeader.style.bold,
      textAlign: template.summaryHeader.style.textAlign,
      backgroundColor: template.summaryHeader.style.backgroundColor,
      color: template.summaryHeader.style.color
    };
    
    // Summary Metrics (Row 4)
    template.summaryMetrics.forEach(metric => {
      cellData[metric.cell] = {
        value: metric.label || metric.value,
        bold: metric.style.bold || false,
        backgroundColor: metric.style.backgroundColor || '',
        textAlign: metric.style.textAlign || 'left',
        fontSize: metric.style.fontSize || 11
      };
    });
    
    // Sales Transactions Title (Row 6)
    cellData['A6'] = {
      value: template.salesTable.title.value,
      fontSize: template.salesTable.title.style.fontSize,
      bold: template.salesTable.title.style.bold,
      textAlign: template.salesTable.title.style.textAlign,
      backgroundColor: template.salesTable.title.style.backgroundColor,
      color: template.salesTable.title.style.color
    };
    
    // Sales Table Headers (Row 8)
    template.salesTable.columns.forEach((col, index) => {
      const cellKey = `${col}8`;
      cellData[cellKey] = {
        value: template.salesTable.headers[index],
        bold: template.salesTable.headerStyle.bold,
        backgroundColor: template.salesTable.headerStyle.backgroundColor,
        color: template.salesTable.headerStyle.color,
        textAlign: template.salesTable.headerStyle.textAlign,
        fontSize: template.salesTable.headerStyle.fontSize
      };
    });
    
    // Sales Table Data (Rows 9-23)
    template.salesTable.sampleData.forEach((sale, index) => {
      const row = template.salesTable.dataStartRow + index;
      
      // Date
      cellData[`A${row}`] = { value: sale.date, backgroundColor: '' };
      // Order ID
      cellData[`B${row}`] = { value: sale.orderId, backgroundColor: '' };
      // Customer
      cellData[`C${row}`] = { value: sale.customer, backgroundColor: '' };
      // Region
      cellData[`D${row}`] = { value: sale.region, backgroundColor: '' };
      // Product
      cellData[`E${row}`] = { value: sale.product, backgroundColor: '' };
      // Quantity (right-aligned)
      cellData[`F${row}`] = { 
        value: String(sale.quantity), 
        backgroundColor: '',
        textAlign: 'right'
      };
      // Unit Price (right-aligned)
      cellData[`G${row}`] = { 
        value: String(sale.unitPrice), 
        backgroundColor: '',
        textAlign: 'right'
      };
      // Total (formula, right-aligned)
      cellData[`H${row}`] = { 
        value: sale.total,
        backgroundColor: '',
        textAlign: 'right'
      };
    });
    
    // Regional Analysis Title (Row 26)
    cellData['A26'] = {
      value: template.regionalAnalysis.title.value,
      fontSize: template.regionalAnalysis.title.style.fontSize,
      bold: template.regionalAnalysis.title.style.bold,
      textAlign: template.regionalAnalysis.title.style.textAlign,
      backgroundColor: template.regionalAnalysis.title.style.backgroundColor,
      color: template.regionalAnalysis.title.style.color
    };
    
    // Regional Analysis Headers (Row 28)
    template.regionalAnalysis.columns.forEach((col, index) => {
      const cellKey = `${col}28`;
      cellData[cellKey] = {
        value: template.regionalAnalysis.headers[index],
        bold: template.regionalAnalysis.headerStyle.bold,
        backgroundColor: template.regionalAnalysis.headerStyle.backgroundColor,
        color: template.regionalAnalysis.headerStyle.color,
        textAlign: template.regionalAnalysis.headerStyle.textAlign
      };
    });
    
    // Regional Analysis Data (Rows 29-32)
    template.regionalAnalysis.regions.forEach((regionData, index) => {
      const row = template.regionalAnalysis.dataStartRow + index;
      
      // Region name
      cellData[`A${row}`] = { value: regionData.region, backgroundColor: '' };
      // Total Sales (SUMIF formula, right-aligned)
      cellData[`B${row}`] = { 
        value: regionData.totalSales,
        backgroundColor: '',
        textAlign: 'right'
      };
      // Orders count (COUNTIF formula, right-aligned)
      cellData[`C${row}`] = { 
        value: regionData.orders,
        backgroundColor: '',
        textAlign: 'right'
      };
    });
    
    return {
      cells: cellData,
      template: {
        id: template.id,
        name: template.name
      }
    };
  }

  // Add company info section for old invoice template (fallback)
  if (template.companyInfo && template.companyInfo.rows) {
    template.companyInfo.rows.forEach((rowData, index) => {
      const row = index + 1;
      Object.entries(rowData).forEach(([col, value]) => {
        if (col !== 'style') {
          const cellId = `${col}${row}`;
          cellData[cellId] = {
            value: String(value),
            style: rowData.style === 'title' ? { fontSize: 24, bold: true } :
                   rowData.style === 'bold' ? { bold: true } : {}
          };
        }
      });
    });
    currentRow = template.companyInfo.rows.length + 1;
  }

  // Determine header row
  const headerRow = template.headerStartRow || currentRow;

  // Add headers
  if (template.headers) {
    template.headers.forEach((header, index) => {
      const col = template.columns[index];
      const cellId = `${col}${headerRow}`;
      cellData[cellId] = {
        value: String(header),
        bold: true,
        backgroundColor: template.styles.headerBg,
        color: template.styles.headerColor,
        fontSize: 12
      };
    });
  }

  // Add sample data
  if (template.sampleData) {
    let dataStartRow = headerRow + 1;
    template.sampleData.forEach((row, rowIndex) => {
      const currentDataRow = dataStartRow + rowIndex;
      row.forEach((value, colIndex) => {
        const col = template.columns[colIndex];
        const cellId = `${col}${currentDataRow}`;
        
        cellData[cellId] = {
          value: String(value),
          backgroundColor: template.styles.alternateRowBg && rowIndex % 2 === 1 ? 
            template.styles.alternateRowBg : ''
        };

        // Apply conditional formatting
        if (template.conditionalFormatting) {
          template.conditionalFormatting.forEach(rule => {
            if (rule.column === col) {
              const shouldApply = checkConditionalRule(String(value), rule);
              if (shouldApply) {
                cellData[cellId] = {
                  ...cellData[cellId],
                  backgroundColor: rule.style.backgroundColor || cellData[cellId].backgroundColor,
                  color: rule.style.color || cellData[cellId].color
                };
              }
            }
          });
        }
      });
    });
  }

  // Add footer formulas for invoice
  if (template.footer) {
    const { subtotalRow, taxRow, totalRow, formulas } = template.footer;
    
    cellData[`C${subtotalRow}`] = { value: 'Subtotal:', bold: true };
    cellData[`D${subtotalRow}`] = { value: formulas.subtotal };
    
    cellData[`C${taxRow}`] = { value: 'Tax (10%):', bold: true };
    cellData[`D${taxRow}`] = { value: formulas.tax };
    
    cellData[`C${totalRow}`] = { value: 'TOTAL:', bold: true, fontSize: 14 };
    cellData[`D${totalRow}`] = { value: formulas.total, bold: true, fontSize: 14 };
  }

  return {
    cells: cellData,
    template: {
      id: template.id,
      name: template.name,
      headers: template.headers,
      columns: template.columns,
      formulas: template.formulas,
      conditionalFormatting: template.conditionalFormatting,
      chart: template.chart
    }
  };
}

/**
 * Check if conditional formatting rule applies
 */
function checkConditionalRule(value, rule) {
  switch (rule.condition) {
    case 'equals':
      return value === rule.value;
    case 'lessThan':
      return parseFloat(value) < rule.value;
    case 'greaterThan':
      return parseFloat(value) > rule.value;
    case 'between':
      const numValue = parseFloat(value);
      return numValue >= rule.value[0] && numValue <= rule.value[1];
    default:
      return false;
  }
}
