# Website (landing pública)

Landing page pública servida em `/` e `/site` do app principal.

Stack: React 18 + TypeScript + Vite + Tailwind + shadcn/ui.

## Rodar localmente

```bash
npm install
npm run dev          # http://localhost:8080
```

## Build e publicação

Vite gera os arquivos com `base: "/site/"`. Após o build, copie o conteúdo de `dist/` para `../frontend/public/site/` para que o frontend principal sirva a landing:

```bash
npm run build
rm -rf ../frontend/public/site/*
cp -r dist/* ../frontend/public/site/
```

Esse passo é manual hoje. Commite o resultado em `frontend/public/site/` quando publicar mudanças na landing.

## Scripts

- `npm run dev` — servidor local
- `npm run build` — build de produção
- `npm run preview` — preview do build
- `npm run lint` — eslint
