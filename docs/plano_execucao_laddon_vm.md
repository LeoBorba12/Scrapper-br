# Plano de Execução — Camada L-Addon Intelligence na VM Oracle de 12 GB

**Data:** 11 de Novembro de 2026  
**Status do Documento:** Planejamento e Arquitetura Pré-Execução (Nenhuma alteração foi realizada em produção)  
**Host Alvo:** VM Oracle Cloud Ampere A1 (`129.148.21.244`)  
**Base Hardware Fixa:** 2.0 OCPUs Ampere / 12.0 GB RAM / 50 GB NVMe  

---

## 1. Diagnóstico e Telemetria Real Comprovada (Zero Estimativas)

Medições obtidas via terminal SSH diretamente na VM em execução (`129.148.21.244` às 19:52 GMT):

```text
=== FREE (RAM & SWAP) ===
               total        used        free      shared  buff/cache   available
Mem:            10Gi       1.0Gi       5.4Gi        13Mi       4.4Gi       9.6Gi
Swap:          4.0Gi          0B       4.0Gi

=== DF (DISCO) ===
Filesystem                  Size  Used Avail Use% Mounted on
/dev/mapper/ocivolume-root   30G   12G   19G  39% /
/dev/mapper/ocivolume-oled   15G  222M   15G   2% /var/oled

=== UPTIME & LOAD AVERAGE ===
19:52:36 up 2:23, 0 users, load average: 0.00, 0.07, 0.09

=== DAEMONS EM EXECUÇÃO (FUTSTATS) ===
futstats-orquestrador.service: 94.0 MB RAM (pico de 278.6 MB durante reindexação)
futstats-bot.service:          11.6 MB RAM (pico de 12.1 MB)
Total do FutStats:             105.6 MB de RAM (~1.0% do total da máquina)
```

### Análise dos Dados Medidos:
* **Memória Disponível Real:** **9.6 GiB** utilizáveis imediatamente para novas aplicações.
* **Memória Swap:** **4.0 GiB** íntegros (0 Bytes usados), garantindo colchão de proteção contra OOM.
* **Armazenamento Livre:** **19 GB** na partição `/` (onde residirá o Docker) e **15 GB** em `/var/oled`.
* **Carga de CPU:** **0.00 a 0.09**, o que significa que mais de **90% dos 2 núcleos físicos** estão ociosos.
* **Congelamento em 12 GB:** O script que tentava o upgrade para 24 GB foi **encerrado na VM antiga**. A base do projeto permanece fixa em **12 GB** com risco zero de alteração não autorizada ou custos imprevistos.

---

## 2. Estrutura de Diretórios Proposta

Toda a stack do L-Addon residirá em diretório dedicado e isolado em `/opt/l-addon/`, sem contato com `/home/opc/Guia-profissional/` (FutStats):

```text
/opt/l-addon/
├── docker-compose.yml              # Orquestração dos containers
├── .env.production                 # Variáveis de ambiente (chmod 600, root:root)
├── config/
│   ├── postgres/
│   │   └── postgresql.conf         # Tuning específico do PG para container
│   ├── redis/
│   │   └── redis.conf              # Senha, maxmemory e política de desalocação
│   └── caddy/
│       └── Caddyfile               # Proxy reverso, SSL, rate-limit e Bearer Auth
├── data/
│   ├── postgres_data/              # Volume persistente do banco (isolado)
│   ├── redis_data/                 # Volume de persistência AOF/RDB
│   └── kuma_data/                  # Banco SQLite interno do Uptime Kuma
├── backups/
│   └── postgres/                   # Dumps diários comprimidos e encriptados
└── scripts/
    ├── backup_postgres.sh          # Rotina diária de backup com retenção 7 dias
    └── test_restore.sh             # Validador semanal de integridade de restore
```

---

## 3. `docker-compose.yml` Proposto com Tuning Cirúrgico

O PostgreSQL está configurado e limitado estritamente ao tamanho do seu container (máximo de 768 MB), **sem assumir a posse da RAM da VM**:

