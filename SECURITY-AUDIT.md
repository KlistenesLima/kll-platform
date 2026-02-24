# Auditoria de Segurança — KLL Platform

**Data:** 20/02/2026
**Auditor:** Automated Security Scan + Manual Review
**Escopo:** Preparação para repositório público no GitHub

## Resumo Executivo

**Status: APROVADO COM RESSALVAS**

Todos os secrets foram removidos dos arquivos rastreados e do histórico Git. O repositório está seguro para ser tornado público, com ressalvas documentadas para produção.

## Verificações Realizadas

### 1. Git History Scan
- [x] Busca de senhas no histórico completo (todas as branches)
- Resultado: **Secrets encontrados e LIMPOS com git-filter-repo**
- Secrets removidos do histórico:
  - `[REDACTED]` (PostgreSQL password) → `REDACTED_DB_PASSWORD`
  - `[REDACTED]` (RabbitMQ password) → `REDACTED_RABBITMQ_PASSWORD`
  - `[REDACTED]` (Seq admin / Keycloak demo user password) → `REDACTED_SEQ_PASSWORD`
  - `[REDACTED]` (KRT Bank integration key) → `REDACTED_API_KEY`
- Verificação final: **ZERO** ocorrências em todo o histórico

### 2. Secrets em Arquivos Atuais
- [x] appsettings*.json — **LIMPO** (usa `CHANGE_ME` e `${VAR}` placeholders)
- [x] docker-compose*.yml — **LIMPO** (usa `${VAR:?Set ...}` para todos os secrets)
- [x] Keycloak realm — **LIMPO** (usa `CHANGE_ME_*` placeholders)
- [x] Dockerfiles — **LIMPO** (sem ENV/ARG com senhas; multi-stage builds)
- [x] .env.example — **LIMPO** (apenas placeholders `CHANGE_ME_*`)
- [x] Código C# — **LIMPO** (sem passwords hardcoded; fallbacks usam `CHANGE_ME`)
- [x] Código TypeScript/React — **LIMPO** (sem API keys ou tokens hardcoded)
- [x] GitHub Actions workflows — **LIMPO** (sem secrets hardcoded)

### 3. Vulnerabilidades de Código
- SQL Injection: **LIMPO** — Nenhum uso de `FromSqlRaw` com concatenação de strings
- XSS: **LIMPO** — React sanitiza por padrão; sem uso de `dangerouslySetInnerHTML`
- CORS misconfiguration: **OK** — `WithOrigins()` com URLs específicas em produção
- Insecure deserialization: **LIMPO** — Nenhum uso de `BinaryFormatter` ou `TypeNameHandling.All`
- Weak cryptography: **LIMPO** — Nenhum uso de MD5 ou SHA1
- Sensitive data logging: **LIMPO** — Nenhum log de passwords/secrets/tokens

### 4. Configuração de Segurança
- Security headers: **IMPLEMENTADO** no Gateway
  - X-Content-Type-Options: nosniff
  - X-Frame-Options: DENY
  - X-XSS-Protection: 1; mode=block
  - Referrer-Policy: strict-origin-when-cross-origin
  - Permissions-Policy: camera=(), microphone=(), geolocation=()
- Rate limiting: **IMPLEMENTADO** no Gateway (100 req/min global por IP, 20 req/min checkout)
- Input validation: **IMPLEMENTADO** — Controllers usam validação
- HTTPS enforcement: **N/A** — Tráfego interno Docker é HTTP (aceitável); HTTPS terminado no reverse proxy
- Authentication: **IMPLEMENTADO** — JWT via Keycloak (PKCE/S256 no storefront)
- Authorization: **IMPLEMENTADO** — Policies `AdminOnly` e `CustomerOnly` nos controllers

### 5. .gitignore
- [x] .env e .env.* protegidos (incluindo nested .env em subprojetos)
- [x] Certificados (*.pem, *.key, *.pfx, *.p12, *.cert, *.crt) protegidos
- [x] Arquivos de IDE (.vs/, .vscode/, .idea/) protegidos
- [x] Build artifacts (bin/, obj/, dist/) protegidos
- [x] launchSettings.json protegido
- [x] appsettings.Development.json protegido

