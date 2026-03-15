# AIAR-T Design Portfolio & Production Standards (Spec 3.0)

> [!IMPORTANT]
> **エージェント動作モード: 高精度物理転写印刷機 (Hardware Printer Mode)**
> デザインの「解釈」を停止せよ。Master PNG は「変更不可能な絶対的図面」であり、ピクセル単位での物理転写のみを許可する。

---

## 1. 印刷用原版 (Master Design) 物理仕様
`scripts/production_orchestrator.py` により、以下の機械的定数を死守する。

| Specification | Value | Note |
| :--- | :--- | :--- |
| Resolution | **3000 x 3000 px** | 1:1 正方形。全視覚アセットの根拠。 |
| Background | 100% Transparent | アルファチャンネル 0 固定。 |
| Text Occupancy | **95% (2850px)** | デジタル図面に基づく配置。 |
| QR Position | **80px Below Text** | テキスト最終行の直下に物理吸着。 |

---

## 2. ブランド画像 (Vibe Image) 転写ルール
Vibe画像生成を「画像編集（編集・転写）」と定義し、創作を禁止する。

**System Command:** `ACT AS A HARDWARE PRINTER. ZERO CREATIVE INTERPRETATION.`

| Rule | Requirement |
| :--- | :--- |
| **STENCIL** | Master PNG を「図案（ステンシル）」として扱う。 |
| **WET INK** | 黒ピクセルを「濡れたインク」として白Tシャツに転写する。 |
| **TARGET** | **PURE WHITE Bella + Canvas 3001** T-shirt のみを使用。 |
| **PROHIBITION** | OCR、文字の修正、"Master PNG"等のラベル追加を厳選。 |
| **FIDELITY** | ピクセル単位での複製。下線や「〜」の勝手な追加は不良品。 |
| **INTEGRATION** | 布のシワや質感に従った自然な歪みのみを許容。 |

---

## 3. Visual QA (即時破棄基準)
以下の項目が1つでも該当する場合、そのロットは「欠陥品」として即座に破棄し、再生成すること。

1.  **Extra Text**: "Master PNG" や "OUT OF PRINT" 等の、原版にない文字が1文字でも見える。
2.  **Symbol Hallucination**: 原版にない「〜」や引用符、ドットが追加されている。
3.  **QR Corruption**: QRコードが正方形ではない、またはデザインが原版と異なる。
4.  **Color Failure**: **PURE WHITE** 以外の色が選ばれている。

---

## 4. API Resilience (耐障害性)
- **429 回避**: リクエスト成功ごとに 30秒 の強制待ち時間を維持。
- **Exponential Backoff**: [1s, 2s, 4s, 8s, 16s] の再試行ロジックを fetch 処理に組み込む。
