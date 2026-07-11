# 🔍 AUDITORIA TÉCNICA — PORTAL NTB

> **Data:** 10/07/2026
> **Escopo:** 93+ arquivos (backend Fastify + frontend Next.js)
> **Metodologia:** Rastreamento completo de fluxos (Controller → Service → Repository → Prisma → Banco), testes em runtime, verificação linha a linha.

---

## 📊 NOTA GERAL

| Dimensão | Nota |
|----------|------|
| **Arquitetura** | 7.0 |
| **Segurança** | 5.5 |
| **Performance** | 6.0 |
| **Escalabilidade** | 5.0 |
| **Código** | 6.5 |
| **Testabilidade** | 4.0 |
| **Manutenibilidade** | 6.5 |
| **Legibilidade** | 7.5 |
| **Documentação** | 6.0 |
| **NOTA GERAL** | **6.0/10** |

---

## ✔ BUGS CONFIRMADOS (10)

---

### 🔴 CRÍTICO #1: `maxAge` do cookie de refresh — 1000× maior que o correto

| Campo | Valor |
|-------|-------|
| **Confiança** | 100% |
| **Arquivo** | `backend/src/controllers/auth.controller.ts` |
| **Linhas** | 20 vs 45 |

**Problema:**

```ts
// Login (L20) — correto: segundos
maxAge: 7 * 24 * 60 * 60,  // 604.800 segundos = 7 dias ✅

// Refresh (L45) — incorreto: milissegundos
maxAge: 7 * 24 * 60 * 60 * 1000,  // 604.800.000 ms ≈ 19 anos ❌
```

O parâmetro `maxAge` do `setCookie` (Fastify) é **sempre em segundos**, não milissegundos. O `* 1000` extra faz o cookie expirar em ~19 anos.

**Impacto:** Cookie de refresh token expira em 19 anos no navegador vs 7 dias no banco. Inconsistência total.

**Correção:** Remover `* 1000`.

---

### 🔴 CRÍTICO #2: CSRF plugin registrado mas sem efeito

| Campo | Valor |
|-------|-------|
| **Confiança** | 95% |
| **Arquivo** | `backend/src/app.ts` |
| **Linha** | 85 |

**Problema:** `await app.register(csrf)` registra o plugin mas **não é aplicado como `preHandler`** em nenhuma rota POST/PUT/PATCH/DELETE. O Fastify não bloqueia requisições sem token CSRF automaticamente.

**Correção:**
```ts
app.addHook('preHandler', async (req, reply) => {
  if (['POST','PUT','PATCH','DELETE'].includes(req.method))
    await app.csrfProtection(req, reply)
})
```

---

### 🔴 CRÍTICO #3: Atualização de tags fora de transação — perda de dados

| Campo | Valor |
|-------|-------|
| **Confiança** | 100% |
| **Arquivo** | `backend/src/services/news.service.ts` |
| **Linhas** | 276-285 |

**Problema:**

```ts
// FORA DE TRANSAÇÃO
await prisma.newsTag.deleteMany({ where: { newsId: id } });
if (tag_ids.length > 0) {
  await prisma.newsTag.createMany({ data: ... }); // Se falhar aqui, tags perdidas
}
return this.newsRepository.update(id, updateData); // Roda mesmo se createMany falhou
```

**Impacto:** Perda irreversível de associações de tags. Notícia fica sem tags se `createMany` falhar.

**Correção:** Envolver em `prisma.$transaction()`.

---

### 🟠 ALTA #4: Deleção de imagem R2 não atômica — sem transação

| Campo | Valor |
|-------|-------|
| **Confiança** | 100% |
| **Arquivo** | `backend/src/services/news.service.ts` |
| **Linhas** | 271-273, 334-336 |

**Problema:** Imagem deletada do R2 **antes** da operação no banco, fora de qualquer transação. `catch(() => {})` engole erros. Se o banco falhar depois da deleção R2, a imagem foi deletada mas o registro permanece — ou vice-versa.

**Impacto:** Inconsistência storage ↔ banco. Imagens órfãs no R2 ou registros órfãos no banco.

**Correção:** Mover deleção R2 e operação do banco para dentro de `$transaction`.

---

