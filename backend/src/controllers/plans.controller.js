const plansService = require('../services/plans.service');
const subscriptionsService = require('../services/subscriptions.service');

class PlansController {
  // Admin: manage plans
  async getAll(req, res, next) {
    try {
      const establishmentId = req.user.establishmentId;
      const data = await plansService.getAll(establishmentId);
      res.json(data);
    } catch (err) {
      next(err);
    }
  }

  async getById(req, res, next) {
    try {
      const data = await plansService.getById(req.params.id);
      res.json(data);
    } catch (err) {
      next(err);
    }
  }

  async create(req, res, next) {
    try {
      const establishmentId = req.user.establishmentId;
      const data = await plansService.create(establishmentId, req.body);
      res.status(201).json(data);
    } catch (err) {
      next(err);
    }
  }

  async update(req, res, next) {
    try {
      const establishmentId = req.user.establishmentId;
      const data = await plansService.update(req.params.id, establishmentId, req.body);
      res.json(data);
    } catch (err) {
      next(err);
    }
  }

  async delete(req, res, next) {
    try {
      const establishmentId = req.user.establishmentId;
      await plansService.delete(req.params.id, establishmentId);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }

  // Plan services
  async getPlanServices(req, res, next) {
    try {
      const data = await plansService.getPlanServices(req.params.id, req.user.establishmentId);
      res.json(data);
    } catch (err) { next(err); }
  }

  async addPlanService(req, res, next) {
    try {
      const { serviceId, priceOverride } = req.body;
      const data = await plansService.addPlanService(
        req.params.id, req.user.establishmentId, serviceId,
        priceOverride !== undefined ? Number(priceOverride) : null
      );
      res.status(201).json(data);
    } catch (err) { next(err); }
  }

  async removePlanService(req, res, next) {
    try {
      await plansService.removePlanService(req.params.id, req.user.establishmentId, req.params.serviceId);
      res.status(204).send();
    } catch (err) { next(err); }
  }

  // Admin: list subscribers
  async getSubscribers(req, res, next) {
    try {
      const establishmentId = req.user.establishmentId;
      const data = await subscriptionsService.getByEstablishment(establishmentId);
      res.json(data);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new PlansController();
