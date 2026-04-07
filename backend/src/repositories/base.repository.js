const supabase = require('../config/supabase');

/**
 * Base repository providing common CRUD operations via Supabase JS client.
 * All tenant-specific repositories extend this class.
 */
class BaseRepository {
  constructor(tableName) {
    this.table = tableName;
    this.db = supabase;
  }

  async findById(id) {
    const { data, error } = await this.db
      .from(this.table)
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async findAll(filters = {}) {
    let query = this.db.from(this.table).select('*');

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query = query.eq(key, value);
      }
    });

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  async create(payload) {
    const { data, error } = await this.db
      .from(this.table)
      .insert(payload)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async update(id, payload) {
    const { data, error } = await this.db
      .from(this.table)
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async delete(id) {
    const { error } = await this.db.from(this.table).delete().eq('id', id);
    if (error) throw error;
    return true;
  }
}

module.exports = BaseRepository;
