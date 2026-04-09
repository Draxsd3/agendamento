const branchesService = require('../services/branches.service');

class BranchesController {
  async getAll(req, res, next) {
    try {
      const establishmentId = req.user.establishmentId;
      const data = await branchesService.getAll(establishmentId);
      res.json(data);
    } catch (err) {
      next(err);
    }
  }

  async getById(req, res, next) {
    try {
      const data = await branchesService.getById(req.params.id);
      res.json(data);
    } catch (err) {
      next(err);
    }
  }

  async create(req, res, next) {
    try {
      const establishmentId = req.user.establishmentId;
      const data = await branchesService.create(establishmentId, req.body);
      res.status(201).json(data);
    } catch (err) {
      next(err);
    }
  }

  async update(req, res, next) {
    try {
      const establishmentId = req.user.establishmentId;
      const data = await branchesService.update(req.params.id, establishmentId, req.body);
      res.json(data);
    } catch (err) {
      next(err);
    }
  }

  async delete(req, res, next) {
    try {
      const establishmentId = req.user.establishmentId;
      await branchesService.delete(req.params.id, establishmentId);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new BranchesController();
