# AIAR-T Design Portfolio & Production Standards (Spec 2.0)

本プロジェクトでは、1つの商品（UUID）に対して役割の異なる3つの画像を生成し、プレミアム価値と製造精度を両立させる。

## 1. 3-Layer Asset Production Strategy

| 役割 | 生成ツール | 用途 | ビジネス上の役割 |
| :--- | :--- | :--- | :--- |
| **1. 印刷用原版 (Master)** | `scripts/create_perfect_master.py` | Printful 直接入稿 | 製造の正確性と配置ミス排除 |
| **2. ブランド画像 (Vibe)** | `Imagen 4.0 Ultra` | Shopify / SNS 広告 | プレミアム価格を正当化するブランド価値 |
| **3. 実物確認用 (Mockup)** | `Printful Mockup API` | Shopify メイン画像 | クレームリスク（実物相違）の回避 |

---

## 2. 印刷用原版 (Master Design) 物理仕様 (Spec 2.3 Revised)
Python (Pillow) スクリプトにより、3000px（高品質と安定性のバランス）を強制する。

| Specification | Value | Note |
| :--- | :--- | :--- |
| Resolution | **3000 x 3000 px** | 安定性を考慮しつつ製造精度を保証 |
| Text Occupancy | **95% (2850px)** | 極限まで巨大化。左右余白 2.5% |
| QR Size | **600 x 600 px** | 3000px キャンバスに合わせて調整 |
| QR Adhesion | **100px** | テキスト最終行の直下に密着 |
| Background | 100% Transparent | Alpha 0 |
| Prohibition | **Imagen 使用禁止** | 配置崩れ・解像度不足を避けるため |

---

## 3. ブランド・イメージ画像 (Vibe Image) (Retina Optimized)
Imagen 4.0 Ultra を使用し、1024px から 1.5倍にスケールアップした **1536px 相当** の高精細出力を狙う。

**Prompt Strategy:**
- **Aesthetic**: "Hard Flash photography", "Street-luxury lookbook", "Paparazzi aesthetic".
- **Lighting**: "Harsh direct flash", "High contrast", "Deep sharp shadows".
- **Subject**: "Model wearing the white T-shirt with the '{meme_text}' text clearly visible".
- **Prohibition**: NO technical diagrams, NO arrows, NO dimensions. Pure visual vibe.

---

## 4. Visual QA Checklist
- [ ] **Master Check**: Python スクリプトで生成され、布の質感が混入していないか。
- [ ] **Vibe Check**: Imagen 4.0 Ultra により、高価格帯ブランドの風格が出ているか。
- [ ] **Mockup Check**: Printful 公式 API から取得した「実物」に近い画像か。
- [ ] **Sync Check**: Shopify の 3枚 の画像が、上記 1〜3 の順で並んでいるか。
