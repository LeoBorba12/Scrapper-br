import urllib.request
import re

base_url = "https://www.campeoesdofutebol.com.br/"

# List of known confrontation files on campeoesdofutebol
candidates = [
    # Clássicos SP
    "confrontos_corinthians_palmeiras.html",
    "confrontos_corinthians_saopaulo.html",
    "confrontos_corinthians_santos.html",
    "confrontos_palmeiras_saopaulo.html",
    "confrontos_palmeiras_santos.html",
    "confrontos_saopaulo_santos.html",
    "confrontos_corinthians_pontepreta.html",
    "confrontos_corinthians_guarani.html",
    "confrontos_derby_campineiro.html",
    
    # Clássicos RJ
    "confrontos_flamengo_fluminense.html",
    "confrontos_flamengo_vasco.html",
    "confrontos_flamengo_botafogo.html",
    "confrontos_fluminense_vasco.html",
    "confrontos_fluminense_botafogo.html",
    "confrontos_botafogo_vasco.html",
    "confrontos_flamengo_americarj.html",
    
    # Clássicos MG
    "confrontos_atleticomg_cruzeiro.html",
    "confrontos_atleticomg_americamg.html",
    "confrontos_cruzeiro_americamg.html",
    
    # Clássicos RS
    "confrontos_grenais.html",
    "confrontos_grenais2.html",
    "confrontos_grenais3.html",
    "confrontos_grenais4.html",
    "confrontos_grenais5.html",
    "confrontos_juventude_caxias.html",
    
    # Clássicos PR & SC
    "confrontos_atleticopr_coritiba.html",
    "confrontos_atleticopr_parana.html",
    "confrontos_coritiba_parana.html",
    "confrontos_avai_figueirense.html",
    "confrontos_criciuma_joinville.html",
    
    # Clássicos Nordeste & Centro-Oeste
    "confrontos_bahia_vitoria.html",
    "confrontos_ceara_fortaleza.html",
    "confrontos_sport_nautico.html",
    "confrontos_sport_santacruz.html",
    "confrontos_nautico_santacruz.html",
    "confrontos_goias_vilanova.html",
    "confrontos_goias_atleticogo.html",
    
    # Interestaduais clássicos
    "confrontos_flamengo_palmeiras.html",
    "confrontos_flamengo_corinthians.html",
    "confrontos_flamengo_saopaulo.html",
    "confrontos_flamengo_gremio.html",
    "confrontos_flamengo_internacional.html",
    "confrontos_flamengo_atleticomg.html",
    "confrontos_flamengo_cruzeiro.html",
    "confrontos_corinthians_internacional.html",
    "confrontos_corinthians_gremio.html",
    "confrontos_palmeiras_cruzeiro.html",
    "confrontos_palmeiras_gremio.html",
    "confrontos_palmeiras_internacional.html",
    "confrontos_saopaulo_cruzeiro.html",
    "confrontos_saopaulo_gremio.html",
    "confrontos_saopaulo_internacional.html",
    "confrontos_vasco_cruzeiro.html",
    "confrontos_vasco_corinthians.html",
    "confrontos_vasco_palmeiras.html",
    "confrontos_vasco_saopaulo.html",
    "confrontos_botafogo_corinthians.html",
    "confrontos_botafogo_palmeiras.html",
    "confrontos_botafogo_saopaulo.html",
    "confrontos_botafogo_santos.html",
    "confrontos_fluminense_corinthians.html",
    "confrontos_fluminense_palmeiras.html",
    "confrontos_fluminense_saopaulo.html",
    "confrontos_fluminense_santos.html",
    "confrontos_santos_gremio.html",
    "confrontos_santos_internacional.html",
    "confrontos_santos_cruzeiro.html",
    "confrontos_santos_flamengo.html",
]

found = []
print("Verificando confrontos históricos no Campeões do Futebol...")
for c in candidates:
    url = base_url + c
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=3) as r:
            if r.status == 200:
                data = r.read()
                if len(data) > 1000:
                    found.append((c, len(data)))
                    print(f"  [OK 200] {c} ({len(data)} bytes)")
    except Exception:
        pass

print(f"\nTotal encontrados diretamente: {len(found)}/{len(candidates)}")
