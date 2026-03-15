import os
import sys
import requests
import base64
import json
from PIL import Image
from io import BytesIO

def load_env():
    env_path = os.path.join(os.path.dirname(__file__), '../.env')
    if os.path.exists(env_path):
        with open(env_path, 'r') as f:
            for line in f:
                if '=' in line:
                    key, value = line.strip().split('=', 1)
                    os.environ[key] = value.replace('"', '').replace("'", "")

def generate_vibe_image(meme_text, output_path="outputs/vibe_image.png"):
    """
    Step 2: ブランドイメージ (Vibe Image) 生成
    1024pxから50%拡大した1536px相当の高精細出力を狙う (Imagen 4.0 Ultra).
    """
    load_env()
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("❌ Error: GEMINI_API_KEY not found in .env")
        return None

    # Spec 2.3 Model Benchmark
    model_id = "imagen-4.0-generate-001"
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_id}:predict?key={api_key}"
    
    # 50%拡大（1.5x）の品質を確保するためのプロンプト強化 (Spec 2.3)
    prompt = f"""
    Ultra-high resolution fashion photography, 1536px quality. 
    A professional model wearing a Bella + Canvas 3001 premium white T-shirt.
    The front features massive black monospace text: '{meme_text}'.
    A small square QR code is anchored perfectly below the text.
    Style: Hard flash, high contrast, paparazzi aesthetic.
    Sharp focus on premium fabric weave and ink texture. 
    1:1 square composition, high-end commercial look.
    """
    
    print(f"📡 Generating Vibe Image (HD Optimized) for: {meme_text}")
    
    payload = {
        "instances": [{"prompt": prompt}], 
        "parameters": {
            "sampleCount": 1,
            # Current API typically supports 1:1, 3:4, etc. 
            # We'll use 1:1 and rely on high-quality prompt for 1.5x perceived quality.
        }
    }
    
    try:
        res = requests.post(url, json=payload)
        if res.status_code == 200:
            data = res.json()
            if 'predictions' in data and len(data['predictions']) > 0:
                img_b64 = data['predictions'][0]['bytesBase64Encoded']
                
                os.makedirs(os.path.dirname(output_path), exist_ok=True)
                with open(output_path, "wb") as f:
                    f.write(base64.b64decode(img_b64))
                
                print(f"✅ Vibe Image Generated Successfully: {output_path}")
                return output_path
            else:
                print(f"❌ Error: No predictions in response. {json.dumps(data)}")
        else:
            print(f"❌ Error: API Status {res.status_code}. {res.text}")
    except Exception as e:
        print(f"❌ Exception during Vibe Image generation: {e}")
        
    return None

if __name__ == "__main__":
    text_arg = sys.argv[1] if len(sys.argv) > 1 else 'if (vibe == "good") {\n  ship_it();\n}'
    out_arg = sys.argv[2] if len(sys.argv) > 2 else "outputs/vibe_image_v2_3.png"
    
    generate_vibe_image(text_arg, out_arg)
