import requests
from PIL import Image, ImageDraw, ImageFont
import os

print("Gerando Card Visual para o Tweet...")

# Dimensões ideais para feed do Twitter/X: 1200 x 675 (16:9 widescreen)
width = 1200
height = 675
img = Image.new('RGB', (width, height), color=(11, 11, 14))
draw = ImageDraw.Draw(img)

# Fundo sutil com gradiente/degradê e divisórias
for y in range(height):
    alpha = int(25 * (y / height))
    draw.line([(0, y), (width, y)], fill=(11 + alpha, 11 + alpha, 18 + alpha))

# Moldura sutil estilo design.md
draw.rounded_rectangle([20, 20, width - 20, height - 20], radius=24, outline=(45, 45, 55), width=2)

# Carregar fonte
font_path = r"F:\pubs\MoneyPrinterTurbo\resource\fonts\BeVietnamPro-Bold.ttf"
try:
    font_badge = ImageFont.truetype(font_path, 20)
    font_title = ImageFont.truetype(font_path, 46)
    font_big_stat = ImageFont.truetype(font_path, 80)
    font_label = ImageFont.truetype(font_path, 24)
    font_sub = ImageFont.truetype(font_path, 22)
    font_footer = ImageFont.truetype(font_path, 18)
except Exception:
    font_badge = font_title = font_big_stat = font_label = font_sub = font_footer = ImageFont.load_default()

# 1. Badge Superior
badge_text = "⚽ DATA & FOOTBALL LAB | BRASILEIRÃO 2015-2024"
draw.rounded_rectangle([50, 45, 520, 85], radius=15, fill=(28, 28, 38), outline=(60, 60, 75), width=1)
draw.text((65, 52), badge_text, font=font_badge, fill=(200, 255, 0)) # Verde limão

# 2. Título Provocador
title_text = "O Corinthians em Itaquera é 'alérgico' ao calor?"
draw.text((50, 110), title_text, font=font_title, fill=(255, 255, 255))
sub_title = "Cruzamento de 10 anos de dados com satélite meteorológico da Open-Meteo"
draw.text((50, 175), sub_title, font=font_sub, fill=(150, 150, 165))

# 3. Dois Blocos de Métricas (Frio vs Calor)
# Bloco 1: Frio (Azul Gelado)
card1_x1, card1_y1, card1_x2, card1_y2 = 50, 230, 570, 540
draw.rounded_rectangle([card1_x1, card1_y1, card1_x2, card1_y2], radius=20, fill=(18, 24, 38), outline=(50, 80, 130), width=2)

draw.text((card1_x1 + 30, card1_y1 + 25), "❄️ NO FRIO PAULISTANO (<= 21°C)", font=font_label, fill=(120, 180, 255))
draw.text((card1_x1 + 30, card1_y1 + 80), "62.3%", font=font_big_stat, fill=(255, 255, 255))
draw.text((card1_x1 + 30, card1_y1 + 195), "Taxa de Vitórias em 53 Jogos", font=font_sub, fill=(160, 190, 225))
draw.text((card1_x1 + 30, card1_y1 + 235), "Aproveitamento de time campeão", font=font_badge, fill=(70, 210, 120))

# Bloco 2: Calor (Laranja/Vermelho)
card2_x1, card2_y1, card2_x2, card2_y2 = 630, 230, 1150, 540
draw.rounded_rectangle([card2_x1, card2_y1, card2_x2, card2_y2], radius=20, fill=(35, 20, 20), outline=(130, 60, 60), width=2)

draw.text((card2_x1 + 30, card2_y1 + 25), "🔥 NO CALOR PAULISTANO (>= 28°C)", font=font_label, fill=(255, 130, 100))
draw.text((card2_x1 + 30, card2_y1 + 80), "47.4%", font=font_big_stat, fill=(255, 100, 100))
draw.text((card2_x1 + 30, card2_y1 + 195), "Taxa de Vitórias em 38 Jogos", font=font_sub, fill=(225, 170, 160))
draw.text((card2_x1 + 30, card2_y1 + 235), "Queda brusca de 15 pontos percentuais!", font=font_badge, fill=(255, 80, 80))

# 4. Rodapé
footer_text = "Fonte: Base Oficial do Brasileirão 2015-2024 & Open-Meteo Historical Weather API"
draw.text((50, 595), footer_text, font=font_footer, fill=(100, 100, 115))
brand_text = "@FutebolEmDados"
draw.text((1000, 595), brand_text, font=font_footer, fill=(200, 255, 0))

# Salvar
out_path = r"f:\Antigravity_Projetos_e_Ferramentas\Guia profissional\card_corinthians_clima.png"
img.save(out_path, quality=95)
print(f"Card salvo em: {out_path}")
