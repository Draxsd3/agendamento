const professionalsService = require('../services/professionals.service');

class ProfessionalsController {
  async getAll(req, res, next) {
    try {
      const result = await professionalsService.getByEstablishment(req.establishmentId);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async getById(req, res, next) {
    try {
      const result = await professionalsService.getById(req.params.id, req.establishmentId);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async create(req, res, next) {
    try {
      const result = await professionalsService.create({
        ...req.body,
        establishment_id: req.establishmentId,
      });
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }

  async update(req, res, next) {
    try {
      const result = await professionalsService.update(req.params.id, req.establishmentId, req.body);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async delete(req, res, next) {
    try {
      await professionalsService.delete(req.params.id, req.establishmentId);
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  }

  async addService(req, res, next) {
    try {
      const result = await professionalsService.addService(
        req.params.id,
        req.body.service_id,
        req.establishmentId
      );
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }

  async uploadAvatar(req, res, next) {
    try {
      const result = await professionalsService.uploadAvatar(
        req.params.id, req.establishmentId, req.body
      );
      res.json(result);
    } catch (err) { next(err); }
  }

  async removeService(req, res, next) {
    try {
      await professionalsService.removeService(req.params.id, req.params.serviceId, req.establishmentId);
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ProfessionalsController();
