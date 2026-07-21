# Backend — Regras e Padrões

## Arquitetura

### Estrutura
```
src/
├── config/           # Env, banco, JWT
├── controllers/      # Handlers HTTP (slim — delegam para services)
├── services/         # Lógica de negócio
│   └── storage/      # StorageProvider para R2/S3
├── repositories/     # Acesso a dados via Prisma
├── middlewares/       # Autenticação e error handling
├── routes/           # Definição de rotas Fastify
├── schemas/          # Validação Zod
├── types/            # Interfaces e tipos
└── utils/            # Helpers
```

### Padrões

1. **Controllers são finos** — validam input, chamam service, retornam resposta. Nunca acessam banco diretamente.
2. **Services concentram a lógica** — regras de negócio, sanitização, permissões.
3. **Repositories abstraem o Prisma** — Interfaces (I*Repository) para facilitar testes e desacoplamento.
4. **StorageProvider** — Classe concreta que centraliza toda a lógica de S3/R2. Único lugar que importa o AWS SDK.
5. **Schemas (Zod)** — Validam entrada em controllers e rotas. Mensagens em português.

### Imagens / Storage

- Apenas a **key** é salva no banco (ex: `news-images/originals/2026/07/uuid.jpg`)
- URL pública é resolvida pelo `StorageProvider.getPublicUrl(key)` na hora da resposta
- Upload é feito via presigned URL (browser → R2, sem passar pelo servidor)
- `cover_image` (URL legada) mantido como fallback — prefira `cover_image_key`
- Ao **deletar** uma imagem, o sistema verifica se há notícias vinculadas via `coverImageKey`. Se sim, bloqueia a exclusão com erro 400.
- Metadados (`alt`, `caption`) são editáveis via `PATCH /upload/images/:id`
- O registro da imagem é criado **no momento da geração da presigned URL**, não após o upload real. Isso significa que registros órfãos podem existir se o upload falhar.

### Modelos

- **News.coverImageKey** — key da imagem de capa no storage
- **News.coverImage** — campo legado (URL completa). Usado apenas como fallback
- **Image** — metadados de imagens enviadas (key única por portal)
- **Banner** — anúncio 728x90 (imageKey, imageUrl, alt, linkUrl, clicks)

### Migrations

- Criar migration: `npx prisma migrate dev --create-only`
- Aplicar: `npx prisma migrate deploy`
- Reset completo: `npx prisma migrate reset --force` (destrói dados)

### Seed

```bash
npx prisma db seed
```

Cria: 1 portal, 3 roles, 4 usuários, 8 categorias, 15 tags, 21 notícias.
