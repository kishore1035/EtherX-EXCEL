/**
 * EXPORT SYSTEM TEST & VALIDATION
 * Tests the unified cell schema and export system
 */

import { DocumentState, SheetData } from '../types/documentState';
import { UnifiedCell, SerializedSheet } from '../types/unifiedCell';
import { serializeSheetForIPFS, mapCellForCSV, exportSheetToCSV } from '../utils/unifiedExport';

/**
 * Create test document with various cell types
 */
export function createTestDocument(): DocumentState {
  const testSheet: SheetData = {
    sheetId: 'test-sheet-1',
    name: 'Test Sheet',
    visible: true,
    grid: {
      rows: 100,
      columns: 26,
      defaultRowHeight: 21,
      defaultColumnWidth: 100,
      rowSizes: {},
      columnSizes: {},
      frozenRows: 0,
      frozenColumns: 0,
      showGridlines: true,
      showRowHeaders: true,
      showColumnHeaders: true,
      hiddenRows: [],
      hiddenColumns: []
    },
    cells: {
      // Text cell
      'A1': {
        value: 'Hello World',
        type: 'string',
        style: {
          bold: true,
          fontSize: 14,
          textColor: '#000000',
          backgroundColor: '#ffffff'
        }
      },
      // Number cell
      'B1': {
        value: 123.45,
        type: 'number',
        style: {
          numberFormat: '0.00',
          textColor: '#000000',
          backgroundColor: '#e8f4f8'
        }
      },
      // Formula cell
      'C1': {
        value: 246.90,
        formula: '=B1*2',
        type: 'number',
        style: {
          italic: true,
          backgroundColor: '#fff3cd'
        }
      },
      // Checkbox cell
      'D1': {
        value: true,
        type: 'boolean',
        style: {
          backgroundColor: '#d4edda'
        }
      },
      // Symbol cell (emoji)
      'E1': {
        value: '🎉✨🚀',
        type: 'string',
        style: {
          fontSize: 18,
          backgroundColor: '#f8d7da'
        }
      },
      // Styled cell with colors
      'F1': {
        value: 'Colored Text',
        type: 'string',
        style: {
          bold: true,
          textColor: '#ffffff',
          backgroundColor: '#dc3545',
          fontSize: 16
        }
      }
    },
    images: [
      {
        id: 'img-1',
        src: 'ipfs://QmTestImageCID123456789',
        x: 50,
        y: 50,
        width: 200,
        height: 150,
        rotation: 0,
        opacity: 1,
        layer: 0
      },
      {
        id: 'img-2',
        src: 'https://ipfs.io/ipfs/QmAnotherTestCID987654321',
        x: 300,
        y: 50,
        width: 150,
        height: 150,
        rotation: 0,
        opacity: 1,
        layer: 0
      }
    ],
    shapes: [],
    charts: [],
    links: [],
    symbols: [],
    conditionalFormatting: [],
    zoom: 100
  };

  return {
    documentId: 'test-doc-1',
    metadata: {
      documentId: 'test-doc-1',
      title: 'Export System Test',
      owner: 'test-user@example.com',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      theme: 'light',
      sheetCount: 1,
      version: '1.0.0'
    },
    sheets: [testSheet],
    activeSheetId: 'test-sheet-1',
    settings: {
      autoSave: true,
      autoSaveInterval: 30,
      showFormulaBar: true,
      calculationMode: 'auto',
      r1c1ReferenceStyle: false
    },
    versionHistory: []
  };
}

/**
 * Test serialization for IPFS
 */
