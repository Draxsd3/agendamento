-- =============================================================================
-- AGENDAMENTO SAAS - COMPLETE DATABASE SCHEMA
-- PostgreSQL / Supabase
-- =============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- ENUM TYPES
-- =============================================================================

CREATE TYPE user_role AS ENUM ('super_admin', 'establishment_admin', 'customer');

CREATE TYPE establishment_status AS ENUM ('active', 'inactive', 'suspended');

CREATE TYPE appointment_status AS ENUM (
  'pending',
  'confirmed',
  'cancelled',
  'completed',
  'no_show'
);

CREATE TYPE weekday_enum AS ENUM (
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday'
);

-- =============================================================================
-- TABLES
-- =============================================================================

-- -----------------------------------------------------------------------------
-- USERS
-- Core identity table. All user types share this table, differentiated by role.
-- -----------------------------------------------------------------------------
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          VARCHAR(255)  NOT NULL,
  email         VARCHAR(255)  UNIQUE NOT NULL,
  password_hash VARCHAR(255)  NOT NULL,
  role          user_role     NOT NULL DEFAULT 'customer',
  is_active     BOOLEAN       NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE users IS 'Core user identity table for all roles (super_admin, establishment_admin, customer).';
COMMENT ON COLUMN users.role IS 'Role determines access level: super_admin > establishment_admin > customer.';

-- -----------------------------------------------------------------------------
-- ESTABLISHMENTS
-- Each establishment is a tenant in the multi-tenant system.
-- -----------------------------------------------------------------------------
CREATE TABLE establishments (
  id          UUID                  PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        VARCHAR(255)          NOT NULL,
  slug        VARCHAR(100)          UNIQUE NOT NULL,
  description TEXT,
  phone       VARCHAR(30),
  address     TEXT,
  logo_url    TEXT,
  status      establishment_status  NOT NULL DEFAULT 'active',
  created_at  TIMESTAMPTZ           NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ           NOT NULL DEFAULT NOW(),

  CONSTRAINT slug_format CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
);

COMMENT ON TABLE establishments IS 'Each row represents a tenant (barbershop, salon, clinic, etc.).';
COMMENT ON COLUMN establishments.slug IS 'URL-safe unique identifier used for public booking pages (/agendamento/:slug).';

-- -----------------------------------------------------------------------------
-- ESTABLISHMENT ADMINS
-- Many-to-many: a user can manage multiple establishments.
-- -----------------------------------------------------------------------------
CREATE TABLE establishment_admins (
  id                UUID  PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID  NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  establishment_id  UUID  NOT NULL REFERENCES establishments(id) ON DELETE CASCADE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (user_id, establishment_id)
);

COMMENT ON TABLE establishment_admins IS 'Links establishment_admin users to their establishment(s).';

