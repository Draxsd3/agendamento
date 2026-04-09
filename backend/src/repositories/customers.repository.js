const BaseRepository = require('./base.repository');

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

  // Returns unique establishments this customer has appointments with, each with active plans
  async findMyEstablishmentsWithPlans(customerId) {
    // Step 1: get distinct establishment IDs from appointments
    const { data: apptRows, error: apptErr } = await this.db
      .from('appointments')
      .select('establishment_id, establishments(id, name, slug, logo_url, description)')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (apptErr) throw apptErr;

    // Deduplicate
    const seen = new Set();
    const establishments = [];
    for (const row of apptRows || []) {
      if (row.establishments && !seen.has(row.establishment_id)) {
        seen.add(row.establishment_id);
        establishments.push(row.establishments);
      }
    }

    if (establishments.length === 0) return [];

    // Step 2: fetch active plans for each establishment
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

  async findByEstablishment(establishmentId, { search, page = 1, limit = 20 } = {}) {
    const offset = (page - 1) * limit;

    // Collect customer IDs from appointments
    const { data: apptRows } = await this.db
      .from('appointments')
      .select('customer_id')
      .eq('establishment_id', establishmentId);

    // Collect customer IDs from subscriptions (customer subscribed to a plan here)
    const { data: subRows } = await this.db
      .from('subscriptions')
      .select('customer_id')
      .eq('establishment_id', establishmentId);

    // Merge and deduplicate
    const ids = [
      ...new Set([
        ...(apptRows  || []).map((r) => r.customer_id),
        ...(subRows   || []).map((r) => r.customer_id),
      ]),
    ];

    if (ids.length === 0) return { data: [], total: 0 };

    // Build enriched query — include subscription status for this establishment
    let query = this.db
      .from('customers')
      .select(`
        id, phone, cpf, date_of_birth, created_at,
        users(id, name, email, is_active),
        subscriptions!left(id, status, plan_id, establishment_id,
          plans(name))
      `, { count: 'exact' })
      .in('id', ids)
      .eq('subscriptions.establishment_id', establishmentId);

    if (search) {
      query = query.ilike('users.name', `%${search}%`);
    }

    query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);

    const { data, error, count } = await query;
    if (error) throw error;

    // Annotate each customer with their origin (appointment / subscription / both)
    const apptIds = new Set((apptRows || []).map((r) => r.customer_id));
    const subIds  = new Set((subRows  || []).map((r) => r.customer_id));

    const annotated = (data || []).map((c) => ({
      ...c,
      origin: {
        has_appointment:  apptIds.has(c.id),
        has_subscription: subIds.has(c.id),
      },
      active_subscription: (c.subscriptions || []).find((s) => s.status === 'active') || null,
    }));

    return { data: annotated, total: count };
  }
}

module.exports = new CustomersRepository();
