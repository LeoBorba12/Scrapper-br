import sys
import os

# Set UTF-8
sys.stdout.reconfigure(encoding='utf-8')
sys.stderr.reconfigure(encoding='utf-8')

sys.path.insert(0, r"F:\pubs\MoneyPrinterTurbo")
os.chdir(r"F:\pubs\MoneyPrinterTurbo")

from cli import run_cli

# Roteiro otimizado para retenção máxima (Gancho nos primeiros 3s + Loop Infinito no final)
script_text = (
    "Soldados de sandálias decidiram o PIB da Europa há dois mil anos. E a prova disso está nos satélites de hoje! "
    "Quando o Império Romano construiu oitenta mil quilômetros de estradas de pedra para mover suas legiões, eles desenharam sem querer o mapa econômico do século vinte e um. "
    "Pesquisadores compararam dados de satélite com as antigas rotas e descobriram algo impressionante: os entroncamentos militares romanos são hoje as regiões com o maior PIB per capita e maior concentração de indústrias da Europa. "
    "Em economia, chamamos isso de dependência de trajetória. Infraestrutura atrai comércio, que atrai cidades e gera riqueza contínua por séculos. "
    "Roma caiu há mil e quinhentos anos, mas suas pedras ainda pagam as contas do continente. E é exatamente por isso que..."
)

cli_args = [
    "--video-subject", "Como Roma Antiga Decidiu o PIB Europeu",
    "--video-script", script_text,
    "--voice-name", "pt-BR-AntonioNeural",
    "--video-aspect", "9:16",
    "--video-source", "pixabay",
    "--video-terms", "Ancient Rome,Colosseum Rome,Roman ruins,Pantheon Rome,antique stone road,Roman architecture",
    "--font-name", "BeVietnamPro-Bold.ttf",
    "--font-size", "95",                     # Fonte GIGANTE (tamanho 95) para leitura instantânea no mobile
    "--text-fore-color", "#FFE600",           # Amarelo Ouro de alta conversão
    "--stroke-color", "#000000",              # Borda preta
    "--stroke-width", "4.0",                  # Contorno espesso para alto contraste
    "--subtitle-position", "two_thirds_bottom",
    "--subtitle-display-mode", "word_by_word",# Palavra por palavra
    "--subtitle-animation", "pop_spring",     # Efeito mola/salto
    "--bgm-type", "random",
    "--bgm-volume", "0.15"
]

print("Iniciando renderização da versão definitiva V3 (Fonte 95 + Gancho + Roma Antiga)...")
exit_code = run_cli(cli_args)
print(f"Finalizado com código: {exit_code}")
