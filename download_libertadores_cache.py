import urllib.request
import os
import time

base_url = "https://www.rsssf.org/sacups/"
cache_dir = "data/raw_conmebol/libertadores"

editions = []
for y in range(1960, 2025):
    if y < 2010:
        filename = f"copa{y % 100:02d}.html"
    else:
        filename = f"copa{y}.html"
    editions.append((y, filename))

print(f"Iniciando download e cache de {len(editions)} edições da Copa Libertadores...")

success = 0
for year, filename in editions:
    local_path = os.path.join(cache_dir, filename)
    if os.path.exists(local_path) and os.path.getsize(local_path) > 500:
        success += 1
        continue
    
    url = base_url + filename
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
        with urllib.request.urlopen(req, timeout=10) as resp:
            content = resp.read()
            with open(local_path, 'wb') as f:
                f.write(content)
        success += 1
        print(f"[{year}] Baixado {filename} ({len(content)} bytes)")
        time.sleep(0.15)
    except Exception as e:
        print(f"[{year}] Falha em {url}: {e}")

print(f"\nCache concluído! {success}/{len(editions)} edições disponíveis em {cache_dir}")
