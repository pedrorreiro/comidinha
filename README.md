# Diário alimentar

App em Next.js para registrar refeições por período do dia e exportar PDF mensal.

## Configuração do Supabase

1. Copie `.env.example` para `.env.local` e preencha:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

2. No painel do Supabase, execute o SQL de `supabase/schema.sql`.
3. Em **Authentication > Providers**, deixe o provedor de e-mail/senha ativo.

## Rodando localmente

```bash
npm install
npx prisma generate
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

## Observações

- O acesso é autenticado: cada usuário visualiza/edita apenas suas próprias refeições.
- A API do app usa a sessão do Supabase e o Prisma para ler/gravar em `public.diary_meals`.
