const BaseRepository = require('./base.repository');

class ServicesRepository extends BaseRepository {
  constructor() {
    super('services');
  }

  async findByEstablishment(establishmentId, activeOnly = false) {
    let query = this.db
      .from('services')
      .select('*')
      .eq('establishment_id', establishmentId)
      .order('name');

    if (activeOnly) query = query.eq('is_active', true);

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  async findByIdAndEstablishment(id, establishmentId) {
    const { data, error } = await this.db
      .from('services')
      .select('*')
      .eq('id', id)
      .eq('establishment_id', establishmentId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }
}

module.exports = new ServicesRepository();
