const servicesService = require('../services/services.service');

class ServicesController {
  async getAll(req, res, next) {
    try {
      const result = await servicesService.getByEstablishment(req.establishmentId);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async getById(req, res, next) {
    try {
      const result = await servicesService.getById(req.params.id, req.establishmentId);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async create(req, res, next) {
    try {
      const result = await servicesService.create({
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
      const result = await servicesService.update(req.params.id, req.establishmentId, req.body);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async delete(req, res, next) {
    try {
      await servicesService.delete(req.params.id, req.establishmentId);
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ServicesController();
