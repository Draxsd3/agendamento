const BaseRepository = require('./base.repository');

class EstablishmentsRepository extends BaseRepository {
  constructor() {
    super('establishments');
  }

  async findBySlug(slug) {
    const { data, error } = await this.db
      .from('establishments')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async findAllPaginated({ page = 1, limit = 20, status, search } = {}) {
    const offset = (page - 1) * limit;
    let query = this.db
      .from('establishments')
      .select('*', { count: 'exact' });

    if (status) query = query.eq('status', status);
    if (search) query = query.ilike('name', `%${search}%`);

    query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);

    const { data, error, count } = await query;
    if (error) throw error;
    return { data, total: count };
  }

  async findByAdminUserId(userId) {
    const { data, error } = await this.db
      .from('establishment_admins')
      .select('establishment_id, establishments(*)')
      .eq('user_id', userId);

    if (error) throw error;
    return data.map((row) => row.establishments);
  }
}

module.exports = new EstablishmentsRepository();
