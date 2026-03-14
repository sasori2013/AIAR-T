/**
 * fetch_trends.js - Future Lab Trend Analyzer (March 2026)
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

const { GEMINI_API_KEY } = process.env;

const SEARCH_RESULTS_CONTEXT = `
[Search Results Summary - March 2026]
- Trends: AI-Native Platforms, Physical AI ChatGPT moment, Cloud 3.0, Vibe Coding.
- Memes: 
  - Vibe Coding: Trusting AI too much, huge cloud bills.
  - "Is this programming in 2026?": AI-generated tech debt.
  - Stack Overflow: "Open-ended questions" redesign.
`;

async function getMemeConcepts() {
  // Using the now-stable gemini-2.5-flash model for March 2026
  const model = 'gemini-2.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
  
  const prompt = `
あなたはハイテクAR Tシャツブランド『AIAR-T』のクリエイティブディレクターです。
以下のトレンドを元に、エンジニアの心に刺さる「ミームTシャツ」のコンセプトを3案提案してください。

1. タイトル
2. 表面デザイン（短いテキストやコード）
3. AR演出（動画やアニメ）
4. ターゲット層

トレンド情報:
${SEARCH_RESULTS_CONTEXT}

日本語で、クールかつ少し皮肉なトーンで。エンジニアが「あ〜、わかるわ...」となるようなものを。
`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const r = await response.json();
    if (r.candidates) {
      console.log(r.candidates[0].content.parts[0].text);
    } else {
      console.error('API Error:', JSON.stringify(r));
    }
  } catch (err) {
    console.error('Network Error:', err.message);
  }
}

getMemeConcepts();
