-- =============================================================================
-- AGENDAMENTO SAAS - CUSTOMER ESTABLISHMENT LINKS
-- Execute no SQL Editor do Supabase apos schema_additions.sql
-- Permite cadastrar clientes manualmente no painel e manter o vinculo
-- cliente-estabelecimento mesmo antes do primeiro agendamento ou assinatura.
-- =============================================================================

CREATE TABLE IF NOT EXISTS customer_establishments (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id       UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  establishment_id  UUID NOT NULL REFERENCES establishments(id) ON DELETE CASCADE,
  source            VARCHAR(30) NOT NULL DEFAULT 'manual'
                    CHECK (source IN ('manual', 'self_signup', 'appointment', 'subscription', 'import')),
  notes             TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (customer_id, establishment_id)
);

CREATE INDEX IF NOT EXISTS idx_customer_establishments_customer
  ON customer_establishments(customer_id);

CREATE INDEX IF NOT EXISTS idx_customer_establishments_establishment
  ON customer_establishments(establishment_id);

DROP TRIGGER IF EXISTS trg_customer_establishments_updated_at ON customer_establishments;
CREATE TRIGGER trg_customer_establishments_updated_at
  BEFORE UPDATE ON customer_establishments
  FOR EACH ROW EXECUTE FUNCTION fn_update_updated_at();

-- Backfill: clientes que ja tinham agendamentos.
INSERT INTO customer_establishments (customer_id, establishment_id, source)
SELECT DISTINCT customer_id, establishment_id, 'appointment'
FROM appointments
WHERE customer_id IS NOT NULL
  AND establishment_id IS NOT NULL
ON CONFLICT (customer_id, establishment_id) DO UPDATE
SET source = CASE
  WHEN customer_establishments.source = 'manual' THEN customer_establishments.source
  ELSE EXCLUDED.source
END;

-- Backfill: clientes que ja tinham assinaturas/planos.
INSERT INTO customer_establishments (customer_id, establishment_id, source)
SELECT DISTINCT customer_id, establishment_id, 'subscription'
FROM subscriptions
WHERE customer_id IS NOT NULL
  AND establishment_id IS NOT NULL
ON CONFLICT (customer_id, establishment_id) DO UPDATE
SET source = CASE
  WHEN customer_establishments.source IN ('manual', 'appointment') THEN customer_establishments.source
  ELSE EXCLUDED.source
END;
