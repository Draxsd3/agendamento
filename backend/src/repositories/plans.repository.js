const BaseRepository = require('./base.repository');

class PlansRepository extends BaseRepository {
  constructor() {
    super('plans');
  }

  async findByEstablishment(establishmentId, onlyActive = false) {
    let query = this.db
      .from('plans')
      .select(`*, plan_services(service_id, price_override, services(id, name, price))`)
      .eq('establishment_id', establishmentId)
      .order('price');

    if (onlyActive) query = query.eq('is_active', true);

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  async getPlanServices(planId) {
    const { data, error } = await this.db
      .from('plan_services')
      .select('*, services(id, name, price, duration_minutes)')
      .eq('plan_id', planId);
    if (error) throw error;
    return data;
  }

  async addPlanService(planId, serviceId, priceOverride) {
    const { data, error } = await this.db
      .from('plan_services')
      .upsert({ plan_id: planId, service_id: serviceId, price_override: priceOverride ?? null },
               { onConflict: 'plan_id,service_id' })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async removePlanService(planId, serviceId) {
    const { error } = await this.db
      .from('plan_services')
      .delete()
      .eq('plan_id', planId)
      .eq('service_id', serviceId);
    if (error) throw error;
    return true;
  }
}

module.exports = new PlansRepository();
