import urllib.request
import os
import time

riosp_editions = [
    (1950, "riospl50.html"), (1951, "riospl51.html"), (1952, "riospl52.html"),
    (1953, "riospl53.html"), (1954, "riospl54.html"), (1955, "riospl55.html"),
    (1957, "riospl57.html"), (1958, "riospl58.html"), (1959, "riospl59.html"),
    (1960, "riospl60.html"), (1961, "riospl61.html"), (1962, "riospl62.html"),
    (1963, "riospl63.html"), (1964, "riospl64.html"), (1965, "riospl65.html"),
    (1966, "riospl66.html"), (1993, "riospl93.html"), (1997, "riospl97.html"),
    (1998, "riospl98.html"), (1999, "riospl99.html"), (2000, "riospl00.html"),
    (2001, "riospl01.html"), (2002, "riospl02.html")
]

print("Baixando cache do Torneio Rio-São Paulo...")
for year, fn in riosp_editions:
    local_path = os.path.join("data", "raw_regionais", "riosp", fn)
    if os.path.exists(local_path) and os.path.getsize(local_path) > 300:
        continue
    url = f"https://www.rsssf.org/tablesr/{fn}"
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=8) as resp:
            content = resp.read()
            with open(local_path, 'wb') as f:
                f.write(content)
        print(f"  [Rio-SP {year}] Baixado {fn} ({len(content)} bytes)")
        time.sleep(0.1)
    except Exception as e:
        print(f"  [Rio-SP {year}] Falha em {url}: {e}")

# Copa do Nordeste
nordeste_candidates = [
    (1994, "nordeste94.html"), (1997, "nordeste97.html"), (1998, "nordeste98.html"),
    (1999, "nordeste99.html"), (2000, "nordeste00.html"), (2001, "nordeste01.html"),
    (2002, "nordeste02.html"), (2003, "nordeste03.html"), (2010, "nordeste10.html"),
    (2010, "nordeste2010.html")
]
for y in range(2013, 2025):
    nordeste_candidates.append((y, f"nordeste{y}.html"))
    nordeste_candidates.append((y, f"nordeste{y % 100:02d}.html"))

print("\nBaixando cache da Copa do Nordeste...")
for year, fn in nordeste_candidates:
    local_path = os.path.join("data", "raw_regionais", "nordeste", fn)
    if os.path.exists(local_path) and os.path.getsize(local_path) > 300:
        continue
    for prefix in ["https://www.rsssf.org/tablesn/", "https://www.rsssf.org/tablesb/"]:
        url = prefix + fn
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, timeout=5) as resp:
                content = resp.read()
                with open(local_path, 'wb') as f:
                    f.write(content)
            print(f"  [Nordeste {year}] Baixado {url} ({len(content)} bytes)")
            time.sleep(0.1)
            break
        except Exception:
            pass

print("\nProcesso de download concluído!")
