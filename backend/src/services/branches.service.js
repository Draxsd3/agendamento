const branchesRepo = require('../repositories/branches.repository');

class BranchesService {
  async getAll(establishmentId) {
    return branchesRepo.findByEstablishment(establishmentId);
  }

  async getById(id) {
    const branch = await branchesRepo.findById(id);
    if (!branch) {
      const err = new Error('Filial não encontrada.');
      err.statusCode = 404;
      throw err;
    }
    return branch;
  }

  async create(establishmentId, payload) {
    return branchesRepo.create({ ...payload, establishment_id: establishmentId });
  }

  async update(id, establishmentId, payload) {
    const branch = await this.getById(id);
    if (branch.establishment_id !== establishmentId) {
      const err = new Error('Acesso negado.');
      err.statusCode = 403;
      throw err;
    }
    return branchesRepo.update(id, payload);
  }

  async delete(id, establishmentId) {
    const branch = await this.getById(id);
    if (branch.establishment_id !== establishmentId) {
      const err = new Error('Acesso negado.');
      err.statusCode = 403;
      throw err;
    }
    return branchesRepo.delete(id);
  }
}

module.exports = new BranchesService();
