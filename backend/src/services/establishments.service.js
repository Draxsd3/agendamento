const establishmentsRepo = require('../repositories/establishments.repository');

class EstablishmentsService {
  async getAll(filters) {
    return establishmentsRepo.findAllPaginated(filters);
  }

  async getById(id) {
    const establishment = await establishmentsRepo.findById(id);
    if (!establishment) {
      const err = new Error('Estabelecimento não encontrado.');
      err.statusCode = 404;
      throw err;
    }
    return establishment;
  }

  async getBySlug(slug) {
    const establishment = await establishmentsRepo.findBySlug(slug);
    if (!establishment) {
      const err = new Error('Estabelecimento não encontrado.');
      err.statusCode = 404;
      throw err;
    }
    if (establishment.status !== 'active') {
      const err = new Error('Estabelecimento não está ativo.');
      err.statusCode = 403;
      throw err;
    }
    return establishment;
  }

  async create(payload) {
    const existing = await establishmentsRepo.findBySlug(payload.slug);
    if (existing) {
      const err = new Error('Slug já está em uso. Escolha outro identificador.');
      err.statusCode = 409;
      throw err;
    }
    return establishmentsRepo.create(payload);
  }

  async update(id, payload) {
    await this.getById(id);

    if (payload.slug) {
      const existing = await establishmentsRepo.findBySlug(payload.slug);
      if (existing && existing.id !== id) {
        const err = new Error('Slug já está em uso.');
        err.statusCode = 409;
        throw err;
      }
    }

    return establishmentsRepo.update(id, payload);
  }

  async delete(id) {
    await this.getById(id);
    return establishmentsRepo.delete(id);
  }

  async setStatus(id, status) {
    await this.getById(id);
    return establishmentsRepo.update(id, { status });
  }
}

module.exports = new EstablishmentsService();
