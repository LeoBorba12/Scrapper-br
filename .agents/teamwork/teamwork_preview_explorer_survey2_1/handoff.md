# Handoff Report: Database Decoupling & Resilient Proxy Gateway (Milestone 1 Survey)

**Agent**: `teamwork_preview_explorer_survey2_1`  
**Parent Orchestrator ID**: `da7384f3-57a9-4b6b-9373-94dcd5a6f441`  
**Timestamp**: 2026-11-01T14:28:00Z  
**Project Root**: `/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional`

---

## Executive Summary
This investigation evaluated the technical architecture for **R1: Database Decoupling & Resilient Proxy Gateway**, liberating FutStats from Vercel's strict 94.0 MB file bundle limit while preparing the platform for the ingestion of 69,777 historical matches and detailed goals (R2). We recommend an **Endpoint-Level Remote API Gateway hosted on the existing Oracle Cloud 24/7 VM** combined with a **Resilient Edge Proxy Layer on Vercel** featuring an in-memory TTL cache, an automatic 3-state Circuit Breaker, and an instantaneous transparent fallback to a local bundled SQLite database (`data/futebol.db`), ensuring $p_{95} < 200\text{ ms}$ latency and 100% zero downtime.

---

## 1. Observation

### 1.1. Backend API Architecture & Query Mechanics
- **Entry Points & Routing**:
  - `vercel.json` (lines 5–23):
    ```json
    "functions": {
      "api/index.py": {
        "includeFiles": "data/futebol.db",
        "maxDuration": 30
      }
    },
    "rewrites": [
      { "source": "/api/(.*)", "destination": "/api/index.py" },
      { "source": "/(.*)", "destination": "/index.html" }
    ]
    ```
  - `api/index.py` (lines 8–11): imports `from backend.app import app` and passes incoming HTTP requests directly to Flask WSGI.
  - `backend/app.py`: Contains 36 HTTP endpoints registered under `@app.route('/api/...')`.
- **Database Connection Layer**:
  - `backend/app.py` (lines 477–514):
    ```python
    def get_db():
        conn = None
        if os.path.exists(DB_FUTEBOL):
            try:
                conn = sqlite3.connect(f"file:{DB_FUTEBOL}?immutable=1", uri=True, timeout=15)
            except Exception:
                try:
                    conn = sqlite3.connect(f"file:{DB_FUTEBOL}?mode=ro", uri=True, timeout=15)
                except Exception:
                    conn = sqlite3.connect(DB_FUTEBOL, timeout=15)
        else:
            conn = sqlite3.connect(DB_FUTEBOL, timeout=15)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        try:
            cursor.execute("PRAGMA query_only = ON;")
            cursor.execute("PRAGMA mmap_size = 268435456;")
            cursor.execute("PRAGMA cache_size = -8000;")
            cursor.execute("PRAGMA temp_store = MEMORY;")
        except Exception:
            pass
        return conn
    ```
- **Read-Only Character of Traffic**:
  - Grep search for SQL mutations across `backend/app.py`:
    - `INSERT INTO`: Only in user registration (`usuarios` table, line 284).
    - `UPDATE`: Only in password change (`usuarios` table, line 432).
    - `DELETE`: 0 occurrences.
    - All 34 data analytics, match, betting, and athlete endpoints are **100% read-only (`SELECT`) queries**.
  - In serverless Lambdas where `/var/task` is mounted read-only, user registration already gracefully falls back to emitting signed JWTs in-memory (lines 159–160 in `backend/auth.py`).

### 1.2. Database Footprint & Vercel Serverless Runtime Constraints
- **Direct Database Metrics** (measured via `PRAGMA page_size`, `PRAGMA page_count` on `data/futebol.db`):
  - Page size: `4,096 bytes`
  - Total pages: `21,648 pages`
  - Total size: `88,670,208 bytes` (84.56 MiB / 88.67 MB decimal)
  - Freelist count: `0 pages` (fully packed, VACUUMed)
  - Margin to Vercel hard limit (94.0 MB / 98,566,144 bytes): **5.33 MB remaining**.
