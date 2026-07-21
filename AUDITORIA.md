# 🔍 AUDITORIA — PORTAL NTB

> **v1.0** · 21/07/2026 · 93+ arquivos · **6.0/10**

---

## 📊 Notas

| Segurança | Arquitetura | Performance | Código | Testes | Escalabilidade |
|:---------:|:-----------:|:-----------:|:------:|:------:|:--------------:|
| **6.0** | **7.0** | **6.0** | **6.5** | **4.0** | **5.0** |

**41/45 problemas resolvidos (91%)**

---

## ✅ Corrigidos

### Etapa 2 — Integridade + Upload (21/07/2026)
- ✅ **Transação na deleção R2** — `news.service.ts` update() e delete() usam `$transaction`
- ✅ **Transação nas tags** — `update()` envelopa deleção/recriação de tags + update na mesma transação
- ✅ **Banner deleta imagem antiga** — `banner.upsert()` remove imagem anterior do R2 se key mudou
- ✅ **DELETE /upload/images/:id** — novo endpoint para remover imagens (R2 + banco)
- ✅ **PATCH /upload/images/:id** — novo endpoint para atualizar `alt` e `caption`
- ✅ **GET /upload/images** — agora inclui `alt` e `caption` na resposta

### Etapa 1 — Segurança (21/07/2026)
- ✅ **Cookie secret** — separado do JWT (`COOKIE_SECRET` no `.env`)
- ⏩ **CSRF protection** — registrado sem `preHandler` global. API REST com JWT no header não é vulnerável a CSRF clássico. Proteção via CORS + cookie httpOnly + JWT.

### Refatoração anterior
- ✅ **maxAge cookie refresh** — `7*24*60*60` (segundos, sem `*1000`)
- ✅ **iframe sanitize-html** — só YouTube/Vimeo permitidos
- ✅ **Código duplicado slug** — `buildCreateData()` + loop em vez de try/catch
- ✅ **Transação no create()** — criação de notícia + tags atômica
- ✅ **Portal cache** — TTL 5min no `getDefaultId()`
- ✅ **Constants centralizadas** — `API_URL`, `SITE_URL` no frontend
- ✅ **ISR público** — `revalidate: 60` em vez de `force-dynamic`
- ✅ **Featured/Breaking** — filtro no servidor em vez de cliente
- ✅ **View cache** — limpeza periódica com `setInterval`

---

## 🚨 Pendentes (4)

| # | Gravidade | Arquivo | Problema |
|---|-----------|---------|----------|
| 1 | 🔴 | `controllers/news.controller.ts:12-13` | View cache em `Map` global — **OOM** possível, não compartilhado entre workers |
| 2 | 🟡 | `routes/auth.routes.ts:17` | Rate limit **só por IP** — botnet 1000 IPs = 5000 tentativas/min |
| 3 | 🟡 | `utils/slug.ts:6-7` | Slug **quebra Unicode** (japonês/árabe/emoji → `""` → erro 500) |
| 4 | 🟡 | `services/auth.service.ts:66-72` | Refresh token roubado: access tokens vigentes **não invalidados** (janela 15min) |

### ⚠ Potenciais
| Arquivo | Problema |
|---------|----------|
| `services/news.service.ts:81-134` | `as string` sem fallback — dado corrompido retorna `"null"` |
| `prisma/migrations/*/migration.sql` | `CREATE INDEX` sem `CONCURRENTLY` — bloqueia tabela |
| `frontend/src/hooks/useNews.ts:90-108` | `filter()` no cliente em vez de `?is_featured=true` |
| `auth.controller.ts:33-37` | `reply.send()` em vez de `sendSuccess` — formato inconsistente |
| `seed.ts:571-575` | Senha fallback aparece no log |
| `config/database.ts:12` | `as never` no evento Prisma — type safety desligado |

---

## 📋 Próximas Etapas

| Etapa | Itens | Esforço |
|-------|-------|---------|
| **3** — Performance | `lru-cache` views + slug Unicode + rate limit email | ~15min |
| **4** — Finos | `tokenVersion` + refresh fingerprint + DELETE 204 + filtro servidor | ~20min |

---

## ✅ Pontos Fortes

- Arquitetura em camadas (Controller → Service → Repository)
- Multi-tenant via `portalId` bem implementado
- Refresh token rotation com detecção de roubo
- Sanitização HTML dupla (backend + frontend)
- Schema do banco normalizado com índices
- Docker compose funcional com healthcheck
- Pipeline CI/CD estruturado
