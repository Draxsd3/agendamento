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
      const { plan_id } = req.body;
      const data = await subscriptionsService.subscribe(req.user.userId, plan_id);
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
}

module.exports = new SubscriptionsController();
