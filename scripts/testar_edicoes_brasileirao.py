import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from scripts.scraper_ogol_estaduais import obter_edicoes_estaduais

edicoes = obter_edicoes_estaduais(
    "brasileirao", 
    "https://www.ogol.com.br/competicao/brasileirao/3"
)
print(f"Total de edições de Brasileirão: {len(edicoes)}")
ed_dict = {ano: eid for ano, eid in edicoes}
for ano in range(2003, 2014):
    print(f"Brasileirão {ano}: Edição ID = {ed_dict.get(ano)}")
