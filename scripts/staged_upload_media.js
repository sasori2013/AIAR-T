/**
 * staged_upload_media.js - Performs a direct file upload to Shopify.
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

async function stagedUpload(filePath) {
  const { SHOPIFY_SHOP, SHOPIFY_ACCESS_TOKEN } = process.env;
  const url = `https://${SHOPIFY_SHOP}/admin/api/2026-01/graphql.json`;
  const fileName = path.basename(filePath);
  const fileSize = fs.statSync(filePath).size.toString();
  
  // 1. stagedUploadsCreate
  const query = `
    mutation stagedUploadsCreate($input: [StagedUploadInput!]!) {
      stagedUploadsCreate(input: $input) {
        stagedTargets {
          url
          resourceUrl
          parameters { name value }
        }
        userErrors { message }
      }
    }
  `;

  const variables = {
    input: [{
      fileSize,
      filename: fileName,
      httpMethod: "POST",
      mimeType: "image/png",
      resource: "IMAGE"
    }]
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN },
    body: JSON.stringify({ query, variables })
  });
  const data = await response.json();
  const target = data.data.stagedUploadsCreate.stagedTargets[0];
  
  console.log('✅ Staged target created.');
  
  // 2. We'll use curl for the actual upload in a separate command to keep simple
  console.log(`URL: ${target.url}`);
  console.log(`ResourceURL: ${target.resourceUrl}`);
  console.log('Parameters:');
  target.parameters.forEach(p => console.log(`${p.name}=${p.value}`));
}

const filePath = process.argv[2] || path.resolve(__dirname, '../TECH_FINAL.png');
stagedUpload(filePath);
