/**
 * automate_product.js - Fully Automated Product Pipeline
 * 1. Upload design to Shopify Files
 * 2. Create Shopify Product
 * 3. (Optional) Create Printful Sync Product
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
        let key = parts[0].trim();
        let value = parts.slice(1).join('=').trim();
        process.env[key] = value.replace(/^['"]|['"]$/g, '');
      }
    });
  }
}

loadEnv();

const {
  SHOPIFY_SHOP,
  SHOPIFY_ACCESS_TOKEN,
  PRINTFUL_ACCESS_TOKEN
} = process.env;

const SHOPIFY_API_VERSION = "2024-01";
const PRINTFUL_STORE_ID = "17852657"; // From system check

async function createShopifyProduct(designUrl) {
  console.log('📦 Creating product on Shopify...');
  const url = `https://${SHOPIFY_SHOP}/admin/api/${SHOPIFY_API_VERSION}/products.json`;
  
  const productData = {
    product: {
      title: "Vibe Coder T-Shirt",
      body_html: "<strong>If vibe is good, ship it.</strong><br>A minimalist T-shirt for engineers who trust their gut. Includes interactive AR experience.",
      vendor: "AIAR-T",
      product_type: "T-Shirt",
      status: "active",
      tags: "meme, engineer, ar",
      images: [
        { src: designUrl }
      ]
    }
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN
    },
    body: JSON.stringify(productData)
  });

  const data = await response.json();
  if (data.product) {
    console.log(`✅ Shopify Product Created: ${data.product.id}`);
    return data.product;
  } else {
    console.error('❌ Failed to create Shopify product:', JSON.stringify(data));
    return null;
  }
}

async function runAutomation() {
  const designUrl = "https://pub-a000bc6dfd29470a950ac8de4b4f36a6.r2.dev/aiar-t/vibe_coder_design_1773466124286.png";
  
  console.log('🚀 Starting automation for product registration...');
  console.log('Design URL:', designUrl);
  
  const product = await createShopifyProduct(designUrl);
  if (product) {
    console.log('\n--- NEXT STEPS ---');
    console.log(`1. Visit: https://${SHOPIFY_SHOP}/admin/products/${product.id}`);
    console.log('2. The AR punchline is already set in config.json.');
    
    // Save mapping for future automated AR target generation
    const mapping = {
      productId: product.id,
      designUrl: designUrl,
      punchline: "// Cloud Bill: $42,069.00",
      timestamp: new Date().toISOString()
    };
    fs.appendFileSync(path.resolve(__dirname, '../product_mappings.log'), JSON.stringify(mapping) + '\n');
  }
}

runAutomation();
