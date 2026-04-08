const BaseRepository = require('./base.repository');

class AppointmentsRepository extends BaseRepository {
  constructor() {
    super('appointments');
  }

  async findByEstablishment(establishmentId, { status, date, page = 1, limit = 50 } = {}) {
    const offset = (page - 1) * limit;

    let query = this.db
      .from('appointments')
      .select(`
        *,
        customers(id, phone, users(id, name, email)),
        professionals(id, name),
        services(id, name, duration_minutes, price)
      `, { count: 'exact' })
      .eq('establishment_id', establishmentId)
      .order('start_time', { ascending: false });

    if (status) query = query.eq('status', status);
    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      query = query.gte('start_time', start.toISOString()).lte('start_time', end.toISOString());
    }

    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;
    if (error) throw error;
    return { data, total: count };
  }

  async findByCustomer(customerId) {
    const { data, error } = await this.db
      .from('appointments')
      .select(`
        *,
        establishments(id, name, slug),
        professionals(id, name),
        services(id, name, duration_minutes, price)
      `)
      .eq('customer_id', customerId)
      .order('start_time', { ascending: false });

    if (error) throw error;
    return data;
  }

  async checkConflict(professionalId, startTime, endTime, excludeId = null) {
    let query = this.db
      .from('appointments')
      .select('id')
      .eq('professional_id', professionalId)
      .neq('status', 'cancelled')
      .lt('start_time', endTime)
      .gt('end_time', startTime);

    if (excludeId) query = query.neq('id', excludeId);

    const { data, error } = await query;
    if (error) throw error;
    return data.length > 0;
  }

  async findByProfessionalAndDate(professionalId, date) {
    const [yr, mo, dy] = date.split('-').map(Number);
    const start = new Date(yr, mo - 1, dy, 0, 0, 0, 0);
    const end = new Date(yr, mo - 1, dy, 23, 59, 59, 999);

    const { data, error } = await this.db
      .from('appointments')
      .select('id, start_time, end_time, status')
      .eq('professional_id', professionalId)
      .neq('status', 'cancelled')
      .gte('start_time', start.toISOString())
      .lte('start_time', end.toISOString());

    if (error) throw error;
    return data;
  }
}

module.exports = new AppointmentsRepository();
