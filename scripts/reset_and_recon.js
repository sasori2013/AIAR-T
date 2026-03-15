/**
 * reset_and_recon.js - Thoroughly resets and then reconstructs product media.
 */
const fs = require('fs');
const path = require('path');

function loadEnv() {
  const envPath = path.resolve(__dirname, '../.env');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    content.split('\n').forEach(line => {
      const parts = line.split('=');
      if (parts.length >= 2) {
        process.env[parts[0].trim()] = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
      }
    });
  }
}

loadEnv();

async function pollImageReady(productId, position) {
  const { SHOPIFY_SHOP, SHOPIFY_ACCESS_TOKEN } = process.env;
  const url = `https://${SHOPIFY_SHOP}/admin/api/2026-01/products/${productId}/images.json`;
  
  for (let i = 0; i < 15; i++) { // Increased wait for processing
    const response = await fetch(url, { headers: { 'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN } });
    const data = await response.json();
    const img = data.images.find(im => im.position === position);
    if (img && img.src && !img.src.includes('null')) {
      console.log(`✅ Image ${position} is live: ${img.src}`);
      return true;
    }
    console.log(`⏳ Waiting for Image ${position} to stabilize...`);
    await new Promise(r => setTimeout(r, 10000));
  }
  return false;
}

async function run() {
  const { SHOPIFY_SHOP, SHOPIFY_ACCESS_TOKEN } = process.env;
  const productId = "8966984401124";
  const url = `https://${SHOPIFY_SHOP}/admin/api/2026-01/products/${productId}.json`;

  // 1. Thorough Reset (User Script Logic)
  console.log("🧹 SCORCHED EARTH: Purging all ghost media...");
  await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN },
    body: JSON.stringify({ product: { id: productId, images: [] } })
  });

  console.log("⏳ Waiting 30s for ghost processes to end...");
  await new Promise(r => setTimeout(r, 30000));

  // 2. Sequential Reconstruction
  const images = [
    { name: "Brand View", file: "../BRAND_VIEW.png", pos: 1 },
    { name: "Technical Spec (AI)", file: "../../.gemini/antigravity/brain/bcb6931c-b705-4b21-971e-ce918e593690/vibe_coder_technical_spec_v1_premium_swiss_1773487061217.png", pos: 2 },
    { name: "Master Design", file: "../MASTER_DESIGN.png", pos: 3 }
  ];

  for (const item of images) {
    console.log(`🚀 RECON: Injecting ${item.name} (Pos ${item.pos})...`);
    const filePath = path.resolve(__dirname, item.file);
    if (!fs.existsSync(filePath)) {
        console.error(`❌ Missing file: ${filePath}`);
        continue;
    }
    const b64 = fs.readFileSync(filePath, 'base64');
    const updateUrl = `https://${SHOPIFY_SHOP}/admin/api/2026-01/products/${productId}/images.json`;
    
    await fetch(updateUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN },
      body: JSON.stringify({ image: { attachment: b64, filename: path.basename(filePath), position: item.pos } })
    });

    await pollImageReady(productId, item.pos);
  }

  console.log("🏆 3-Layer Visual QA Registry Reconstruction Complete.");
}

run();
