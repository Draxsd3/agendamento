const financialRepo = require('../repositories/financial.repository');

// Preset period helpers
function buildDateRange(period) {
  const now = new Date();

  if (period === 'today') {
    const from = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const to   = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    return { from: from.toISOString(), to: to.toISOString() };
  }

  if (period === 'week') {
    const day  = now.getDay(); // 0 = Sunday
    const diff = now.getDate() - day;
    const from = new Date(now.getFullYear(), now.getMonth(), diff, 0, 0, 0, 0);
    const to   = new Date(now.getFullYear(), now.getMonth(), diff + 6, 23, 59, 59, 999);
    return { from: from.toISOString(), to: to.toISOString() };
  }

  if (period === 'month') {
    const from = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const to   = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    return { from: from.toISOString(), to: to.toISOString() };
  }

  if (period === 'year') {
    const from = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
    const to   = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
    return { from: from.toISOString(), to: to.toISOString() };
  }

  // Default: current month
  const from = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
  const to   = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  return { from: from.toISOString(), to: to.toISOString() };
}

function resolveDateRange(query) {
  if (query.from && query.to) {
    const from = new Date(query.from);
    from.setHours(0, 0, 0, 0);
    const to = new Date(query.to);
    to.setHours(23, 59, 59, 999);
    return { from: from.toISOString(), to: to.toISOString() };
  }
  return buildDateRange(query.period || 'month');
}

class FinancialService {
  async getSummary(establishmentId, query) {
    const range = resolveDateRange(query);

    // Current period
    const current = await financialRepo.getSummary(establishmentId, {
      ...range,
      branchId: query.branchId || null,
    });

    // Previous equivalent period for comparison
    const fromDate = new Date(range.from);
    const toDate   = new Date(range.to);
    const duration = toDate.getTime() - fromDate.getTime();
    const prevFrom = new Date(fromDate.getTime() - duration);
    const prevTo   = new Date(toDate.getTime()   - duration);

    const previous = await financialRepo.getSummary(establishmentId, {
      from: prevFrom.toISOString(),
      to:   prevTo.toISOString(),
      branchId: query.branchId || null,
    });

    const growthRevenue     = previous.total > 0  ? ((current.total - previous.total) / previous.total) * 100 : null;
    const growthAppointments = previous.count > 0 ? ((current.count - previous.count) / previous.count) * 100 : null;

    return {
      period: range,
      total:   current.total,
      count:   current.count,
      avg:     current.avg,
      growth: {
        revenue:      growthRevenue,
        appointments: growthAppointments,
      },
    };
  }

  async getRevenueByDay(establishmentId, query) {
    const range = resolveDateRange(query);
    return financialRepo.getRevenueByDay(establishmentId, {
      ...range,
      branchId: query.branchId || null,
    });
  }

  async getRevenueByBranch(establishmentId, query) {
    const range = resolveDateRange(query);
    return financialRepo.getRevenueByBranch(establishmentId, range);
  }

  async getRevenueByProfessional(establishmentId, query) {
    const range = resolveDateRange(query);
    return financialRepo.getRevenueByProfessional(establishmentId, {
      ...range,
      branchId: query.branchId || null,
    });
  }

  async getRevenueByService(establishmentId, query) {
    const range = resolveDateRange(query);
    return financialRepo.getRevenueByService(establishmentId, {
      ...range,
      branchId: query.branchId || null,
    });
  }

  async getTransactions(establishmentId, query) {
    const range = resolveDateRange(query);
    return financialRepo.getTransactions(establishmentId, {
      ...range,
      branchId: query.branchId || null,
      page:  Number(query.page)  || 1,
      limit: Number(query.limit) || 20,
    });
  }

  async updatePaymentMethod(appointmentId, establishmentId, paymentMethod) {
    const VALID = ['dinheiro', 'cartao_credito', 'cartao_debito', 'pix', 'cortesia', 'plano'];
    if (!VALID.includes(paymentMethod)) {
      const err = new Error('Forma de pagamento inválida.');
      err.statusCode = 400;
      throw err;
    }
    return financialRepo.updatePaymentMethod(appointmentId, establishmentId, paymentMethod);
  }
}

module.exports = new FinancialService();
