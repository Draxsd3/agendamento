-- =============================================================================
-- AGENDAMENTO SAAS - ASAAS INTEGRATION
-- Execute no SQL Editor do Supabase apos schema_additions.sql
-- =============================================================================

ALTER TABLE customers
  ADD COLUMN IF NOT EXISTS asaas_customer_id VARCHAR(100),
  ADD COLUMN IF NOT EXISTS asaas_customer_synced_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS city VARCHAR(120),
  ADD COLUMN IF NOT EXISTS province VARCHAR(120);

CREATE INDEX IF NOT EXISTS idx_customers_asaas_customer_id
  ON customers(asaas_customer_id);

ALTER TABLE subscriptions
  ADD COLUMN IF NOT EXISTS payment_provider VARCHAR(30),
  ADD COLUMN IF NOT EXISTS provider_customer_id VARCHAR(100),
  ADD COLUMN IF NOT EXISTS provider_subscription_id VARCHAR(100),
  ADD COLUMN IF NOT EXISTS provider_checkout_id VARCHAR(100),
  ADD COLUMN IF NOT EXISTS provider_payment_id VARCHAR(100),
  ADD COLUMN IF NOT EXISTS checkout_url TEXT,
  ADD COLUMN IF NOT EXISTS payment_method VARCHAR(30),
  ADD COLUMN IF NOT EXISTS payment_status VARCHAR(40),
  ADD COLUMN IF NOT EXISTS metadata JSONB NOT NULL DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_subscriptions_provider_subscription_id
  ON subscriptions(provider_subscription_id);

CREATE INDEX IF NOT EXISTS idx_subscriptions_provider_checkout_id
  ON subscriptions(provider_checkout_id);
