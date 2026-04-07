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

  async findByEstablishment(establishmentId, { search, page = 1, limit = 20 } = {}) {
    const offset = (page - 1) * limit;

    let query = this.db
      .from('customers')
      .select(`
        id, phone, created_at,
        users(id, name, email, is_active)
      `, { count: 'exact' });

    // Customers who have appointments with this establishment
    const { data: apptCustomers } = await this.db
      .from('appointments')
      .select('customer_id')
      .eq('establishment_id', establishmentId);

    if (!apptCustomers || apptCustomers.length === 0) {
      return { data: [], total: 0 };
    }

    const ids = [...new Set(apptCustomers.map((a) => a.customer_id))];
    query = query.in('id', ids);

    if (search) {
      query = query.ilike('users.name', `%${search}%`);
    }

    query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);

    const { data, error, count } = await query;
    if (error) throw error;
    return { data, total: count };
  }
}

module.exports = new CustomersRepository();
