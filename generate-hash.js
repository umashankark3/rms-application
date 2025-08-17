const bcrypt = require('bcryptjs');

async function generateHash() {
  try {
    // Generate hash for 'admin123' password
    const hash1 = await bcrypt.hash('admin123', 12);
    console.log('Password: admin123');
    console.log('Hash:', hash1);
    console.log('');
    
    // Generate hash for 'secret' password
    const hash2 = await bcrypt.hash('secret', 12);
    console.log('Password: secret');
    console.log('Hash:', hash2);
    console.log('');
    
    // Test verification
    const isValid1 = await bcrypt.compare('admin123', hash1);
    const isValid2 = await bcrypt.compare('secret', hash2);
    
    console.log('Verification test:');
    console.log('admin123 matches hash1:', isValid1);
    console.log('secret matches hash2:', isValid2);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

generateHash();