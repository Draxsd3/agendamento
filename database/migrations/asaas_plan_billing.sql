-- Add billing_type per plan: 'manual' = admin confirms, 'asaas' = Asaas checkout
ALTER TABLE plans
  ADD COLUMN IF NOT EXISTS billing_type VARCHAR(30) NOT NULL DEFAULT 'manual';
