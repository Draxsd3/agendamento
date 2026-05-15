# Agendamento SaaS

Sistema de agendamento online multi-tenant para barbearias, estúdios e salões.

## Estrutura do repositório

```
.
├── backend/        ← API Node/Express (Supabase como banco)
├── frontend/       ← Painel SPA React + Vite (admin, dono, cliente)
├── website/        ← Landing pública (TypeScript + Vite). Build vai para frontend/public/site/
├── database/       ← schema.sql, migrations/ e seeds/ para o Supabase
├── docs/           ← Documentação (roteiro de testes, etc.)
├── scripts/        ← Scripts utilitários (pre-deploy-check, etc.)
├── render.yaml     ← Config de deploy do backend no Render
└── frontend/vercel.json  ← Config de deploy do frontend no Vercel
```

## Stack

- **Backend**: Node 20, Express, Supabase (Postgres + Storage), JWT
- **Frontend**: React 18, Vite, Tailwind, React Router, React Query, React Hook Form
- **Landing**: React 18, TypeScript, Vite, shadcn/ui
- **Deploy**: backend no Render, frontend no Vercel, landing buildada para dentro do frontend

## Rodando localmente

### Pré-requisitos

- Node 20
- Projeto Supabase ativo
- `.env` em `backend/` (veja `backend/.env.example`)
- `.env.local` em `frontend/` opcional (veja `frontend/.env.example`)

### Banco

Aplique o schema e as migrations no SQL Editor do Supabase. Veja [database/README.md](database/README.md) para a ordem das migrations.

### Backend

```bash
cd backend
npm install
npm run dev          # http://localhost:3001
npm run check        # lint
```

### Frontend

```bash
cd frontend
npm install
npm run dev          # http://localhost:5173
npm run ci           # lint + build
```

### Landing (website)

```bash
cd website
npm install
npm run dev          # http://localhost:8080
npm run build        # gera dist/, copie o conteúdo para ../frontend/public/site/
```

Veja `website/README.md` para detalhes.

## Deploy

### Backend (Render)

`render.yaml` declara o serviço. Cada push em `main` dispara build automático.

Antes de subir mudanças, rode no terminal:

```bash
bash scripts/pre-deploy-check.sh
```

Variáveis de ambiente obrigatórias no painel do Render: `JWT_SECRET`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `CORS_ORIGIN`, `FRONTEND_URL`.

### Frontend (Vercel)

`frontend/vercel.json` configura:
- `/api/v1/*` → proxy para o backend em produção
- `/` e `/site` → landing buildada em `frontend/public/site/`
- demais rotas → SPA React

### Banco (Supabase)

Não há ferramenta de migração automática. Veja [database/README.md](database/README.md).

## Convenções

- **Branch principal**: `main` (deploy automático).
- **Commits**: usar prefixos `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`.
- **Lint obrigatório**: `npm run check` (backend) e `npm run ci` (frontend) precisam passar antes de subir.
- **Nunca commitar** `.env`, credenciais, `node_modules/`, `dist/` ou logs locais (já cobertos pelo `.gitignore`).

## Documentação adicional

- [Roteiro de testes do sistema](docs/ROTEIRO_TESTES_SISTEMA.md)
- [Database — schema, migrations e seeds](database/README.md)
