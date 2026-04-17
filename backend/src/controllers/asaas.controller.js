const asaasAccountService = require('../services/asaas-account.service');

class AsaasController {
  async getSubaccount(req, res, next) {
    try {
      const data = await asaasAccountService.getSubaccount(req.user.establishmentId, {
        sync: req.query.sync === 'true',
      });
      res.json(data);
    } catch (err) {
      next(err);
    }
  }

  async createSubaccount(req, res, next) {
    try {
      const data = await asaasAccountService.createSubaccount(req.user.establishmentId, req.body);
      res.status(201).json(data);
    } catch (err) {
      next(err);
    }
  }

  async syncSubaccount(req, res, next) {
    try {
      const updated = await asaasAccountService.syncSubaccount(req.user.establishmentId);
      res.json(asaasAccountService._serializeSubaccount(updated));
    } catch (err) {
      next(err);
    }
  }

  async updateBillingMode(req, res, next) {
    try {
      const data = await asaasAccountService.updateBillingSettings(req.user.establishmentId, req.body);
      res.json(data);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AsaasController();
