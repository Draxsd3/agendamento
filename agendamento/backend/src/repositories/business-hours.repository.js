const BaseRepository = require('./base.repository');

class BusinessHoursRepository extends BaseRepository {
  constructor() {
    super('business_hours');
  }

  async findByEstablishment(establishmentId) {
    const { data, error } = await this.db
      .from('business_hours')
      .select('*')
      .eq('establishment_id', establishmentId)
      .order('weekday');

    if (error) throw error;
    return data;
  }

  async upsert(establishmentId, weekday, payload) {
    const { data, error } = await this.db
      .from('business_hours')
      .upsert(
        { ...payload, establishment_id: establishmentId, weekday },
        { onConflict: 'establishment_id,weekday' }
      )
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

module.exports = new BusinessHoursRepository();
