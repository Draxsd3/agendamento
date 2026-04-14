const { Router } = require('express');
const financialController = require('../controllers/financial.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');

const router = Router();

router.use(authMiddleware, roleMiddleware('establishment_admin'));

router.get('/summary',              financialController.getSummary);
router.get('/revenue-by-day',       financialController.getRevenueByDay);
router.get('/revenue-by-branch',    financialController.getRevenueByBranch);
router.get('/revenue-by-professional', financialController.getRevenueByProfessional);
router.get('/revenue-by-service',   financialController.getRevenueByService);
router.get('/transactions',         financialController.getTransactions);
router.patch('/transactions/:id/payment-method', financialController.updatePaymentMethod);
router.get('/asaas-subaccount', financialController.getAsaasSubaccount);
router.post('/asaas-subaccount/sync', financialController.syncAsaasSubaccount);

module.exports = router;
