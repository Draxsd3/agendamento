const BaseRepository = require('./base.repository');

const isMissingCustomerEstablishmentsTable = (error) => {
  if (!error) return false;
  const message = error.message || '';
  return error.code === '42P01'
    || error.code === 'PGRST205'
    || (/customer_establishments/i.test(message)
      && /schema cache|does not exist|could not find/i.test(message));
};

const toPositiveInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

class CustomersRepository extends BaseRepository {
  constructor() {
    super('customers');
  }

  async findByUserId(userId) {
    const { data, error } = await this.db
      .from('customers')
      .select('*, users(id, name, email, is_active)')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async findByAsaasCustomerId(asaasCustomerId) {
    const { data, error } = await this.db
      .from('customers')
      .select('*, users(id, name, email, is_active)')
      .eq('asaas_customer_id', asaasCustomerId)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  // Returns unique establishments this customer is linked to, each with active plans.
  async findMyEstablishmentsWithPlans(customerId) {
    const establishmentsById = new Map();

    const { data: linkRows, error: linkErr } = await this.db
      .from('customer_establishments')
      .select('establishment_id, establishments(id, name, slug, logo_url, description)')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (linkErr && !isMissingCustomerEstablishmentsTable(linkErr)) throw linkErr;

    for (const row of linkRows || []) {
      if (row.establishments) {
        establishmentsById.set(row.establishment_id, row.establishments);
      }
    }

    const { data: apptRows, error: apptErr } = await this.db
      .from('appointments')
      .select('establishment_id, establishments(id, name, slug, logo_url, description)')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (apptErr) throw apptErr;

    for (const row of apptRows || []) {
      if (row.establishments && !establishmentsById.has(row.establishment_id)) {
        establishmentsById.set(row.establishment_id, row.establishments);
      }
    }

    const establishments = [...establishmentsById.values()];
    if (establishments.length === 0) return [];

    const { data: allPlans, error: planErr } = await this.db
      .from('plans')
      .select('*')
      .in('establishment_id', establishments.map((e) => e.id))
      .eq('is_active', true)
      .order('price');

    if (planErr) throw planErr;

    return establishments.map((estab) => ({
      ...estab,
      plans: (allPlans || []).filter((p) => p.establishment_id === estab.id),
    }));
  }

  async assertCustomerEstablishmentsTable() {
    const { error } = await this.db
      .from('customer_establishments')
      .select('id')
      .limit(1);

    if (!error) return true;

    if (isMissingCustomerEstablishmentsTable(error)) {
      const err = new Error('Execute database/customer_establishments.sql no Supabase antes de cadastrar clientes manualmente.');
      err.statusCode = 500;
      throw err;
    }

    throw error;
  }

  async linkToEstablishment(customerId, establishmentId, source = 'manual', { ignoreMissingTable = true } = {}) {
    if (!customerId || !establishmentId) return null;

    const { data, error } = await this.db
      .from('customer_establishments')
      .upsert(
        { customer_id: customerId, establishment_id: establishmentId, source },
        { onConflict: 'customer_id,establishment_id', ignoreDuplicates: true }
      )
      .select()
      .maybeSingle();

    if (error) {
      if (ignoreMissingTable && isMissingCustomerEstablishmentsTable(error)) return null;
      throw error;
    }

    return data;
  }

  async _findLinkedCustomerRows(establishmentId) {
    const { data, error } = await this.db
      .from('customer_establishments')
      .select('customer_id, source')
      .eq('establishment_id', establishmentId);

    if (error) {
      if (isMissingCustomerEstablishmentsTable(error)) return [];
      throw error;
    }

    return data || [];
  }

  async _findAppointmentCustomerRows(establishmentId) {
    const { data, error } = await this.db
      .from('appointments')
      .select('customer_id')
      .eq('establishment_id', establishmentId);

    if (error) throw error;
    return data || [];
  }

  async _findSubscriptionCustomerRows(establishmentId) {
    const { data, error } = await this.db
      .from('subscriptions')
      .select('customer_id')
      .eq('establishment_id', establishmentId);

    if (error) throw error;
    return data || [];
  }

  async findCustomerIdsForEstablishment(establishmentId) {
    const [linkRows, apptRows, subRows] = await Promise.all([
      this._findLinkedCustomerRows(establishmentId),
      this._findAppointmentCustomerRows(establishmentId),
      this._findSubscriptionCustomerRows(establishmentId),
    ]);

    const originById = new Map();
    const ensureOrigin = (customerId) => {
      if (!customerId) return null;
      if (!originById.has(customerId)) {
        originById.set(customerId, {
          has_manual: false,
          has_self_signup: false,
          has_appointment: false,
          has_subscription: false,
        });
      }
      return originById.get(customerId);
    };

    for (const row of linkRows) {
      const origin = ensureOrigin(row.customer_id);
      if (!origin) continue;
      if (row.source === 'self_signup') {
        origin.has_self_signup = true;
      } else {
        origin.has_manual = true;
      }
    }

    for (const row of apptRows) {
      const origin = ensureOrigin(row.customer_id);
      if (origin) origin.has_appointment = true;
    }

    for (const row of subRows) {
      const origin = ensureOrigin(row.customer_id);
      if (origin) origin.has_subscription = true;
    }

    return {
      ids: [...originById.keys()],
      originById,
    };
  }

  async findByEstablishment(establishmentId, { search, page = 1, limit = 20 } = {}) {
    const normalizedPage = toPositiveInt(page, 1);
    const normalizedLimit = Math.min(toPositiveInt(limit, 20), 100);
    const offset = (normalizedPage - 1) * normalizedLimit;
    const { ids, originById } = await this.findCustomerIdsForEstablishment(establishmentId);

    if (ids.length === 0) return { data: [], total: 0 };

    const { data: customers, error } = await this.db
      .from('customers')
      .select(`
        id, phone, cpf, date_of_birth, city, province, created_at,
        users(id, name, email, is_active)
      `)
      .in('id', ids);

    if (error) throw error;

    const { data: subscriptions, error: subError } = await this.db
      .from('subscriptions')
      .select(`
        id, customer_id, status, plan_id, establishment_id, started_at, expires_at, payment_status,
        plans(id, name, price, billing_interval, discount_percent)
      `)
      .eq('establishment_id', establishmentId)
      .in('customer_id', ids);

    if (subError) throw subError;

    const subscriptionsByCustomer = new Map();
    for (const sub of subscriptions || []) {
      const list = subscriptionsByCustomer.get(sub.customer_id) || [];
      list.push(sub);
      subscriptionsByCustomer.set(sub.customer_id, list);
    }

    const term = String(search || '').trim().toLowerCase();
    const enriched = (customers || [])
      .map((customer) => {
        const customerSubscriptions = subscriptionsByCustomer.get(customer.id) || [];
        return {
          ...customer,
          subscriptions: customerSubscriptions,
          origin: originById.get(customer.id) || {},
          active_subscription: customerSubscriptions.find((s) => s.status === 'active') || null,
        };
      })
      .filter((customer) => {
        if (!term) return true;
        const searchable = [
          customer.users?.name,
          customer.users?.email,
          customer.phone,
          customer.cpf,
        ].filter(Boolean).join(' ').toLowerCase();
        return searchable.includes(term);
      })
      .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));

    return {
      data: enriched.slice(offset, offset + normalizedLimit),
      total: enriched.length,
    };
  }

