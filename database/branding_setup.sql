-- =============================================================================
-- AGENDAMENTO SAAS - BRANDING SETUP
-- Execute este script no SQL Editor do Supabase para habilitar:
-- 1. personalizacao visual do estabelecimento
-- 2. upload direto de logo via Supabase Storage
-- =============================================================================

-- -----------------------------------------------------------------------------
-- CAMPOS DE BRANDING NO ESTABELECIMENTO
-- -----------------------------------------------------------------------------

ALTER TABLE establishments
  ADD COLUMN IF NOT EXISTS primary_color      VARCHAR(7)  DEFAULT '#2563EB',
  ADD COLUMN IF NOT EXISTS accent_color       VARCHAR(7)  DEFAULT '#0F172A',
  ADD COLUMN IF NOT EXISTS booking_heading    VARCHAR(80),
  ADD COLUMN IF NOT EXISTS booking_subheading TEXT;

COMMENT ON COLUMN establishments.primary_color IS 'Cor principal da identidade visual da pagina publica.';
COMMENT ON COLUMN establishments.accent_color IS 'Cor de destaque/apoio da identidade visual da pagina publica.';
COMMENT ON COLUMN establishments.booking_heading IS 'Titulo principal exibido no topo da pagina publica.';
COMMENT ON COLUMN establishments.booking_subheading IS 'Texto de apoio exibido na pagina publica.';

-- -----------------------------------------------------------------------------
-- BUCKET PUBLICO PARA LOGOS DOS ESTABELECIMENTOS
-- O backend usa service role, entao o upload nao depende de policy publica.
-- Ainda assim, o bucket precisa existir e ser publico para servir a logo.
-- -----------------------------------------------------------------------------

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'establishment-branding',
  'establishment-branding',
  true,
  2097152,
  ARRAY['image/png', 'image/jpeg', 'image/webp']
)
ON CONFLICT (id) DO UPDATE
SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;
