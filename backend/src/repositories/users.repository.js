const BaseRepository = require('./base.repository');

class UsersRepository extends BaseRepository {
  constructor() {
    super('users');
  }

  async findByEmail(email) {
    const { data, error } = await this.db
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async findByResetToken(token) {
    const { data, error } = await this.db
      .from('users')
      .select('*')
      .eq('password_reset_token', token)
      .gt('password_reset_expires_at', new Date().toISOString())
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async clearResetToken(userId) {
    const { error } = await this.db
      .from('users')
      .update({ password_reset_token: null, password_reset_expires_at: null })
      .eq('id', userId);

    if (error) throw error;
  }

  async findAllPaginated({ page = 1, limit = 20, role, search } = {}) {
    const offset = (page - 1) * limit;
    let query = this.db
      .from('users')
      .select('id, name, email, role, is_active, created_at', { count: 'exact' });

    if (role) query = query.eq('role', role);
    if (search) query = query.ilike('name', '%' + search + '%');

    query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);

    const { data, error, count } = await query;
    if (error) throw error;
    return { data, total: count };
  }
}

module.exports = new UsersRepository();
