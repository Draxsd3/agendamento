const servicesRepo = require('../repositories/services.repository');

class ServicesService {
  async getByEstablishment(establishmentId, activeOnly = false) {
    return servicesRepo.findByEstablishment(establishmentId, activeOnly);
  }

  async getById(id, establishmentId) {
    const service = await servicesRepo.findByIdAndEstablishment(id, establishmentId);
    if (!service) {
      const err = new Error('Serviço não encontrado.');
      err.statusCode = 404;
      throw err;
    }
    return service;
  }

  async create(payload) {
    return servicesRepo.create(payload);
  }

  async update(id, establishmentId, payload) {
    await this.getById(id, establishmentId);
    return servicesRepo.update(id, payload);
  }

  async delete(id, establishmentId) {
    await this.getById(id, establishmentId);
    return servicesRepo.delete(id);
  }
}

module.exports = new ServicesService();
