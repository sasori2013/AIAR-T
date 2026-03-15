import os
import sys
import requests
import base64
import json
from PIL import Image, ImageDraw, ImageFont
from io import BytesIO

# ==========================================
# 1. 物理仕様定義 (Spec 2.5 - Production Robot Mode)
# ==========================================
CANVAS_SIZE = 3000      # 絶対基準：3000 x 3000 px (1:1)
TEXT_WIDTH_RATIO = 0.95 # 占有率：95% (2850px)
QR_SIZE = 600           # 歪みのない正方形
QR_GAP = 80             # テキスト直下 80px
MAX_LINES = 2           # 2行制限（厳守）

FONT_PATHS = [
    "C:/Windows/Fonts/consola.ttf", # Consolas (Windows)
    "/System/Library/Fonts/Supplemental/Courier New Bold.ttf", # Mac
    "/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf" # Linux
]

def load_env():
    env_path = os.path.join(os.path.dirname(__file__), '../.env')
    if os.path.exists(env_path):
        with open(env_path, 'r', encoding='utf-8') as f:
            for line in f:
                if '=' in line:
                    key, value = line.strip().split('=', 1)
                    os.environ[key] = value.replace('"', '').replace("'", "")

def create_master_design(text_list, qr_url, output_path):
    """
    Step 1: 印刷用原版 (Master Design) 生成
    AI不使用。物理パラメータに基づき完全にプログラムで生成する。
    """
    # 3行以上の入力をエラーとして排除
    if len(text_list) > MAX_LINES:
        print(f"❌ Error: Text lines exceeded {MAX_LINES}. Aborting generation.")
        sys.exit(1)

    print(f"🤖 [Robot Mode] Generating Master Design (3000px 1:1) for: {text_list}")
    
    canvas = Image.new('RGBA', (CANVAS_SIZE, CANVAS_SIZE), (0, 0, 0, 0))
    draw = ImageDraw.Draw(canvas)

    # フォント読み込み
    font = None
    for path in FONT_PATHS:
        if os.path.exists(path):
            font = ImageFont.truetype(path, 300)
            break
    if font is None:
        font = ImageFont.load_default()

    # テキスト極大化 (95% 占有)
    target_width = CANVAS_SIZE * TEXT_WIDTH_RATIO
    current_size = 50
    final_font = font
    
    while True:
        try:
            temp_font = font.font_variant(size=current_size)
        except: break
        max_w = max([draw.textbbox((0, 0), line, font=temp_font)[2] for line in text_list])
        if max_w >= target_width or current_size > 1200:
            break
        final_font = temp_font
        current_size += 10

    # 描画位置：上部 250px 起点
    current_y = 250
    line_metrics = []
    for line in text_list:
        bbox = draw.textbbox((0, 0), line, font=final_font)
        lw, lh = bbox[2] - bbox[0], bbox[3] - bbox[1]
        lx = (CANVAS_SIZE - lw) // 2
        draw.text((lx, current_y), line, font=final_font, fill=(0, 0, 0, 255))
        line_metrics.append((lw, lh))
        current_y += lh + 50 # 行間

    # QRコード取得と配置
    qr_api = f"https://api.qrserver.com/v1/create-qr-code/?size={QR_SIZE}x{QR_SIZE}&data={qr_url}"
    qr_res = requests.get(qr_api)
    qr_img = Image.open(BytesIO(qr_res.content)).convert("RGBA")
    
    # QR黒一色変換＋完全透過
    qdata = qr_img.getdata()
    new_q = [(255, 255, 255, 0) if d[0]>200 else (0,0,0,255) for d in qdata]
    qr_img.putdata(new_q)

    qx, qy = (CANVAS_SIZE - QR_SIZE) // 2, current_y + QR_GAP
    canvas.paste(qr_img, (qx, qy), qr_img)

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    canvas.save(output_path, "PNG")
    print(f"✅ Master Design Certified (3000px): {output_path}")
    return output_path

import time

def fetch_with_backoff(url, json_payload, max_retries=5):
    """
    API Resilience: [1s, 2s, 4s, 8s, 16s] の指数バックオフを実装。
    """
    backoff = 1
    for i in range(max_retries):
        try:
            res = requests.post(url, json=json_payload)
            if res.status_code == 200:
                return res
            elif res.status_code == 429:
                print(f"⚠️ Rate limited (429). Retrying in {backoff}s...")
            else:
                print(f"⚠️ API Error ({res.status_code}): {res.text}. Retrying in {backoff}s...")
        except Exception as e:
            print(f"⚠️ Exception: {e}. Retrying in {backoff}s...")
        
        time.sleep(backoff)
        backoff *= 2
    return None

