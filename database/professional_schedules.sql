-- =============================================================================
-- AGENDAMENTO SAAS - PROFESSIONAL SCHEDULES
-- Per-professional working hours. Falls back to the establishment's
-- business_hours when no row exists for that (professional, weekday).
-- =============================================================================

CREATE TABLE IF NOT EXISTS professional_schedules (
  id              UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  professional_id UUID         NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
  weekday         weekday_enum NOT NULL,
  start_time      TIME         NOT NULL,
  end_time        TIME         NOT NULL,
  is_working      BOOLEAN      NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

  UNIQUE (professional_id, weekday),
  CHECK (end_time > start_time)
);

COMMENT ON TABLE professional_schedules IS
  'Working hours per professional and weekday. Overrides business_hours when present.';

CREATE INDEX IF NOT EXISTS idx_prof_schedules_professional
  ON professional_schedules(professional_id);

-- Trigger to keep updated_at in sync.
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_prof_schedules_updated_at ON professional_schedules;
CREATE TRIGGER trg_prof_schedules_updated_at
  BEFORE UPDATE ON professional_schedules
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
