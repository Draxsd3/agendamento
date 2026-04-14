const financialService = require('../services/financial.service');

class FinancialController {
  async getSummary(req, res, next) {
    try {
      const result = await financialService.getSummary(req.user.establishmentId, req.query);
      res.json(result);
    } catch (err) { next(err); }
  }

  async getRevenueByDay(req, res, next) {
    try {
      const result = await financialService.getRevenueByDay(req.user.establishmentId, req.query);
      res.json(result);
    } catch (err) { next(err); }
  }

  async getRevenueByBranch(req, res, next) {
    try {
      const result = await financialService.getRevenueByBranch(req.user.establishmentId, req.query);
      res.json(result);
    } catch (err) { next(err); }
  }

  async getRevenueByProfessional(req, res, next) {
    try {
      const result = await financialService.getRevenueByProfessional(req.user.establishmentId, req.query);
      res.json(result);
    } catch (err) { next(err); }
  }

  async getRevenueByService(req, res, next) {
    try {
      const result = await financialService.getRevenueByService(req.user.establishmentId, req.query);
      res.json(result);
    } catch (err) { next(err); }
  }

  async getTransactions(req, res, next) {
    try {
      const result = await financialService.getTransactions(req.user.establishmentId, req.query);
      res.json(result);
    } catch (err) { next(err); }
  }

  async updatePaymentMethod(req, res, next) {
    try {
      const result = await financialService.updatePaymentMethod(
        req.params.id,
        req.user.establishmentId,
        req.body.payment_method,
      );
      res.json(result);
    } catch (err) { next(err); }
  }

  async getAsaasSubaccount(req, res, next) {
    try {
      const result = await financialService.getAsaasSubaccount(req.user.establishmentId, {
        sync: req.query.sync === 'true',
      });
      res.json(result);
    } catch (err) { next(err); }
  }

  async syncAsaasSubaccount(req, res, next) {
    try {
      const result = await financialService.syncAsaasSubaccount(req.user.establishmentId);
      res.json(result);
    } catch (err) { next(err); }
  }
}

module.exports = new FinancialController();