### 🟠 ALTA #5: View cache em memória — vulnerável a OOM

| Campo | Valor |
|-------|-------|
| **Confiança** | 100% |
| **Arquivo** | `backend/src/controllers/news.controller.ts` |
| **Linhas** | 12-13, 67-84 |

**Problema:** `Map<string, number>` global. Atacante com IPs variados (VPN, botnet) força crescimento indefinido. Limpeza O(n) a cada 10k entradas. Cache **não compartilhado** entre workers.

**Impacto:** DDoS por exaustão de memória (OOM). Views contadas separadamente por worker.

**Correção:** Substituir por `lru-cache` com `max: 10000, ttl: 300000` ou Redis.

---

### 🟠 ALTA #6: sanitize-html permite iframes de qualquer origem

| Campo | Valor |
|-------|-------|
| **Confiança** | 100% (testado em runtime) |
| **Arquivo** | `backend/src/services/news.service.ts` |
| **Linhas** | 28-38 |

**Problema:** Testei em runtime:

```
Entrada: <iframe src="https://evil.com/malware"></iframe>
Saída:   <iframe src="https://evil.com/malware"></iframe>  ← passou!
```

Falta `allowedIframeHostnames`. `allowedSchemes` só protege links `<a>`, não `src` de iframe.

**Impacto:** Jornalista ou atacante com acesso de editor pode embutir qualquer site (phishing, malware) no conteúdo da notícia.

**Correção:**
```ts
allowedIframeHostnames: ["www.youtube.com", "player.vimeo.com"],
```

---

### 🟡 MÉDIO #7: Refresh token reuse não invalida access tokens atuais

| Campo | Valor |
|-------|-------|
| **Confiança** | 95% |
| **Arquivo** | `backend/src/services/auth.service.ts` |
| **Linhas** | 66-72 |

**Problema:** Ao detectar refresh token roubado, todos os refresh tokens são revogados. Mas **access tokens JWT com expiração de 15 minutos continuam válidos**.

**Impacto:** Janela de 15 min onde atacante ainda tem acesso via access token.

**Melhor prática:** Adicionar `tokenVersion` na tabela `User`, incluir no JWT, verificar em toda rota autenticada.

---

### 🟡 MÉDIO #8: Refresh token sem fingerprint (IP / User-Agent)

| Campo | Valor |
|-------|-------|
| **Confiança** | 90% |
| **Arquivo** | `backend/src/services/auth.service.ts` |
| **Linhas** | 50-91 |

**Problema:** Refresh token validado apenas por hash + expiry. Sem verificação de IP, User-Agent, ou qualquer fingerprint.

**Impacto:** Roubo de sessão indetectável. Atacante pode usar refresh token de qualquer lugar sem ser detectado (a menos que haja reuse detection).

---

### 🟡 MÉDIO #9: Slug pode ser string vazia para títulos não-latinos

| Campo | Valor |
|-------|-------|
| **Confiança** | 95% |
| **Arquivo** | `backend/src/utils/slug.ts` |
| **Linhas** | 1-9 |

**Problema:** `replace(/[^a-z0-9]+/g, "-")` remove tudo que não é latino. Título `"ニュース"` ou `"مرحبا"` gera slug `""`. Violação de constraint `@@unique([slug, portalId])` → erro 500.

**Correção:**
```ts
if (!slug) slug = `untitled-${crypto.randomBytes(4).toString('hex')}`;
```

---

### 🟡 MÉDIO #10: Banner upsert não deleta imagem antiga do R2

| Campo | Valor |
|-------|-------|
| **Confiança** | 100% |
| **Arquivo** | `backend/src/services/banner.service.ts` |
| **Linhas** | 79-105 |

**Problema:** `upsert()` sempre gasta nova URL mas **nunca chama `delete()`** na imagem anterior.

**Impacto:** Imagens órfãs acumuladas no R2 a cada troca de banner.

---

## ⚠ POTENCIAIS PROBLEMAS (5)

### ⚠ #11: Rate limit de login por IP apenas

| Campo | Valor |
|-------|-------|
| **Confiança** | 85% |
| **Arquivo** | `backend/src/routes/auth.routes.ts:14-17` |