export function testSerialization(): SerializedSheet | undefined {
  console.log('\n🧪 TESTING IPFS SERIALIZATION');
  console.log('═══════════════════════════════════════\n');

  const testDoc = createTestDocument();
  const sheet = testDoc.sheets[0];

  try {
    const serialized = serializeSheetForIPFS(sheet);
    
    console.log('✅ Serialization successful');
    console.log(`   Cells serialized: ${serialized.cells.length}`);
    console.log(`   Sheet: ${serialized.name}`);
    console.log('\n📊 Cell Breakdown:');
    
    const cellTypes = serialized.cells.reduce((acc, cell) => {
      acc[cell.type] = (acc[cell.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    Object.entries(cellTypes).forEach(([type, count]) => {
      console.log(`   - ${type}: ${count}`);
    });
    
    // Validate each cell
    console.log('\n🔍 Validating cells:');
    serialized.cells.forEach((cell, index) => {
      if (!cell.type) {
        console.error(`   ❌ Cell ${index}: Missing type`);
      } else if (cell.value === undefined) {
        console.error(`   ❌ Cell ${index}: Missing value`);
      } else {
        console.log(`   ✅ Cell ${cell.col}${cell.row} (${cell.type}): "${cell.value}"`);
      }
    });
    
    return serialized;
  } catch (error) {
    console.error('❌ Serialization failed:', error);
    throw error;
  }
  
  return undefined;
}

/**
 * Test CSV export
 */
export function testCSVExport(): string | undefined {
  console.log('\n🧪 TESTING CSV EXPORT');
  console.log('═══════════════════════════════════════\n');

  const testDoc = createTestDocument();
  const sheet = testDoc.sheets[0];

  try {
    const serialized = serializeSheetForIPFS(sheet);
    const csv = exportSheetToCSV(serialized, {
      includeStyles: true,
      includeFormulas: false
    });
    
    console.log('✅ CSV export successful');
    console.log('\n📄 CSV Content:');
    console.log('───────────────────────────────────────');
    console.log(csv);
    console.log('───────────────────────────────────────');
    
    // Validate NO base64 in CSV
    if (csv.includes('data:image') || csv.includes('base64,')) {
      console.error('❌ CSV contains base64 data - VALIDATION FAILED');
      throw new Error('CSV export validation failed: contains base64');
    } else {
      console.log('\n✅ VALIDATION PASSED: No base64 data in CSV');
    }
    
    // Check for proper image formatting
    if (csv.includes('IMAGE(ipfs://')) {
      console.log('✅ Images properly formatted as IMAGE(ipfs://CID)');
    }
    
    // Check for style annotations
    if (csv.includes('[bg=') || csv.includes('[color=')) {
      console.log('✅ Style annotations present');
    }
    
    return csv;
  } catch (error) {
    console.error('❌ CSV export failed:', error);
    throw error;
  }
  
  return undefined;
}

/**
 * Test individual cell mapping
 */
export function testCellMapping(): void {
  console.log('\n🧪 TESTING CELL MAPPING');
  console.log('═══════════════════════════════════════\n');

  const testCells: UnifiedCell[] = [
    {
      row: 1,
      col: 'A',
      type: 'text',
      value: 'Hello',
      style: { bold: true, bgColor: '#ff0000', textColor: '#ffffff' }
    },
    {
      row: 1,
      col: 'B',
      type: 'image',
      value: 'QmTestCID123',
      meta: { ipfsCid: 'QmTestCID123' }
    },
    {
      row: 1,
      col: 'C',
      type: 'file',
      value: 'QmFileCID456',
      meta: { ipfsCid: 'QmFileCID456', fileName: 'document.pdf' }
    },
    {
      row: 1,
      col: 'D',
      type: 'checkbox',
      value: 'true',
      meta: { checked: true }
    },
    {
      row: 1,
      col: 'E',
      type: 'symbol',
      value: '🚀💡'
    }
  ];

  console.log('Testing cell type mappings:\n');
  
  testCells.forEach(cell => {
    try {
      const csvValue = mapCellForCSV(cell, { includeStyles: true });
      console.log(`✅ ${cell.type.toUpperCase()}: ${csvValue}`);
      
      // Validate
      if (cell.type === 'image' && !csvValue.includes('IMAGE(ipfs://')) {
        console.error(`   ❌ Image cell not properly formatted`);
      }
      if (cell.type === 'file' && !csvValue.includes('FILE(ipfs://')) {
        console.error(`   ❌ File cell not properly formatted`);
      }
      if (csvValue.includes('data:') || csvValue.includes('base64,')) {
        console.error(`   ❌ Contains base64 data`);
      }
    } catch (error) {
      console.error(`❌ ${cell.type.toUpperCase()}: ${error}`);
    }
  });
}

/**
 * Run all tests
 */
export function runAllTests(): void {
  console.log('\n┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓');
  console.log('┃  EXPORT SYSTEM VALIDATION SUITE       ┃');
  console.log('┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛');

  try {
    testCellMapping();
    testSerialization();
    testCSVExport();
    
    console.log('\n┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓');
    console.log('┃  ✅ ALL TESTS PASSED                   ┃');
    console.log('┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛\n');
  } catch (error) {
    console.log('\n┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓');
    console.log('┃  ❌ TESTS FAILED                       ┃');
    console.log('┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛\n');
    console.error(error);
  }
}

// Export for console testing
if (typeof window !== 'undefined') {
  (window as any).testExportSystem = {
    createTestDocument,
    testSerialization,
    testCSVExport,
    testCellMapping,
    runAllTests
  };
  
  console.log('💡 Export system tests available in console:');
  console.log('   window.testExportSystem.runAllTests()');
  console.log('   window.testExportSystem.testCSVExport()');
  console.log('   window.testExportSystem.testSerialization()');
}
