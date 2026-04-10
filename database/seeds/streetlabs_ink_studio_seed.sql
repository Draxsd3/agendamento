-- =============================================================================
-- STREETLABS INK STUDIO - DEMO SEED
-- Execute apos:
-- 1. database/schema.sql
-- 2. database/schema_additions.sql
-- 3. database/financial_additions.sql
--
-- Credenciais demo:
-- Admin:   marina@streetlabsink.com  / Street@2026
-- Cliente: beatriz@streetlabsink.com / Cliente@2026
-- Cliente: lucas@streetlabsink.com   / Cliente@2026
-- Cliente: amanda@streetlabsink.com  / Cliente@2026
-- =============================================================================

DO $$
DECLARE
  v_establishment_id UUID;
  v_admin_user_id UUID;
  v_branch_id UUID;

  v_prof_rafael_id UUID;
  v_prof_camila_id UUID;
  v_prof_danilo_id UUID;

  v_service_sessao_id UUID;
  v_service_fine_line_id UUID;
  v_service_piercing_id UUID;
  v_service_retoque_id UUID;

  v_plan_bronze_id UUID;
  v_plan_silver_id UUID;
  v_plan_gold_id UUID;

  v_user_beatriz_id UUID;
  v_user_lucas_id UUID;
  v_user_amanda_id UUID;

  v_customer_beatriz_id UUID;
  v_customer_lucas_id UUID;
  v_customer_amanda_id UUID;

  v_day_offset INTEGER;
  v_today_sp DATE := timezone('America/Sao_Paulo', now())::date;
  v_month_start DATE := date_trunc('month', timezone('America/Sao_Paulo', now()))::date;
