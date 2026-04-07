const professionalsRepo = require('../repositories/professionals.repository');

class ProfessionalsService {
  async getByEstablishment(establishmentId, activeOnly = false) {
    return professionalsRepo.findByEstablishment(establishmentId, activeOnly);
  }

  async getById(id, establishmentId) {
    const professional = await professionalsRepo.findByIdAndEstablishment(id, establishmentId);
    if (!professional) {
      const err = new Error('Profissional não encontrado.');
      err.statusCode = 404;
      throw err;
    }
    return professional;
  }

  async create(payload) {
    return professionalsRepo.create(payload);
  }

  async update(id, establishmentId, payload) {
    await this.getById(id, establishmentId);
    return professionalsRepo.update(id, payload);
  }

  async delete(id, establishmentId) {
    await this.getById(id, establishmentId);
    return professionalsRepo.delete(id);
  }

  async addService(professionalId, serviceId, establishmentId) {
    await this.getById(professionalId, establishmentId);
    return professionalsRepo.addService(professionalId, serviceId);
  }

  async removeService(professionalId, serviceId, establishmentId) {
    await this.getById(professionalId, establishmentId);
    return professionalsRepo.removeService(professionalId, serviceId);
  }

  async getByService(serviceId) {
    return professionalsRepo.findByService(serviceId);
  }
}

module.exports = new ProfessionalsService();
