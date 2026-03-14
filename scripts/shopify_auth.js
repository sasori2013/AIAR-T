/**
 * shopify_auth.js - 2026 Specification (Client Credentials Flow)
 * This script exchanges client_id and client_secret directly for a permanent access token.
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
  SHOPIFY_CLIENT_ID,
  SHOPIFY_CLIENT_SECRET
} = process.env;

async function run() {
  if (!SHOPIFY_SHOP || !SHOPIFY_CLIENT_ID || !SHOPIFY_CLIENT_SECRET) {
    console.error('Missing SHOPIFY credentials in .env');
    process.exit(1);
  }

  const url = `https://${SHOPIFY_SHOP}/admin/oauth/access_token`;
  
  console.log(`📡 Requesting token for ${SHOPIFY_SHOP}...`);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: SHOPIFY_CLIENT_ID,
        client_secret: SHOPIFY_CLIENT_SECRET,
        grant_type: 'client_credentials'
      })
    });

    const data = await response.json();

    if (data.access_token) {
      console.log('\n' + '='.repeat(50));
      console.log('✅ Token Acquisition Successful!');
      console.log(`Access Token: ${data.access_token}`);
      console.log('='.repeat(50));
      
      // Save to .env
      const envPath = path.resolve(__dirname, '../.env');
      let envContent = fs.readFileSync(envPath, 'utf8');
      
      // Remove old token if exists
      envContent = envContent.replace(/^SHOPIFY_ACCESS_TOKEN=.*$/m, '');
      envContent += `\nSHOPIFY_ACCESS_TOKEN=${data.access_token}\n`;
      
      fs.writeFileSync(envPath, envContent.trim() + '\n');
      console.log('\nToken has been saved to .env file.');
    } else {
      console.error('\n❌ Failed to obtain access token:', data);
    }
  } catch (err) {
    console.error('\n⚠️ Communication Error:', err.message);
  }
}

run();
