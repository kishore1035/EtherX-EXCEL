#!/usr/bin/env node

/**
 * TEST: Environment Variables Loading
 * Verify that dotenv properly loads environment variables before any module imports
 */

import dotenv from 'dotenv';
dotenv.config();

console.log('🧪 Testing Environment Variable Loading');
console.log('═'.repeat(60));

// Check PINATA_JWT
const PINATA_JWT = process.env.PINATA_JWT;
console.log('\n✓ PINATA_JWT Status:');
console.log('  - Defined:', !!PINATA_JWT);

if (PINATA_JWT) {
  const parts = PINATA_JWT.split('.');
  console.log('  - JWT Segments:', parts.length);
  console.log('  - Valid JWT Format:', parts.length === 3 ? '✅ YES (3 segments)' : '❌ NO');
  
  if (parts.length === 3) {
    console.log('  - Header length:', parts[0].length);
    console.log('  - Payload length:', parts[1].length);
    console.log('  - Signature length:', parts[2].length);
    console.log('  - Full JWT length:', PINATA_JWT.length);
    console.log('  - Preview:', PINATA_JWT.substring(0, 50) + '...');
  }
} else {
  console.log('  ❌ PINATA_JWT is undefined or missing!');
}

// Check other critical variables
console.log('\n✓ Other Environment Variables:');
console.log('  - JWT_SECRET:', !!process.env.JWT_SECRET ? '✅ Set' : '❌ Missing');
console.log('  - NODE_ENV:', process.env.NODE_ENV || 'not set');
console.log('  - PINATA_API_URL:', process.env.PINATA_API_URL || 'not set');
console.log('  - IPFS_GATEWAY:', process.env.IPFS_GATEWAY || 'not set');

// Result
console.log('\n' + '═'.repeat(60));
if (PINATA_JWT && PINATA_JWT.split('.').length === 3) {
  console.log('✅ SUCCESS: Environment variables loaded correctly!');
  console.log('   PINATA_JWT is valid and ready for IPFS uploads.');
} else {
  console.log('❌ FAILED: PINATA_JWT is missing or invalid!');
  console.log('   Check backend/.env file and ensure PINATA_JWT is set.');
}
