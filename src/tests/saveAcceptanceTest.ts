/**
 * SAVE PIPELINE ACCEPTANCE TEST
 * 
 * Test Requirements:
 * 1. Insert shape → Insert image → Change color
 * 2. Save to IPFS
 * 3. Open saved JSON
 * 4. Verify JSON contains shapes[], images[], and formatting
 * 5. If arrays empty → FAIL
 * 
 * Run this test to verify complete documentState save/load pipeline
 */

import { DocumentState, ImageObject, ShapeObject, CellData } from '../types/documentState';
import { saveDocumentStateToIPFS, loadDocumentStateFromIPFS } from '../services/documentStateSave';

export interface TestResult {
  passed: boolean;
  message: string;
  details: {
    savedCID?: string;
    loadedDocument?: DocumentState;
    hasImages?: boolean;
    hasShapes?: boolean;
    hasCellFormatting?: boolean;
    imageCount?: number;
    shapeCount?: number;
    formattedCellCount?: number;
  };
}

/**
 * Create a test document with visual elements
 */
export function createTestDocument(): DocumentState {
  const testImage: ImageObject = {
    id: 'test-image-1',
    src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    x: 100,
    y: 100,
    width: 200,
    height: 150,
    rotation: 0,
    opacity: 1.0,
    layer: 0
  };

  const testShape: ShapeObject = {
    id: 'test-shape-1',
    type: 'rectangle',
    x: 300,
    y: 100,
    width: 150,
    height: 100,
    rotation: 0,
    opacity: 1.0,
    layer: 0,
    fill: '#FF0000',
    stroke: '#000000',
    strokeWidth: 2
  };

  const testCellWithFormatting: CellData = {
    value: 'Test Cell',
    type: 'string',
    style: {
      backgroundColor: '#FFFF00',
      textColor: '#0000FF',
      bold: true,
      italic: false,
      underline: true,
      fontSize: 14,
      fontFamily: 'Arial'
    }
  };

  const documentState: DocumentState = {
    documentId: `test-doc-${Date.now()}`,
    metadata: {
      documentId: `test-doc-${Date.now()}`,
      title: 'Acceptance Test Document',
      owner: 'test@etherx.com',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      theme: 'light',
      sheetCount: 1,
      version: '1.0.0'
    },
    sheets: [
      {
        sheetId: 'test-sheet-1',
        name: 'Test Sheet',
        visible: true,
        grid: {
          rows: 1000,
          columns: 26,
          defaultRowHeight: 25,
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
          'A1': testCellWithFormatting,
          'B2': {
            value: '=SUM(A1:A10)',
            type: 'formula',
            formula: '=SUM(A1:A10)'
          }
        },
        images: [testImage],
        shapes: [testShape],
        charts: [],
        symbols: [],
        links: [],
        conditionalFormatting: []
      }
    ],
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

  return documentState;
}

/**
 * Run the complete acceptance test
 */
export async function runSaveAcceptanceTest(): Promise<TestResult> {
  console.log('🧪 ═══════════════════════════════════════════════════════');
  console.log('🧪 SAVE PIPELINE ACCEPTANCE TEST');
  console.log('🧪 ═══════════════════════════════════════════════════════');

  try {
    // Step 1: Create test document with visual elements
    console.log('\n📝 Step 1: Creating test document...');
    const testDoc = createTestDocument();
    console.log('✅ Test document created:', {
      images: testDoc.sheets[0].images.length,
      shapes: testDoc.sheets[0].shapes.length,
      cells: Object.keys(testDoc.sheets[0].cells).length
    });

    // Step 2: Save to IPFS
    console.log('\n☁️  Step 2: Saving to IPFS...');
    const saveResult = await saveDocumentStateToIPFS(testDoc);
    if (!saveResult.success) {
      throw new Error(saveResult.error || 'Save failed');
    }
    console.log('✅ Saved to IPFS:', saveResult.cid);

    // Step 3: Load from IPFS
    console.log('\n📥 Step 3: Loading from IPFS...');
    const loadResult = await loadDocumentStateFromIPFS(saveResult.cid);
    if (!loadResult.success || !loadResult.documentState) {
      throw new Error(loadResult.error || 'Load failed');
    }
    const loadedDoc = loadResult.documentState;
    console.log('✅ Document loaded successfully');

    // Step 4: Verify contents
    console.log('\n🔍 Step 4: Verifying document contents...');
    
    const sheet = loadedDoc.sheets[0];
    const hasImages = sheet.images && sheet.images.length > 0;
    const hasShapes = sheet.shapes && sheet.shapes.length > 0;
    const hasCells = sheet.cells && Object.keys(sheet.cells).length > 0;
    const hasCellFormatting = sheet.cells['A1']?.style?.backgroundColor === '#FFFF00';

    console.log('   Images:', sheet.images?.length || 0, hasImages ? '✅' : '❌');
    console.log('   Shapes:', sheet.shapes?.length || 0, hasShapes ? '✅' : '❌');
    console.log('   Cells:', Object.keys(sheet.cells || {}).length, hasCells ? '✅' : '❌');
    console.log('   Cell Formatting:', hasCellFormatting ? '✅' : '❌');

    // Detailed verification
    if (hasImages) {
      const img = sheet.images[0];
      console.log('   → Image details:', {
        id: img.id,
        width: img.width,
        height: img.height,
        src: img.src.substring(0, 50) + '...'
      });
    }

    if (hasShapes) {
      const shape = sheet.shapes[0];
      console.log('   → Shape details:', {
        id: shape.id,
        type: shape.type,
        fill: shape.fill,
        width: shape.width,
        height: shape.height
      });
    }

    if (hasCellFormatting) {
      const cell = sheet.cells['A1'];
      console.log('   → Cell A1 formatting:', {
        value: cell.value,
        backgroundColor: cell.style?.backgroundColor,
        textColor: cell.style?.textColor,
        bold: cell.style?.bold
      });
    }

    // Final verdict
    const passed = hasImages && hasShapes && hasCells && hasCellFormatting;

    console.log('\n🧪 ═══════════════════════════════════════════════════════');
    if (passed) {
      console.log('✅ ACCEPTANCE TEST PASSED');
      console.log('   All visual elements saved and loaded correctly!');
    } else {
      console.log('❌ ACCEPTANCE TEST FAILED');
      if (!hasImages) console.log('   ❌ Images not found in loaded document');
      if (!hasShapes) console.log('   ❌ Shapes not found in loaded document');
      if (!hasCells) console.log('   ❌ Cells not found in loaded document');
      if (!hasCellFormatting) console.log('   ❌ Cell formatting not preserved');
    }
    console.log('🧪 ═══════════════════════════════════════════════════════\n');

    return {
      passed,
      message: passed 
        ? 'All visual elements saved and loaded correctly' 
        : 'Some elements missing from saved document',
      details: {
        savedCID: saveResult.cid,
        loadedDocument: loadedDoc,
        hasImages,
        hasShapes,
        hasCellFormatting,
        imageCount: sheet.images?.length || 0,
        shapeCount: sheet.shapes?.length || 0,
        formattedCellCount: Object.values(sheet.cells || {}).filter((c: any) => c.style).length
      }
    };
  } catch (error: any) {
    console.error('🧪 ═══════════════════════════════════════════════════════');
    console.error('❌ ACCEPTANCE TEST ERROR');
    console.error('   Error:', error.message);
    console.error('🧪 ═══════════════════════════════════════════════════════\n');

    return {
      passed: false,
      message: `Test failed with error: ${error.message}`,
      details: {}
    };
  }
}

/**
 * Quick test that can be run from browser console
 */
export function quickTest() {
  console.log('🚀 Running quick acceptance test...');
  runSaveAcceptanceTest().then(result => {
    if (result.passed) {
      console.log('✅ QUICK TEST PASSED');
    } else {
      console.error('❌ QUICK TEST FAILED:', result.message);
    }
  });
}

// Export for use in browser console
if (typeof window !== 'undefined') {
  (window as any).runSaveAcceptanceTest = runSaveAcceptanceTest;
  (window as any).quickTest = quickTest;
  console.log('💡 Acceptance test available:');
  console.log('   window.runSaveAcceptanceTest() - Full test with detailed output');
  console.log('   window.quickTest() - Quick test');
}
