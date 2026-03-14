/**
 * composite_design.js - Composites a QR code onto the design image.
 */
const sharp = require('sharp');
const path = require('path');

async function compositeDesign() {
  const baseImage = "C:/Users/kenxx/.gemini/antigravity/brain/bcb6931c-b705-4b21-971e-ce918e593690/vibe_coder_digital_design_v3_1773468608205.png";
  const qrImage = path.resolve(__dirname, '../qr_00001.png');
  const outPath = "C:/Users/kenxx/.gemini/antigravity/brain/bcb6931c-b705-4b21-971e-ce918e593690/vibe_coder_v5_final.png";

  try {
    // Get metadata of the base image to determine placement
    const metadata = await sharp(baseImage).metadata();
    const qrSize = Math.floor(metadata.width * 0.15); // QR code size: 15% of width

    console.log(`🖼️  Base Image: ${metadata.width}x${metadata.height}`);
    console.log(`🔳 Resizing QR to: ${qrSize}px`);

    await sharp(baseImage)
      .composite([
        {
          input: await sharp(qrImage).resize(qrSize).toBuffer(),
          top: metadata.height - qrSize - 50, // 50px margin from bottom
          left: metadata.width - qrSize - 50, // 50px margin from right
        },
      ])
      .toFile(outPath);

    console.log(`✅ Final composite saved to: ${outPath}`);
  } catch (err) {
    console.error('❌ Error compositing images:', err);
  }
}

compositeDesign();
