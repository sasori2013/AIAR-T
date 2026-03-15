/**
 * create_test_product.js - Creates a new product with 3 images to test the count.
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

async function createTest() {
  const { SHOPIFY_SHOP, SHOPIFY_ACCESS_TOKEN } = process.env;
  const url = `https://${SHOPIFY_SHOP}/admin/api/2026-01/products.json`;
  
  const payload = {
    product: {
      title: "Mission QA Test - 3 Layers",
      body_html: "Testing image registration limits.",
      vendor: "Future Lab",
      product_type: "T-Shirt",
      status: "draft",
      images: [
        { src: "https://pub-a000bc6dfd29470a950ac8de4b4f36a6.r2.dev/aiar-t/BRAND_VIEW.png", position: 1 },
        { src: "https://pub-a000bc6dfd29470a950ac8de4b4f36a6.r2.dev/aiar-t/TECH_SPEC.jpg", position: 2 },
        { src: "https://pub-a000bc6dfd29470a950ac8de4b4f36a6.r2.dev/aiar-t/MASTER_DESIGN.png", position: 3 }
      ]
    }
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    if (data.product) {
      console.log(`✅ Test Product Created: ${data.product.id}`);
      console.log(`Registered Image Count: ${data.product.images.length}`);
      data.product.images.forEach(img => console.log(` - Pos ${img.position}: ${img.src}`));
    } else {
      console.error('❌ Shopify Error:', JSON.stringify(data, null, 2));
    }
  } catch (err) {
    console.error('❌ Error:', err);
  }
}

createTest();
