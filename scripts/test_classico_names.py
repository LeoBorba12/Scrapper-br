import urllib.request

base_url = "https://www.campeoesdofutebol.com.br/"

test_files = [
    "fla_flu.html",
    "fla_flu_estatisticas.html",
    "fla_vasco.html",
    "fla_vasco_estatisticas.html",
    "fla_botafogo.html",
    "flu_vasco_classico.html",
    "flu_botafogo.html",
    "vasco_botafogo.html",
    "cor_spfc.html",
    "cor_spfc_classico.html",
    "pal_spfc.html",
    "pal_spfc_classico.html",
    "san_spfc.html",
    "cor_santos.html",
    "galo_raposa.html",
    "atletico_cruzeiro.html",
    "classico_mineiro.html",
    "bavi.html",
    "bavi_historico.html",
    "atletiba.html",
    "atletiba_historico.html",
]

print("Testando nomes clássicos no Campeões do Futebol:")
for fn in test_files:
    url = base_url + fn
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=3) as r:
            if r.status == 200:
                data = r.read()
                print(f"  [OK 200] {fn} ({len(data)} bytes)")
    except Exception:
        pass
