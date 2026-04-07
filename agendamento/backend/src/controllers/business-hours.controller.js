const businessHoursService = require('../services/business-hours.service');

class BusinessHoursController {
  async getAll(req, res, next) {
    try {
      const result = await businessHoursService.getByEstablishment(req.establishmentId);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async bulkUpsert(req, res, next) {
    try {
      const result = await businessHoursService.bulkUpsert(req.establishmentId, req.body.hours);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new BusinessHoursController();
