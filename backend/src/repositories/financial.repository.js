const supabase = require('../config/supabase');

class FinancialRepository {
  /**
   * Returns aggregate KPIs for a given establishment and date range.
   * Counts only appointments with status = 'completed'.
   */
  async getSummary(establishmentId, { from, to, branchId }) {
    let query = supabase
      .from('appointments')
      .select('total_price, payment_method, branch_id', { count: 'exact' })
      .eq('establishment_id', establishmentId)
      .eq('status', 'completed')
      .gte('start_time', from)
      .lte('start_time', to);

    if (branchId) query = query.eq('branch_id', branchId);

    const { data, error, count } = await query;
    if (error) throw error;

    const total = (data || []).reduce((sum, r) => sum + Number(r.total_price || 0), 0);
    const avg   = count > 0 ? total / count : 0;

    return { total, count, avg, appointments: data || [] };
  }

  /**
   * Revenue grouped by branch.
   */
  async getRevenueByBranch(establishmentId, { from, to }) {
    const { data, error } = await supabase
      .from('appointments')
      .select('branch_id, total_price, branches(id, name)')
      .eq('establishment_id', establishmentId)
      .eq('status', 'completed')
      .gte('start_time', from)
      .lte('start_time', to);

    if (error) throw error;

    const map = {};
    for (const row of data || []) {
      const key  = row.branch_id || '__none__';
      const name = row.branches?.name || 'Sem filial';
      if (!map[key]) map[key] = { branch_id: row.branch_id, name, total: 0, count: 0 };
      map[key].total += Number(row.total_price || 0);
      map[key].count += 1;
    }

    return Object.values(map).sort((a, b) => b.total - a.total);
  }

  /**
   * Revenue grouped by professional.
   */
  async getRevenueByProfessional(establishmentId, { from, to, branchId }) {
    let query = supabase
      .from('appointments')
      .select('professional_id, total_price, professionals(id, name, avatar_url)')
      .eq('establishment_id', establishmentId)
      .eq('status', 'completed')
      .gte('start_time', from)
      .lte('start_time', to);

    if (branchId) query = query.eq('branch_id', branchId);

    const { data, error } = await query;
    if (error) throw error;

    const map = {};
    for (const row of data || []) {
      const key = row.professional_id;
      if (!map[key]) {
        map[key] = {
          professional_id: key,
          name: row.professionals?.name || 'Desconhecido',
          avatar_url: row.professionals?.avatar_url || null,
          total: 0,
          count: 0,
        };
      }
      map[key].total += Number(row.total_price || 0);
      map[key].count += 1;
    }

    return Object.values(map).sort((a, b) => b.total - a.total);
  }

  /**
   * Revenue grouped by service.
   */
  async getRevenueByService(establishmentId, { from, to, branchId }) {
    let query = supabase
      .from('appointments')
      .select('service_id, total_price, services(id, name, price)')
      .eq('establishment_id', establishmentId)
      .eq('status', 'completed')
      .gte('start_time', from)
      .lte('start_time', to);

    if (branchId) query = query.eq('branch_id', branchId);

    const { data, error } = await query;
    if (error) throw error;

    const map = {};
    for (const row of data || []) {
      const key = row.service_id;
      if (!map[key]) {
        map[key] = {
          service_id: key,
          name: row.services?.name || 'Desconhecido',
          base_price: Number(row.services?.price || 0),
          total: 0,
          count: 0,
        };
      }
      map[key].total += Number(row.total_price || 0);
      map[key].count += 1;
    }

    return Object.values(map).sort((a, b) => b.total - a.total);
  }

  /**
   * Paginated list of completed appointments (transactions).
   */
  async getTransactions(establishmentId, { from, to, branchId, page = 1, limit = 20 }) {
    const offset = (page - 1) * limit;

    let query = supabase
      .from('appointments')
      .select(`
        id, start_time, total_price, payment_method, status,
        customers(id, users(name, email)),
        professionals(id, name),
        services(id, name),
        branches(id, name)
      `, { count: 'exact' })
      .eq('establishment_id', establishmentId)
      .eq('status', 'completed')
      .gte('start_time', from)
      .lte('start_time', to)
      .order('start_time', { ascending: false })
      .range(offset, offset + limit - 1);

    if (branchId) query = query.eq('branch_id', branchId);

    const { data, error, count } = await query;
    if (error) throw error;

    return { data: data || [], total: count || 0 };
  }

  /**
   * Revenue per day within the date range (for the chart).
   */
  async getRevenueByDay(establishmentId, { from, to, branchId }) {
    let query = supabase
      .from('appointments')
      .select('start_time, total_price')
      .eq('establishment_id', establishmentId)
      .eq('status', 'completed')
      .gte('start_time', from)
      .lte('start_time', to);

    if (branchId) query = query.eq('branch_id', branchId);

    const { data, error } = await query;
    if (error) throw error;

    const map = {};
    for (const row of data || []) {
      const day = row.start_time.slice(0, 10); // YYYY-MM-DD
      if (!map[day]) map[day] = 0;
      map[day] += Number(row.total_price || 0);
    }

    return Object.entries(map)
      .map(([date, total]) => ({ date, total }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Update payment_method on a single appointment (admin only).
   */
  async updatePaymentMethod(appointmentId, establishmentId, paymentMethod) {
    const { data, error } = await supabase
      .from('appointments')
      .update({ payment_method: paymentMethod })
      .eq('id', appointmentId)
      .eq('establishment_id', establishmentId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

module.exports = new FinancialRepository();
