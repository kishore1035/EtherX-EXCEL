/**
 * EXPORT MENU COMPONENT
 * Provides UI for exporting documents in multiple formats
 */

import React, { useState } from 'react';
import { Download, FileText, FileImage, FileJson, FileSpreadsheet, X } from 'lucide-react';
import { useDocumentState } from '../contexts/DocumentStateContext';
import {
  exportDocumentToCSV,
  exportDocumentToPDF,
  exportDocumentToJSON,
  exportSerializedDocumentToJSON,
  exportDocumentToExcel,
  EXPORT_FORMATS,
  ExportFormat
} from '../services/exportService';
import { ExportOptions } from '../types/unifiedCell';

interface ExportMenuProps {
  onClose?: () => void;
}

export const ExportMenu: React.FC<ExportMenuProps> = ({ onClose }) => {
  const { state: documentState } = useDocumentState();
  const [exportingFormat, setExportingFormat] = useState<string | null>(null);
  const [showOptions, setShowOptions] = useState(false);
  
  const [options, setOptions] = useState<ExportOptions>({
    includeStyles: true,
    includeFormulas: false,
    ipfsGateway: 'https://ipfs.io/ipfs/',
    maxImageSize: 5 * 1024 * 1024,
    fallbackOnError: true
  });

  const handleExport = async (format: ExportFormat) => {
    if (!documentState) {
      alert('No document to export');
      return;
    }

    try {
      setExportingFormat(format.name);
      
      console.log(`📦 Exporting as ${format.name}...`);
      
      await format.handler(documentState, undefined, options);
      
      console.log(`✅ ${format.name} export complete`);
      
      setExportingFormat(null);
      
      if (onClose) {
        setTimeout(onClose, 500);
      }
    } catch (error) {
      console.error(`❌ ${format.name} export failed:`, error);
      alert(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setExportingFormat(null);
    }
  };

  const getFormatIcon = (format: ExportFormat) => {
    switch (format.extension) {
      case '.csv':
        return <FileText className="w-5 h-5" />;
      case '.pdf':
        return <FileImage className="w-5 h-5" />;
      case '.json':
        return <FileJson className="w-5 h-5" />;
      case '.xlsx':
        return <FileSpreadsheet className="w-5 h-5" />;
      default:
        return <Download className="w-5 h-5" />;
    }
  };

  const isLibraryAvailable = (libraryName?: string): boolean => {
    if (!libraryName) return true;
    return typeof window !== 'undefined' && !!(window as any)[libraryName];
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Download className="w-6 h-6" />
            Export Document
          </h2>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Document Info */}
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
              {documentState?.metadata.title || 'Untitled Document'}
            </h3>
            <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <p>Sheets: {documentState?.sheets.length || 0}</p>
              <p>
                Cells: {documentState?.sheets.reduce((sum, sheet) => sum + Object.keys(sheet.cells).length, 0) || 0}
              </p>
              <p>
                Images: {documentState?.sheets.reduce((sum, sheet) => sum + sheet.images.length, 0) || 0}
              </p>
            </div>
          </div>

          {/* Export Options Toggle */}
          <button
            onClick={() => setShowOptions(!showOptions)}
            className="mb-4 text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            {showOptions ? 'Hide' : 'Show'} Export Options
          </button>

          {/* Export Options */}
          {showOptions && (
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg space-y-3">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={options.includeStyles}
                  onChange={(e) => setOptions({ ...options, includeStyles: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm">Include cell styling</span>
              </label>
              
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={options.includeFormulas}
                  onChange={(e) => setOptions({ ...options, includeFormulas: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm">Export formulas (instead of values)</span>
              </label>
              
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={options.fallbackOnError}
                  onChange={(e) => setOptions({ ...options, fallbackOnError: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm">Graceful error handling</span>
              </label>
            </div>
          )}

          {/* Format List */}
          <div className="space-y-2">
            {EXPORT_FORMATS.map((format) => {
              const isAvailable = isLibraryAvailable(format.requiresLibrary);
              const isExporting = exportingFormat === format.name;

              return (
                <button
                  key={format.name}
                  onClick={() => handleExport(format)}
                  disabled={!isAvailable || isExporting}
                  className={`
                    w-full flex items-start gap-4 p-4 rounded-lg border-2 transition-all
                    ${isAvailable
                      ? 'border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                      : 'border-gray-100 dark:border-gray-800 opacity-50 cursor-not-allowed'
                    }
                    ${isExporting ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''}
                  `}
                >
                  <div className={`
                    ${isAvailable ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}
                  `}>
                    {getFormatIcon(format)}
                  </div>
                  
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {format.name}
                      </h3>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {format.extension}
                      </span>
                      {format.requiresLibrary && !isAvailable && (
                        <span className="text-xs text-red-500 dark:text-red-400">
                          (Requires {format.requiresLibrary})
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {format.description}
                    </p>
                    {isExporting && (
                      <p className="text-sm text-blue-600 dark:text-blue-400 mt-2">
                        Exporting...
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Notes */}
          <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <h4 className="font-medium text-yellow-900 dark:text-yellow-100 mb-2 text-sm">
              📝 Export Notes
            </h4>
            <ul className="text-xs text-yellow-800 dark:text-yellow-200 space-y-1">
              <li>• CSV exports include styling as annotations (e.g., [bg=#ff0000])</li>
              <li>• PDF exports fetch images from IPFS and embed them</li>
              <li>• Images in CSV appear as IMAGE(ipfs://CID)</li>
              <li>• Files in CSV appear as FILE(ipfs://CID)</li>
              <li>• JSON exports contain complete document state</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportMenu;
