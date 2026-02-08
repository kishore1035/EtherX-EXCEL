import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./ui/card";
import { getAllTemplates, generateTemplate, type Template } from "../services/templateService";

interface TemplatePickerDialogProps {
  open: boolean;
  onClose: () => void;
  onSelectTemplate: (templateData: any) => void;
  isDarkMode?: boolean;
}

const CATEGORY_COLORS: Record<string, string> = {
  Business: "bg-green-500",
  HR: "bg-blue-500",
  Finance: "bg-yellow-500",
  "Project Management": "bg-purple-500",
  Sales: "bg-red-500",
  Operations: "bg-yellow-500",
  Education: "bg-indigo-500",
};

// Fallback templates if backend is unavailable
const FALLBACK_TEMPLATES: Template[] = [
  {
    id: "business-report",
    name: "Business Report Template",
    description: "Professional business performance report with key metrics and analysis",
    category: "Business",
    icon: "TrendingUp"
  },
  {
    id: "attendance",
    name: "Attendance Template",
    description: "Track employee attendance with conditional formatting",
    category: "HR",
    icon: "Users"
  },
  {
    id: "budget-planner",
    name: "Monthly Budget Template",
    description: "Structured monthly budget planner with income, expenses, and savings tracking",
    category: "Finance",
    icon: "DollarSign"
  },
  {
    id: "invoice",
    name: "Invoice Template",
    description: "Professional invoice with automatic calculations",
    category: "Business",
    icon: "FileText"
  },
  {
    id: "project-tracker",
    name: "Project Tracker Template",
    description: "Track tasks, deadlines, and project status",
    category: "Project Management",
    icon: "CheckSquare"
  },
  {
    id: "sales-tracker",
    name: "Sales Tracker Template",
    description: "Track product sales with revenue calculations and regional analysis",
    category: "Sales",
    icon: "ShoppingCart"
  },
  {
    id: "inventory-management",
    name: "Inventory Management Template",
    description: "Track stock levels and inventory balance",
    category: "Operations",
    icon: "Package"
  },
  {
    id: "timesheet",
    name: "Employee Timesheet Template",
    description: "Track employee hours worked with automatic total calculations",
    category: "HR",
    icon: "Clock"
  },
  {
    id: "school-gradebook",
    name: "School Gradebook Template",
    description: "Track student grades with automatic grade calculation",
    category: "Education",
    icon: "BookOpen"
  },
];

