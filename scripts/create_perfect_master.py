import os
import sys
from PIL import Image, ImageDraw, ImageFont
import requests
from io import BytesIO

# ==========================================
# 1. 物理仕様定義 (Spec 2.3 Revised - Stability Optimized)
# ==========================================
CANVAS_SIZE = 3000      # 印刷用：安定性と品質のバランス（3000px）
TEXT_WIDTH_RATIO = 0.95
QR_SIZE = 600
QR_GAP = 100
FONT_PATHS = [
    "C:/Windows/Fonts/consola.ttf", # Consolas (Windows)
    "/System/Library/Fonts/Supplemental/Courier New Bold.ttf", # Mac
    "/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf" # Linux
]

def create_master_design(text, qr_url, output_path="outputs/master_design.png"):
    """
    Step 1: 印刷原版 (Master Design) 生成
    4500pxの巨大キャンバスで製造精度を100%保証。
    """
    print(f"🎨 Generating Master Design (Spec 2.3) for: {text}")
    
    # 1. キャンバス作成 (4500x4500, 完全透過)
    canvas = Image.new('RGBA', (CANVAS_SIZE, CANVAS_SIZE), (0, 0, 0, 0))
    draw = ImageDraw.Draw(canvas)

    # 2. フォント設定
    font = None
    for path in FONT_PATHS:
        if os.path.exists(path):
            try:
                font = ImageFont.truetype(path, 400)
                print(f"ℹ️ Using font: {path}")
                break
            except:
                continue
    
    if font is None:
        print("⚠️ Warning: System font not found, falling back to default.")
        font = ImageFont.load_default()

    # 3. テキストの極大化 (幅95% = 4275px になるまでサイズを調整)
    target_width = CANVAS_SIZE * TEXT_WIDTH_RATIO
    current_font_size = 100
    final_font = font
    
    lines = text.split('\n')
    
    while True:
        try:
            temp_font = font.font_variant(size=current_font_size)
        except:
            break
            
        max_line_w = 0
        for line in lines:
            bbox = draw.textbbox((0, 0), line, font=temp_font)
            line_w = bbox[2] - bbox[0]
            max_line_w = max(max_line_w, line_w)
            
        if max_line_w >= target_width or current_font_size > 1500:
            break
        
        final_font = temp_font
        current_font_size += 10

    # 4. 描画位置の計算
    line_metrics = []
    total_text_h = 0
    for line in lines:
        bbox = draw.textbbox((0, 0), line, font=final_font)
        lw, lh = bbox[2] - bbox[0], bbox[3] - bbox[1]
        line_metrics.append((line, lw, lh))
        total_text_h += lh + 40 # 行間も拡大

    current_y = 250 # 上から250px (Spec 2.3)
    for line, lw, lh in line_metrics:
        lx = (CANVAS_SIZE - lw) // 2
        draw.text((lx, current_y), line, font=final_font, fill=(0, 0, 0, 255))
        current_y += lh + 40

    # 5. QRコードの取得と配置
    print(f"📡 Fetching QR for: {qr_url}")
    qr_api_url = f"https://api.qrserver.com/v1/create-qr-code/?size={QR_SIZE}x{QR_SIZE}&data={qr_url}"
    try:
        qr_response = requests.get(qr_api_url)
        qr_img = Image.open(BytesIO(qr_response.content)).convert("RGBA")
        
        datas = qr_img.getdata()
        new_data = [(255, 255, 255, 0) if d[0]>200 else (0,0,0,255) for d in datas]
        qr_img.putdata(new_data)

        qx, qy = (CANVAS_SIZE - QR_SIZE) // 2, current_y + QR_GAP
        canvas.paste(qr_img, (qx, qy), qr_img)
    except Exception as e:
        print(f"❌ Error fetching QR: {e}")

    # 6. 保存
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    canvas.save(output_path, "PNG")
    print(f"✅ Master Design successfully saved (Spec 2.3): {output_path}")

if __name__ == "__main__":
    text_arg = sys.argv[1] if len(sys.argv) > 1 else 'if (vibe == "good") {\n  ship_it();\n}'
    qr_arg = sys.argv[2] if len(sys.argv) > 2 else "https://aiar-t.com/v/vibe-coder"
    out_arg = sys.argv[3] if len(sys.argv) > 3 else "outputs/master_design_v2_3.png"
    
    create_master_design(text_arg, qr_arg, out_arg)

if __name__ == "__main__":
    # 引数から取得 (text, qr_url, output_path)
    text_arg = sys.argv[1] if len(sys.argv) > 1 else 'if (vibe == "good") {\n  ship_it();\n}'
    qr_arg = sys.argv[2] if len(sys.argv) > 2 else "https://aiar-t.com/00001"
    out_arg = sys.argv[3] if len(sys.argv) > 3 else "outputs/master_design_00001.png"
    
    create_master_design(text_arg, qr_arg, out_arg)
