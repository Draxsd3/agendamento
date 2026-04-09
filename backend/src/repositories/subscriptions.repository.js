const BaseRepository = require('./base.repository');

class SubscriptionsRepository extends BaseRepository {
  constructor() {
    super('subscriptions');
  }

  async findByCustomer(customerId) {
    const { data, error } = await this.db
      .from('subscriptions')
      .select(`
        *,
        plans(id, name, description, price, billing_interval, benefits, discount_percent, establishment_id, plan_services(service_id, price_override)),
        establishments(id, name, slug)
      `)
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async findActiveByCustomerAndEstablishment(customerId, establishmentId) {
    const { data, error } = await this.db
      .from('subscriptions')
      .select(`
        *,
        plans(id, name, description, price, billing_interval, benefits, discount_percent)
      `)
      .eq('customer_id', customerId)
      .eq('establishment_id', establishmentId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async findByEstablishment(establishmentId) {
    const { data, error } = await this.db
      .from('subscriptions')
      .select(`
        *,
        plans(id, name, price),
        customers(id, users(id, name, email))
      `)
      .eq('establishment_id', establishmentId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }
}

module.exports = new SubscriptionsRepository();
