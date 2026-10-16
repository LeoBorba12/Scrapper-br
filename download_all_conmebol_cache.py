import urllib.request
import os
import time

base_url = "https://www.rsssf.org/sacups/"

tasks = [
    # Sudamericana 2002 to 2024
    ('sulamericana', [(y, f"sudamcup{y % 100:02d}.html" if y < 2010 else f"sudamcup{y}.html") for y in range(2002, 2025)]),
    # Supercopa 1988 to 1997
    ('supercopa', [(y, f"supcopa{y % 100:02d}.html") for y in range(1988, 1998)]),
    # Mercosur 1998 to 2001
    ('mercosur', [(y, f"mercosur{y % 100:02d}.html") for y in range(1998, 2002)]),
    # Copa CONMEBOL 1992 to 1999
    ('conmebol', [(y, f"conmebol{y % 100:02d}.html") for y in range(1992, 2000)]),
]

for folder, items in tasks:
    dir_path = os.path.join("data", "raw_conmebol", folder)
    os.makedirs(dir_path, exist_ok=True)
    print(f"\nBaixando {folder} ({len(items)} edições)...")
    for year, filename in items:
        local_path = os.path.join(dir_path, filename)
        if os.path.exists(local_path) and os.path.getsize(local_path) > 500:
            continue
        url = base_url + filename
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, timeout=10) as resp:
                data = resp.read()
                with open(local_path, 'wb') as f:
                    f.write(data)
            print(f"  [{year}] {filename} ({len(data)} bytes)")
            time.sleep(0.15)
        except Exception as e:
            print(f"  [{year}] Falha em {url}: {e}")

# Recopa
recopa_path = os.path.join("data", "raw_conmebol", "recopa.html")
if not os.path.exists(recopa_path):
    try:
        req = urllib.request.Request(base_url + "recopa.html", headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = resp.read()
            with open(recopa_path, 'wb') as f:
                f.write(data)
        print(f"\nRecopa baixada com sucesso! ({len(data)} bytes)")
    except Exception as e:
        print(f"Falha ao baixar recopa: {e}")

print("\nTodos os caches CONMEBOL baixados com sucesso!")
