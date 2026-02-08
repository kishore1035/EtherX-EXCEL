// Help System Service
// Provides help content, search functionality, and user feedback collection

export interface HelpArticle {
  id: string;
  title: string;
  category: string;
  content: string;
  keywords: string[];
  lastUpdated: string;
  version: string;
}

export interface BugReport {
  id: string;
  userId: string;
  spreadsheetId: string;
  description: string;
  browser: string;
  os: string;
  timestamp: string;
  screenshot?: string;
  logs?: string;
}

export interface FeatureRequest {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: string;
  timestamp: string;
  votes: number;
}

export interface HelpSearchResult {
  article: HelpArticle;
  score: number;
  matchedKeywords: string[];
}

const HELP_CONTENT_KEY = 'help_content';
const BUG_REPORTS_KEY = 'bug_reports';
const FEATURE_REQUESTS_KEY = 'feature_requests';
const HELP_ANALYTICS_KEY = 'help_analytics';

// Help Content Database
const helpArticles: HelpArticle[] = [
  {
    id: 'quick-tour',
    title: 'Quick Tour',
    category: 'Getting Started',
    content: `
# Welcome to EtherX Excel!

## Getting Started
EtherX Excel is a powerful, collaborative spreadsheet application with advanced features.

### Key Features:
- **Real-time Collaboration**: Work together with your team in real-time
- **Advanced Formulas**: Support for 200+ Excel-compatible formulas
- **Charts & Visualizations**: Create stunning charts and graphs
- **IPFS Integration**: Decentralized storage for your spreadsheets
- **Import/Export**: Compatible with Excel, CSV, and more

### Quick Start:
1. Click on any cell to start entering data
2. Use the ribbon tabs (Home, Insert, View) to access features
3. Press Enter to move to the next row
4. Use Ctrl+Z/Ctrl+Y for undo/redo
5. Save your work with Ctrl+S

### Need Help?
Use the search box in the Help tab to find specific topics.
    `,
    keywords: ['getting started', 'introduction', 'tour', 'welcome', 'basics', 'overview'],
    lastUpdated: new Date().toISOString(),
    version: '1.0.0'
  },
  {
    id: 'keyboard-shortcuts',
    title: 'Keyboard Shortcuts',
    category: 'Getting Started',
    content: `
# Keyboard Shortcuts

## Navigation
- **Arrow Keys**: Move between cells
- **Tab**: Move to next cell (right)
- **Shift+Tab**: Move to previous cell (left)
- **Enter**: Move down
- **Shift+Enter**: Move up
- **Ctrl+Home**: Go to cell A1
- **Ctrl+End**: Go to last used cell

## Editing
- **F2**: Edit active cell
- **Delete**: Clear cell content
- **Ctrl+X**: Cut
- **Ctrl+C**: Copy
- **Ctrl+V**: Paste
- **Ctrl+Z**: Undo
- **Ctrl+Y**: Redo

## Formatting
- **Ctrl+B**: Bold
- **Ctrl+I**: Italic
- **Ctrl+U**: Underline

## Selection
- **Ctrl+A**: Select all
- **Shift+Arrow**: Extend selection
- **Ctrl+Space**: Select entire column
- **Shift+Space**: Select entire row

## Other
- **Ctrl+S**: Save
- **Ctrl+F**: Find
- **Ctrl+H**: Find and replace
    `,
    keywords: ['shortcuts', 'keyboard', 'hotkeys', 'quick keys', 'ctrl', 'navigation'],
    lastUpdated: new Date().toISOString(),
    version: '1.0.0'
  },
  {
    id: 'formulas',
    title: 'Using Formulas',
    category: 'Usage & Features',
    content: `
# Formula Guide

## Basic Syntax
All formulas start with an equals sign (=)

Example: =SUM(A1:A10)

## Common Functions

### Math
- **SUM(range)**: Add numbers
- **AVERAGE(range)**: Calculate average
- **MAX(range)**: Find maximum value
- **MIN(range)**: Find minimum value
- **ROUND(number, decimals)**: Round numbers

### Logical
- **IF(condition, true_value, false_value)**: Conditional logic
- **AND(condition1, condition2)**: All conditions must be true
- **OR(condition1, condition2)**: At least one condition must be true

### Text
- **CONCATENATE(text1, text2)**: Join text
- **LEFT(text, num_chars)**: Extract from left
- **RIGHT(text, num_chars)**: Extract from right
- **LEN(text)**: Get text length

### Lookup
- **VLOOKUP(lookup_value, table, col_index, [range_lookup])**: Vertical lookup
- **HLOOKUP**: Horizontal lookup
- **INDEX/MATCH**: Advanced lookups

## Tips
- Use cell references instead of hardcoded values
- Press F4 to toggle absolute/relative references ($A$1)
- Use named ranges for clarity
- Check for #DIV/0!, #VALUE!, #REF! errors
    `,
    keywords: ['formulas', 'functions', 'sum', 'average', 'calculations', 'vlookup', 'if'],
    lastUpdated: new Date().toISOString(),
    version: '1.0.0'
  },
  {
    id: 'charts',
    title: 'Creating Charts',
    category: 'Usage & Features',
    content: `
# Chart Guide

## Creating a Chart
1. Select your data range
2. Go to Insert tab
3. Click "Insert Chart"
4. Choose chart type
5. Customize as needed

## Chart Types
- **Column/Bar**: Compare values across categories
- **Line**: Show trends over time
- **Pie**: Show parts of a whole
- **Area**: Show cumulative totals
- **Scatter**: Show relationships between variables

## Customization
- Edit title and labels
- Change colors and styles
- Add data labels
- Modify axis ranges
- Add trendlines

## Best Practices
- Choose the right chart type for your data
- Keep it simple and clear
- Use colors effectively
- Label axes clearly
- Include a legend when needed
    `,
    keywords: ['charts', 'graphs', 'visualization', 'pie chart', 'bar chart', 'line graph'],
    lastUpdated: new Date().toISOString(),
    version: '1.0.0'
  },
  {
    id: 'sharing',
    title: 'Sharing & Permissions',
    category: 'Collaboration',
    content: `
# Sharing Your Spreadsheet

## Generating a Link
1. Click the Collaboration icon in the header
2. Choose permission level:
   - **View Only**: Recipients can view but not edit
   - **View & Edit**: Recipients can make changes
3. Click "Generate Link"
4. Copy and share the link

## Permission Levels
- **Owner**: Full control (you)
- **Editor**: Can edit content
- **Viewer**: Can only view

## Best Practices
- Use View Only for sensitive data
- Share Edit links only with trusted collaborators
- Regenerate links if needed
- Monitor active collaborators

## Revoking Access
Currently, links don't expire. To revoke access:
- Generate a new link for authorized users
- Don't share the old link anymore
    `,
    keywords: ['sharing', 'permissions', 'collaborate', 'link', 'access', 'view only', 'edit'],
    lastUpdated: new Date().toISOString(),
    version: '1.0.0'
  },
  {
    id: 'live-collab',
    title: 'Live Collaboration',
    category: 'Collaboration',
    content: `
# Real-Time Collaboration

## How It Works
When multiple users open the same spreadsheet:
- You'll see their cursor positions
- Changes appear instantly
- See who's viewing/editing in real-time

## Collaboration Features
- **Live Cursors**: See where others are working
- **Auto-save**: Changes saved automatically
- **User Presence**: See active collaborators
- **Conflict Resolution**: Last edit wins

## Tips for Effective Collaboration
- Communicate with your team
- Work in different areas to avoid conflicts
- Use comments for discussions
- Check the collaboration panel for active users

## Performance
- Works best with stable internet
- May slow down with 10+ concurrent users
- Large spreadsheets may have slight delays
    `,
    keywords: ['collaboration', 'real-time', 'live', 'multiple users', 'cursors', 'presence'],
    lastUpdated: new Date().toISOString(),
    version: '1.0.0'
  },
  {
    id: 'import-export',
    title: 'Import & Export',
    category: 'Usage & Features',
    content: `
# Import & Export

## Importing Files
1. Click "Import" in Home tab
2. Select your file (.xlsx, .csv)
3. Choose import options
4. Click "Import"

### Supported Formats
- Excel (.xlsx, .xls)
- CSV (.csv)
- TSV (.tsv)

## Exporting Files
1. Click "Export" dropdown in Home tab
2. Choose format:
   - **Excel**: Full formatting preserved
   - **PDF**: Print-ready document
   - **CSV**: Data only, no formatting

### Export Tips
- CSV exports data only (no formulas, formatting)
- PDF creates a static snapshot
- Excel format preserves everything

## IPFS Integration
Your spreadsheets are automatically saved to IPFS for decentralized storage.
- Look for the IPFS status indicator in the header
- Click it to see your IPFS hash and gateway links
    `,
    keywords: ['import', 'export', 'csv', 'excel', 'xlsx', 'pdf', 'file', 'download', 'upload'],
    lastUpdated: new Date().toISOString(),
    version: '1.0.0'
  },
  {
    id: 'version',
    title: 'Version Information',
    category: 'About',
    content: `
# EtherX Excel

**Version**: 1.0.0
**Release Date**: February 2026

## What's New in 1.0.0
- Full Excel compatibility
- Real-time collaboration
- IPFS integration
- Advanced formulas (200+)
- Chart builder
- Template library
- Dark mode support
- Mobile-friendly design

## Technology Stack
- React 18.3.1
- TypeScript
- Vite 6.3.5
- Tailwind CSS
- IPFS/Pinata
- WebSocket collaboration

## Browser Compatibility
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## License
Proprietary software. All rights reserved.
    `,
    keywords: ['version', 'about', 'info', 'release', 'changelog', 'updates'],
    lastUpdated: new Date().toISOString(),
    version: '1.0.0'
  }
];

