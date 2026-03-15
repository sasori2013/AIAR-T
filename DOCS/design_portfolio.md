# AIAR-T Design Portfolio & Production Standards

## 1. Master Spec 1.0 (Physical Production)
These values are hardcoded in `scripts/composite_design.js` and MUST NOT be changed without explicit USER authorization.

| Specification | Value | Note |
| :--- | :--- | :--- |
| Resolution | 2250 x 2700 px | Printful 15x18 Guideline |
| Design Block | Top 30% (810px) | Concentrated high-impact chest area |
| Dead Zone | Bottom 70% (1890px) | ABSOLUTE VOID (Empty/Transparent) |
| Text Occupancy | 95% (2137px) | Edge-to-Edge (2.5% Margins) |
| QR Adhesion | Exactly 50px | Tightly snapped monolith unit |
| Background | 100% Transparent | Alpha 0 |
| Prohibition | NO Mockups | NO fabric, NO shadows, NO humans |

## 2. AI Generation Strategy (Imagen 4.0)

### For Master Design (Master PNG Only)
**Extreme Monolith Prompt:**
"A flat, 2D minimalist black graphic for screen printing. Transparent background. The black text '{meme_text}' in bold monospace font MUST span 95% of the 2250px canvas width, stretching edge-to-edge. Directly below the center of the text, a small black QR code is placed with a tiny 50-pixel gap. The entire design is strictly located at the top 30% of the 2250x2700px canvas. The bottom 70% of the image is empty and transparent. NO t-shirt, NO clothing, NO mockup, NO human, NO shadows. High-contrast vector style."

### For Brand/Vibe Images
> [!IMPORTANT]
> Description: "Hard Flash photography", "Street-luxury lookbook", "Paparazzi aesthetic".
> Lighting: "Harsh direct flash", "High contrast with deep sharp shadows".
> Prohibition: NO arrows, NO dimensions, NO technical diagrams.

### For Text-to-SVG/PNG Generation
**Strict Prompt Template:**
"Monolithic typographic design for a premium white T-shirt. The text '{meme_text}' must be EXTREMELY OVERSIZED, filling exactly 95% of the 2250px width. Bold JetBrains Mono font. A sharp, high-contrast black QR code is placed tightly 80 pixels directly below the center of the text. NO EXTRA MARGINS. The design occupies the upper-center of the 2250x2700px transparent canvas. Pure black ink on transparent background."

## 3. Visual QA Checklist
All products MUST pass these checks before Shopify update:
- [ ] **Width Verification**: Text spans tightly to canvas edges (margins < 5%).
- [ ] **Distance Verification**: QR code is integrated unit (Gap 50-80px).
- [ ] **Content Verification**: Font is JetBrains Mono, BG is Transparent.
- [ ] **Aesthetic Verification**: Hard Flash lifestyle (No technical diagrams).