BEGIN
  INSERT INTO establishments (
    name,
    slug,
    description,
    phone,
    address,
    primary_color,
    accent_color,
    booking_heading,
    booking_subheading,
    status
  )
  VALUES (
    'StreetLabs Ink Studio',
    'streetlabs-ink',
    'Estudio de tatuagem e piercing com foco em fine line, blackwork e projetos autorais.',
    '(11) 99876-4321',
    'Rua Augusta, 1449 - Consolacao, Sao Paulo - SP',
    '#2563EB',
    '#0F172A',
    'Agende sua sessao na StreetLabs Ink Studio',
    'Escolha seu artista, horario e finalize o atendimento online em poucos passos.',
    'active'
  )
  ON CONFLICT (slug) DO UPDATE
  SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    phone = EXCLUDED.phone,
    address = EXCLUDED.address,
    primary_color = EXCLUDED.primary_color,
    accent_color = EXCLUDED.accent_color,
    booking_heading = EXCLUDED.booking_heading,
    booking_subheading = EXCLUDED.booking_subheading,
    status = EXCLUDED.status
  RETURNING id INTO v_establishment_id;

  INSERT INTO users (name, email, password_hash, role, is_active)
  VALUES (
    'Marina Costa',
    'marina@streetlabsink.com',
    '$2a$12$oTFkZMwtauA8UPKYirafwOXMPNHi0iCCROfOVAkWgQjc6SolixiIC',
    'establishment_admin',
    true
  )
  ON CONFLICT (email) DO UPDATE
  SET
    name = EXCLUDED.name,
    password_hash = EXCLUDED.password_hash,
    role = EXCLUDED.role,
    is_active = EXCLUDED.is_active
  RETURNING id INTO v_admin_user_id;

  INSERT INTO establishment_admins (user_id, establishment_id)
  VALUES (v_admin_user_id, v_establishment_id)
  ON CONFLICT (user_id, establishment_id) DO NOTHING;

  INSERT INTO business_hours (establishment_id, weekday, start_time, end_time, is_open)
  VALUES
    (v_establishment_id, 'monday',    '10:00', '18:00', true),
    (v_establishment_id, 'tuesday',   '10:00', '18:00', true),
    (v_establishment_id, 'wednesday', '10:00', '18:00', true),
    (v_establishment_id, 'thursday',  '10:00', '18:00', true),
    (v_establishment_id, 'friday',    '10:00', '18:00', true),
    (v_establishment_id, 'saturday',  '10:00', '16:00', true),
    (v_establishment_id, 'sunday',    '00:00', '01:00', false)
  ON CONFLICT (establishment_id, weekday) DO UPDATE
  SET
    start_time = EXCLUDED.start_time,
    end_time = EXCLUDED.end_time,
    is_open = EXCLUDED.is_open;

  INSERT INTO branches (
    establishment_id,
    name,
    address,
    phone,
    city,
    state,
    zip_code,
    is_active
  )
  SELECT
    v_establishment_id,
    'Unidade Augusta',
    'Rua Augusta, 1449 - Consolacao',
    '(11) 99876-4321',
    'Sao Paulo',
    'SP',
    '01305-100',
    true
  WHERE NOT EXISTS (
    SELECT 1
    FROM branches
    WHERE establishment_id = v_establishment_id
      AND name = 'Unidade Augusta'
  );

  SELECT id
  INTO v_branch_id
  FROM branches
  WHERE establishment_id = v_establishment_id
    AND name = 'Unidade Augusta'
  LIMIT 1;

  INSERT INTO professionals (establishment_id, name, bio, is_active)
  SELECT v_establishment_id, 'Rafael Black', 'Especialista em blackwork, sombreado e grandes projetos.', true
  WHERE NOT EXISTS (
    SELECT 1 FROM professionals WHERE establishment_id = v_establishment_id AND name = 'Rafael Black'
  );

  INSERT INTO professionals (establishment_id, name, bio, is_active)
  SELECT v_establishment_id, 'Camila Fine', 'Artista focada em fine line, lettering e tatuagens delicadas.', true
  WHERE NOT EXISTS (
    SELECT 1 FROM professionals WHERE establishment_id = v_establishment_id AND name = 'Camila Fine'
  );

  INSERT INTO professionals (establishment_id, name, bio, is_active)
  SELECT v_establishment_id, 'Danilo Piercer', 'Responsavel pelos piercings e perfuracoes com joias premium.', true
  WHERE NOT EXISTS (
    SELECT 1 FROM professionals WHERE establishment_id = v_establishment_id AND name = 'Danilo Piercer'
  );

  SELECT id INTO v_prof_rafael_id
  FROM professionals
  WHERE establishment_id = v_establishment_id AND name = 'Rafael Black'
  LIMIT 1;

  SELECT id INTO v_prof_camila_id
  FROM professionals
  WHERE establishment_id = v_establishment_id AND name = 'Camila Fine'
  LIMIT 1;

  SELECT id INTO v_prof_danilo_id
  FROM professionals
  WHERE establishment_id = v_establishment_id AND name = 'Danilo Piercer'
  LIMIT 1;

  INSERT INTO services (establishment_id, name, description, duration_minutes, price, is_active)
  SELECT v_establishment_id, 'Sessao de tatuagem - ate 2h', 'Sessao individual para projetos de ate 2 horas.', 120, 250.00, true
  WHERE NOT EXISTS (
    SELECT 1 FROM services WHERE establishment_id = v_establishment_id AND name = 'Sessao de tatuagem - ate 2h'
  );

  INSERT INTO services (establishment_id, name, description, duration_minutes, price, is_active)
  SELECT v_establishment_id, 'Fine line autoral', 'Tatuagens delicadas, tracos finos e composicoes personalizadas.', 90, 180.00, true
  WHERE NOT EXISTS (
    SELECT 1 FROM services WHERE establishment_id = v_establishment_id AND name = 'Fine line autoral'
  );

  INSERT INTO services (establishment_id, name, description, duration_minutes, price, is_active)
  SELECT v_establishment_id, 'Piercing com joia basica', 'Aplicacao com assepsia completa e joia inicial inclusa.', 45, 120.00, true
  WHERE NOT EXISTS (
    SELECT 1 FROM services WHERE establishment_id = v_establishment_id AND name = 'Piercing com joia basica'
  );

  INSERT INTO services (establishment_id, name, description, duration_minutes, price, is_active)
  SELECT v_establishment_id, 'Retoque express', 'Ajustes rapidos em tatuagens ja cicatrizadas.', 60, 90.00, true
  WHERE NOT EXISTS (
    SELECT 1 FROM services WHERE establishment_id = v_establishment_id AND name = 'Retoque express'
  );

  SELECT id INTO v_service_sessao_id
  FROM services
  WHERE establishment_id = v_establishment_id AND name = 'Sessao de tatuagem - ate 2h'
  LIMIT 1;

  SELECT id INTO v_service_fine_line_id
  FROM services
  WHERE establishment_id = v_establishment_id AND name = 'Fine line autoral'
  LIMIT 1;

  SELECT id INTO v_service_piercing_id
  FROM services
  WHERE establishment_id = v_establishment_id AND name = 'Piercing com joia basica'
  LIMIT 1;

  SELECT id INTO v_service_retoque_id
  FROM services
  WHERE establishment_id = v_establishment_id AND name = 'Retoque express'
  LIMIT 1;

  INSERT INTO professional_services (professional_id, service_id)
  VALUES
    (v_prof_rafael_id, v_service_sessao_id),
    (v_prof_rafael_id, v_service_retoque_id),
    (v_prof_camila_id, v_service_fine_line_id),
    (v_prof_camila_id, v_service_retoque_id),
    (v_prof_danilo_id, v_service_piercing_id)
  ON CONFLICT (professional_id, service_id) DO NOTHING;

  INSERT INTO plans (
    establishment_id,
    name,
    description,
    price,
    billing_interval,
    max_appointments,
    discount_percent,
    benefits,
    is_active
  )
  SELECT
    v_establishment_id,
    'Plano Bronze',
    'Plano de entrada com desconto progressivo para clientes recorrentes.',
    59.90,
    'monthly',
    2,
    10.00,
    ARRAY[
      '10% de desconto em tatuagens avulsas',
      '1 piercing com desconto especial por mes',
      'Prioridade em janelas de encaixe'
    ]::TEXT[],
    true
  WHERE NOT EXISTS (
    SELECT 1 FROM plans WHERE establishment_id = v_establishment_id AND name = 'Plano Bronze'
  );

  SELECT id
  INTO v_plan_bronze_id
  FROM plans
  WHERE establishment_id = v_establishment_id AND name = 'Plano Bronze'
  LIMIT 1;

  INSERT INTO plans (
    establishment_id,
    name,
    description,
    price,
    billing_interval,
    max_appointments,
    discount_percent,
    benefits,
    is_active
  )
  SELECT
    v_establishment_id,
    'Plano Silver',
    'Plano intermediario para clientes que tatuam com frequencia e buscam prioridade.',
    119.90,
    'monthly',
    4,
    15.00,
    ARRAY[
      '15% de desconto em tatuagens avulsas',
      '1 retoque com valor especial por mes',
      'Prioridade em encaixes durante a semana'
    ]::TEXT[],
    true
  WHERE NOT EXISTS (
    SELECT 1 FROM plans WHERE establishment_id = v_establishment_id AND name = 'Plano Silver'
  );

  INSERT INTO plans (
    establishment_id,
    name,
    description,
    price,
    billing_interval,
    max_appointments,
    discount_percent,
    benefits,
    is_active
  )
  SELECT
    v_establishment_id,
    'Plano Gold',
    'Plano premium com vantagens em sessoes longas, piercings e atendimento prioritario.',
    189.90,
    'monthly',
    6,
    20.00,
    ARRAY[
      '20% de desconto em tatuagens selecionadas',
      'Piercing com preco promocional',
      'Janela exclusiva para atendimento em horario nobre'
    ]::TEXT[],
    true
  WHERE NOT EXISTS (
    SELECT 1 FROM plans WHERE establishment_id = v_establishment_id AND name = 'Plano Gold'
  );

  SELECT id
  INTO v_plan_silver_id
  FROM plans
  WHERE establishment_id = v_establishment_id AND name = 'Plano Silver'
  LIMIT 1;

  SELECT id
  INTO v_plan_gold_id
  FROM plans
  WHERE establishment_id = v_establishment_id AND name = 'Plano Gold'
  LIMIT 1;

  INSERT INTO plan_services (plan_id, service_id, price_override)
  VALUES
    (v_plan_bronze_id, v_service_piercing_id, 90.00),
    (v_plan_bronze_id, v_service_retoque_id, 70.00)
  ON CONFLICT (plan_id, service_id) DO UPDATE
  SET price_override = EXCLUDED.price_override;

  INSERT INTO plan_services (plan_id, service_id, price_override)
  VALUES
    (v_plan_silver_id, v_service_fine_line_id, 150.00),
    (v_plan_silver_id, v_service_retoque_id, 60.00),
    (v_plan_gold_id, v_service_sessao_id, 199.00),
    (v_plan_gold_id, v_service_piercing_id, 80.00)
  ON CONFLICT (plan_id, service_id) DO UPDATE
  SET price_override = EXCLUDED.price_override;

  INSERT INTO users (name, email, password_hash, role, is_active)
  VALUES
    ('Beatriz Nogueira', 'beatriz@streetlabsink.com', '$2a$12$YPvHqBa9Kk565vDKKhXs2OyioZfAy1qNuyHV7P6.snkw8rNv957ZO', 'customer', true),
    ('Lucas Andrade',    'lucas@streetlabsink.com',   '$2a$12$YPvHqBa9Kk565vDKKhXs2OyioZfAy1qNuyHV7P6.snkw8rNv957ZO', 'customer', true),
    ('Amanda Ribeiro',   'amanda@streetlabsink.com',  '$2a$12$YPvHqBa9Kk565vDKKhXs2OyioZfAy1qNuyHV7P6.snkw8rNv957ZO', 'customer', true)
  ON CONFLICT (email) DO UPDATE
  SET
    name = EXCLUDED.name,
    password_hash = EXCLUDED.password_hash,
    role = EXCLUDED.role,
    is_active = EXCLUDED.is_active;

  SELECT id INTO v_user_beatriz_id FROM users WHERE email = 'beatriz@streetlabsink.com' LIMIT 1;
  SELECT id INTO v_user_lucas_id   FROM users WHERE email = 'lucas@streetlabsink.com' LIMIT 1;
  SELECT id INTO v_user_amanda_id  FROM users WHERE email = 'amanda@streetlabsink.com' LIMIT 1;

  INSERT INTO customers (user_id, phone, date_of_birth, cpf, gender, notes, address)
  SELECT v_user_beatriz_id, '(11) 99611-2200', DATE '1996-08-11', '123.456.789-00', 'feminino', 'Cliente recorrente de fine line.', 'Vila Mariana, Sao Paulo - SP'
  WHERE NOT EXISTS (SELECT 1 FROM customers WHERE user_id = v_user_beatriz_id);

  INSERT INTO customers (user_id, phone, date_of_birth, cpf, gender, notes, address)
  SELECT v_user_lucas_id, '(11) 99777-1100', DATE '1992-04-18', '987.654.321-00', 'masculino', 'Prefere sessoes longas com blackwork.', 'Pinheiros, Sao Paulo - SP'
  WHERE NOT EXISTS (SELECT 1 FROM customers WHERE user_id = v_user_lucas_id);

  INSERT INTO customers (user_id, phone, date_of_birth, cpf, gender, notes, address)
  SELECT v_user_amanda_id, '(11) 98888-3344', DATE '1998-12-02', '456.789.123-00', 'feminino', 'Costuma agendar piercing e retoque.', 'Bela Vista, Sao Paulo - SP'
  WHERE NOT EXISTS (SELECT 1 FROM customers WHERE user_id = v_user_amanda_id);

  SELECT id INTO v_customer_beatriz_id FROM customers WHERE user_id = v_user_beatriz_id LIMIT 1;
  SELECT id INTO v_customer_lucas_id   FROM customers WHERE user_id = v_user_lucas_id LIMIT 1;
  SELECT id INTO v_customer_amanda_id  FROM customers WHERE user_id = v_user_amanda_id LIMIT 1;

  INSERT INTO subscriptions (
    customer_id,
    plan_id,
    establishment_id,
    status,
    started_at,
    expires_at
  )
  SELECT
    v_customer_beatriz_id,
    v_plan_bronze_id,
    v_establishment_id,
    'active',
    ((v_month_start + time '09:00') AT TIME ZONE 'America/Sao_Paulo'),
    ((((v_month_start + interval '1 month')::date) + time '09:00') AT TIME ZONE 'America/Sao_Paulo')
  WHERE NOT EXISTS (
    SELECT 1
    FROM subscriptions
    WHERE customer_id = v_customer_beatriz_id
      AND plan_id = v_plan_bronze_id
      AND status = 'active'
  );

  INSERT INTO subscriptions (
    customer_id,
    plan_id,
    establishment_id,
    status,
    started_at,
    expires_at
  )
  SELECT
    v_customer_lucas_id,
    v_plan_gold_id,
    v_establishment_id,
    'active',
    (((v_month_start + 3) + time '11:00') AT TIME ZONE 'America/Sao_Paulo'),
    (((((v_month_start + 3) + interval '1 month')::date) + time '11:00') AT TIME ZONE 'America/Sao_Paulo')
  WHERE NOT EXISTS (
    SELECT 1
    FROM subscriptions
    WHERE customer_id = v_customer_lucas_id
      AND plan_id = v_plan_gold_id
      AND status = 'active'
  );

  INSERT INTO subscriptions (
    customer_id,
    plan_id,
    establishment_id,
    status,
    started_at,
    expires_at
  )
  SELECT
    v_customer_amanda_id,
    v_plan_silver_id,
    v_establishment_id,
    'active',
    (((v_month_start + 5) + time '12:00') AT TIME ZONE 'America/Sao_Paulo'),
    (((((v_month_start + 5) + interval '1 month')::date) + time '12:00') AT TIME ZONE 'America/Sao_Paulo')
  WHERE NOT EXISTS (
    SELECT 1
    FROM subscriptions
    WHERE customer_id = v_customer_amanda_id
      AND plan_id = v_plan_silver_id
      AND status = 'active'
  );

  -- Agendamentos concluidos no mes para alimentar o financeiro
  IF NOT EXISTS (
    SELECT 1 FROM appointments
    WHERE establishment_id = v_establishment_id
      AND customer_id = v_customer_lucas_id
      AND start_time = ((v_month_start + 2 + time '13:00') AT TIME ZONE 'America/Sao_Paulo')
  ) THEN
    INSERT INTO appointments (
      establishment_id, customer_id, professional_id, service_id, branch_id,
      start_time, end_time, status, notes, total_price, payment_method
    )
    VALUES (
      v_establishment_id, v_customer_lucas_id, v_prof_rafael_id, v_service_sessao_id, v_branch_id,
      ((v_month_start + 2 + time '13:00') AT TIME ZONE 'America/Sao_Paulo'),
      ((v_month_start + 2 + time '15:00') AT TIME ZONE 'America/Sao_Paulo'),
      'completed',
      'Projeto blackwork no antebraco.',
      250.00,
      'pix'
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM appointments
    WHERE establishment_id = v_establishment_id
      AND customer_id = v_customer_beatriz_id
      AND start_time = ((v_today_sp + time '10:00') AT TIME ZONE 'America/Sao_Paulo')
  ) THEN
    INSERT INTO appointments (
      establishment_id, customer_id, professional_id, service_id, branch_id,
      start_time, end_time, status, notes, total_price, payment_method
    )
    VALUES (
      v_establishment_id, v_customer_beatriz_id, v_prof_camila_id, v_service_fine_line_id, v_branch_id,
      ((v_today_sp + time '10:00') AT TIME ZONE 'America/Sao_Paulo'),
      ((v_today_sp + time '11:30') AT TIME ZONE 'America/Sao_Paulo'),
      'completed',
      'Fine line floral com retoque leve.',
      162.00,
      'plano'
    );
  END IF;

  -- Agenda atual e futura para alimentar dashboard e fluxo publico
  IF NOT EXISTS (
    SELECT 1 FROM appointments
    WHERE establishment_id = v_establishment_id
      AND customer_id = v_customer_amanda_id
      AND start_time = ((v_today_sp + time '15:00') AT TIME ZONE 'America/Sao_Paulo')
  ) THEN
    INSERT INTO appointments (
      establishment_id, customer_id, professional_id, service_id, branch_id,
      start_time, end_time, status, notes, total_price
    )
    VALUES (
      v_establishment_id, v_customer_amanda_id, v_prof_danilo_id, v_service_piercing_id, v_branch_id,
      ((v_today_sp + time '15:00') AT TIME ZONE 'America/Sao_Paulo'),
      ((v_today_sp + time '15:45') AT TIME ZONE 'America/Sao_Paulo'),
      'confirmed',
      'Piercing helix com joia basica.',
      120.00
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM appointments
    WHERE establishment_id = v_establishment_id
      AND customer_id = v_customer_beatriz_id
      AND start_time = (((v_today_sp + 3) + time '13:00') AT TIME ZONE 'America/Sao_Paulo')
  ) THEN
    INSERT INTO appointments (
      establishment_id, customer_id, professional_id, service_id, branch_id,
      start_time, end_time, status, notes, total_price
    )
    VALUES (
      v_establishment_id, v_customer_beatriz_id, v_prof_rafael_id, v_service_sessao_id, v_branch_id,
      (((v_today_sp + 3) + time '13:00') AT TIME ZONE 'America/Sao_Paulo'),
      (((v_today_sp + 3) + time '15:00') AT TIME ZONE 'America/Sao_Paulo'),
      'pending',
      'Sessao agendada pelo fluxo publico.',
      250.00
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM appointments
    WHERE establishment_id = v_establishment_id
      AND customer_id = v_customer_lucas_id
      AND start_time = (((v_today_sp - 1) + time '14:00') AT TIME ZONE 'America/Sao_Paulo')
  ) THEN
    INSERT INTO appointments (
      establishment_id, customer_id, professional_id, service_id, branch_id,
      start_time, end_time, status, notes, total_price
    )
    VALUES (
      v_establishment_id, v_customer_lucas_id, v_prof_rafael_id, v_service_retoque_id, v_branch_id,
      (((v_today_sp - 1) + time '14:00') AT TIME ZONE 'America/Sao_Paulo'),
      (((v_today_sp - 1) + time '15:00') AT TIME ZONE 'America/Sao_Paulo'),
      'no_show',
      'Cliente nao compareceu ao retoque.',
      90.00
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM appointments
    WHERE establishment_id = v_establishment_id
      AND customer_id = v_customer_amanda_id
      AND start_time = (((v_today_sp + 5) + time '11:00') AT TIME ZONE 'America/Sao_Paulo')
  ) THEN
    INSERT INTO appointments (
      establishment_id, customer_id, professional_id, service_id, branch_id,
      start_time, end_time, status, notes, total_price
    )
    VALUES (
      v_establishment_id, v_customer_amanda_id, v_prof_camila_id, v_service_fine_line_id, v_branch_id,
      (((v_today_sp + 5) + time '11:00') AT TIME ZONE 'America/Sao_Paulo'),
      (((v_today_sp + 5) + time '12:30') AT TIME ZONE 'America/Sao_Paulo'),
      'cancelled',
      'Cliente cancelou por conflito de agenda.',
      180.00
    );
  END IF;

  -- Historico retroativo para popular dashboards e graficos
  FOR v_day_offset IN 2..21 LOOP
    IF EXTRACT(ISODOW FROM (v_today_sp - v_day_offset)) < 7 THEN
      IF NOT EXISTS (
        SELECT 1
        FROM appointments
        WHERE establishment_id = v_establishment_id
          AND start_time = (((v_today_sp - v_day_offset) + time '11:00') AT TIME ZONE 'America/Sao_Paulo')
      ) THEN
        INSERT INTO appointments (
          establishment_id, customer_id, professional_id, service_id, branch_id,
          start_time, end_time, status, notes, total_price, payment_method
        )
        VALUES (
          v_establishment_id,
          CASE
            WHEN MOD(v_day_offset, 3) = 0 THEN v_customer_beatriz_id
            WHEN MOD(v_day_offset, 3) = 1 THEN v_customer_lucas_id
            ELSE v_customer_amanda_id
          END,
          CASE
            WHEN MOD(v_day_offset, 3) = 0 THEN v_prof_camila_id
            WHEN MOD(v_day_offset, 3) = 1 THEN v_prof_rafael_id
            ELSE v_prof_danilo_id
          END,
          CASE
            WHEN MOD(v_day_offset, 3) = 0 THEN v_service_fine_line_id
            WHEN MOD(v_day_offset, 3) = 1 THEN v_service_sessao_id
            ELSE v_service_piercing_id
          END,
          v_branch_id,
          (((v_today_sp - v_day_offset) + time '11:00') AT TIME ZONE 'America/Sao_Paulo'),
          (((v_today_sp - v_day_offset) + time '12:30') AT TIME ZONE 'America/Sao_Paulo'),
          'completed',
          'Atendimento retroativo gerado para popular dashboards.',
          CASE
            WHEN MOD(v_day_offset, 3) = 0 THEN 150.00
            WHEN MOD(v_day_offset, 3) = 1 THEN 250.00
            ELSE 90.00
          END,
          CASE
            WHEN MOD(v_day_offset, 4) = 0 THEN 'pix'
            WHEN MOD(v_day_offset, 4) = 1 THEN 'cartao_credito'
            WHEN MOD(v_day_offset, 4) = 2 THEN 'cartao_debito'
            ELSE 'plano'
          END
        );
      END IF;

      IF MOD(v_day_offset, 2) = 0 AND NOT EXISTS (
        SELECT 1
        FROM appointments
        WHERE establishment_id = v_establishment_id
          AND start_time = (((v_today_sp - v_day_offset) + time '14:30') AT TIME ZONE 'America/Sao_Paulo')
      ) THEN
        INSERT INTO appointments (
          establishment_id, customer_id, professional_id, service_id, branch_id,
          start_time, end_time, status, notes, total_price, payment_method
        )
        VALUES (
          v_establishment_id,
          CASE
            WHEN MOD(v_day_offset, 4) IN (0, 1) THEN v_customer_beatriz_id
            ELSE v_customer_lucas_id
          END,
          CASE
            WHEN MOD(v_day_offset, 4) = 0 THEN v_prof_rafael_id
            WHEN MOD(v_day_offset, 4) = 1 THEN v_prof_camila_id
            WHEN MOD(v_day_offset, 4) = 2 THEN v_prof_danilo_id
            ELSE v_prof_rafael_id
          END,
          CASE
            WHEN MOD(v_day_offset, 4) = 0 THEN v_service_sessao_id
            WHEN MOD(v_day_offset, 4) = 1 THEN v_service_fine_line_id
            WHEN MOD(v_day_offset, 4) = 2 THEN v_service_piercing_id
            ELSE v_service_retoque_id
          END,
          v_branch_id,
          (((v_today_sp - v_day_offset) + time '14:30') AT TIME ZONE 'America/Sao_Paulo'),
          (((v_today_sp - v_day_offset) + time '15:30') AT TIME ZONE 'America/Sao_Paulo'),
          'completed',
          'Atendimento adicional retroativo para compor receita e recorrencia.',
          CASE
            WHEN MOD(v_day_offset, 4) = 0 THEN 199.00
            WHEN MOD(v_day_offset, 4) = 1 THEN 180.00
            WHEN MOD(v_day_offset, 4) = 2 THEN 80.00
            ELSE 90.00
          END,
          CASE
            WHEN MOD(v_day_offset, 3) = 0 THEN 'dinheiro'
            WHEN MOD(v_day_offset, 3) = 1 THEN 'pix'
            ELSE 'cartao_credito'
          END
        );
      END IF;
    END IF;
  END LOOP;
END $$;
