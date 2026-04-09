const subscriptionsRepo = require('../repositories/subscriptions.repository');
const plansRepo = require('../repositories/plans.repository');
const customersRepo = require('../repositories/customers.repository');

class SubscriptionsService {
  // Customer: get my subscriptions
  async getMySubscriptions(userId) {
    const customer = await customersRepo.findByUserId(userId);
    if (!customer) {
      const err = new Error('Perfil de cliente não encontrado.');
      err.statusCode = 404;
      throw err;
    }
    return subscriptionsRepo.findByCustomer(customer.id);
  }

  // Customer: subscribe to a plan
  async subscribe(userId, planId) {
    const customer = await customersRepo.findByUserId(userId);
    if (!customer) {
      const err = new Error('Perfil de cliente não encontrado.');
      err.statusCode = 404;
      throw err;
    }

    const plan = await plansRepo.findById(planId);
    if (!plan || !plan.is_active) {
      const err = new Error('Plano não encontrado ou inativo.');
      err.statusCode = 404;
      throw err;
    }

    // Check for existing active subscription for the same establishment
    const existing = await subscriptionsRepo.findActiveByCustomerAndEstablishment(
      customer.id,
      plan.establishment_id
    );
    if (existing) {
      const err = new Error('Você já possui uma assinatura ativa para este estabelecimento.');
      err.statusCode = 409;
      throw err;
    }

    // Calculate expires_at based on billing interval
    const expiresAt = this._calcExpiresAt(plan.billing_interval);

    return subscriptionsRepo.create({
      customer_id: customer.id,
      plan_id: planId,
      establishment_id: plan.establishment_id,
      status: 'active',
      started_at: new Date().toISOString(),
      expires_at: expiresAt,
    });
  }

  // Customer: cancel subscription
  async cancel(userId, subscriptionId) {
    const customer = await customersRepo.findByUserId(userId);
    if (!customer) {
      const err = new Error('Perfil de cliente não encontrado.');
      err.statusCode = 404;
      throw err;
    }

    const sub = await subscriptionsRepo.findById(subscriptionId);
    if (!sub || sub.customer_id !== customer.id) {
      const err = new Error('Assinatura não encontrada.');
      err.statusCode = 404;
      throw err;
    }
    if (sub.status !== 'active') {
      const err = new Error('Assinatura já está cancelada ou expirada.');
      err.statusCode = 400;
      throw err;
    }

    return subscriptionsRepo.update(subscriptionId, {
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
    });
  }

  // Admin: get all subscriptions for an establishment
  async getByEstablishment(establishmentId) {
    return subscriptionsRepo.findByEstablishment(establishmentId);
  }

  _calcExpiresAt(interval) {
    const now = new Date();
    if (interval === 'monthly')   now.setMonth(now.getMonth() + 1);
    if (interval === 'quarterly') now.setMonth(now.getMonth() + 3);
    if (interval === 'annual')    now.setFullYear(now.getFullYear() + 1);
    return now.toISOString();
  }
}

module.exports = new SubscriptionsService();
