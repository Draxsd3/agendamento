alter table public.establishments
  add column if not exists asaas_billing_mode text not null default 'checkout_recurring',
  add column if not exists asaas_billing_updated_at timestamptz null;

comment on column public.establishments.asaas_billing_mode is
  'Modelo de faturamento escolhido para a subconta Asaas do estabelecimento.';

comment on column public.establishments.asaas_billing_updated_at is
  'Data da ultima alteracao do modelo de faturamento da subconta Asaas.';
