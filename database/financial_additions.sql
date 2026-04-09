-- =============================================================================
-- AGENDAMENTO SAAS - FINANCIAL MODULE ADDITIONS
-- Execute no SQL Editor do Supabase APÓS rodar schema_additions.sql
-- Adiciona: total_price e payment_method em appointments
-- =============================================================================

-- Valor cobrado no agendamento (pode diferir do preço base por plano/desconto)
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS total_price     DECIMAL(10,2) DEFAULT NULL;

-- Forma de pagamento registrada pelo gestor
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS payment_method  VARCHAR(30)   DEFAULT NULL;
-- Valores esperados: 'dinheiro', 'cartao_credito', 'cartao_debito', 'pix', 'cortesia', 'plano'

-- Índices para consultas financeiras
CREATE INDEX IF NOT EXISTS idx_appt_total_price    ON appointments(establishment_id, total_price);
CREATE INDEX IF NOT EXISTS idx_appt_branch_status  ON appointments(establishment_id, branch_id, status);
