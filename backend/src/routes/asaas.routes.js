const { Router } = require('express');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');
const ctrl = require('../controllers/asaas.controller');

const router = Router();

router.use(authMiddleware, roleMiddleware('establishment_admin'));

router.get('/', ctrl.getSubaccount.bind(ctrl));
router.post('/', ctrl.createSubaccount.bind(ctrl));
router.post('/sync', ctrl.syncSubaccount.bind(ctrl));
router.patch('/billing-mode', ctrl.updateBillingMode.bind(ctrl));

module.exports = router;
