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

async function debugProducts() {
  const { SHOPIFY_SHOP, SHOPIFY_ACCESS_TOKEN } = process.env;
  const url = `https://${SHOPIFY_SHOP}/admin/api/2026-01/products/8966984401124.json`;
  
  try {
    const response = await fetch(url, {
      headers: { 'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN }
    });
    const data = await response.json();
    fs.writeFileSync(path.resolve(__dirname, '../debug_images.json'), JSON.stringify(data.product.images, null, 2));
    console.log(`✅ Debug info written to debug_images.json`);
  } catch (err) {
    console.error('❌ Error fetching debug info:', err);
  }
}

debugProducts();