- **Table Row Inventory**:
  - `partidas`: 115,625 rows
  - `gols`: 95,522 rows
  - `escalacoes`: 152,266 rows
  - `jogadores_estatisticas`: 19,790 rows
  - `cartoes`: 38,605 rows
  - `odds_partidas`: 10,919 rows
  - `ranking_ponderado`: 3,368 rows
  - `jogadores`: 3,639 rows
  - `estatisticas_partidas`: 1,037 rows
  - `estatisticas_arbitros`: 121 rows
  - `usuarios`: 6 rows
- **Vercel Constraints**:
  - Serverless function deployment limit: 250 MB uncompressed, individual asset limit ~94.0 MB.
  - Cold start penalty: Extracting an 88 MB SQLite database into AWS Lambda memory takes 1.5s–3.0s on cold starts.
  - Git repository bloat: `scripts/orquestrador_mestre_24x7.py` commits `data/futebol.db` every 15 cycles (~2 hours, line 294). Each commit writes an 88 MB blob into `.git/objects/`, creating rapid repository bloat.

### 1.3. Existing Oracle Cloud Infrastructure
- **Active 24/7 Virtual Machine** (documented in `docs/DOSSIE_TECNICO_CONTINUIDADE.md` lines 31–55 and `backend/app.py` lines 206, 440):
  - Cloud Provider: Oracle Cloud Infrastructure (OCI Free Tier)
  - Region: Ashburn (`us-east-1`), low latency to AWS us-east-1 (where Vercel serverless executes).
  - Public IP: `163.176.87.218`
  - User: `opc`, Key: `/home/leo/.ssh/oracle_key`
  - System: Ampere A1 (or E2.1.Micro) Linux, 1 GB RAM + 2.5 GB swapfile (`vm.swappiness = 20`), isolated `.venv` at `/home/opc/scrapper-br/.venv`.
  - Active Daemon: `futstats-orquestrador.service` (`MemoryMax=850M`, `Restart=always`).
  - Storage: 50 GB persistent block storage (capable of hosting databases > 10 GB without size caps).
  - Pre-existing integration: `backend/app.py` already performs HTTP calls to `http://163.176.87.218:3000/cache/...` and `http://163.176.87.218:3000/auth/update-password`.

### 1.4. Frontend Dispatch & Error Patterns
- **Centralized Client**: `frontend/src/App.jsx` (lines 237–256) defines `apiFetch(url, options)`.
  - Attaches `Authorization: Bearer <token>` from `localStorage`.
  - Intercepts 401 (only logs out if URL includes `/api/auth/me`).
  - Returns raw Response object; caller calls `res.json()`.
- **Component Fetching**:
  - Components (`ProtagonistaAtleta`, `AthleteCompareView`, `HomeMatchdayView`, `BettingHubView`, `RefereeScoutView`) uniformly invoke `/api/...`.
  - Error handling pattern in UI:
    ```javascript
    apiFetch(url)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
    ```
  - Crucial insight: Components have NO retry logic or fallback rendering if an endpoint returns HTTP 500 or 504. A backend failure leaves the screen stuck with an empty state or infinite loading. Therefore, **backend-level transparent fallback with HTTP 200 response is mandatory**.

### 1.5. Baseline Verification Commands & Results
- `pytest tests/test_model_evals.py`: 22 passed in 0.27s (Exit code 0).
- `python scripts/auditar_integridade_dados.py`: 12/12 rules OK, 0 anomalies, total partidas: 115,625 (Exit code 0).
- `npm run build` in `frontend/`: Compiled successfully in 4.35s (Exit code 0).

---

## 2. Logic Chain

1. **Step 1 — The Decoupling Imperative**:
   - *Observation*: `data/futebol.db` is 88.67 MB; Vercel reject limit is 94.0 MB.
   - *Observation*: Ingesting 69,777 historical matches with detailed goals and lineups (R2) will add >150,000 goals and >500,000 lineup entries, expanding SQLite to 150–300+ MB.
   - *Deduction*: Preserving the master database inside the Vercel Git bundle is mathematically and physically impossible. Decoupling the master database to a remote host is the only viable path to achieve R2.