-- -----------------------------------------------------------------------------
-- CUSTOMERS
-- Extended profile for users with role = customer.
-- -----------------------------------------------------------------------------
CREATE TABLE customers (
  id            UUID  PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID  UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  phone         VARCHAR(30),
  date_of_birth DATE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE customers IS 'Extended profile for customer-role users.';

-- -----------------------------------------------------------------------------
-- PROFESSIONALS
-- Employees/providers that perform services within an establishment.
-- -----------------------------------------------------------------------------
CREATE TABLE professionals (
  id                UUID    PRIMARY KEY DEFAULT uuid_generate_v4(),
  establishment_id  UUID    NOT NULL REFERENCES establishments(id) ON DELETE CASCADE,
  name              VARCHAR(255) NOT NULL,
  bio               TEXT,
  avatar_url        TEXT,
  is_active         BOOLEAN NOT NULL DEFAULT true,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE professionals IS 'Service providers belonging to an establishment.';

-- -----------------------------------------------------------------------------
-- SERVICES
-- Bookable services offered by an establishment.
-- -----------------------------------------------------------------------------
CREATE TABLE services (
  id                UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  establishment_id  UUID          NOT NULL REFERENCES establishments(id) ON DELETE CASCADE,
  name              VARCHAR(255)  NOT NULL,
  description       TEXT,
  duration_minutes  INTEGER       NOT NULL CHECK (duration_minutes > 0),
  price             DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  is_active         BOOLEAN       NOT NULL DEFAULT true,
  created_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE services IS 'Services offered by an establishment with duration and price.';

-- -----------------------------------------------------------------------------
-- PROFESSIONAL SERVICES
-- Which professional can perform which service (many-to-many).
-- -----------------------------------------------------------------------------
CREATE TABLE professional_services (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  professional_id  UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
  service_id       UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (professional_id, service_id)
);

COMMENT ON TABLE professional_services IS 'Associates professionals with the services they can perform.';

-- -----------------------------------------------------------------------------
-- BUSINESS HOURS
-- Operating hours per weekday per establishment.
-- -----------------------------------------------------------------------------
CREATE TABLE business_hours (
  id                UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  establishment_id  UUID          NOT NULL REFERENCES establishments(id) ON DELETE CASCADE,
  weekday           weekday_enum  NOT NULL,
  start_time        TIME          NOT NULL,
  end_time          TIME          NOT NULL,
  is_open           BOOLEAN       NOT NULL DEFAULT true,
  created_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

  UNIQUE (establishment_id, weekday),
  CHECK (end_time > start_time)
);

COMMENT ON TABLE business_hours IS 'Operating hours for each day of the week per establishment.';

-- -----------------------------------------------------------------------------
-- APPOINTMENTS
-- Core booking entity. Links customer, professional, service and establishment.
-- -----------------------------------------------------------------------------
CREATE TABLE appointments (
  id                UUID                PRIMARY KEY DEFAULT uuid_generate_v4(),
  establishment_id  UUID                NOT NULL REFERENCES establishments(id) ON DELETE CASCADE,
  customer_id       UUID                NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  professional_id   UUID                NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
  service_id        UUID                NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  start_time        TIMESTAMPTZ         NOT NULL,
  end_time          TIMESTAMPTZ         NOT NULL,
  status            appointment_status  NOT NULL DEFAULT 'pending',
  notes             TEXT,
  created_at        TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ         NOT NULL DEFAULT NOW(),

  CHECK (end_time > start_time)
);

COMMENT ON TABLE appointments IS 'Booking records. Conflict detection must be enforced at application layer.';

-- =============================================================================
-- INDEXES
-- =============================================================================

CREATE INDEX idx_users_email             ON users(email);
CREATE INDEX idx_users_role              ON users(role);

CREATE INDEX idx_establishments_slug     ON establishments(slug);
CREATE INDEX idx_establishments_status   ON establishments(status);

CREATE INDEX idx_ea_user                 ON establishment_admins(user_id);
CREATE INDEX idx_ea_establishment        ON establishment_admins(establishment_id);

CREATE INDEX idx_customers_user          ON customers(user_id);

CREATE INDEX idx_professionals_estab     ON professionals(establishment_id);
CREATE INDEX idx_professionals_active    ON professionals(establishment_id, is_active);

CREATE INDEX idx_services_estab          ON services(establishment_id);
CREATE INDEX idx_services_active         ON services(establishment_id, is_active);

CREATE INDEX idx_prof_svc_professional   ON professional_services(professional_id);
CREATE INDEX idx_prof_svc_service        ON professional_services(service_id);

CREATE INDEX idx_biz_hours_estab         ON business_hours(establishment_id);

CREATE INDEX idx_appt_establishment      ON appointments(establishment_id);
CREATE INDEX idx_appt_customer           ON appointments(customer_id);
CREATE INDEX idx_appt_professional       ON appointments(professional_id);
CREATE INDEX idx_appt_start_time         ON appointments(start_time);
CREATE INDEX idx_appt_status             ON appointments(status);
-- Composite for conflict detection queries
CREATE INDEX idx_appt_conflict_check     ON appointments(professional_id, start_time, end_time)
  WHERE status NOT IN ('cancelled');

-- =============================================================================
-- TRIGGERS - AUTO-UPDATE updated_at
-- =============================================================================

CREATE OR REPLACE FUNCTION fn_update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION fn_update_updated_at();

CREATE TRIGGER trg_establishments_updated_at
  BEFORE UPDATE ON establishments
  FOR EACH ROW EXECUTE FUNCTION fn_update_updated_at();

CREATE TRIGGER trg_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION fn_update_updated_at();

CREATE TRIGGER trg_professionals_updated_at
  BEFORE UPDATE ON professionals
  FOR EACH ROW EXECUTE FUNCTION fn_update_updated_at();

CREATE TRIGGER trg_services_updated_at
  BEFORE UPDATE ON services
  FOR EACH ROW EXECUTE FUNCTION fn_update_updated_at();

CREATE TRIGGER trg_business_hours_updated_at
  BEFORE UPDATE ON business_hours
  FOR EACH ROW EXECUTE FUNCTION fn_update_updated_at();

CREATE TRIGGER trg_appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION fn_update_updated_at();

-- =============================================================================
-- FUNCTIONS
-- =============================================================================

-- Check for appointment conflicts (same professional, overlapping time, not cancelled)
CREATE OR REPLACE FUNCTION fn_check_appointment_conflict(
  p_professional_id   UUID,
  p_start_time        TIMESTAMPTZ,
  p_end_time          TIMESTAMPTZ,
  p_exclude_id        UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  conflict_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO conflict_count
  FROM appointments
  WHERE professional_id = p_professional_id
    AND status NOT IN ('cancelled')
    AND id != COALESCE(p_exclude_id, '00000000-0000-0000-0000-000000000000'::UUID)
    AND (start_time, end_time) OVERLAPS (p_start_time, p_end_time);

  RETURN conflict_count > 0;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION fn_check_appointment_conflict IS 'Returns true if a conflict exists for the professional in the given time window.';

-- =============================================================================
-- SEED DATA - Super Admin
-- Email: admin@agendamento.com | Password: Admin@2024
-- =============================================================================

INSERT INTO users (name, email, password_hash, role)
VALUES (
  'Super Admin',
  'admin@agendamento.com',
  '$2a$12$.u7Yfa/rqSH3ZOabf7knBu0p4osjLRrAwqr89EZ6TEqG831kJKi7W',
  'super_admin'
) ON CONFLICT (email) DO NOTHING;
