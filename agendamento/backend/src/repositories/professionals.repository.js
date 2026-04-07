const BaseRepository = require('./base.repository');

class ProfessionalsRepository extends BaseRepository {
  constructor() {
    super('professionals');
  }

  async findByEstablishment(establishmentId, activeOnly = false) {
    let query = this.db
      .from('professionals')
      .select(`
        *,
        professional_services(
          service_id,
          services(id, name, duration_minutes, price)
        )
      `)
      .eq('establishment_id', establishmentId)
      .order('name');

    if (activeOnly) query = query.eq('is_active', true);

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  async findByIdAndEstablishment(id, establishmentId) {
    const { data, error } = await this.db
      .from('professionals')
      .select(`
        *,
        professional_services(
          service_id,
          services(id, name, duration_minutes, price)
        )
      `)
      .eq('id', id)
      .eq('establishment_id', establishmentId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async findByService(serviceId) {
    const { data, error } = await this.db
      .from('professional_services')
      .select('professionals(*)')
      .eq('service_id', serviceId);

    if (error) throw error;
    return data.map((r) => r.professionals).filter((p) => p && p.is_active);
  }

  async addService(professionalId, serviceId) {
    const { data, error } = await this.db
      .from('professional_services')
      .insert({ professional_id: professionalId, service_id: serviceId })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async removeService(professionalId, serviceId) {
    const { error } = await this.db
      .from('professional_services')
      .delete()
      .eq('professional_id', professionalId)
      .eq('service_id', serviceId);

    if (error) throw error;
    return true;
  }
}

module.exports = new ProfessionalsRepository();
