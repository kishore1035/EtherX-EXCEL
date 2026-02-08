/**
 * IPFS CONNECTION TEST
 * Test script to verify IPFS integration with Pinata
 */

import fetch from 'node-fetch';
import FormData from 'form-data';

const PINATA_JWT = process.env.PINATA_JWT || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJmYTQzZjI2Yi02MGZkLTQxNmEtYWIyMC04YjBmY2M0YmNkZTYiLCJlbWFpbCI6InJlc2htYWJhbnUyMzI4QGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6IkZSQTEifSx7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6Ik5ZQzEifV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiJmZjYwOWZhYmY5YjZjNTFkYzYzZSIsInNjb3BlZEtleVNlY3JldCI6IjliOTM0NGE2N2RjNjhhN2M5NjIzNjZlYWQwNmI3Yzc1ZjZhZjI5MjdhOWFmMTc3YWI2OTM0YmUwMmU5NTJiZmYiLCJleHAiOjE4MDE5MTE2MDB9.CTe1XnGVdBZlHRTG5TZQsrilYP_iBmCc1yBoOBZ7q1s';
const PINATA_API_URL = 'https://api.pinata.cloud';

async function testPinataConnection() {
  console.log('🔍 Testing Pinata IPFS Connection...\n');
  
  try {
    // Test 1: Check authentication
    console.log('1️⃣ Testing authentication...');
    const authResponse = await fetch(`${PINATA_API_URL}/data/testAuthentication`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${PINATA_JWT}`
      }
    });
    
    if (authResponse.ok) {
      const authData = await authResponse.json();
      console.log('✅ Authentication successful:', authData.message);
    } else {
      throw new Error('Authentication failed');
    }
    
    // Test 2: Upload test document
    console.log('\n2️⃣ Testing document upload...');
    const testDocument = {
      documentId: 'test-doc-' + Date.now(),
      metadata: {
        title: 'IPFS Test Document',
        owner: 'system',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        theme: 'light',
        sheetCount: 1,
        version: '1.0.0'
      },
      sheets: [{
        sheetId: 'sheet-1',
        name: 'Test Sheet',
        visible: true,
        grid: {
          rows: 100,
          columns: 26,
          rowSizes: {},
          columnSizes: {},
          frozenRows: 0,
          frozenColumns: 0,
          showGridlines: true,
          showRowHeaders: true,
          showColumnHeaders: true,
          defaultRowHeight: 24,
          defaultColumnWidth: 100,
          hiddenRows: [],
          hiddenColumns: []
        },
        cells: {
          'A1': {
            value: 'IPFS Test',
            style: { bold: true }
          }
        },
        images: [],
        shapes: [],
        charts: [],
        links: [],
        symbols: [],
        conditionalFormatting: []
      }],
      activeSheetId: 'sheet-1',
      settings: {
        autoSave: true,
        autoSaveInterval: 30,
        showFormulaBar: true,
        calculationMode: 'auto',
        r1c1ReferenceStyle: false
      },
      versionHistory: []
    };
    
    const jsonString = JSON.stringify(testDocument, null, 2);
    const blob = Buffer.from(jsonString, 'utf-8');
    
    const formData = new FormData();
    formData.append('file', blob, 'test-document.json');
    
    const pinataMetadata = JSON.stringify({
      name: 'test-document.json',
      keyvalues: {
        type: 'test-document',
        timestamp: new Date().toISOString()
      }
    });
    formData.append('pinataMetadata', pinataMetadata);
    
    const uploadResponse = await fetch(`${PINATA_API_URL}/pinning/pinFileToIPFS`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PINATA_JWT}`,
        ...formData.getHeaders()
      },
      body: formData
    });
    
    if (uploadResponse.ok) {
      const uploadData = await uploadResponse.json();
      const cid = uploadData.IpfsHash;
      console.log('✅ Document uploaded successfully!');
      console.log('   CID:', cid);
      console.log('   Size:', uploadData.PinSize, 'bytes');
      console.log('   View at: https://ipfs.io/ipfs/' + cid);
      
      // Test 3: Retrieve the document
      console.log('\n3️⃣ Testing document retrieval...');
      const retrieveResponse = await fetch(`https://ipfs.io/ipfs/${cid}`);
      
      if (retrieveResponse.ok) {
        const retrievedDoc = await retrieveResponse.json();
        console.log('✅ Document retrieved successfully!');
        console.log('   Title:', retrievedDoc.metadata.title);
        console.log('   Sheets:', retrievedDoc.sheets.length);
        console.log('   Cell A1:', retrievedDoc.sheets[0].cells.A1?.value);
        
        // Verify integrity
        if (retrievedDoc.metadata.title === testDocument.metadata.title) {
          console.log('✅ Data integrity verified!');
        }
      } else {
        throw new Error('Failed to retrieve document');
      }
      
      console.log('\n🎉 All IPFS tests passed!');
      console.log('📌 Your IPFS database connection is working correctly.');
      console.log('📌 Documents will be stored on IPFS with CID versioning.');
      
      return cid;
    } else {
      const error = await uploadResponse.text();
      throw new Error(`Upload failed: ${error}`);
    }
    
  } catch (error) {
    console.error('\n❌ IPFS Connection Test Failed:', error.message);
    throw error;
  }
}

// Run test if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testPinataConnection()
    .then(() => {
      console.log('\n✅ Test completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Test failed:', error);
      process.exit(1);
    });
}

export { testPinataConnection };
