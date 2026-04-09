const plansRepo = require('../repositories/plans.repository');

class PlansService {
  async getAll(establishmentId, onlyActive = false) {
    return plansRepo.findByEstablishment(establishmentId, onlyActive);
  }

  async getById(id) {
    const plan = await plansRepo.findById(id);
    if (!plan) {
      const err = new Error('Plano não encontrado.');
      err.statusCode = 404;
      throw err;
    }
    return plan;
  }

  async create(establishmentId, payload) {
    return plansRepo.create({ ...payload, establishment_id: establishmentId });
  }

  async update(id, establishmentId, payload) {
    const plan = await this.getById(id);
    if (plan.establishment_id !== establishmentId) {
      const err = new Error('Acesso negado.');
      err.statusCode = 403;
      throw err;
    }
    return plansRepo.update(id, payload);
  }

  async delete(id, establishmentId) {
    const plan = await this.getById(id);
    if (plan.establishment_id !== establishmentId) {
      const err = new Error('Acesso negado.');
      err.statusCode = 403;
      throw err;
    }
    return plansRepo.delete(id);
  }

  async getPlanServices(planId, establishmentId) {
    const plan = await this.getById(planId);
    if (plan.establishment_id !== establishmentId) {
      const err = new Error('Acesso negado.');
      err.statusCode = 403;
      throw err;
    }
    return plansRepo.getPlanServices(planId);
  }

  async addPlanService(planId, establishmentId, serviceId, priceOverride) {
    const plan = await this.getById(planId);
    if (plan.establishment_id !== establishmentId) {
      const err = new Error('Acesso negado.');
      err.statusCode = 403;
      throw err;
    }
    return plansRepo.addPlanService(planId, serviceId, priceOverride);
  }

  async removePlanService(planId, establishmentId, serviceId) {
    const plan = await this.getById(planId);
    if (plan.establishment_id !== establishmentId) {
      const err = new Error('Acesso negado.');
      err.statusCode = 403;
      throw err;
    }
    return plansRepo.removePlanService(planId, serviceId);
  }
}

module.exports = new PlansService();
