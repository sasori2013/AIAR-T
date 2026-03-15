# AIAR-T Design Portfolio & Production Standards (Spec 2.7)

> [!IMPORTANT]
> **エージェント動作モード: 忠実な生産ライン**
> デザインの根拠は常に Master PNG に置くこと。独創性を排し、Master データの視覚的完全性を維持せよ。

---

## 1. 印刷用原版 (Master Design) 絶対ルール
`scripts/production_orchestrator.py` を使用し、以下の数値を強制する。

| Specification | Value | Note |
| :--- | :--- | :--- |
| Resolution | **3000 x 3000 px** | 1:1 正方形。絶対基準。 |
| Text Input | **2-line List Only** | 3行以上、または1行のみを厳禁とする。 |
| Text Occupancy | **95% (2850px)** | 最大幅をキャンバス幅の 95% に固定。 |
| QR Size | **600 x 600 px** | 歪みのない正方形を維持。 |
| QR Adhesion | **80px** | テキスト最終行の直下に密着。 |
| Background | 100% Transparent | Tシャツの形状や装飾を描写しない。 |

---

## 2. ブランド・イメージ画像 (Vibe Image) 絶対ルール
`gemini-2.5-flash-image-preview` 等を使用し、**Master PNG をソースとする画像編集**を実行する。Imagen 4.0 による新規生成はハルシネーション防止のため禁止。

**Prompt Requirements:**
- **Source-Based**: 必ず Step 1 で生成した Master PNG を入力データとして参照させる。
- **Core Instruction**: "Apply this design onto a model's shirt. DO NOT ALTER font, lines, or symbols."
- **Prohibition**: 文字の下線、波線（〜）、ドット、影、引用符の勝手な追加を厳禁とする。
- **Style**: "Hard flash, paparazzi style, industrial background."
- **Resolution**: **1536px** (Retina/Web Optimized).

---

## 3. Error Handling & Visual QA
以下の事象が確認された場合、即座にアセットを破棄し再生成せよ。

1. **デザインのズレ**: Master PNG と Vibe 画像の間で、改行位置や文字の形状が1ミリでも異なる場合。
2. **装飾の混入**: 意図しない波線（〜）やドット、エフェクトの追加。
3. **低解像度感**: 合成結果がボケている、または不自然に浮いている。

**Visual QA Checklist:**
- [ ] Master PNG と Vibe 画像の文字配置が 100% 重なるか？
- [ ] QRコードは正方形であり、読み取り可能か？
- [ ] Vibe 画像に「〜」などの余計なノイズが入っていないか？