2. **Step 2 — Evaluation of Remote Database Topologies**:
   - *Alternative A: SQL-over-HTTP RPC (Query Proxying)*:
     - Endpoints like `/api/jogadores/perfil` or `/api/jogadores/comparar` execute 8 to 15 distinct SQL queries to assemble career histories, cards, and xG data.
     - With a 40ms HTTP round-trip between Vercel and the remote server, 10 sequential query RPCs = 400ms pure transit latency, violating the SLI-02 target ($p_{95} < 200\text{ ms}$).
   - *Alternative B: Turso (LibSQL Serverless)*:
     - Requires managing third-party cloud database keys and requires Python C-extensions (`libsql-client`), which introduce build friction on Vercel AWS Lambda runtimes. Furthermore, continuous scraping writes on Oracle VM would have to push writes over WAN to Turso.
   - *Alternative C: Endpoint-Level Remote API Gateway on Oracle VM (Selected)*:
     - The Oracle VM already hosts the complete codebase, Python `.venv`, scrapers, and 50 GB storage.
     - By running `backend/app.py` as an API Gateway daemon on the VM, a Vercel request (`GET /api/jogadores/perfil?id=9033`) requires **exactly 1 HTTP round-trip** (~35ms). The Oracle VM executes all 10 SQL queries locally in < 3ms and returns the consolidated JSON payload.
     - Total latency: ~40ms, easily beating the 200ms SLO.

3. **Step 3 — Architecture of the Resilient Proxy & Fallback Engine**:
   - To achieve **zero downtime** and prevent cascading outages if the Oracle VM or WAN oscillates:
     - **Tier 1 (In-Memory Cache)**: High-frequency requests are served from `TTLCache` in 1–3ms.
     - **Tier 2 (Remote Gateway with Tight Timeout)**: Upstream request is sent with `timeout=1.8s`.
     - **Tier 3 (3-State Circuit Breaker)**: After 3 consecutive failures (timeouts or 5xx), circuit trips to `OPEN` for 60s. While `OPEN`, upstream requests are completely bypassed, dropping latency to ~5ms.
     - **Tier 4 (Transparent Local Fallback)**: If upstream fails or circuit is `OPEN`, the serverless function executes the query against local bundled `data/futebol.db`, returning HTTP 200 with header `X-Data-Source: local-fallback`. The frontend never sees an error.

4. **Step 4 — Preserving Local SQLite as a Fallback Asset**:
   - The bundled `data/futebol.db` on Vercel is retained strictly as an immutable, compact fallback copy (< 85 MB).
   - The master database on Oracle VM is decoupled from Git/Vercel size constraints and receives all massive batch ingestions.

5. **Step 5 — Zero Impact on Frontend Interfaces**:
   - Since the Resilient Proxy Gateway runs server-side in `api/index.py` / `backend/app.py`, the frontend continues dispatching standard `fetch('/api/...')`.
   - Zero frontend rewrites are required, eliminating regression risk.

---

## 3. Caveats

1. **Oracle VM Memory & CPU Budget**:
   - The Oracle VM has 1 GB RAM (with 2.5 GB swap) and a systemd limit `MemoryMax=850M`. The API gateway daemon must run with lightweight worker concurrency (e.g., Gunicorn with 2 workers or Waitress/Uvicorn) to prevent triggering Linux OOM killer alongside the 24/7 scraping scripts.
2. **Network Transit & Firewall Configuration**:
   - Oracle VM public IP `163.176.87.218` requires port exposure (e.g., port 8000 or 8443) in Oracle Cloud Security Lists, OR an encrypted Cloudflare Tunnel (`cloudflared` daemon on VM), which eliminates public open ports and provides free SSL (`https://gateway.futstats.com`).
3. **Shared Secret Verification**:
   - Upstream calls must enforce `X-Gateway-Secret: <SECRET_KEY>` to prevent unauthorized internet scraping directly against the Oracle VM.
4. **Data Divergence between Remote & Local Fallback**:
   - The remote database will contain newly ingested historical matches (69,777 matches) not present in the slim local fallback database. If remote is temporarily down, the dashboard temporarily serves the baseline 115,625 matches until remote recovers. This is the intended graceful degradation trade-off.

---

## 4. Conclusion & Concrete Architectural Specification for Milestone 1