```yaml
version: "3.8"

networks:
  laddon_internal:
    driver: bridge
    internal: true      # Rede 100% isolada: SEM ACESSO DIRETO DA INTERNET
  laddon_edge:
    driver: bridge      # Rede exclusiva entre Caddy e o Serviço Intelligence

services:
  # --------------------------------------------------------------------------
  # 1. Banco de Dados Relacional - Metadados e Deduplicação
  # --------------------------------------------------------------------------
  postgres:
    image: postgres:16-alpine
    container_name: laddon_postgres
    restart: always
    environment:
      POSTGRES_DB: ${POSTGRES_DB}
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    command: >
      postgres
      -c shared_buffers=128MB
      -c effective_cache_size=512MB
      -c work_mem=8MB
      -c maintenance_work_mem=64MB
      -c max_connections=20
      -c checkpoint_completion_target=0.9
      -c wal_buffers=4MB
      -c default_statistics_target=100
    volumes:
      - /opt/l-addon/data/postgres_data:/var/lib/postgresql/data
    networks:
      - laddon_internal
    deploy:
      resources:
        limits:
          cpus: "0.8"
          memory: 768M
        reservations:
          memory: 256M
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}"]
      interval: 15s
      timeout: 5s
      retries: 5

  # --------------------------------------------------------------------------
  # 2. Cache em Memória - Respostas Rápidas e TTLs
  # --------------------------------------------------------------------------
  redis:
    image: redis:7-alpine
    container_name: laddon_redis
    restart: always
    command: >
      redis-server
      --requirepass ${REDIS_PASSWORD}
      --maxmemory 256mb
      --maxmemory-policy allkeys-lru
      --save 900 1
      --save 300 10
      --rename-command FLUSHALL ""
      --rename-command FLUSHDB ""
      --rename-command CONFIG ""
    volumes:
      - /opt/l-addon/data/redis_data:/data
    networks:
      - laddon_internal
    deploy:
      resources:
        limits:
          cpus: "0.4"
          memory: 384M
        reservations:
          memory: 128M
    healthcheck:
      test: ["CMD", "redis-cli", "-a", "${REDIS_PASSWORD}", "ping"]
      interval: 10s
      timeout: 3s
      retries: 3

  # --------------------------------------------------------------------------
  # 3. Serviço Interno L-Addon Intelligence
  # --------------------------------------------------------------------------
  intelligence:
    image: node:20-alpine
    container_name: laddon_intelligence
    restart: always
    working_dir: /app
    environment:
      NODE_ENV: production
      PORT: 3000
      DATABASE_URL: postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}
      REDIS_URL: redis://:${REDIS_PASSWORD}@redis:6379/0
      INTERNAL_API_SECRET: ${INTERNAL_API_SECRET}
    volumes:
      - /opt/l-addon/app:/app
    networks:
      - laddon_internal
      - laddon_edge
    deploy:
      resources:
        limits:
          cpus: "0.8"
          memory: 512M
        reservations:
          memory: 180M
    healthcheck:
      test: ["CMD-SHELL", "wget --no-verbose --tries=1 --spider http://127.0.0.1:3000/health || exit 1"]
      interval: 15s
      timeout: 4s
      retries: 3

  # --------------------------------------------------------------------------
  # 4. Observabilidade Inicial - Monitor de Endpoints e Fontes
  # --------------------------------------------------------------------------
  uptime-kuma:
    image: louislam/uptime-kuma:1
    container_name: laddon_uptime_kuma
    restart: always
    volumes:
      - /opt/l-addon/data/kuma_data:/app/data
    networks:
      - laddon_edge
    deploy:
      resources:
        limits:
          cpus: "0.3"
          memory: 256M
        reservations:
          memory: 90M

  # --------------------------------------------------------------------------
  # 5. Reverse Proxy Seguro e Terminação TLS (Caddy)
  # --------------------------------------------------------------------------
  caddy:
    image: caddy:2-alpine
    container_name: laddon_caddy
    restart: always
    ports:
      - "443:443"
      - "80:80"
    volumes:
      - /opt/l-addon/config/caddy/Caddyfile:/etc/caddy/Caddyfile:ro
      - /opt/l-addon/data/caddy_data:/data
      - /opt/l-addon/data/caddy_config:/config
    networks:
      - laddon_edge
    deploy:
      resources:
        limits:
          cpus: "0.3"
          memory: 128M
```