export function TemplatePickerDialog({ open, onClose, onSelectTemplate, isDarkMode = true }: TemplatePickerDialogProps) {
  if (!open) return null;

  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  useEffect(() => {
    if (open) {
      loadTemplates();
    }
  }, [open]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const fetchedTemplates = await getAllTemplates();
      setTemplates(fetchedTemplates);
    } catch (error) {
      console.error('Failed to load templates from backend:', error);
      // Fallback to local templates if backend is unavailable
      console.info('Using fallback templates...');
      setTemplates(FALLBACK_TEMPLATES);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTemplate = async (templateId: string) => {
    try {
      setGenerating(true);
      const templateData = await generateTemplate(templateId);
      onSelectTemplate(templateData);
      onClose();
    } catch (error) {
      console.error('Failed to generate template:', error);
      alert('Failed to load template. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const categories = Array.from(new Set(templates.map(t => t.category)));
  const filteredTemplates = selectedCategory 
    ? templates.filter(t => t.category === selectedCategory)
    : templates;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        background: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(8px)',
      }}
      onClick={onClose}
    >
      <div
        data-template-dialog
        className="relative w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl"
        style={{
          background: '#000000',
          border: '3px solid',
          borderImage: 'linear-gradient(135deg, #FFD700 0%, #FFFACD 100%) 1',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="sticky top-0 z-10 px-6 py-4 flex items-center justify-between"
          style={{
            background: 'linear-gradient(135deg, #000000 0%, #000000 100%)',
            borderBottom: '2px solid',
            borderColor: '#FFD700',
          }}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ background: 'linear-gradient(135deg, rgba(255, 207, 64, 0.2) 0%, rgba(255, 207, 64, 0.1) 100%)', border: '2px solid rgba(255, 207, 64, 0.3)' }}>
              <img src="/icons/3d/sparkles.svg" alt="Templates" style={{ width: '24px', height: '24px' }} />
            </div>
            <div>
              <h2 className="text-2xl font-bold" style={{ color: '#FFCF40' }}>
                Choose a Template
              </h2>
              <p className="text-sm" style={{ color: '#FFFFFF' }}>
                Select a professional template to get started quickly
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-all duration-200"
            style={{ background: 'rgba(255, 207, 64, 0.2)', border: '2px solid rgba(255, 207, 64, 0.3)', color: '#FFCF40' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 207, 64, 0.3)';
              e.currentTarget.style.boxShadow = '0 0 20px rgba(255, 207, 64, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 207, 64, 0.2)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <img src="/icons/3d/x.svg" alt="Close" style={{ width: '20px', height: '20px' }} />
          </button>
        </div>

        {/* Info Box */}
        <div
          className="mx-6 mt-4 p-4 rounded-lg"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 215, 0, 0.05) 100%)',
            border: '1px solid',
            borderColor: 'rgba(255, 215, 0, 0.3)',
          }}
        >
          <p className="text-sm" style={{ color: '#FFFFFF' }}>
            <strong style={{ color: '#FFCF40' }}>Browse templates:</strong> Pick a template by category or name. Click "Use Template" to instantly create a new spreadsheet with pre-built formatting, formulas, and charts.
          </p>
        </div>

        {/* Category Filter */}
        {/* Removed All Templates button and category filter area as requested */}

        {/* Templates List */}
        <div 
          className="px-6 pb-6 overflow-y-auto" 
          style={{ 
            maxHeight: 'calc(80vh - 220px)',
            background: '#000000'
          }}
        >
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="text-center py-12">
              <img src="/icons/3d/sparkles.svg" alt="No templates" style={{ width: '64px', height: '64px', margin: '0 auto 16px' }} />
              <p className="text-lg font-medium" style={{ color: '#666666' }}>
                No templates found
              </p>
              <p className="text-sm mt-2" style={{ color: '#999999' }}>
                Try a different category or check your connection
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map((template) => {
                return (
                  <div
                    key={template.id}
                    className="rounded-lg p-4 transition-all duration-200 border-2"
                    style={{
                      background: '#000000',
                      border: '2px solid rgba(255, 207, 64, 0.3)',
                      boxShadow: '0 2px 8px rgba(255, 207, 64, 0.1)',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = '0 0 20px rgba(255, 207, 64, 0.6), 0 0 40px rgba(255, 207, 64, 0.4)';
                      e.currentTarget.style.borderColor = 'rgba(255, 207, 64, 0.6)';
                      e.currentTarget.style.transform = 'translateY(-5px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(255, 207, 64, 0.1)';
                      e.currentTarget.style.borderColor = 'rgba(255, 207, 64, 0.3)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(255, 207, 64, 0.2) 0%, rgba(255, 207, 64, 0.1) 100%)', border: '2px solid rgba(255, 207, 64, 0.3)' }}>
                        <img src="/icons/3d/file-spreadsheet.svg" alt={template.name} style={{ width: '24px', height: '24px' }} />
                      </div>
                    </div>
                        {/* Removed category display as requested */}
                    <h3 className="font-bold text-lg" style={{ color: '#FFCF40' }}>{template.name}</h3>
                    <p className="text-sm mb-4" style={{ color: '#FFFFFF' }}>{template.description}</p>
                    <button
                      className="w-full rounded-md px-4 py-2 text-sm font-bold transition-all"
                      style={{ 
                        background: '#FFCF40',
                        border: '2px solid rgba(255, 207, 64, 0.3)',
                        color: '#000000',
                        fontWeight: 'bold',
                        boxShadow: '0 2px 8px rgba(255, 207, 64, 0.3)',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow = '0 0 20px rgba(255, 207, 64, 0.6), 0 0 40px rgba(255, 207, 64, 0.4)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(255, 207, 64, 0.3)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                      onClick={() => handleSelectTemplate(template.id)}
                    >
                      Use Template
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Loading Overlay */}
        {generating && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
            <div className="bg-white dark:bg-background p-6 rounded-lg flex flex-col items-center gap-3">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="text-sm font-medium">Generating template...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
