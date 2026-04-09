-- =============================================================================
-- AGENDAMENTO SAAS - SCHEMA ADDITIONS v2
-- Execute no SQL Editor do Supabase APÓS rodar schema.sql
-- Adiciona: branches (filiais), plans (planos), subscriptions (assinaturas)
-- Estende: customers (campos de perfil)
-- =============================================================================

-- =============================================================================
-- EXTEND CUSTOMERS TABLE
-- =============================================================================

ALTER TABLE customers ADD COLUMN IF NOT EXISTS cpf        VARCHAR(20);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS gender     VARCHAR(20);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS notes      TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS address    TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- =============================================================================
-- EXTEND ESTABLISHMENTS TABLE FOR BRANDING
-- =============================================================================

ALTER TABLE establishments ADD COLUMN IF NOT EXISTS primary_color     VARCHAR(7)   DEFAULT '#2563EB';
ALTER TABLE establishments ADD COLUMN IF NOT EXISTS accent_color      VARCHAR(7)   DEFAULT '#0F172A';
ALTER TABLE establishments ADD COLUMN IF NOT EXISTS booking_heading   VARCHAR(80);
ALTER TABLE establishments ADD COLUMN IF NOT EXISTS booking_subheading TEXT;

-- =============================================================================
-- BRANCHES (FILIAIS)
-- =============================================================================

CREATE TABLE IF NOT EXISTS branches (
  id                UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  establishment_id  UUID          NOT NULL REFERENCES establishments(id) ON DELETE CASCADE,
  name              VARCHAR(255)  NOT NULL,
  address           TEXT,
  phone             VARCHAR(30),
  city              VARCHAR(100),
  state             VARCHAR(50),
  zip_code          VARCHAR(20),
  is_active         BOOLEAN       NOT NULL DEFAULT true,
  created_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_branches_establishment ON branches(establishment_id);

DROP TRIGGER IF EXISTS trg_branches_updated_at ON branches;
CREATE TRIGGER trg_branches_updated_at
  BEFORE UPDATE ON branches
  FOR EACH ROW EXECUTE FUNCTION fn_update_updated_at();

-- =============================================================================
-- PLANS (PLANOS DO CLUBE DO ASSINANTE)
-- =============================================================================

CREATE TABLE IF NOT EXISTS plans (
  id                UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  establishment_id  UUID          NOT NULL REFERENCES establishments(id) ON DELETE CASCADE,
  name              VARCHAR(255)  NOT NULL,
  description       TEXT,
  price             DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (price >= 0),
  billing_interval  VARCHAR(20)   NOT NULL DEFAULT 'monthly'
                      CHECK (billing_interval IN ('monthly', 'quarterly', 'annual')),
  max_appointments  INTEGER,
  discount_percent  DECIMAL(5,2)  NOT NULL DEFAULT 0
                      CHECK (discount_percent >= 0 AND discount_percent <= 100),
  benefits          TEXT[],
  is_active         BOOLEAN       NOT NULL DEFAULT true,
  created_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_plans_establishment ON plans(establishment_id);
CREATE INDEX IF NOT EXISTS idx_plans_active        ON plans(establishment_id, is_active);

DROP TRIGGER IF EXISTS trg_plans_updated_at ON plans;
CREATE TRIGGER trg_plans_updated_at
  BEFORE UPDATE ON plans
  FOR EACH ROW EXECUTE FUNCTION fn_update_updated_at();

-- =============================================================================
-- SUBSCRIPTION STATUS ENUM
-- Usa bloco DO para evitar erro se o tipo já existir
-- =============================================================================

DO $$
BEGIN
  CREATE TYPE subscription_status AS ENUM ('active', 'cancelled', 'expired', 'pending');
EXCEPTION
  WHEN duplicate_object THEN
    RAISE NOTICE 'subscription_status já existe, pulando.';
END
$$;

-- =============================================================================
-- SUBSCRIPTIONS (ASSINATURAS)
-- =============================================================================

CREATE TABLE IF NOT EXISTS subscriptions (
  id                UUID                PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id       UUID                NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  plan_id           UUID                NOT NULL REFERENCES plans(id),
  establishment_id  UUID                NOT NULL REFERENCES establishments(id),
  status            subscription_status NOT NULL DEFAULT 'active',
  started_at        TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
  expires_at        TIMESTAMPTZ,
  cancelled_at      TIMESTAMPTZ,
  created_at        TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ         NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_customer      ON subscriptions(customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan          ON subscriptions(plan_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_establishment ON subscriptions(establishment_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status        ON subscriptions(status);

DROP TRIGGER IF EXISTS trg_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER trg_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION fn_update_updated_at();

-- =============================================================================
-- PLAN SERVICES (SERVIÇOS INCLUÍDOS NO PLANO)
-- =============================================================================

CREATE TABLE IF NOT EXISTS plan_services (
  id             UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id        UUID          NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
  service_id     UUID          NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  price_override DECIMAL(10,2) DEFAULT NULL,
  -- NULL = aplicar discount_percent do plano; 0 = gratuito; outro = preço fixo
  created_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  UNIQUE(plan_id, service_id)
);

CREATE INDEX IF NOT EXISTS idx_plan_services_plan    ON plan_services(plan_id);
CREATE INDEX IF NOT EXISTS idx_plan_services_service ON plan_services(service_id);

-- =============================================================================
-- EXTEND APPOINTMENTS — filial opcional
-- =============================================================================

ALTER TABLE appointments ADD COLUMN IF NOT EXISTS branch_id UUID REFERENCES branches(id);

-- =============================================================================
-- EXTEND ESTABLISHMENTS — capa (cover)
-- =============================================================================

ALTER TABLE establishments ADD COLUMN IF NOT EXISTS cover_url TEXT;
