import sys
import os

# Set UTF-8
sys.stdout.reconfigure(encoding='utf-8')
sys.stderr.reconfigure(encoding='utf-8')

sys.path.insert(0, r"F:\pubs\MoneyPrinterTurbo")
os.chdir(r"F:\pubs\MoneyPrinterTurbo")

from cli import run_cli, parse_args

script_text = (
    "Você sabia que a riqueza das cidades mais ricas da Europa foi decidida há dois mil anos por soldados romanos? "
    "Quando o Império Romano construiu oitenta mil quilômetros de estradas de pedra para mover suas legiões, eles desenharam o mapa econômico moderno. "
    "Pesquisadores compararam mapas de satélite com antigas rotas romanas e confirmaram: os pontos exatos onde havia entroncamentos militares romanos há dois mil anos são hoje os centros com o maior PIB per capita e maior concentração de indústrias da Europa. "
    "Em economia, isso se chama dependência de trajetória. Infraestrutura atrai comércio, que atrai cidades e inovação por séculos. "
    "Roma caiu há mil e quinhentos anos, mas suas pedras ainda sustentam a riqueza do continente."
)

cli_args = [
    "--video-subject", "As Estradas de Roma Antiga e o PIB Europeu",
    "--video-script", script_text,
    "--voice-name", "pt-BR-AntonioNeural",
    "--video-aspect", "9:16",
    "--video-source", "pixabay",
    "--video-terms", "Ancient Rome,Roman ruins,Colosseum Rome,Rome Italy,antique stone road,Roman architecture",
    "--font-name", "BeVietnamPro-Bold.ttf",
    "--font-size", "75",
    "--text-fore-color", "#FFFF00",
    "--stroke-color", "#000000",
    "--stroke-width", "3.5",
    "--subtitle-position", "two_thirds_bottom",
    "--subtitle-display-mode", "word_by_word",
    "--subtitle-animation", "pop_spring",
    "--bgm-type", "random",
    "--bgm-volume", "0.15"
]

print("Iniciando geração do vídeo com legendas dinâmicas e imagens da Roma Antiga...")
exit_code = run_cli(cli_args)
print(f"Finalizado com código: {exit_code}")
