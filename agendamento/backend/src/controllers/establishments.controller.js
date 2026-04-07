const establishmentsService = require('../services/establishments.service');

class EstablishmentsController {
  async getAll(req, res, next) {
    try {
      const result = await establishmentsService.getAll(req.query);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async getById(req, res, next) {
    try {
      const result = await establishmentsService.getById(req.params.id);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async create(req, res, next) {
    try {
      const result = await establishmentsService.create(req.body);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }

  async update(req, res, next) {
    try {
      const result = await establishmentsService.update(req.params.id, req.body);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async delete(req, res, next) {
    try {
      await establishmentsService.delete(req.params.id);
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new EstablishmentsController();
