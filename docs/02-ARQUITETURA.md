# Boleiros.app — Arquitetura do Sistema

## 1. Visão Geral da Arquitetura

```
┌─────────────────────────────────────────────────────────┐
│                     VPS (oliecare.cloud)                 │
│                     IP: 72.62.11.30                      │
│                                                         │
│  ┌─────────────┐    ┌──────────────────────────────┐    │
│  │ Nginx       │    │ Docker Network               │    │
│  │ Principal   │    │ (boleiros-network)            │    │
│  │ :80/:443    │    │                              │    │
│  │             │───▶│  ┌────────────────────┐      │    │
│  └─────────────┘    │  │ Nginx Boleiros     │      │    │
│                     │  │ :8080              │      │    │
│                     │  └──────┬───────┬─────┘      │    │
│                     │         │       │             │    │
│                     │    ┌────▼──┐ ┌──▼──────┐     │    │
│                     │    │ Web   │ │ API     │     │    │
│                     │    │ :3000 │ │ :3001   │     │    │
│                     │    │Next.js│ │Express  │     │    │
│                     │    └───────┘ └──┬──┬───┘     │    │
│                     │                 │  │          │    │
│                     │          ┌──────▼┐ ▼──────┐  │    │
│                     │          │ PgSQL │ │ Redis │  │    │
│                     │          │ :5433 │ │ :6380 │  │    │
│                     │          └───────┘ └───────┘  │    │
│                     └──────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

## 2. Componentes

### 2.1 Frontend — `boleiros-web`

| Item | Detalhe |
|------|---------|
| Framework | Next.js 15 (App Router) |
| Linguagem | TypeScript |
| Estilo | Tailwind CSS |
| UI Components | Radix UI + CVA (Class Variance Authority) |
| Porta interna | 3000 |
| Porta externa | 3000 |

**Responsabilidades:**
- Renderização SSR/SSG das páginas
- PWA (manifest.json, service worker)
- Chamadas à API via fetch/axios
- Gerenciamento de estado (React Context / Zustand)

### 2.2 Backend — `boleiros-api`

| Item | Detalhe |
|------|---------|
| Runtime | Node.js 20 |
| Framework | Express.js |
| ORM | Prisma 6 |
| Auth | JWT (access 15min + refresh 7d) |
| Porta interna | 3001 |
| Porta externa | 3001 |

**Endpoints principais:**

```
POST   /auth/register          — Cadastro
POST   /auth/login             — Login
POST   /auth/refresh           — Refresh token
GET    /auth/me                — Dados do usuário logado

GET    /players/me             — Perfil do jogador
PUT    /players/me             — Atualizar perfil

POST   /groups                 — Criar grupo
GET    /groups                 — Listar meus grupos
GET    /groups/:id             — Detalhes do grupo
POST   /groups/:id/join        — Entrar no grupo
GET    /groups/:id/members     — Membros do grupo

POST   /groups/:gid/matches   — Criar partida
GET    /groups/:gid/matches   — Listar partidas
GET    /matches/:id            — Detalhes da partida
POST   /matches/:id/confirm   — Confirmar presença
POST   /matches/:id/draft     — Sortear times
POST   /matches/:id/start     — Iniciar partida
POST   /matches/:id/end       — Finalizar partida
POST   /matches/:id/events    — Registrar evento

GET    /groups/:id/finance             — Resumo financeiro
POST   /groups/:id/finance/transactions — Nova transação

GET    /notifications          — Minhas notificações
PUT    /notifications/:id/read — Marcar como lida
```

### 2.3 Banco de Dados — `boleiros-db`

| Item | Detalhe |
|------|---------|
| SGBD | PostgreSQL 16 Alpine |
| Porta interna | 5432 |
| Porta externa | 5433 (evita conflito com PG existente na VPS) |
| Volume | `boleiros-db-data` (persistente) |

**Diagrama ER simplificado:**

```
User ──1:1── PlayerProfile
  │                │
  │1:N             │1:N
  ▼                ▼
GroupMember    MatchConfirmation
  │                │
  │N:1             │N:1
  ▼                ▼
Group ──1:N── Match ──1:N── Team ──1:N── TeamPlayer
                │                            │
                │1:N                         │N:1
                ▼                            ▼
           MatchEvent              PlayerProfile
                │
           PlayerRating
           PlayerAward

