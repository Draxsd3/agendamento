const subscriptionsService = require('../services/subscriptions.service');
const plansService = require('../services/plans.service');
const establishmentsRepo = require('../repositories/establishments.repository');

class SubscriptionsController {
  // Customer: get my subscriptions
  async getMine(req, res, next) {
    try {
      const data = await subscriptionsService.getMySubscriptions(req.user.userId);
      res.json(data);
    } catch (err) {
      next(err);
    }
  }

  // Customer: subscribe to a plan
  async subscribe(req, res, next) {
    try {
      const { plan_id, success_url, cancel_url, expired_url } = req.body;
      const data = await subscriptionsService.subscribe(req.user.userId, plan_id, {
        success_url,
        cancel_url,
        expired_url,
      });
      res.status(201).json(data);
    } catch (err) {
      next(err);
    }
  }

  // Customer: cancel a subscription
  async cancel(req, res, next) {
    try {
      const data = await subscriptionsService.cancel(req.user.userId, req.params.id);
      res.json(data);
    } catch (err) {
      next(err);
    }
  }

  // Public: get active plans by establishment ID
  async getPublicPlans(req, res, next) {
    try {
      const { establishmentId } = req.params;
      const data = await plansService.getAll(establishmentId, true);
      res.json(data);
    } catch (err) {
      next(err);
    }
  }

  // Public: get active plans by establishment SLUG (more user-friendly)
  async getPublicPlansBySlug(req, res, next) {
    try {
      const { slug } = req.params;
      const establishment = await establishmentsRepo.findBySlug(slug);
      if (!establishment) {
        return res.status(404).json({ error: 'Estabelecimento não encontrado.' });
      }
      const data = await plansService.getAll(establishment.id, true);
      res.json(data);
    } catch (err) {
      next(err);
    }
  }

  // Admin: get all subscriptions for the establishment
  async getByEstablishment(req, res, next) {
    try {
      const data = await subscriptionsService.getByEstablishment(req.user.establishmentId);
      res.json(data);
    } catch (err) {
      next(err);
    }
  }

  // Admin: manually activate a pending subscription (billing_type=manual)
  async adminActivate(req, res, next) {
    try {
      const data = await subscriptionsService.adminActivate(req.params.id, req.user.establishmentId);
      res.json(data);
    } catch (err) {
      next(err);
    }
  }

  // Admin: cancel any subscription
  async adminCancel(req, res, next) {
    try {
      const data = await subscriptionsService.adminCancel(req.params.id, req.user.establishmentId);
      res.json(data);
    } catch (err) {
      next(err);
    }
  }

  // Admin: generate Asaas checkout for a pending subscription (billing_type=asaas)
  async adminGenerateCheckout(req, res, next) {
    try {
      const { success_url, cancel_url, expired_url } = req.body;
      const data = await subscriptionsService.adminGenerateCheckout(
        req.params.id,
        req.user.establishmentId,
        { success_url, cancel_url, expired_url }
      );
      res.json(data);
    } catch (err) {
      next(err);
    }
  }

  async asaasWebhook(req, res, next) {
    try {
      const authToken =
        req.headers['asaas-access-token'] ||
        req.headers['x-asaas-webhook-token'] ||
        req.query.token;

      const data = await subscriptionsService.handleAsaasWebhook(req.body, authToken);
      res.json({ received: true, ...data });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new SubscriptionsController();
