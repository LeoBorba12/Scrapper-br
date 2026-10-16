import requests
from PIL import Image, ImageDraw, ImageFont, ImageFilter
from io import BytesIO
import os

print("Criando thumbnail de alto impacto...")

# 1. Baixar foto do Coliseu em alta resolução do Pixabay
api_key = '58064362-6755e43d7fe87fe0a4b4b0b5a'
r = requests.get('https://pixabay.com/api/', params={'key': api_key, 'q': 'Colosseum Rome sunset', 'image_type': 'photo', 'orientation': 'vertical', 'per_page': 3})
hits = r.json().get('hits', [])
img_url = hits[0].get('largeImageURL') if hits else None

if img_url:
    res = requests.get(img_url)
    base_img = Image.open(BytesIO(res.content)).convert('RGB')
else:
    base_img = Image.new('RGB', (1080, 1920), color=(20, 20, 25))

# Redimensionar e cortar para 1080x1920 (9:16)
base_img = base_img.resize((1080, int(1080 * base_img.height / base_img.width)), Image.Resampling.LANCZOS)
if base_img.height < 1920:
    base_img = base_img.resize((int(1920 * base_img.width / base_img.height), 1920), Image.Resampling.LANCZOS)

left = (base_img.width - 1080) // 2
top = (base_img.height - 1920) // 2
thumb = base_img.crop((left, top, left + 1080, top + 1920))

# 2. Aplicar degradê escuro (overlay) para destacar o texto
overlay = Image.new('RGBA', (1080, 1920), (0, 0, 0, 0))
draw_overlay = ImageDraw.Draw(overlay)

# Escurecer o topo e o meio
for y in range(1920):
    if y < 700:
        alpha = int(140 * (1 - y / 700)) + 60
    elif 700 <= y <= 1400:
        alpha = 150
    else:
        alpha = int(180 * ((y - 1400) / 520))
    draw_overlay.line([(0, y), (1080, y)], fill=(0, 0, 0, alpha))

thumb = Image.alpha_composite(thumb.convert('RGBA'), overlay).convert('RGB')
draw = ImageDraw.Draw(thumb)

# 3. Fontes
font_path = r"F:\pubs\MoneyPrinterTurbo\resource\fonts\BeVietnamPro-Bold.ttf"
try:
    font_badge = ImageFont.truetype(font_path, 40)
    font_main = ImageFont.truetype(font_path, 92)
    font_sub = ImageFont.truetype(font_path, 42)
except Exception:
    font_badge = font_main = font_sub = ImageFont.load_default()

# 4. Badge Superior "HISTÓRIA & ECONOMIA"
badge_text = "🏛️ HISTÓRIA & ECONOMIA"
badge_bbox = draw.textbbox((0, 0), badge_text, font=font_badge)
badge_w = badge_bbox[2] - badge_bbox[0]
badge_x = (1080 - badge_w) // 2
badge_y = 280

# Fundo arredondado do badge
draw.rounded_rectangle([badge_x - 30, badge_y - 12, badge_x + badge_w + 30, badge_y + 55], radius=25, fill=(245, 166, 35, 230))
draw.text((badge_x, badge_y), badge_text, font=font_badge, fill=(0, 0, 0))

# 5. Título Principal em 3 Linhas com Contorno Forte
lines = [
    ("COMO ROMA", "#FFFFFF"),
    ("DECIDIU O PIB", "#FFE600"),
    ("DA EUROPA?", "#FFE600")
]

start_y = 800
for text, color in lines:
    bbox = draw.textbbox((0, 0), text, font=font_main)
    w = bbox[2] - bbox[0]
    x = (1080 - w) // 2
    
    # Sombra/Borda preta espessa
    stroke_w = 6
    for sx in range(-stroke_w, stroke_w + 1):
        for sy in range(-stroke_w, stroke_w + 1):
            if sx != 0 or sy != 0:
                draw.text((x + sx, start_y + sy), text, font=font_main, fill=(0, 0, 0))
    
    # Texto colorido
    draw.text((x, start_y), text, font=font_main, fill=color)
    start_y += 125

# 6. Rodapé Chamativo (Pill)
sub_text = "A regra de 2.000 anos revelada por satélite"
sub_bbox = draw.textbbox((0, 0), sub_text, font=font_sub)
sub_w = sub_bbox[2] - sub_bbox[0]
sub_x = (1080 - sub_w) // 2
sub_y = 1550

draw.rounded_rectangle([sub_x - 25, sub_y - 15, sub_x + sub_w + 25, sub_y + 60], radius=20, fill=(0, 0, 0, 200), outline=(255, 230, 0), width=3)
draw.text((sub_x, sub_y), sub_text, font=font_sub, fill=(255, 255, 255))

# Salvar
out_path = r"f:\Antigravity_Projetos_e_Ferramentas\Guia profissional\thumb_roma_pib.png"
thumb.save(out_path, quality=95)
print(f"Thumbnail salva com sucesso em: {out_path}")
