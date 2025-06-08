import QRCode from 'qrcode';
import fs from 'fs';

async function createTestQR() {
  try {
    // Generate a simple QR code
    const qrCodeBuffer = await QRCode.toBuffer('Hello World Test QR', {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    
    fs.writeFileSync('test-qr.png', qrCodeBuffer);
    console.log('Test QR code created: test-qr.png');
  } catch (error) {
    console.error('Error creating test QR:', error);
  }
}

createTestQR();