## Issues Encontrados e Resolvidos

| # | Severidade | Descrição | Ação Tomada |
|---|-----------|-----------|-------------|
| 1 | CRITICAL | Secrets reais ([REDACTED], [REDACTED], [REDACTED], [REDACTED]) no histórico Git — centenas de ocorrências | Histórico limpo com `git-filter-repo --replace-text` |
| 2 | HIGH | `src/Web/kll-admin-web/.env` rastreado pelo Git | Removido do tracking com `git rm --cached` |
| 3 | MEDIUM | launchSettings.json (5 arquivos) rastreados pelo Git | Removidos do tracking com `git rm --cached` |
| 4 | MEDIUM | .gitignore não cobria .env.*, *.pem, *.key, launchSettings.json, appsettings.Development.json | .gitignore atualizado com cobertura completa |

## Issues Conhecidos (Aceitos para Demo)

| # | Severidade | Descrição | Justificativa |
|---|-----------|-----------|---------------|
| 1 | MEDIUM | `AllowAnyOrigin()` em dev no KLL.Store | Apenas quando `!IsProduction()`; tráfego passa pelo Gateway que tem CORS restritivo |
| 2 | MEDIUM | `RequireHttpsMetadata = false` no JWT (AuthExtensions.cs) | Necessário para Docker (Keycloak interno sem TLS). Em produção: tornar configurável |
| 3 | MEDIUM | `ValidateAudience = false` no JWT | Simplificação para demo. Em produção: habilitar com audiences específicas por serviço |
| 4 | MEDIUM | JWT tokens armazenados em localStorage (AuthProvider.tsx, authStore.ts) | Padrão comum em SPAs. Em produção: migrar para httpOnly cookies |
| 5 | MEDIUM | Redis e MongoDB sem autenticação no docker-compose | Aceitável para desenvolvimento local. Em produção: adicionar `--requirepass` e `MONGO_INITDB_ROOT_*` |
| 6 | MEDIUM | Swagger exposto em ambiente Docker (`IsDevelopment() \|\| Docker`) | Em produção: usar overlay prod ou desabilitar. docker-compose.prod.yml usa `ASPNETCORE_ENVIRONMENT=Docker` |
| 7 | LOW | Keycloak `sslRequired: "none"` no realm | Configuração de desenvolvimento |
| 8 | LOW | Keycloak `start-dev` no docker-compose base | docker-compose.prod.yml override para `start` |
| 9 | LOW | `directAccessGrantsEnabled: true` (ROPC) nos clients Keycloak | Usado para login direto na UI. Produção: migrar para Authorization Code + PKCE |
| 10 | LOW | Hardcoded Seq URL em Gateway e Notifications Worker | Funcional para Docker. Em produção: ler de configuration |
| 11 | LOW | URLs localhost hardcoded no KLL.Admin Blazor app | Apenas para dev local. Docker override via appsettings.Docker.json |
| 12 | LOW | `StoreDbContextFactory` com fallback `Password=CHANGE_ME` | Factory de design-time para EF migrations, não usado em runtime |

## Recomendações para Produção

1. **Rotacionar TODAS as senhas** antes do deploy (senhas de dev foram expostas no histórico anterior)
2. **Habilitar HTTPS** em todos os serviços com certificados TLS válidos
3. **Configurar `sslRequired: "external"`** no Keycloak realm
4. **Tornar `RequireHttpsMetadata` e `ValidateAudience`** configuráveis via appsettings
5. **Habilitar `ValidateAudience = true`** com audiences específicas por microserviço
6. **Migrar JWT storage** de localStorage para httpOnly cookies
7. **Adicionar CSP (Content-Security-Policy)** e **HSTS** headers
8. **Configurar autenticação em Redis** (`--requirepass`) e **MongoDB** (`MONGO_INITDB_ROOT_*`)
9. **Adicionar security headers** aos microserviços individuais como defesa em profundidade
10. **Mover Seq URL** para configuration ao invés de hardcoded no Program.cs
11. **Configurar WAF** na frente do Gateway em produção
12. **Implementar audit logging** persistente para ações administrativas
13. **Adicionar webhook signature verification** para integração KRT↔KLL
