# Diário alimentar

App em Next.js para registrar refeições por período do dia e exportar PDF mensal.

## Configuração do Supabase

1. Copie `.env.example` para `.env.local` e preencha:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
DATABASE_URL=...
DIRECT_URL=...
```

Para produção com Prisma + Supabase:

- `DATABASE_URL`: use a URL do **Connection Pooling** (porta `6543`, com `?pgbouncer=true&connection_limit=1&sslmode=require`).
- `DIRECT_URL`: use a URL **direta** do banco (host `db.<project-ref>.supabase.co`, porta `5432`, com `?sslmode=require`) para migrations.

2. Em **Authentication > Providers**, deixe o provedor de e-mail/senha ativo.

## Rodando localmente

```bash
npm install
npx prisma generate
npx prisma migrate deploy
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

## Observações

- O acesso é autenticado: cada usuário visualiza/edita apenas suas próprias refeições.
- A API do app usa a sessão do Supabase e o Prisma para ler/gravar em `public.diary_meals`.
- O bucket `avatars` e as policies (RLS + storage) são criados via Prisma migration.
