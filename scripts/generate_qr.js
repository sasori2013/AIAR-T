/**
 * generate_qr.js - Generates a QR code for a given design number.
 */
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

async function generateDesignQR() {
  const designsPath = path.resolve(__dirname, '../designs.json');
  const designsData = JSON.parse(fs.readFileSync(designsPath, 'utf8'));
  
  const num = String(designsData.nextDesignNumber).padStart(5, '0');
  const arUrl = `${designsData.baseArUrl}${num}`;
  const outPath = path.resolve(__dirname, `../qr_${num}.png`);

  try {
    await QRCode.toFile(outPath, arUrl, {
      color: {
        dark: '#000000',
        light: '#ffffff'
      },
      width: 400
    });
    console.log(`✅ QR Code generated for ${arUrl} -> ${outPath}`);
    
    // Update designs.json
    designsData.designs.push({
      id: num,
      url: arUrl,
      timestamp: new Date().toISOString()
    });
    designsData.nextDesignNumber++;
    fs.writeFileSync(designsPath, JSON.stringify(designsData, null, 2));

  } catch (err) {
    console.error('❌ Error generating QR code:', err);
  }
}

generateDesignQR();