Rate limit de 5 tentativas/10min **por IP**. Botnet de 1000 IPs = 5000 tentativas/min. Sem bloqueio por email. Atenuado por bcrypt custo 12 (~250ms/tentativa).

### ⚠ #12: JWT secret reusado como cookie secret

| Campo | Valor |
|-------|-------|
| **Confiança** | 90% |
| **Arquivo** | `backend/src/app.ts:57,72` |

Mesmo segredo para JWT e cookies. Se um vazar, o outro está comprometido.

### ⚠ #13: Type assertions (`as`) sem fallback em `toNewsResponse`

| Campo | Valor |
|-------|-------|
| **Confiança** | 95% |
| **Arquivo** | `backend/src/services/news.service.ts:81-134` |

```ts
slug: news.slug as string,   // Se null → "null" (string)
status: news.status as string, // Se null → "null" (string)
```

Campos sem fallback. Dados corrompidos no banco retornam `"null"` em vez de `null`.

### ⚠ #14: Migration cria índices GIN sem CONCURRENTLY

| Campo | Valor |
|-------|-------|
| **Confiança** | 99% |
| **Arquivo** | `backend/prisma/migrations/*/migration.sql` |

`CREATE INDEX` dentro de transação = bloqueia tabela com `ACCESS EXCLUSIVE LOCK`. Para tabelas grandes, minutos de downtime.

### ⚠ #15: Frontend hooks filtram no cliente em vez do servidor

| Campo | Valor |
|-------|-------|
| **Confiança** | 100% |
| **Arquivo** | `frontend/src/hooks/useNews.ts:90-108` |

`useFeaturedNews` e `useBreakingNews` usam `filter()` no cliente em vez de `?is_featured=true` e `?is_breaking=true`. Desperdício de banda.

---

## 💡 SUGESTÕES DE MELHORIA

### 🔧 Duplicação de código no NewsService.create() (L162-227)

26 linhas duplicadas no catch de slug collision. Qualquer novo campo precisa ser adicionado em 2 lugares. Refatorar para verificar slug antes de tentar criar.

### 🔧 Inconsistência no formato de erro (auth.controller.ts:33-37)

Usa `reply.send()` direto em vez de `sendSuccess`. Diferença sutil no formato comparado com o error handler global.

### 🔧 Campo `url` na tabela `images` enganoso

`url` recebe a key em vez da URL pública. Resolvido manualmente no controller com `storageProvider.getPublicUrl()`.

### 🔧 Seed expõe senha fallback no log (seed.ts:571-575)

`'temp-admin-change-me-please'` aparece no log do seed. Risco baixo mas evitável.

---

## 📋 AÇÕES PRIORITÁRIAS

### Imediatas (hoje)
1. 🔴 Corrigir `maxAge` do cookie de refresh: `7*24*60*60` (sem `*1000`)
2. 🔴 Adicionar `allowedIframeHostnames` no sanitize-html

### Curto prazo (esta semana)
3. 🔴 Aplicar CSRF protection como `preHandler` global
4. 🔴 Mover atualização de tags para dentro de transação
5. 🟠 Envolver deleção de imagem R2 em transação
6. 🟠 Substituir `Map` de views por `lru-cache` ou Redis

### Médio prazo (este mês)
7. 🟡 Adicionar `tokenVersion` no User para invalidar access tokens
8. 🟡 Adicionar rate limit por email no login
9. 🟡 Tratar slug vazio para Unicode
10. 🟡 Deletar imagem antiga do banner no upsert

---

## ✅ PONTOS POSITIVOS DO PROJETO

- **Refresh token rotation** com detecção de reuse implementada corretamente
- **Sanitização HTML dupla camada** (backend sanitize-html + frontend DOMPurify)
- **Erros consistentes** com `AppError` em toda a cadeia
- **Dependency Injection** nos services (embora sem testes)
- **Multi-tenant** via `portalId` bem implementado em toda a stack
- **Schema do banco** bem normalizado com índices apropriados
- **Seed completo** com dados realistas
- **Docker compose funcional** com healthcheck
- **Pipeline CI/CD** estruturado (CI → Docker Build → Deploy)
- **Rate limit por IP** no login já existe (falta complementar com email)
