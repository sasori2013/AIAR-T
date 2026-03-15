/**
 * scripts/unified_image_sync_v2.js
 * AIAR-T Spec 2.0 Asset Synchronization
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
                const value = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
                process.env[key] = value;
            }
        });
    }
}

loadEnv();

async function runProductionWorkflow(masterUrl, vibeUrl) {
    const PRINTFUL_ACCESS_TOKEN = process.env.PRINTFUL_ACCESS_TOKEN;
    const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN;
    const SHOPIFY_SHOP = process.env.SHOPIFY_SHOP;
    const PRODUCT_ID = "8966984401124"; 

    // Printful テンプレート設定 (Bella + Canvas 3001 - White)
    const TEMPLATE_ID = 71; 
    const VARIANT_ID = 4011; 

    console.log("🚀 Spec 2.0 Unified Sync Process Starting...");
    console.log(`🔗 Master: ${masterUrl}`);
    console.log(`🔗 Vibe: ${vibeUrl}`);

    // 1. Printful API モックアップ生成
    console.log("⏳ Step 1: Generating Printful Technical Mockup...");
    const taskResponse = await fetch(`https://api.printful.com/mockup-generator/create-task/${TEMPLATE_ID}`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${PRINTFUL_ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            variant_ids: [VARIANT_ID],
            format: "jpg",
            files: [{
                placement: "front",
                image_url: masterUrl,
                position: {
                    area_width: 1800, area_height: 2400,
                    width: 1800, height: 1800, 
                    top: 0, left: 0 
                }
            }]
        })
    });

    const taskData = await taskResponse.json();
    if (!taskData.result || !taskData.result.task_key) {
        console.error("❌ Printful Task Create Error:", JSON.stringify(taskData));
        return;
    }
    const taskKey = taskData.result.task_key;

    let officialMockupUrl = "";
    while (!officialMockupUrl) {
        process.stdout.write("⏳");
        await new Promise(r => setTimeout(r, 5000));
        const statusRes = await fetch(`https://api.printful.com/mockup-generator/task?task_key=${taskKey}`, {
            headers: { 'Authorization': `Bearer ${PRINTFUL_ACCESS_TOKEN}` }
        });
        const statusData = await statusRes.json();
        if (statusData.result.status === 'completed') {
            console.log("\n✅ Official Mockup Generated");
            const mock = statusData.result.mockups[0];
            officialMockupUrl = (mock.extra_mockups && mock.extra_mockups[0]) ? mock.extra_mockups[0].url : mock.mockup_url;
            console.log(`🔗 Mockup URL: ${officialMockupUrl}`);
        } else if (statusData.result.status === 'failed') {
            console.error("\n❌ Printful Mockup Task Failed");
            return;
        }
    }

    // 2. Shopify への3枚一括登録
    console.log("⏳ Step 2: Batch Updating Shopify Product Media (3-Layer Registry)...");
    const shopifyUrl = `https://${SHOPIFY_SHOP}/admin/api/2024-01/products/${PRODUCT_ID}.json`;

    const updateResponse = await fetch(shopifyUrl, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN
        },
        body: JSON.stringify({
            product: {
                id: PRODUCT_ID,
                images: [
                    { src: vibeUrl, alt: "Fashion Vibe Image (Imagen 4.0 Ultra)" }, // Pos 1: Inspiration
                    { src: officialMockupUrl, alt: "Official Technical Mockup (Printful)" }, // Pos 2: Verification
                    { src: masterUrl, alt: "Master Design Blueprint (Spec 2.0)" } // Pos 3: Production
                ]
            }
        })
    });

    if (updateResponse.ok) {
        console.log("🎉 Spec 2.0 Registry Complete! Verify in Shopify Admin.");
    } else {
        const error = await updateResponse.json();
        console.error("❌ Shopify Update Error:", JSON.stringify(error));
    }
}

const mUrl = process.argv[2];
const vUrl = process.argv[3];
if (!mUrl || !vUrl) {
    console.error("Usage: node scripts/unified_image_sync_v2.js <masterUrl> <vibeUrl>");
    process.exit(1);
}

runProductionWorkflow(mUrl, vUrl);
