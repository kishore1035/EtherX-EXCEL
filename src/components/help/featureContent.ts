import { Palette, CheckSquare, Link, Users } from "lucide-react";

export interface FeatureStep {
  title: string;
  description: string;
  icon: any;
  benefits?: string[];
  howTo?: string[];
}

// Conditional Formatting Feature Content
export const conditionalFormattingSteps: FeatureStep[] = [
  {
    title: "What is Conditional Formatting?",
    description: "Automatically format cells based on their values to highlight important data and identify trends at a glance.",
    icon: Palette,
    benefits: [
      "Quickly identify high and low values",
      "Spot trends and patterns in data",
      "Create visual data analysis",
      "Make spreadsheets easier to read"
    ],
    howTo: [
      "Select the cells you want to format",
      "Click 'Conditional Formatting' on the Home tab",
      "Choose a formatting rule (Color Scales, Data Bars, Icon Sets)",
      "Customize colors and thresholds",
      "Click Apply to see your formatted cells"
    ]
  },
  {
    title: "Color Scales",
    description: "Apply gradient colors across your data range to visualize value distribution.",
    icon: Palette,
    benefits: [
      "Instantly see value distribution",
      "Identify outliers and patterns",
      "Compare data visually"
    ],
    howTo: [
      "Select your data range",
      "Choose 'Color Scales' from Conditional Formatting",
      "Select a 2-color or 3-color scale",
      "Adjust color thresholds if needed"
    ]
  },
  {
    title: "Data Bars",
    description: "Add horizontal bars within cells to show relative values like a mini bar chart.",
    icon: Palette,
    benefits: [
      "Compare values at a glance",
      "Create mini charts in cells",
      "Track progress visually"
    ],
    howTo: [
      "Select cells with numeric values",
      "Choose 'Data Bars' from Conditional Formatting",
      "Pick a bar color",
      "Bars will appear automatically based on values"
    ]
  },
  {
    title: "Icon Sets",
    description: "Display icons (arrows, flags, ratings) based on cell values to categorize data.",
    icon: Palette,
    benefits: [
      "Categorize data with symbols",
      "Create visual indicators",
      "Track status or ratings"
    ],
    howTo: [
      "Select your data range",
      "Choose 'Icon Sets' from Conditional Formatting",
      "Pick an icon style (arrows, flags, ratings)",
      "Icons will update automatically with your data"
    ]
  }
];

// Data Validation Feature Content
export const dataValidationSteps: FeatureStep[] = [
  {
    title: "What is Data Validation?",
    description: "Control what data can be entered into cells to prevent errors and maintain data consistency.",
    icon: CheckSquare,
    benefits: [
      "Prevent data entry errors",
      "Create dropdown lists for easy selection",
      "Ensure data consistency",
      "Set custom validation rules"
    ],
    howTo: [
      "Select the cells where you want validation",
      "Click 'Data Validation' on the Data tab",
      "Choose a validation type (List, Number, Date, Text)",
      "Set your criteria and optional error messages",
      "Click Apply to activate validation"
    ]
  },
  {
    title: "Dropdown Lists",
    description: "Create dropdown menus in cells for standardized data entry from predefined options.",
    icon: CheckSquare,
    benefits: [
      "Standardize data entry",
      "Reduce typing errors",
      "Speed up data input",
      "Maintain consistency"
    ],
    howTo: [
      "Select cells for dropdown",
      "Choose 'List' validation type",
      "Enter options separated by commas or reference a range",
      "Users can now select from dropdown"
    ]
  },
  {
    title: "Number Ranges",
    description: "Restrict cell input to numbers within a specific range or meeting certain criteria.",
    icon: CheckSquare,
    benefits: [
      "Prevent invalid numbers",
      "Set minimum/maximum values",
      "Ensure data accuracy"
    ],
    howTo: [
      "Select cells for number validation",
      "Choose 'Number' validation type",
      "Set criteria (between, greater than, etc.)",
      "Define minimum and maximum values"
    ]
  },
  {
    title: "Custom Validation Rules",
    description: "Create advanced validation rules using formulas for complex data requirements.",
    icon: CheckSquare,
    benefits: [
      "Implement complex business rules",
      "Cross-reference other cells",
      "Create custom error messages"
    ],
    howTo: [
      "Select cells for custom validation",
      "Choose 'Custom' validation type",
      "Enter a formula that returns TRUE/FALSE",
      "Add helpful error messages for users"
    ]
  }
];

