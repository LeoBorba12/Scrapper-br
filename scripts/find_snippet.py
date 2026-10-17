import urllib.request

url = "https://www.bolanaarea.com/serie_b_2024_turno1.htm"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
html = urllib.request.urlopen(req).read().decode('latin1', errors='ignore')

idx = html.find("2x1")
while idx != -1:
    snippet = html[max(0, idx-100):min(len(html), idx+150)]
    if "Novorizontino" in snippet or "CRB" in snippet or "Santos" in snippet:
        print("SNIPPET:")
        print(snippet)
        print("="*60)
        break
    idx = html.find("2x1", idx+1)
