/**
 * system_check.js - Future Lab Integrated System Check
 * Verifies connectivity to Shopify, Printful, and Gemini API.
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

const {
  SHOPIFY_SHOP,
  SHOPIFY_ACCESS_TOKEN,
  PRINTFUL_ACCESS_TOKEN,
  GEMINI_API_KEY
} = process.env;

const SHOPIFY_API_VERSION = "2024-01";

async function verifyShopify() {
  console.log(`📡 Shopify (${SHOPIFY_SHOP}) への接続を確認中...`);
  const url = `https://${SHOPIFY_SHOP}/admin/api/${SHOPIFY_API_VERSION}/shop.json`;
  try {
    const r = await fetch(url, {
      headers: {
        "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
        "Content-Type": "application/json"
      }
    });
    if (r.ok) {
      const data = await r.json();
      console.log(`✅ Shopify 接続成功: ${data.shop.name}`);
      return true;
    } else {
      const errorText = await r.text();
      console.log(`❌ Shopify 接続失敗: ${r.status} - ${errorText}`);
      return false;
    }
  } catch (e) {
    console.log(`⚠️ Shopify エラー: ${e.message}`);
    return false;
  }
}

async function verifyPrintful() {
  console.log(`📡 Printful への接続を確認中...`);
  const url = "https://api.printful.com/stores";
  if (!PRINTFUL_ACCESS_TOKEN) {
    console.log("❌ Printful 接続失敗: PRINTFUL_ACCESS_TOKEN が設定されていません。");
    return false;
  }
  try {
    const r = await fetch(url, {
      headers: { "Authorization": `Bearer ${PRINTFUL_ACCESS_TOKEN}` }
    });
    if (r.ok) {
      const data = await r.json();
      const stores = data.result || [];
      console.log(`✅ Printful 接続成功: ${stores.length}件のストアを検出`);
      stores.forEach(s => console.log(`   - ${s.name} (ID: ${s.id})`));
      return true;
    } else {
      const errorText = await r.text();
      console.log(`❌ Printful 接続失敗: ${r.status} - ${errorText}`);
      return false;
    }
  } catch (e) {
    console.log(`⚠️ Printful エラー: ${e.message}`);
    return false;
  }
}

async function verifyGemini() {
  console.log(`📡 Gemini API への接続を確認中...`);
  if (!GEMINI_API_KEY) {
    console.log("❌ Gemini API 接続失敗: GEMINI_API_KEY が設定されていません。");
    return false;
  }
  // v1 版の 1.5-flash エンドポイント
  const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
  try {
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: "Respond only with 'OK'." }] }] })
    });
    if (r.ok) {
      console.log(`✅ Gemini API 接続成功`);
      return true;
    } else {
      const errorText = await r.text();
      console.log(`❌ Gemini API 接続失敗: ${r.status} - ${errorText}`);
      return false;
    }
  } catch (e) {
    console.log(`⚠️ Gemini API エラー: ${e.message}`);
    return false;
  }
}

async function run() {
  console.log("🚀 Future Lab 統合システム チェック開始\n");
  const s_ok = await verifyShopify();
  const p_ok = await verifyPrintful();
  const g_ok = await verifyGemini(); // Geminiはオプション
  
  console.log("\n" + "=".repeat(50));
  if (s_ok && p_ok) {
    if (g_ok) {
      console.log("🎉 すべてのAPI連携が正常です！");
    } else {
      console.log("✅ ストア連携（Shopify/Printful）は正常です！");
      console.log("（将来的に Gemini APIキーを設定すると、AIによるミーム自動生成が可能になります）");
    }
    console.log("\nAntigravityに以下の指示を出して、自動運用を開始してください：");
    console.log("『APIの接続を確認した。最初のミームTシャツを1枚、デザインから登録まで全自動で実行して。』");
  } else {
    console.log("⚠️ ストア連携に失敗しています。 .env の設定を再確認してください。");
  }
  console.log("=".repeat(50));
}

run();