// Links Feature Content
export const linksSteps: FeatureStep[] = [
  {
    title: "What are Cell Links?",
    description: "Create clickable hyperlinks in cells to navigate to websites, email addresses, or other sheets.",
    icon: Link,
    benefits: [
      "Navigate to external resources quickly",
      "Link to related documents",
      "Create interactive spreadsheets",
      "Connect data across sheets"
    ],
    howTo: [
      "Select the cell where you want the link",
      "Click 'Insert Link' on the Insert tab",
      "Choose link type (URL, Email, or Sheet)",
      "Enter the destination and display text",
      "Click OK to create the link"
    ]
  },
  {
    title: "Web Links",
    description: "Add clickable URLs to navigate to websites or web resources directly from your spreadsheet.",
    icon: Link,
    benefits: [
      "Quick access to reference materials",
      "Link to online resources",
      "Create clickable documentation"
    ],
    howTo: [
      "Select a cell",
      "Click 'Insert Link'",
      "Choose 'Web URL'",
      "Paste or type the web address",
      "Add custom display text if desired"
    ]
  },
  {
    title: "Email Links",
    description: "Create mailto links that open the user's email client with a pre-filled recipient address.",
    icon: Link,
    benefits: [
      "Quick email access",
      "Pre-fill email addresses",
      "Streamline communication"
    ],
    howTo: [
      "Select a cell",
      "Click 'Insert Link'",
      "Choose 'Email Address'",
      "Enter the email address",
      "Optionally add subject line"
    ]
  },
  {
    title: "Sheet References",
    description: "Link to other sheets within your spreadsheet for easy navigation between related data.",
    icon: Link,
    benefits: [
      "Navigate between sheets quickly",
      "Create table of contents",
      "Connect related information"
    ],
    howTo: [
      "Select a cell",
      "Click 'Insert Link'",
      "Choose 'Sheet'",
      "Select the target sheet from dropdown",
      "Link will jump to that sheet when clicked"
    ]
  }
];

// Collaboration Feature Content
export const collaborationSteps: FeatureStep[] = [
  {
    title: "What is Real-Time Collaboration?",
    description: "Work together with your team on the same spreadsheet simultaneously with live updates.",
    icon: Users,
    benefits: [
      "Work simultaneously with team members",
      "See changes in real-time",
      "Avoid version conflicts",
      "Track who's editing what"
    ],
    howTo: [
      "Click 'Share' on the Collaboration tab",
      "Enter email addresses of collaborators",
      "Set permissions (View or Edit)",
      "Click 'Send Invitations'",
      "Collaborators can now access the spreadsheet"
    ]
  },
  {
    title: "Live Cursors",
    description: "See where your team members are working with colored cursor indicators showing their selections.",
    icon: Users,
    benefits: [
      "Know who's editing what",
      "Avoid editing conflicts",
      "Coordinate work efficiently",
      "See collaborator names and positions"
    ],
    howTo: [
      "When collaborators join, their cursors appear automatically",
      "Each collaborator gets a unique color",
      "Hover over a cursor to see who it belongs to",
      "Watch selections update in real-time"
    ]
  },
  {
    title: "Permissions & Sharing",
    description: "Control who can view or edit your spreadsheet with granular permission settings.",
    icon: Users,
    benefits: [
      "Control access levels",
      "Protect sensitive data",
      "Share securely",
      "Manage team permissions"
    ],
    howTo: [
      "Click 'Manage Permissions'",
      "Add users by email",
      "Choose 'View Only' or 'Can Edit'",
      "Revoke access anytime",
      "Track who has access in the permissions panel"
    ]
  },
  {
    title: "Comments & Chat",
    description: "Communicate with your team using cell comments and integrated chat for context-rich discussions.",
    icon: Users,
    benefits: [
      "Discuss data in context",
      "Ask questions about specific cells",
      "Leave notes for team members",
      "Track conversation history"
    ],
    howTo: [
      "Right-click a cell and select 'Add Comment'",
      "Type your comment or question",
      "Team members will see a comment indicator",
      "Reply to comments to continue the discussion",
      "Use the chat panel for general team communication"
    ]
  }
];
