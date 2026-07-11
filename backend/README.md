# Backend — CMS Portal NTB

Backend em Fastify + Prisma + PostgreSQL para CMS de notícias multiportal.

## Stack

| Tecnologia | Versão | Uso |
|---|---|---|
| Node.js | 22.x | Runtime |
| Fastify | 5.x | Framework HTTP |
| Prisma | 5.x | ORM / Migrations |
| PostgreSQL | 16 | Banco de dados |
| Zod | 3.x | Validação |
| JWT | — | Autenticação |
| AWS SDK S3 | — | Cloudflare R2 / S3 |
| Pino | — | Logging |

## Primeiros passos

```bash
# Instalar dependências
npm install

# Copiar variáveis de ambiente
cp .env.example .env  # e preencher

# Rodar migrações
npx prisma migrate dev

# Popular banco com dados iniciais
npx prisma db seed

# Iniciar desenvolvimento
npm run dev
```

Servidor em `http://localhost:3001` — Swagger em `/docs`.

## Credenciais de Teste

| Role | Email | Senha |
|---|---|---|
| Admin | admin@portal.com | Definida via `SEED_PASSWORD` no `.env` |
| Editor | editor@portal.com | Definida via `SEED_PASSWORD` no `.env` |
| Jornalista | jornalista@portal.com | Definida via `SEED_PASSWORD` no `.env` |
| Jornalista | marina@portal.com | Definida via `SEED_PASSWORD` no `.env` |

> ⚠️ Se `SEED_PASSWORD` não for definida, a senha padrão é `temp-admin-change-me-please`. Altere no `.env` antes de usar em produção.

## Scripts

```bash
npm run dev                    # Desenvolvimento (hot reload)
npm run build                  # Compilar TypeScript
npm run start                  # Rodar produção
npm run prisma:studio          # Prisma Studio
npm run prisma:migrate         # Criar migration
npm run prisma:seed            # Seed
```

## Estrutura

```
src/
├── config/           # Env, banco, JWT
├── controllers/      # Handlers HTTP
├── services/         # Lógica de negócio
│   └── storage/      # StorageProvider (R2/S3)
├── repositories/     # Acesso a dados (Prisma)
├── middlewares/       # Auth, error handling
├── routes/           # Definição de rotas
├── schemas/          # Validação Zod
├── types/            # Interfaces TypeScript
└── utils/            # Utilitários
```

## Modelos do Banco

### Core
- **Portal** — Raiz do multi-tenant
- **User** — Admin, Editor, Jornalista
- **Role** — Permissões (ADMIN, EDITOR, JOURNALIST)
- **Session / RefreshToken** — Sessões

### Conteúdo
- **News** — Notícias com suporte a coverImageKey (storage key)
- **Category** — Categorias hierárquicas
- **Tag** — Tags
- **NewsTag** — Relação N:N entre notícias e tags

### Mídia
- **Image** — Metadados de imagens enviadas (key única)
- **Banner** — Anúncio 728x90 configurável por portal

## Endpoints

Documentação completa em `/docs` (swagger).

### Públicos
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/news` | Listar notícias publicadas |
| GET | `/news/:slug` | Detalhes da notícia |
| GET | `/categories` | Listar categorias |
| GET | `/tags` | Listar tags |
| GET | `/banner` | Banner ativo |
| POST | `/banner/click` | Registrar clique |

### Autenticados (JWT)
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/news` | Criar notícia |
| PUT | `/news/:id` | Atualizar notícia |
| PATCH | `/news/:id/publish` | Publicar notícia |
| PATCH | `/news/:id/archive` | Arquivar notícia |
| DELETE | `/news/:id` | Excluir notícia |
| POST | `/upload/presigned` | Gerar URL de upload |
| GET | `/upload/images` | Listar imagens |
| GET | `/banner/admin` | Banner atual (admin) |
| PUT | `/banner` | Salvar banner |
| DELETE | `/banner` | Remover banner |

### Estatísticas (JWT)
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/stats/dashboard` | Estatísticas agregadas do dashboard |

### Públicos (SEO)
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/sitemap.xml` | Sitemap dinâmico |
| GET | `/rss` | Feed RSS |
| GET | `/robots.txt` | Robots.txt |

## Storage

O sistema usa **Cloudflare R2** (compatível com S3) para armazenamento de imagens.

- Upload direto browser → R2 via presigned URLs
- Apenas a **key** é salva no banco (ex: `news-images/originals/2026/07/uuid.jpg`)
- URL pública é resolvida pelo `StorageProvider` na resposta da API
- Trocar de provedor (R2 → S3 → MinIO) requer mudança apenas no `StorageProvider`
