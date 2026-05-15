# Database

SQL para o Supabase (Postgres).

## Estrutura

```
database/
├── schema.sql          ← Schema inicial. Rode UMA vez ao criar o projeto.
├── migrations/         ← Migrações incrementais. Rode em ordem cronológica.
└── seeds/              ← Dados de exemplo opcionais (demo / QA).
```

## Como aplicar

Tudo é aplicado manualmente pelo SQL Editor do Supabase. Não há ferramenta de migração automática.

### 1. Projeto novo

```sql
-- 1. Cole e rode schema.sql inteiro
-- 2. Depois cole e rode CADA arquivo de migrations/ na ordem listada abaixo
```

### 2. Projeto existente

Rode apenas as migrations novas que ainda não foram aplicadas. Os arquivos usam `IF NOT EXISTS` / `ADD COLUMN IF NOT EXISTS` para serem idempotentes na maior parte dos casos.

## Ordem das migrations

A ordem reflete o histórico do projeto. Se algum arquivo faltar, o backend retorna a mensagem `Execute database/migrations/<arquivo>.sql no Supabase…` para você saber qual rodar.

| # | Arquivo                            | Para que serve                                          |
|---|------------------------------------|----------------------------------------------------------|
| 1 | `schema_additions.sql`             | Campos extras de personalização/branch                  |
| 2 | `branding_setup.sql`               | Cores, logo e bucket `establishment-branding`            |
| 3 | `portfolio.sql`                    | Tagline, about, galeria, redes sociais                   |
| 4 | `password_reset_tokens.sql`        | Token e expiração de redefinição de senha               |
| 5 | `customer_establishments.sql`      | Vínculo cliente↔estabelecimento (multi-tenant)          |
| 6 | `financial_additions.sql`          | `total_price`, `payment_method` em appointments         |
| 7 | `asaas_subaccounts.sql`            | Campos Asaas no establishment                            |
| 8 | `asaas_integration.sql`            | Campos Asaas em customers/subscriptions                  |
| 9 | `asaas_plan_billing.sql`           | `billing_type` por plano                                 |
| 10 | `asaas_billing_settings.sql`      | Modo de faturamento na subconta Asaas                    |
| 11 | `professional_schedules.sql`      | Horários por profissional (override do business_hours)   |

## Seeds (opcional)

`seeds/streetlabs_ink_studio_seed.sql` cria um estabelecimento demo (`streetlabs-ink`) com profissionais, serviços, planos e clientes de exemplo. Rode só em ambientes de QA/staging.