/**
 * Get all help articles
 */
export function getAllHelpArticles(): HelpArticle[] {
  return helpArticles;
}

/**
 * Get help article by ID
 */
export function getHelpArticle(id: string): HelpArticle | null {
  return helpArticles.find(article => article.id === id) || null;
}

/**
 * Search help articles
 */
export function searchHelpArticles(query: string): HelpSearchResult[] {
  const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 2);
  
  if (searchTerms.length === 0) {
    return [];
  }

  const results: HelpSearchResult[] = [];

  for (const article of helpArticles) {
    let score = 0;
    const matchedKeywords: string[] = [];

    // Check title (highest weight)
    for (const term of searchTerms) {
      if (article.title.toLowerCase().includes(term)) {
        score += 10;
        matchedKeywords.push(term);
      }
    }

    // Check keywords (high weight)
    for (const keyword of article.keywords) {
      for (const term of searchTerms) {
        if (keyword.includes(term)) {
          score += 5;
          if (!matchedKeywords.includes(term)) {
            matchedKeywords.push(term);
          }
        }
      }
    }

    // Check content (lower weight)
    for (const term of searchTerms) {
      if (article.content.toLowerCase().includes(term)) {
        score += 1;
        if (!matchedKeywords.includes(term)) {
          matchedKeywords.push(term);
        }
      }
    }

    if (score > 0) {
      results.push({ article, score, matchedKeywords });
    }
  }

  // Sort by score descending
  results.sort((a, b) => b.score - a.score);

  // Track search analytics
  trackHelpSearch(query, results.length);

  return results;
}

