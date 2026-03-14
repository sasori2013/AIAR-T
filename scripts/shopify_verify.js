/**
 * shopify_verify.js - Shopify API Connection Verifier
 * This script tests the permanent access token by fetching shop information.
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
        const key = parts[0].trim();
        const value = parts.slice(1).join('=').trim();
        process.env[key] = value;
      }
    });
  }
}

loadEnv();

const {
  SHOPIFY_SHOP,
  SHOPIFY_ACCESS_TOKEN
} = process.env;

async function verify() {
  if (!SHOPIFY_SHOP || !SHOPIFY_ACCESS_TOKEN) {
    console.error('Missing SHOPIFY credentials in .env');
    process.exit(1);
  }

  const url = `https://${SHOPIFY_SHOP}/admin/api/2024-01/shop.json`;
  
  console.log(`📡 Verifying connection for ${SHOPIFY_SHOP}...`);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN
      }
    });

    if (response.ok) {
      const data = await response.json();
      console.log('\n' + '='.repeat(50));
      console.log('✅ Connection Verified Successfully!');
      console.log(`Shop Name: ${data.shop.name}`);
      console.log(`Email: ${data.shop.email}`);
      console.log(`Domain: ${data.shop.domain}`);
      console.log('='.repeat(50));
    } else {
      const errorData = await response.json();
      console.error('\n❌ Connection Failed:', response.status, errorData);
    }
  } catch (err) {
    console.error('\n⚠️ Communication Error:', err.message);
  }
}

verify();
