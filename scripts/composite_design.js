/**
 * composite_design.js - Composites a QR code onto the design image.
 */
const sharp = require('sharp');
const path = require('path');

async function compositeDesign() {
  const baseImage = "C:/Users/kenxx/.gemini/antigravity/brain/bcb6931c-b705-4b21-971e-ce918e593690/vibe_coder_digital_design_v3_1773468608205.png";
  const qrImage = path.resolve(__dirname, '../qr_00001.png');
  const outPath = path.resolve(__dirname, '../vibe-coder-master-v1.png');

  // Printful 15" x 18" at 150 DPI = 2250 x 2700 px
  const CANVAS_WIDTH = 2250;
  const CANVAS_HEIGHT = 2700;

  try {
    console.log(`🎨 Creating Production Canvas: ${CANVAS_WIDTH}x${CANVAS_HEIGHT}`);

    // ==========================================
    // PHYSICAL SPECIFICATIONS (HARDCODED MASTER SPEC 1.2)
    // ==========================================
    const baseImage = "C:/Users/kenxx/.gemini/antigravity/brain/bcb6931c-b705-4b21-971e-ce918e593690/vibe_coder_2d_monolith_spec_1_2_1773538384939.png";
    const WIDTH_OCCUPANCY = 0.95; 
    const MAX_WIDTH = Math.floor(CANVAS_WIDTH * WIDTH_OCCUPANCY); // 2137px
    const UPPER_LIMIT = Math.floor(CANVAS_HEIGHT * 0.3); // 810px (Upper 30% Area)
    const UNIT_GAP = 50; // EXACTLY 50px
    const QR_SIZE = 260; // Standard sized QR

    console.log(`📏 Master Spec 1.2: Width=${MAX_WIDTH}px (95%), Design-Area=${UPPER_LIMIT}px`);

    // 1. Prepare Typography (Auto-Trim to ensure 95% occupancy is based on INK ONLY)
    let typographyBuffer = await sharp(baseImage).trim().toBuffer();
    
    // Scale to MAX_WIDTH
    const typography = await sharp(typographyBuffer)
      .resize(MAX_WIDTH, null, { fit: 'inside' }) 
      .toBuffer();
    const typoMeta = await sharp(typography).metadata();

    // 2. Prepare QR Code
    const qrBuffer = await sharp(qrImage).resize(QR_SIZE).toBuffer();

    // 3. Composite everything (Upper-Focused 2D Graphic)
    const UNIT_POS_TOP = 50; // Absolute Top start
    const TYPO_POS_LEFT = Math.floor((CANVAS_WIDTH - typoMeta.width) / 2);
    
    const QR_POS_TOP = UNIT_POS_TOP + typoMeta.height + UNIT_GAP;
    const QR_POS_LEFT = Math.floor((CANVAS_WIDTH - QR_SIZE) / 2);

    // Total height check for Master Spec 1.2 (30% limit)
    const actualHeight = typoMeta.height + UNIT_GAP + QR_SIZE;
    console.log(`📍 Monolith 1.2 Mapping: Typo@${UNIT_POS_TOP}, QR@${QR_POS_TOP}, TotalHeight=${actualHeight}px (Limit: ${UPPER_LIMIT}px)`);

    if (actualHeight > UPPER_LIMIT) {
        console.warn(`⚠️ Warning: Design block (${actualHeight}px) exceeds 30% limit (${UPPER_LIMIT}px).`);
    }

    await sharp({
      create: {
        width: CANVAS_WIDTH,
        height: CANVAS_HEIGHT,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 } // Completely Transparent
      }
    })
    .composite([
      {
        input: typography,
        top: UNIT_POS_TOP,
        left: TYPO_POS_LEFT
      },
      {
        input: qrBuffer,
        top: QR_POS_TOP,
        left: QR_POS_LEFT
      }
    ])
    .png()
    .toFile(outPath);

    console.log(`✅ Definitive Master Design (Spec 1.2) saved to: ${outPath}`);
  } catch (err) {
    console.error('❌ Error compositing images:', err);
  }
}

compositeDesign();