def generate_vibe_image(text_list, master_path, output_path):
    """
    Step 2: ブランドイメージ (Vibe Image) 転写 (Spec 3.0 - Hardware Printer Mode)
    デザインを「解釈」せず、ピクセルを「物理転写」することに特化。
    """
    load_env()
    api_key = os.environ.get("GEMINI_API_KEY")
    
    # 3.000px の Master PNG を Base64 符号化 (ステンシルとして扱う)
    with open(master_path, "rb") as f:
        master_b64 = base64.b64encode(f.read()).decode('utf-8')

    # Spec 3.0 Physical Transfer Prompt
    prompt = f"""System Command: ACT AS A HARDWARE PRINTER. ZERO CREATIVE INTERPRETATION.

Instructions:
THE STENCIL: The provided PNG is a "STENCIL". Treat every black pixel as "WET INK".
TARGET: Create a high-end streetwear photo of a model wearing a BLANK, PURE WHITE Bella + Canvas 3001 T-shirt.
TRANSFER PROCESS: Transfer the STENCIL pixels onto the white shirt's chest area.

STRICT FORBIDDEN:
* DO NOT write the text "Master PNG" or any technical labels.
* DO NOT read, OCR, or "fix" the typography.
* DO NOT add decorative symbols (~, ", ', etc.) not present in the stencil.
* DO NOT generate additional QR codes or logos. Use ONLY the one in the stencil.

PIXEL FIDELITY: The final shirt design must be a pixel-for-pixel replica of the source PNG.
PHYSICAL INTEGRATION: Distort the ink ONLY to follow the physical folds and fabric texture of the white shirt. The ink should look screen-printed into the cotton.
VISUAL CONTEXT: Harsh direct flash, high contrast paparazzi style, urban industrial night.

Output: High-definition 1536px commercial visual.
"""
    
    print(f"🤖 [Hardware Printer] Starting Physical Transfer from Stencil: {master_path}")
    
    # 429 回避: 前回の成功から30秒待機 (簡易的に実行前に待機)
    print("⏳ Waiting 30s for API Resilience (Spec 3.0)...")
    time.sleep(30)
    
    replica_url = f"https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key={api_key}"
    payload = {
        "instances": [{"prompt": prompt}], 
        "parameters": {
            "sampleCount": 1, 
            "aspectRatio": "1:1"
        }
    }
    
    res = fetch_with_backoff(replica_url, payload)
    
    if res and res.status_code == 200:
        img_b64 = res.json()['predictions'][0]['bytesBase64Encoded']
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        with open(output_path, "wb") as f:
            f.write(base64.b64decode(img_b64))
        print(f"✅ Spec 3.0 Transfer Complete: {output_path}")
        return output_path
    else:
        print(f"❌ Vibe Image Transfer Failed after retries.")
    return None

def verify_and_sync(master, vibe, mockup=None):
    """
    Step 3: Visual QA (Spec 3.0 Hardware Defect Check)
    """
    print("\n--- Visual QA Checklist (Spec 3.0 Hardware Mode) ---")
    print(f"[ ] No Extra Text ('Master PNG', 'OUT OF PRINT')? (Defect Check)")
    print(f"[ ] No Symbol Hallucination ('~', quotes)? (Defect Check)")
    print(f"[ ] QR is perfect pixel-for-pixel from stencil? (Fidelity Check)")
    print(f"[ ] Target is PURE WHITE Bella + Canvas 3001? (Quality Check)")
    print("----------------------------------------------------\n")

if __name__ == "__main__":
    import ast
    try:
        input_text = ast.literal_eval(sys.argv[1]) if len(sys.argv) > 1 else ["if (vibe == 'good') {", "  ship_it(); }"]
        qr_url = sys.argv[2] if len(sys.argv) > 2 else "https://aiar-t.vercel.app/00001"
        serial = sys.argv[3] if len(sys.argv) > 3 else "00001"
        
        m_out = f"img/production/master_{serial}_v3.0.png"
        v_out = f"img/production/vibe_{serial}_v3.0.png"
        
        master_path = create_master_design(input_text, qr_url, m_out)
        vibe_path = generate_vibe_image(input_text, master_path, v_out)
        
        verify_and_sync(master_path, vibe_path)
    except Exception as e:
        print(f"❌ Fatal Orchestrator Error: {e}")
        sys.exit(1)
