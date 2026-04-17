-- =============================================================================
-- AGENDAMENTO SAAS — RECUPERAÇÃO DE SENHA
-- Execute no SQL Editor do Supabase antes de ativar o reset de senha.
-- =============================================================================

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS password_reset_token       TEXT,
  ADD COLUMN IF NOT EXISTS password_reset_expires_at  TIMESTAMPTZ;

-- Índice para busca rápida pelo token (chamada em cada clique no link)
CREATE INDEX IF NOT EXISTS idx_users_password_reset_token
  ON public.users (password_reset_token)
  WHERE password_reset_token IS NOT NULL;

COMMENT ON COLUMN public.users.password_reset_token      IS 'Token aleatório de 64 hex chars para redefinição de senha. Nulo quando não há solicitação ativa.';
COMMENT ON COLUMN public.users.password_reset_expires_at IS 'Expiração do token de redefinição. O backend invalida tokens expirados na consulta.';