/**
 * Submit bug report
 */
export function submitBugReport(
  userId: string,
  spreadsheetId: string,
  description: string,
  screenshot?: string,
  logs?: string
): BugReport {
  const report: BugReport = {
    id: `bug_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    spreadsheetId,
    description,
    browser: navigator.userAgent,
    os: navigator.platform,
    timestamp: new Date().toISOString(),
    screenshot,
    logs
  };

  // Save to localStorage (in production, send to backend)
  const reports = getBugReports();
  reports.push(report);
  localStorage.setItem(BUG_REPORTS_KEY, JSON.stringify(reports));

  // Track analytics
  trackHelpAction('bug_report');

  return report;
}

/**
 * Submit feature request
 */
export function submitFeatureRequest(
  userId: string,
  title: string,
  description: string,
  category: string
): FeatureRequest {
  const request: FeatureRequest = {
    id: `feature_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    title,
    description,
    category,
    timestamp: new Date().toISOString(),
    votes: 1 // User's own vote
  };

  // Save to localStorage (in production, send to backend)
  const requests = getFeatureRequests();
  requests.push(request);
  localStorage.setItem(FEATURE_REQUESTS_KEY, JSON.stringify(requests));

  // Track analytics
  trackHelpAction('feature_request');

  return request;
}

/**
 * Get all bug reports
 */
export function getBugReports(): BugReport[] {
  const data = localStorage.getItem(BUG_REPORTS_KEY);
  return data ? JSON.parse(data) : [];
}

/**
 * Get all feature requests
 */
export function getFeatureRequests(): FeatureRequest[] {
  const data = localStorage.getItem(FEATURE_REQUESTS_KEY);
  return data ? JSON.parse(data) : [];
}

/**
 * Track help search for analytics
 */
function trackHelpSearch(query: string, resultsCount: number) {
  const analytics = getHelpAnalytics();
  
  if (!analytics.searches) {
    analytics.searches = [];
  }

  analytics.searches.push({
    query,
    resultsCount,
    timestamp: new Date().toISOString()
  });

  // Keep only last 1000 searches
  if (analytics.searches.length > 1000) {
    analytics.searches = analytics.searches.slice(-1000);
  }

  localStorage.setItem(HELP_ANALYTICS_KEY, JSON.stringify(analytics));
}

/**
 * Track help action for analytics
 */
export function trackHelpAction(action: string, metadata?: any) {
  const analytics = getHelpAnalytics();
  
  if (!analytics.actions) {
    analytics.actions = [];
  }

  analytics.actions.push({
    action,
    metadata,
    timestamp: new Date().toISOString()
  });

  // Keep only last 1000 actions
  if (analytics.actions.length > 1000) {
    analytics.actions = analytics.actions.slice(-1000);
  }

  localStorage.setItem(HELP_ANALYTICS_KEY, JSON.stringify(analytics));
}

/**
 * Get help analytics
 */
function getHelpAnalytics() {
  const data = localStorage.getItem(HELP_ANALYTICS_KEY);
  return data ? JSON.parse(data) : { searches: [], actions: [] };
}

/**
 * Get help analytics summary
 */
export function getHelpAnalyticsSummary() {
  const analytics = getHelpAnalytics();
  
  return {
    totalSearches: analytics.searches?.length || 0,
    totalActions: analytics.actions?.length || 0,
    topSearches: getTopSearches(analytics.searches || []),
    topActions: getTopActions(analytics.actions || [])
  };
}

function getTopSearches(searches: any[]) {
  const counts: Record<string, number> = {};
  
  for (const search of searches) {
    const query = search.query.toLowerCase();
    counts[query] = (counts[query] || 0) + 1;
  }

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([query, count]) => ({ query, count }));
}

function getTopActions(actions: any[]) {
  const counts: Record<string, number> = {};
  
  for (const action of actions) {
    counts[action.action] = (counts[action.action] || 0) + 1;
  }

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([action, count]) => ({ action, count }));
}
