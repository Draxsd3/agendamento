#!/usr/bin/env bash
# =============================================================================
# pre-deploy-check.sh — Verificações mínimas antes de fazer deploy
# Uso: bash pre-deploy-check.sh
# =============================================================================
set -e

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
PASS="${GREEN}✔${NC}"; FAIL="${RED}✘${NC}"; WARN="${YELLOW}⚠${NC}"

echo ""
echo "========================================"
echo "  Pre-deploy check — Agendamento SaaS"
echo "========================================"
echo ""

ERRORS=0

check() {
  local label="$1"; local cmd="$2"
  printf "  %-45s" "$label"
  if eval "$cmd" > /dev/null 2>&1; then
    echo -e "$PASS"
  else
    echo -e "$FAIL"
    ERRORS=$((ERRORS+1))
  fi
}

warn_check() {
  local label="$1"; local cmd="$2"
  printf "  %-45s" "$label"
  if eval "$cmd" > /dev/null 2>&1; then
    echo -e "$PASS"
  else
    echo -e "$WARN  (não bloqueante)"
  fi
}

# ── Ambiente ──────────────────────────────────────────────────────────────────
echo "→ Ambiente"
check "Node.js >= 18" "node -e 'if(parseInt(process.versions.node)<18)process.exit(1)'"
check "npm instalado"   "npm --version"
echo ""

# ── Backend ───────────────────────────────────────────────────────────────────
echo "→ Backend"
check "node_modules instalados"  "test -d backend/node_modules"
check "Lint sem erros"           "cd backend && npm run check"
check ".env existe"              "test -f backend/.env"

# Verificar segredos fracos no .env
printf "  %-45s" "JWT_SECRET forte (>= 32 chars)"
JWT=$(grep '^JWT_SECRET=' backend/.env 2>/dev/null | cut -d= -f2-)
if [ ${#JWT} -ge 32 ] && [[ "$JWT" != *"chavesegura"* ]] && [[ "$JWT" != *"changeme"* ]]; then
  echo -e "$PASS"
else
  echo -e "$FAIL  — execute: openssl rand -base64 64"
  ERRORS=$((ERRORS+1))
fi

printf "  %-45s" "NODE_ENV=production no .env"
if grep -q 'NODE_ENV=production' backend/.env 2>/dev/null; then
  echo -e "$PASS"
else
  echo -e "$WARN  (definido como development)"
fi

printf "  %-45s" "EMAIL_HOST configurado"
if grep -qE '^EMAIL_HOST=.+' backend/.env 2>/dev/null; then
  echo -e "$PASS"
else
  echo -e "$WARN  — reset de senha não enviará e-mails"
fi
echo ""

# ── Frontend ──────────────────────────────────────────────────────────────────
echo "→ Frontend"
check "node_modules instalados"    "test -d frontend/node_modules"
check "Lint + build sem erros"     "cd frontend && npm run ci"
warn_check "VITE_API_URL no .env"  "grep -qE '^VITE_API_URL=https://' frontend/.env 2>/dev/null"
echo ""

# ── Git ───────────────────────────────────────────────────────────────────────
echo "→ Git / segurança"

printf "  %-45s" "Nenhum .env commitado"
if git ls-files | grep -qE '(^|/)\.env$'; then
  echo -e "$FAIL  — remova com: git rm --cached <arquivo>"
  ERRORS=$((ERRORS+1))
else
  echo -e "$PASS"
fi

printf "  %-45s" "credenciais.txt não commitado"
if git ls-files | grep -q 'credenciais.txt'; then
  echo -e "$FAIL  — remova com: git rm --cached credenciais.txt"
  ERRORS=$((ERRORS+1))
else
  echo -e "$PASS"
fi

warn_check ".gitignore cobre .env"  "grep -q '\.env' .gitignore"
echo ""

# ── Resultado ─────────────────────────────────────────────────────────────────
echo "========================================"
if [ $ERRORS -eq 0 ]; then
  echo -e "  ${GREEN}Tudo OK — pronto para deploy!${NC}"
else
  echo -e "  ${RED}$ERRORS erro(s) encontrado(s). Corrija antes do deploy.${NC}"
fi
echo "========================================"
echo ""

exit $ERRORS