Group ──1:N── FinancialTransaction ──N:1── Wallet
User ──1:N── Notification
AuditLog (standalone)
```

**Total: 15 tabelas**

### 2.4 Cache — `boleiros-redis`

| Item | Detalhe |
|------|---------|
| Versão | Redis 7 Alpine |
| Porta interna | 6379 |
| Porta externa | 6380 (evita conflito com Redis existente) |
| Memória máxima | 256 MB |
| Política de evição | allkeys-lru |

**Uso planejado:**
- Cache de sessões e tokens
- Rate limiting
- Cache de rankings e estatísticas
- Pub/Sub para notificações em tempo real (futuro)

### 2.5 Proxy Reverso — Nginx (`boleiros.conf`)

| Item | Detalhe |
|------|---------|
| Porta de escuta | 8080 |
| Upstream web | boleiros-web:3000 |
| Upstream API | boleiros-api:3001 |

**Regras de roteamento:**

| Path | Destino | Transformação |
|------|---------|---------------|
| `/` | boleiros-web:3000 | — |
| `/api/*` | boleiros-api:3001 | Remove prefixo `/api` |
| `/auth/*` | boleiros-api:3001 | Proxy direto |
| `/ws` | boleiros-api:3001 | WebSocket upgrade |
| `/_next/static/*` | boleiros-web:3000 | Cache imutável |

## 3. Mapa de Portas

| Serviço | Porta Interna | Porta Externa | Nota |
|---------|---------------|---------------|------|
| PostgreSQL (boleiros) | 5432 | 5433 | PG da VPS em 5432 |
| Redis (boleiros) | 6379 | 6380 | Redis da VPS em 6379 |
| API Express | 3001 | 3001 | Livre |
| Frontend Next.js | 3000 | 3000 | Livre |
| Nginx (boleiros) | 8080 | 8080 | Nginx da VPS em 80/443 |

**Portas já em uso na VPS (não tocar):** 80, 443, 4000, 5432, 5678, 6379

## 4. Rede Docker

Todos os containers rodam na rede `boleiros-network` (bridge). A comunicação interna usa nomes de container como hostname:

- `boleiros-db:5432` — acesso ao PostgreSQL
- `boleiros-redis:6379` — acesso ao Redis
- `boleiros-api:3001` — acesso à API
- `boleiros-web:3000` — acesso ao frontend

## 5. Volumes Persistentes

| Volume | Montagem | Uso |
|--------|----------|-----|
| `boleiros-db-data` | `/var/lib/postgresql/data` | Dados do PostgreSQL |
| `boleiros-redis-data` | `/data` | Snapshot do Redis (RDB) |

## 6. Fluxo de Autenticação

```
┌────────┐          ┌──────┐          ┌────────┐
│ Cliente │──login──▶│ API  │──query──▶│ PgSQL  │
│         │          │      │          │        │
│         │◀─tokens──│      │◀─user────│        │
│         │          │      │          └────────┘
│         │          │      │
│         │──request─│      │──verify JWT──▶ (in-memory)
│         │  +Bearer │      │
│         │◀─data────│      │
└────────┘          └──────┘

Access Token:  15 minutos (JWT_EXPIRES_IN)
Refresh Token: 7 dias (JWT_REFRESH_EXPIRES_IN)
Hash:          bcrypt (12 rounds)
```

## 7. Deploy

### Pré-requisitos na VPS
- Docker Engine 24+
- Docker Compose v2
- Nginx principal configurado para proxy_pass :8080

### Comandos de Deploy

```bash
# Primeiro deploy
docker compose up -d

# Atualizar após mudanças
docker compose pull
docker compose up -d --build

# Ver logs
docker compose logs -f boleiros-api
docker compose logs -f boleiros-web

# Reiniciar um serviço
docker compose restart boleiros-api

# Parar tudo
docker compose down

# Parar e limpar volumes (CUIDADO: apaga dados!)
docker compose down -v
```

### Configuração do Nginx Principal (na VPS)

Adicionar ao nginx principal (`/etc/nginx/sites-available/boleiros.app`):

```nginx
server {
    listen 80;
    server_name boleiros.app www.boleiros.app;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name boleiros.app www.boleiros.app;

    ssl_certificate     /etc/letsencrypt/live/boleiros.app/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/boleiros.app/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

### SSL com Certbot

```bash
sudo certbot --nginx -d boleiros.app -d www.boleiros.app
```

## 8. Monitoramento

### Health Checks

| Serviço | Método | Intervalo |
|---------|--------|-----------|
| PostgreSQL | `pg_isready` | 10s |
| Redis | `redis-cli ping` | 10s |
| API | `curl /health` | 30s (start: 60s) |

### Logs

```bash
# Todos os serviços
docker compose logs -f --tail=100

# Serviço específico
docker compose logs -f boleiros-api --tail=50

# Apenas erros
docker compose logs boleiros-api 2>&1 | grep -i error
```

## 9. Segurança

- **Senhas**: bcrypt com 12 rounds
- **JWT**: tokens de curta duração (15 min) + refresh (7 dias)
- **Helmet**: headers de segurança na API
- **CORS**: configurado no Express
- **Nginx**: X-Frame-Options, X-Content-Type-Options, X-XSS-Protection
- **Docker**: containers isolados em rede bridge dedicada
- **Portas**: apenas o necessário exposto externamente
- **Variáveis de ambiente**: senhas não commitadas (`.env` no `.gitignore`)