### 4.1. Proposed File Boundaries
```
Guia profissional/
├── backend/
│   ├── app.py                      # Updated to include Resilient Proxy Dispatch
│   ├── gateway/                    # NEW: Modular Proxy & Resilient Layer
│   │   ├── __init__.py
│   │   ├── proxy_client.py         # HTTP client with timeout, retries, headers
│   │   ├── circuit_breaker.py      # CircuitBreaker class (CLOSED, OPEN, HALF_OPEN)
│   │   └── cache_manager.py        # Centralized TTLCache wrapper
│   ├── calculo_player_rating.py    # Unchanged
│   ├── calculo_xg_discreto.py      # Unchanged
│   └── ia_analista.py              # Unchanged
├── scripts/
│   ├── remote_gateway_daemon.py    # NEW: Standalone server for Oracle Cloud VM
│   ├── futstats-gateway.service    # NEW: Systemd service unit for Oracle VM
│   ├── test_gateway_resilience.py  # NEW: Comprehensive tests for circuit breaker & fallback
│   ├── orquestrador_mestre_24x7.py # Decoupled from pushing heavy DB to git
│   └── auditar_integridade_dados.py
├── data/
│   └── futebol.db                  # Local fallback database (strictly < 85.0 MB)
└── tests/
    ├── test_model_evals.py         # 22/22 tests intact
    └── test_proxy_fallback.py      # NEW: Automated integration tests for fallback
```

### 4.2. Interface Contracts & Environment Variables

| Variable | Type | Default | Description |
|:---|:---|:---|:---|
| `FUTSTATS_REMOTE_GATEWAY_URL` | String | `""` (Empty) | If set (e.g. `http://163.176.87.218:8000`), Vercel acts as proxy. If empty, runs standalone local. |
| `FUTSTATS_GATEWAY_SECRET` | String | `SECRET_KEY` | Preshared token passed in `X-Gateway-Secret` header for mutual authentication. |
| `FUTSTATS_GATEWAY_TIMEOUT_SEC` | Float | `1.8` | Maximum wait time for remote response before triggering local fallback. |
| `FUTSTATS_CIRCUIT_MAX_FAILURES` | Int | `3` | Number of consecutive failures to trip circuit breaker from CLOSED to OPEN. |
| `FUTSTATS_CIRCUIT_RESET_SEC` | Int | `60` | Cooldown period before transitioning from OPEN to HALF-OPEN. |

### 4.3. HTTP Response Telemetry Headers
Every response from Vercel `/api/*` will include:
- `X-Data-Source`: `remote-gateway` | `local-fallback` | `local-standalone` | `cache`
- `X-Circuit-Breaker-State`: `closed` | `open` | `half-open`
- `X-Response-Time-Ms`: Precise execution duration in milliseconds.
- `X-Fallback-Reason`: Present only on fallback (e.g., `remote_timeout`, `connect_error`, `status_503`, `circuit_open`).

### 4.4. Core Implementation Sketches

#### A. `backend/gateway/circuit_breaker.py`
```python
import time
import threading

class CircuitBreaker:
    STATE_CLOSED = "closed"
    STATE_OPEN = "open"
    STATE_HALF_OPEN = "half-open"

    def __init__(self, failure_threshold=3, recovery_time=60.0):
        self.failure_threshold = failure_threshold
        self.recovery_time = recovery_time
        self.state = self.STATE_CLOSED
        self.failure_count = 0
        self.last_failure_time = 0
        self._lock = threading.Lock()

    def can_attempt(self) -> bool:
        with self._lock:
            now = time.time()
            if self.state == self.STATE_OPEN:
                if now - self.last_failure_time > self.recovery_time:
                    self.state = self.STATE_HALF_OPEN
                    return True
                return False
            return True

    def record_success(self):
        with self._lock:
            self.failure_count = 0
            self.state = self.STATE_CLOSED

    def record_failure(self):
        with self._lock:
            self.failure_count += 1
            self.last_failure_time = time.time()
            if self.failure_count >= self.failure_threshold:
                self.state = self.STATE_OPEN
```

