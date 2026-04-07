const { Router } = require('express');
const businessHoursController = require('../controllers/business-hours.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');
const tenantMiddleware = require('../middlewares/tenant.middleware');

const router = Router({ mergeParams: true });

router.use(authMiddleware, roleMiddleware('super_admin', 'establishment_admin'), tenantMiddleware);

router.get('/', businessHoursController.getAll);
router.put('/', businessHoursController.bulkUpsert);

module.exports = router;