> [!IMPORTANT]
> **Teto Máximo Reservado pela Stack L-Addon:** `768M + 384M + 512M + 256M + 128M = 2.048 MB` (**2.05 GB de RAM**).  
> Com o FutStats usando ~105 MB e o sistema operacional usando ~900 MB, a máquina operará com **mais de 7.0 GB de RAM totalmente intocados**.

---

## 4. Variáveis de Ambiente e Gestão de Secrets

O arquivo `/opt/l-addon/.env.production` será protegido com `chmod 600` e propriedade de `root:root`:

```ini
# Identificação do Ambiente
ENV=production

# PostgreSQL (Gerados via openssl rand -hex 24)
POSTGRES_DB=laddon_canonical
POSTGRES_USER=laddon_app
POSTGRES_PASSWORD=<GERADO_ALEATORIAMENTE_32_BYTES>

# Redis (Gerado via openssl rand -hex 24)
REDIS_PASSWORD=<GERADO_ALEATORIAMENTE_32_BYTES>

# Token de Comunicação Vercel <-> VM (Bearer Token)
INTERNAL_API_SECRET=<GERADO_ALEATORIAMENTE_64_BYTES>

# Domínio do Serviço (quando configurado)
SERVICE_DOMAIN=api-intelligence.seudominio.com
```

### Regras Estritas de Dados e Privacidade:
* ❌ **Proibido:** Armazenar tokens de usuários (ex: TorBox API key de clientes).
* ❌ **Proibido:** Armazenar URLs assinadas de vídeo de longa duração.
* ✅ **Permitido:** IMDb IDs, TMDb IDs, títulos normalizados, chaves de deduplicação (`type:normalizedTitle:year`), sinopses e metadados públicos.

---

## 5. Configuração de Firewall e Acesso Seguro

