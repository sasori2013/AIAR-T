/**
 * scripts/unified_image_sync.js
 * AIAR-T 商品画像統合スクリプト
 * 1. Master Design (印刷用透過PNG)
 * 2. Imagen Vibe Image (ブランドイメージ画像)
 * 3. Printful Official Mockup (公式着用画像)
 * 上記3点をShopify商品に一括登録する。
 */
const fs = require('fs');
const path = require('path');

// .env から環境変数を読み込む
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

async function runProductionWorkflow() {
    // ==========================================
    // 1. 環境設定とアセットURL
    // ==========================================
    const PRINTFUL_ACCESS_TOKEN = process.env.PRINTFUL_ACCESS_TOKEN;
    const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN;
    const SHOPIFY_SHOP = process.env.SHOPIFY_SHOP;
    const PRODUCT_ID = "8966984401124"; 

    // R2 にアップロード済みのURL
    const MASTER_DESIGN_URL = "https://pub-a000bc6dfd29470a950ac8de4b4f36a6.r2.dev/aiar-t/vibe-coder-master-v1.png";
    const IMAGEN_VIBE_URL = "https://pub-a000bc6dfd29470a950ac8de4b4f36a6.r2.dev/aiar-t/vibe_coder_brand_v4_hard_flash_1773536215533.png";

    // Printful テンプレート設定 (Bella + Canvas 3001)
    const TEMPLATE_ID = 71; 
    const VARIANT_ID = 4011; // White / S

    console.log("🚀 3層画像統合プロセスを開始します...");

    // ==========================================
    // 2. Printful API で公式モックアップを生成
    // ==========================================
    console.log("⏳ Step 1: Printful公式モックアップを生成中...");
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
                image_url: MASTER_DESIGN_URL,
                position: {
                    area_width: 1800, area_height: 2400,
                    width: 1800, height: 1800, // MAX WIDTH
                    top: 0, left: 0 // ABSOLUTE TOP
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

    // ポーリング処理
    let officialMockupUrl = "";
    while (!officialMockupUrl) {
        process.stdout.write("⏳");
        await new Promise(r => setTimeout(r, 5000));
        const statusRes = await fetch(`https://api.printful.com/mockup-generator/task?task_key=${taskKey}`, {
            headers: { 'Authorization': `Bearer ${PRINTFUL_ACCESS_TOKEN}` }
        });
        const statusData = await statusRes.json();
        if (statusData.result.status === 'completed') {
            console.log("\n✅ 公式モックアップ作成完了");
            // extra_mockups が無い場合へのフォールバック
            const mock = statusData.result.mockups[0];
            officialMockupUrl = (mock.extra_mockups && mock.extra_mockups[0]) ? mock.extra_mockups[0].url : mock.mockup_url;
            console.log(`🔗 Mockup URL: ${officialMockupUrl}`);
        } else if (statusData.result.status === 'failed') {
            console.error("\n❌ Printful Mockup Task Failed");
            return;
        }
    }

    // ==========================================
    // 3. Shopify への3枚一括登録 (Update Product)
    // ==========================================
    console.log("⏳ Step 2: Shopifyの商品メディアを更新中...");
    const shopifyUrl = `https://${SHOPIFY_SHOP}/admin/api/2024-01/products/${PRODUCT_ID}.json`;

    // 既存メディアとの競合を避けるため、一括登録
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
                    { src: officialMockupUrl, alt: "Official Product View" }, // メイン画像
                    { src: IMAGEN_VIBE_URL, alt: "Brand Concept View" },      // 2枚目: 雰囲気
                    { src: MASTER_DESIGN_URL, alt: "Design Blueprint" }      // 3枚目: デザイン原版
                ]
            }
        })
    });

    if (updateResponse.ok) {
        console.log("🎉 統合成功！ Shopifyストアで3枚の画像を確認してください。");
        const data = await updateResponse.json();
        console.log(`登録画像数: ${data.product.images.length}`);
    } else {
        const error = await updateResponse.json();
        console.error("❌ Shopify更新エラー:", JSON.stringify(error));
    }
}

runProductionWorkflow();