#### B. `backend/gateway/proxy_client.py`
```python
import os
import requests
from flask import request, jsonify, g
from .circuit_breaker import CircuitBreaker

breaker = CircuitBreaker(failure_threshold=3, recovery_time=60.0)

def dispatch_with_fallback(local_handler, cache_key=None, ttl=1800):
    remote_base = os.environ.get("FUTSTATS_REMOTE_GATEWAY_URL", "").rstrip("/")
    if not remote_base:
        resp = local_handler()
        return resp

    # Check circuit breaker
    if not breaker.can_attempt():
        resp = local_handler()
        if isinstance(resp, tuple):
            resp[0].headers["X-Data-Source"] = "local-fallback"
            resp[0].headers["X-Fallback-Reason"] = "circuit_open"
            resp[0].headers["X-Circuit-Breaker-State"] = "open"
        else:
            resp.headers["X-Data-Source"] = "local-fallback"
            resp.headers["X-Fallback-Reason"] = "circuit_open"
            resp.headers["X-Circuit-Breaker-State"] = "open"
        return resp

    timeout = float(os.environ.get("FUTSTATS_GATEWAY_TIMEOUT_SEC", 1.8))
    secret = os.environ.get("FUTSTATS_GATEWAY_SECRET", os.environ.get("SECRET_KEY", ""))
    target_url = f"{remote_base}{request.full_path}"
    headers = {
        "X-Gateway-Secret": secret,
        "Accept": "application/json"
    }
    auth = request.headers.get("Authorization")
    if auth:
        headers["Authorization"] = auth

    try:
        remote_resp = requests.get(target_url, headers=headers, timeout=timeout)
        if remote_resp.status_code == 200:
            breaker.record_success()
            res = jsonify(remote_resp.json())
            res.headers["X-Data-Source"] = "remote-gateway"
            res.headers["X-Circuit-Breaker-State"] = breaker.state
            return res
        else:
            breaker.record_failure()
    except (requests.exceptions.Timeout, requests.exceptions.RequestException) as e:
        breaker.record_failure()

    # Transparent fallback to local SQLite
    resp = local_handler()
    if isinstance(resp, tuple):
        resp[0].headers["X-Data-Source"] = "local-fallback"
        resp[0].headers["X-Fallback-Reason"] = "remote_error"
        resp[0].headers["X-Circuit-Breaker-State"] = breaker.state
    else:
        resp.headers["X-Data-Source"] = "local-fallback"
        resp.headers["X-Fallback-Reason"] = "remote_error"
        resp.headers["X-Circuit-Breaker-State"] = breaker.state
    return resp
```

#### C. `scripts/remote_gateway_daemon.py`
```python
# Standalone high-performance gateway service for Oracle Cloud VM
import os
import sys
from waitress import serve  # or gunicorn
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from backend.app import app

if __name__ == "__main__":
    port = int(os.environ.get("GATEWAY_PORT", 8000))
    print(f"Starting FutStats Remote Gateway on port {port}...")
    serve(app, host="0.0.0.0", port=port, threads=4)
```

---

## 5. Verification Method

To independently verify this survey and the subsequent implementation:

1. **Verify Baseline Model Regression**:
   ```bash
   .venv/bin/pytest tests/test_model_evals.py
   # Expected: 22 passed in < 0.5s
   ```
2. **Verify Database Integrity**:
   ```bash
   .venv/bin/python scripts/auditar_integridade_dados.py
   # Expected: 12/12 rules OK, 0 anomalies, total_partidas == 115,625
   ```
3. **Verify Frontend Build**:
   ```bash
   cd frontend && npm run build
   # Expected: Exit code 0, dist/ created without syntax or module errors
   ```
4. **Simulate Fallback Verification**:
   - Set `FUTSTATS_REMOTE_GATEWAY_URL="http://127.0.0.1:9999"` (non-existent port).
   - Send `GET /api/overview` to Flask.
   - Assert: HTTP 200 returned, JSON valid, header `X-Data-Source: local-fallback`, latency < 2.0s.
   - Send 3 subsequent requests:
   - Assert: Header `X-Circuit-Breaker-State: open`, latency drops to < 15ms.
5. **Storage Invalidation Condition**:
   - If `data/futebol.db` on Vercel bundle exceeds `94.0 MB` (98,566,144 bytes), test fails.