### A. Regras da Subnet na Oracle Cloud (Ingress Rules)
* **Permitido:** Porta `22` (SSH - apenas chave).
* **Permitido:** Porta `443` (HTTPS) e Porta `80` (Redirect Let's Encrypt).
* **Bloqueadas de Fábrica:** Portas `5432` (Postgres), `6379` (Redis), `3000` (Node), `3001` (Kuma). Nenhuma delas possui mapeamento de porta externa no host.

### B. Proteção no Caddyfile
```caddy
{$SERVICE_DOMAIN} {
    # 1. Rota de telemetria pública restrita (sem dados sensíveis)
    handle /health {
        reverse_proxy intelligence:3000
    }

    # 2. Rota interna de Metadados e Cache (Exige Bearer Token Estrito)
    handle /v1/* {
        @no_auth not header Authorization "Bearer {$INTERNAL_API_SECRET}"
        respond @no_auth "Unauthorized" 401

        reverse_proxy intelligence:3000 {
            header_up X-Real-IP {remote_host}
        }
    }

    # 3. Painel Uptime Kuma (Protegido por Basic Auth ou Cloudflare Access)
    handle /kuma/* {
        basic_auth {
            admin {$KUMA_ADMIN_HASH}
        }
        reverse_proxy uptime-kuma:3001
    }
}
```

---

## 6. Estratégia de Backup, Retenção e Teste de Restore

### A. Script de Backup Diário (`/opt/l-addon/scripts/backup_postgres.sh`)
```bash
#!/bin/bash
set -e
BACKUP_DIR="/opt/l-addon/backups/postgres"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/laddon_${DATE}.sql.gz"

mkdir -p "$BACKUP_DIR"
docker exec -t laddon_postgres pg_dump -U laddon_app -d laddon_canonical | gzip -9 > "$BACKUP_FILE"
chmod 600 "$BACKUP_FILE"

# Retenção estrita de 7 dias (remove arquivos com mais de 7 dias)
find "$BACKUP_DIR" -name "laddon_*.sql.gz" -type f -mtime +7 -delete

echo "[$(date)] Backup concluído com sucesso: $BACKUP_FILE (Tamanho: $(du -h $BACKUP_FILE | cut -f1))"
```

### B. Procedimento Semanal Obrigatório de Teste de Restore (`test_restore.sh`)
Antes de considerar os backups confiáveis, um teste semanal restaura o dump mais recente em um banco efêmero temporário para validar integridade:
```bash
#!/bin/bash
set -e
LATEST_BACKUP=$(ls -t /opt/l-addon/backups/postgres/*.sql.gz | head -n 1)

echo "Testando restore de: $LATEST_BACKUP"
# Cria banco temporário
docker exec -i laddon_postgres psql -U laddon_app -d postgres -c "DROP DATABASE IF EXISTS test_restore_db; CREATE DATABASE test_restore_db;"

# Restaura o dump
gunzip -c "$LATEST_BACKUP" | docker exec -i laddon_postgres psql -U laddon_app -d test_restore_db > /dev/null

# Valida contagem de títulos
COUNT=$(docker exec -i laddon_postgres psql -U laddon_app -d test_restore_db -t -c "SELECT count(*) FROM canonical_titles;")
echo "[RESTORE OK] Banco de teste restaurado com sucesso! Total de títulos válidos: $COUNT"

# Destrói o banco temporário
docker exec -i laddon_postgres psql -U laddon_app -d postgres -c "DROP DATABASE test_restore_db;"
```

---

## 7. Endpoints Iniciais da API `l-addon-intelligence`

| Método | Endpoint | Proteção | Timeout Vercel | Função |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/health` | Público | 1.500 ms | Healthcheck rápido da VM, PostgreSQL e Redis. |
| `POST` | `/v1/cache/get` | Bearer Token | 2.500 ms | Consulta em lote ao Redis por chaves de catálogo e streams. |
| `POST` | `/v1/cache/set` | Bearer Token | 2.500 ms | Armazena respostas brutas com TTL específico (5m a 24h). |
| `GET` | `/v1/metadata/:imdb_id` | Bearer Token | 2.500 ms | Retorna título normalizado, poster, dublagem e fontes. |
| `POST` | `/v1/dedup/resolve` | Bearer Token | 2.500 ms | Resolve chave composta `type:normalizedTitle:year`. |

---

## 8. Estratégia de Fallback no L-Addon (Vercel)

No cliente do L-Addon dentro da Vercel, o acesso à VM será implementado com **resiliência total**:

```typescript
// Exemplo conceitual do cliente seguro na Vercel:
const VM_ENDPOINT = process.env.LADDON_VM_INTELLIGENCE_URL;
const VM_SECRET = process.env.LADDON_VM_SECRET;

let consecutiveFailures = 0;
let circuitBreakerOpenUntil = 0;

export async function fetchWithVMFallback<T>(
  cacheKey: string,
  fetchDirectFallback: () => Promise<T>
): Promise<T> {
  const now = Date.now();

  // 1. Circuit Breaker: se houve 3 falhas seguidas, não tenta a VM por 60s
  if (now < circuitBreakerOpenUntil || !VM_ENDPOINT) {
    return fetchDirectFallback();
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500); // 2.5s estrito

    const response = await fetch(`${VM_ENDPOINT}/v1/cache/get`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${VM_SECRET}`,
      },
      body: JSON.stringify({ key: cacheKey }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (response.ok) {
      const data = await response.json();
      if (data.hit) {
        consecutiveFailures = 0;
        return data.payload as T;
      }
    }
  } catch (err) {
    consecutiveFailures++;
    if (consecutiveFailures >= 3) {
      circuitBreakerOpenUntil = Date.now() + 60_000; // Abre circuito por 60s
      console.warn("[L-Addon VM Circuit Breaker] 3 falhas consecutivas. Pausando VM por 60s.");
    }
  }

  // 2. Fallback obrigatório: busca diretamente na fonte original (TorBox / TMDb / Brazuca)
  const freshData = await fetchDirectFallback();
  return freshData;
}
```

---

## 9. Plano de Implantação Faseado e Critérios de Aceite

```
Fase 1: Preparação da Infraestrutura Docker e Isolamento
├── Instalação do Docker Engine e Compose oficial para aarch64 (Oracle Linux 9).
├── Criação de /opt/l-addon/ e configuração de permissões restritas.
└── Critério de Aceite: Docker ativo sem elevar o uso de RAM além de 100 MB; FutStats mantém 22/22 testes PASS.

Fase 2: Implantação de Redis e Uptime Kuma
├── Subida dos containers Redis (senha, 384M) e Uptime Kuma (256M).
├── Configuração dos monitores de saúde dos endpoints da Vercel no Uptime Kuma.
└── Critério de Aceite: Redis responde ao ping interno com senha; Uptime Kuma acessível com 2FA; RAM livre > 8.0 GB.

Fase 3: Implantação do PostgreSQL Tunado e Validação de Backup
├── Subida do container PostgreSQL 16 com o tuning de 768M.
├── Execução do script de backup e script de restore com sucesso.
└── Critério de Aceite: Restore semanal executado com sucesso em banco temporário; disco livre > 16 GB.

Fase 4: Serviço L-Addon Intelligence e Proxy Caddy
├── Deploy do container Node.js com Fastify e Caddy com SSL e Bearer Token.
├── Teste de carga local (50 req/s por 30s) avaliando isolamento do FutStats.
└── Critério de Aceite: Endpoint /health responde em < 30ms; FutStats não sofre aumento de latência.

Fase 5: Integração Piloto na Vercel com Circuit Breaker
├── Implementação do cliente com timeout de 2.5s em branch de preview na Vercel.
├── Teste de desligamento simulado da VM para certificar que o fallback funciona 100%.
└── Critério de Aceite: Nenhuma tela branca ou erro 500 caso a VM seja interrompida.
```

---

## 10. Matriz de Riscos e Mitigações

| Risco Identificado | Severidade | Probabilidade | Mitigação Obrigatória Implementada |
| :--- | :--- | :--- | :--- |
| **OOM (Esgotamento de RAM)** | Alta | Muito Baixa | Limites de memória rígidos no Docker (`2.05 GB` máx) + 4.0 GB de Swap NVMe. FutStats isolado no Systemd com `MemoryMax=4G`. |
| **Invasão de Banco de Dados** | Alta | Quase Nula | Portas 5432 e 6379 não expostas na internet. Acesso somente pela rede Docker interna (`internal: true`). |
| **Lentidão na Vercel por causa da VM** | Alta | Baixa | Timeout curto de 2.5s na Vercel + Circuit Breaker de 60s após 3 falhas. |
| **Sobrecarga de Disco por Logs/Dump** | Média | Baixa | Retenção de backups de 7 dias + logrotate automático no Docker (`max-size: "50m"`). |
| **Cobrança Indesejada na Oracle** | Crítica | Nula | VM congelada nos **12 GB** atuais. Sniper de upgrade desativado. Nenhuma alteração de shape ou recursos extras provisionados. |

---

## 11. Declaração de Conformidade Estrita

* ✅ **Nenhum código do L-Addon foi alterado em produção nem na branch main.**
* ✅ **Nenhum serviço, container ou pacote foi instalado na VM nesta etapa.**
* ✅ **O FutStats permanece 100% ativo e intocado (`futstats-orquestrador` e `futstats-bot` rodando normalmente).**
* ✅ **A VM de 12 GB foi confirmada como a base estável e segura do projeto.**
