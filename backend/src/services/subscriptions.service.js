const subscriptionsRepo = require('../repositories/subscriptions.repository');
const plansRepo = require('../repositories/plans.repository');
const customersRepo = require('../repositories/customers.repository');

class SubscriptionsService {
  async getMySubscriptions(userId) {
    const customer = await customersRepo.findByUserId(userId);
    if (!customer) {
      const err = new Error('Perfil de cliente nao encontrado.');
      err.statusCode = 404;
      throw err;
    }

    return subscriptionsRepo.findByCustomer(customer.id);
  }

  async subscribe(userId, planId) {
    const customer = await customersRepo.findByUserId(userId);
    if (!customer) {
      const err = new Error('Perfil de cliente nao encontrado.');
      err.statusCode = 404;
      throw err;
    }

    const plan = await plansRepo.findById(planId);
    if (!plan || !plan.is_active) {
      const err = new Error('Plano nao encontrado ou inativo.');
      err.statusCode = 404;
      throw err;
    }

    const existing = await subscriptionsRepo.findActiveByCustomerAndEstablishment(
      customer.id,
      plan.establishment_id
    );

    if (existing) {
      const err = new Error('Voce ja possui uma assinatura ativa para este estabelecimento.');
      err.statusCode = 409;
      throw err;
    }

    const pending = await subscriptionsRepo.findPendingByCustomerAndEstablishment(
      customer.id,
      plan.establishment_id
    );
    if (pending) return { subscription: pending };

    const subscription = await subscriptionsRepo.create({
      customer_id: customer.id,
      plan_id: planId,
      establishment_id: plan.establishment_id,
      status: 'pending',
      started_at: new Date().toISOString(),
      payment_provider: 'manual',
      payment_status: 'awaiting_confirmation',
      metadata: {},
    });

    return { subscription };
  }

  async cancel(userId, subscriptionId) {
    const customer = await customersRepo.findByUserId(userId);
    if (!customer) {
      const err = new Error('Perfil de cliente nao encontrado.');
      err.statusCode = 404;
      throw err;
    }

    const sub = await subscriptionsRepo.findById(subscriptionId);
    if (!sub || sub.customer_id !== customer.id) {
      const err = new Error('Assinatura nao encontrada.');
      err.statusCode = 404;
      throw err;
    }

    return subscriptionsRepo.update(subscriptionId, {
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
      payment_status: 'cancelled',
    });
  }

  async getByEstablishment(establishmentId) {
    return subscriptionsRepo.findByEstablishment(establishmentId);
  }

  async adminActivate(subscriptionId, establishmentId) {
    const sub = await subscriptionsRepo.findById(subscriptionId);
    if (!sub || sub.establishment_id !== establishmentId) {
      const err = new Error('Assinatura nao encontrada.');
      err.statusCode = 404;
      throw err;
    }

    if (sub.status === 'active') {
      const err = new Error('Assinatura ja esta ativa.');
      err.statusCode = 409;
      throw err;
    }

    const plan = await plansRepo.findById(sub.plan_id);
    return subscriptionsRepo.update(subscriptionId, {
      status: 'active',
      payment_status: 'manual_confirmed',
      expires_at: this._calcExpiresAt(plan?.billing_interval),
    });
  }

  async adminCancel(subscriptionId, establishmentId) {
    const sub = await subscriptionsRepo.findById(subscriptionId);
    if (!sub || sub.establishment_id !== establishmentId) {
      const err = new Error('Assinatura nao encontrada.');
      err.statusCode = 404;
      throw err;
    }

    return subscriptionsRepo.update(subscriptionId, {
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
      payment_status: 'cancelled',
    });
  }

  _calcExpiresAt(interval) {
    const now = new Date();

    if (interval === 'monthly') now.setMonth(now.getMonth() + 1);
    if (interval === 'quarterly') now.setMonth(now.getMonth() + 3);
    if (interval === 'annual') now.setFullYear(now.getFullYear() + 1);

    return now.toISOString();
  }
}

module.exports = new SubscriptionsService();
