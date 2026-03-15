/**
 * finalize_product_media.js - Clears all media and adds 3 layers via GraphQL.
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

async function finalize(productId, brand, tech, master) {
  const { SHOPIFY_SHOP, SHOPIFY_ACCESS_TOKEN } = process.env;
  const url = `https://${SHOPIFY_SHOP}/admin/api/2026-01/graphql.json`;
  
  try {
    // 1. Get all media IDs
    const getQuery = `
      query getMedia($id: ID!) {
        product(id: $id) {
          media(first: 20) {
            nodes { id }
          }
        }
      }
    `;
    const getRes = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN },
      body: JSON.stringify({ query: getQuery, variables: { id: `gid://shopify/Product/${productId}` } })
    });
    const getData = await getRes.json();
    const mediaIds = getData.data.product.media.nodes.map(n => n.id);

    // 2. Delete all
    if (mediaIds.length > 0) {
      console.log(`🧹 Deleting ${mediaIds.length} media nodes...`);
      const deleteQuery = `
        mutation productDeleteMedia($mediaIds: [ID!]!, $productId: ID!) {
          productDeleteMedia(mediaIds: $mediaIds, productId: $productId) {
            deletedMediaIds
            mediaUserErrors { message }
          }
        }
      `;
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN },
        body: JSON.stringify({ query: deleteQuery, variables: { mediaIds, productId: `gid://shopify/Product/${productId}` } })
      });
    }

    // 3. Create 3 new
    console.log(`🖼️ Injecting 3-Layer visuals...`);
    const createQuery = `
      mutation productCreateMedia($media: [CreateMediaInput!]!, $productId: ID!) {
        productCreateMedia(media: $media, productId: $productId) {
          media { id status }
          mediaUserErrors { message }
        }
      }
    `;
    const payload = [
      { alt: "Brand View - High Fashion", mediaContentType: "IMAGE", originalSource: brand },
      { alt: "Technical View - Production Std", mediaContentType: "IMAGE", originalSource: tech },
      { alt: "Master Design - Transparent", mediaContentType: "IMAGE", originalSource: master }
    ];
    
    const createRes = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN },
      body: JSON.stringify({ query: createQuery, variables: { media: payload, productId: `gid://shopify/Product/${productId}` } })
    });
    const createData = await createRes.json();
    
    if (createData.data && createData.data.productCreateMedia) {
      console.log(`✅ Finalization Complete! Media Created.`);
    } else {
      console.log(JSON.stringify(createData, null, 2));
    }

  } catch (err) {
    console.error('❌ Finalization Error:', err);
  }
}

const productId = process.argv[2];
const brand = process.argv[3];
const tech = process.argv[4];
const master = process.argv[5];

finalize(productId, brand, tech, master);
