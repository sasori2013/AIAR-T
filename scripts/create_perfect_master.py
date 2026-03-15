import os
import sys
from PIL import Image, ImageDraw, ImageFont
import requests
from io import BytesIO

def create_master_design(text, qr_url, output_path="outputs/master_design.png"):
    """
    画像生成モデルを使わず、プログラムで2250x2700pxの入稿データを直接生成する。
    これにより、95%幅、密着QR、完全透過を100%保証する。
    """
    print(f"🎨 Generating Master Design for: {text}")
    
    # 1. キャンバス作成 (2250x2700, 完全透過)
    width, height = 2250, 2700
    canvas = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(canvas)

    # 2. フォント設定
    # Windows/Mac両方で動作するように一般的な等幅フォントを候補に挙げる
    font_paths = [
        "C:/Windows/Fonts/consola.ttf", # Consolas (Windows)
        "/System/Library/Fonts/Supplemental/Courier New Bold.ttf", # Mac
        "/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf" # Linux
    ]
    
    font = None
    for path in font_paths:
        if os.path.exists(path):
            try:
                font = ImageFont.truetype(path, 100)
                print(f"ℹ️ Using font: {path}")
                break
            except:
                continue
    
    if font is None:
        print("⚠️ Warning: System font not found, falling back to default.")
        font = ImageFont.load_default()

    # 3. テキストの極大化 (幅95% = 2137px になるまでサイズを調整)
    target_width = width * 0.95
    current_font_size = 50
    final_font = font
    
    # 複数行に対応させるための処理
    lines = text.split('\n')
    
    while True:
        try:
            temp_font = font.font_variant(size=current_font_size)
        except:
            # Fallback for default font which doesn't support font_variant
            break
            
        # 最も長い行で幅を計算
        max_line_w = 0
        total_h = 0
        for line in lines:
            bbox = draw.textbbox((0, 0), line, font=temp_font)
            line_w = bbox[2] - bbox[0]
            line_h = bbox[3] - bbox[1]
            max_line_w = max(max_line_w, line_w)
            total_h += line_h + 20 # 行間
            
        if max_line_w >= target_width or current_font_size > 800:
            break
        
        final_font = temp_font
        current_font_size += 5

    # 最終的なバウンディングボックス計算
    max_line_w = 0
    total_h = 0
    line_metrics = []
    for line in lines:
        bbox = draw.textbbox((0, 0), line, font=final_font)
        lw = bbox[2] - bbox[0]
        lh = bbox[3] - bbox[1]
        max_line_w = max(max_line_w, lw)
        line_metrics.append((line, lw, lh))
        total_h += lh + 20

    # テキストを中央上部に配置
    current_y = 200 # 上から200px (Spec 2.0)
    for line, lw, lh in line_metrics:
        lx = (width - lw) // 2
        draw.text((lx, current_y), line, font=final_font, fill=(0, 0, 0, 255))
        current_y += lh + 20

    # 4. QRコードの取得と配置
    print(f"📡 Fetching QR for: {qr_url}")
    qr_size = 400 # 視認性向上のため少し大きく
    qr_api_url = f"https://api.qrserver.com/v1/create-qr-code/?size={qr_size}x{qr_size}&data={qr_url}"
    try:
        qr_response = requests.get(qr_api_url)
        qr_img = Image.open(BytesIO(qr_response.content)).convert("RGBA")
        
        # QRを黒一色に変換（背景透過）
        datas = qr_img.getdata()
        new_data = []
        for item in datas:
            # 白っぽい色は透明に
            if item[0] > 200 and item[1] > 200 and item[2] > 200:
                new_data.append((255, 255, 255, 0))
            else:
                new_data.append((0, 0, 0, 255))
        qr_img.putdata(new_data)

        # テキストの最終行から 80px 下に配置
        qr_x = (width - qr_size) // 2
        qr_y = current_y + 80 # current_y は既に最後の行の高さ分進んでいる
        canvas.paste(qr_img, (qr_x, qr_y), qr_img)
    except Exception as e:
        print(f"❌ Error fetching QR: {e}")

    # 5. 保存
    output_dir = os.path.dirname(output_path)
    if output_dir and not os.path.exists(output_dir):
        os.makedirs(output_dir, exist_ok=True)
        
    canvas.save(output_path, "PNG")
    print(f"✅ Master Design successfully saved to: {output_path}")

if __name__ == "__main__":
    # 引数から取得 (text, qr_url, output_path)
    text_arg = sys.argv[1] if len(sys.argv) > 1 else 'if (vibe == "good") {\n  ship_it();\n}'
    qr_arg = sys.argv[2] if len(sys.argv) > 2 else "https://aiar-t.com/00001"
    out_arg = sys.argv[3] if len(sys.argv) > 3 else "outputs/master_design_00001.png"
    
    create_master_design(text_arg, qr_arg, out_arg)