  async findLink(establishmentId, customerId) {
    const { data, error } = await this.db
      .from('customer_establishments')
      .select('*')
      .eq('establishment_id', establishmentId)
      .eq('customer_id', customerId)
      .maybeSingle();

    if (error) {
      if (isMissingCustomerEstablishmentsTable(error)) return null;
      throw error;
    }

    return data;
  }

  async findDetailByEstablishment(establishmentId, customerId) {
    const { ids, originById } = await this.findCustomerIdsForEstablishment(establishmentId);
    if (!ids.includes(customerId)) return null;

    const { data: customer, error: customerError } = await this.db
      .from('customers')
      .select('*, users(id, name, email, is_active, created_at)')
      .eq('id', customerId)
      .maybeSingle();

    if (customerError) throw customerError;
    if (!customer) return null;

    const { data: appointments, error: appointmentsError } = await this.db
      .from('appointments')
      .select(`
        id, start_time, end_time, status, notes, total_price, payment_method, created_at,
        professionals(id, name),
        services(id, name, duration_minutes, price)
      `)
      .eq('establishment_id', establishmentId)
      .eq('customer_id', customerId)
      .order('start_time', { ascending: false });

    if (appointmentsError) throw appointmentsError;

    const { data: subscriptions, error: subscriptionsError } = await this.db
      .from('subscriptions')
      .select(`
        id, status, started_at, expires_at, cancelled_at, payment_provider, payment_status,
        payment_method, checkout_url, created_at,
        plans(
          id, name, description, price, billing_interval, billing_type, benefits, discount_percent,
          plan_services(id, service_id, price_override, services(id, name, price))
        )
      `)
      .eq('establishment_id', establishmentId)
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (subscriptionsError) throw subscriptionsError;

    const appointmentPayments = (appointments || []).map((appointment) => ({
      id: appointment.id,
      source: 'appointment',
      label: appointment.services?.name || 'Agendamento',
      amount: appointment.total_price ?? appointment.services?.price ?? null,
      status: appointment.status,
      method: appointment.payment_method,
      date: appointment.start_time,
    }));

    const subscriptionPayments = (subscriptions || []).map((subscription) => ({
      id: subscription.id,
      source: 'subscription',
      label: subscription.plans?.name || 'Plano',
      amount: subscription.plans?.price ?? null,
      status: subscription.payment_status || subscription.status,
      method: subscription.payment_method || subscription.payment_provider,
      date: subscription.started_at || subscription.created_at,
      checkout_url: subscription.checkout_url,
    }));

    const discounts = [];
    for (const subscription of subscriptions || []) {
      const plan = subscription.plans;
      if (!plan || subscription.status !== 'active') continue;

      if (Number(plan.discount_percent) > 0) {
        discounts.push({
          id: `${subscription.id}-percent`,
          type: 'percent',
          plan: plan.name,
          label: 'Desconto geral',
          value: Number(plan.discount_percent),
        });
      }

      for (const planService of plan.plan_services || []) {
        if (planService.price_override === null || planService.price_override === undefined) continue;
        discounts.push({
          id: planService.id,
          type: 'service_price',
          plan: plan.name,
          service: planService.services?.name || 'Servico',
          value: Number(planService.price_override),
        });
      }
    }

    return {
      customer,
      link: await this.findLink(establishmentId, customerId),
      origin: originById.get(customerId) || {},
      appointments: appointments || [],
      subscriptions: subscriptions || [],
      payments: [...appointmentPayments, ...subscriptionPayments]
        .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0)),
      discounts,
    };
  }
}

module.exports = new CustomersRepository();
