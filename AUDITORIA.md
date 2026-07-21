# 🔍 AUDITORIA — PORTAL NTB

> **v1.1** · 21/07/2026 · ~200 arquivos · ~11.400 linhas · **6.0/10**

---

## 📊 Notas

| Segurança | Arquitetura | Performance | Código | Testes | Documentação | Escalabilidade |
|:---------:|:-----------:|:-----------:|:------:|:------:|:------------:|:--------------:|
| **6.0** | **7.0** | **6.0** | **6.5** | **1.0** | **7.0** | **5.0** |

**43/49 problemas resolvidos (88%)** — 6 novos achados nesta auditoria

---

## ✅ Corrigidos

### Etapa 3 — Modal de Upload + Proteção ao deletar (21/07/2026)
- ✅ **Verificação de vínculo ao deletar imagem** — `upload.service.ts` agora conta notícias vinculadas via `coverImageKey` antes de excluir. Bloqueia com 400 se estiver em uso.
- ✅ **Modal de preview/edição/exclusão** — nova página de uploads com `ImageDetailModal`: preview ampliado, edição de `alt`/`caption`, exclusão com confirmação (`AlertDialog`), loading states, toast de feedback.
- ✅ **Hooks `useUpdateImage` e `useDeleteImage`** — mutations React Query para PATCH e DELETE.
- ✅ **Card clicável** — grid de imagens agora abre modal ao clicar, com `cursor-pointer` e `hover:ring`.

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

## 🚨 Pendentes (6)

| # | Gravidade | Arquivo | Problema | Descoberta |
|---|-----------|---------|----------|:----------:|
| 1 | 🔴 | `controllers/news.controller.ts:12-13` | View cache em `Map` global — **OOM** possível, não compartilhado entre workers | Auditoria anterior |
| 2 | 🔴 | `frontend/src/lib/api.ts:24-27` | Access token em **sessionStorage** — vulnerável a XSS. Preferir httpOnly cookie | 🔍 Nova |
| 3 | 🔴 | `backend/src/**/*.service.ts` | **Zero testes automatizados** (0% cobertura) — Vitest instalado mas sem config | 🔍 Nova |
| 4 | 🟡 | `routes/auth.routes.ts:17` | Rate limit **só por IP** — botnet 1000 IPs = 5000 tentativas/min | Auditoria anterior |
| 5 | 🟡 | `utils/slug.ts:6-7` | Slug **quebra Unicode** (japonês/árabe/emoji → `""` → erro 500) | Auditoria anterior |
| 6 | 🟡 | `services/auth.service.ts:66-72` | Refresh token roubado: access tokens vigentes **não invalidados** (janela 15min) | Auditoria anterior |

### ⚠ Potenciais
| Arquivo | Problema | Gravidade |
|---------|----------|:---------:|
| `services/news.service.ts:81-134` | `as string` sem fallback — dado corrompido retorna `"null"` | 🟡 |
| `services/storage/storage-provider.ts:80` | `storageProvider` é singleton global sem injeção de dependência — difícil de mockar | 🟡 |
| `prisma/migrations/*/migration.sql` | `CREATE INDEX` sem `CONCURRENTLY` — bloqueia tabela em produção | 🟡 |
| `controllers/news.controller.ts:24` | `setInterval` sem `clearInterval` — memory leak em testes | 🟡 |
| `services/auth.service.ts:108-118` | `AuthService` acoplado a `FastifyInstance` — difícil testar isoladamente | 🟡 |
| `seed.ts:571-575` | Senha fallback aparece no log | 🟠 |
| `config/database.ts:12` | `as never` no evento Prisma — type safety desligado | 🟠 |
| `frontend/src/app/(public)/hero-section.tsx:10-19` | `suppressHydrationWarning` em data — pode causar mismatch SSR | 🟠 |
| `ci.yml` | Pipeline CI **não executa testes** — PRs podem mergear com testes quebrados | 🔴 |

### ❌ Resolvidos nesta auditoria
| # | Arquivo | Problema | Status |
|---|---------|----------|:------:|
| — | `backend/tests/` | Diretórios de test vazios (já conhecido) | ⚠️ Permanece |
| — | `frontend/package.json` | Nenhuma dependência de teste instalada | ⚠️ Permanece |
| — | `frontend/src/hooks/useNews.ts:90-108` | `filter()` no cliente em vez de `?is_featured=true` | ✅ Verificado na análise |

---

## 📋 Próximas Etapas

| Etapa | Itens | Esforço | Impacto |
|-------|-------|:-------:|:-------:|
| **4** — Testes (parte 1) | `vitest.config.ts` + testes `utils/` + schemas + CI `npm test` | ~1h | 🔴 |
| **5** — Testes (parte 2) | AuthService + NewsService unit tests + setup banco teste | ~3h | 🔴 |
| **6** — Segurança | tokenVersion + refresh fingerprint + lru-cache views + slug Unicode | ~45min | 🟡 |
| **7** — Finos | Access token httpOnly + DELETE 204 + Prettier + EditorConfig | ~30min | 🟡 |
| **8** — Frontend Tests | Instalar testing-library + Vitest + testar ApiClient + hooks | ~2h | 🟡 |

---

## ✅ Pontos Fortes

- Arquitetura em camadas (Controller → Service → Repository) com injeção de dependência
- Multi-tenant via `portalId` bem implementado com índices compostos
- Refresh token rotation com detecção de roubo
- Sanitização HTML dupla (backend sanitize-html + frontend DOMPurify)
- Schema do banco normalizado com índices e chaves compostas
- Docker compose funcional com healthcheck e multi-stage builds
- Pipeline CI/CD estruturado (lint → typecheck → build → Docker push)
- Upload via presigned URL (browser → R2) — sem gargalo no servidor
- README extremamente completo (24 seções + diagramas + ADRs)
- Swagger API docs em `/docs`
- Helmets com Content Security Policy configurada
- Rate limiting por rota (login: 5 tentativas/10min)
- Constantes centralizadas no frontend (`API_URL`, `SITE_URL`)
- ISR para páginas públicas com `revalidate: 60`
