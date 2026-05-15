-- =============================================================================
-- AGENDAMENTO SAAS - ASAAS SUBACCOUNTS
-- Execute no SQL Editor do Supabase
-- =============================================================================

ALTER TABLE establishments
  ADD COLUMN IF NOT EXISTS asaas_account_id VARCHAR(100),
  ADD COLUMN IF NOT EXISTS asaas_api_key TEXT,
  ADD COLUMN IF NOT EXISTS asaas_wallet_id VARCHAR(100),
  ADD COLUMN IF NOT EXISTS asaas_account_email VARCHAR(255),
  ADD COLUMN IF NOT EXISTS asaas_person_type VARCHAR(20),
  ADD COLUMN IF NOT EXISTS asaas_cpf_cnpj VARCHAR(30),
  ADD COLUMN IF NOT EXISTS asaas_birth_date DATE,
  ADD COLUMN IF NOT EXISTS asaas_company_type VARCHAR(50),
  ADD COLUMN IF NOT EXISTS asaas_account_status JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS asaas_onboarding_links JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS asaas_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS asaas_last_synced_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_establishments_asaas_account_id
  ON establishments(asaas_account_id);

CREATE INDEX IF NOT EXISTS idx_establishments_asaas_wallet_id
  ON establishments(asaas_wallet_id);
