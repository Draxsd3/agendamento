const { Router } = require('express');
const customersController = require('../controllers/customers.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');
const tenantMiddleware = require('../middlewares/tenant.middleware');

const router = Router({ mergeParams: true });

// Customer profile
router.get('/profile', authMiddleware, roleMiddleware('customer'), customersController.getProfile);
router.put('/profile', authMiddleware, roleMiddleware('customer'), customersController.updateProfile);

// Admin: list establishment customers
router.get(
  '/establishment/:establishmentId',
  authMiddleware,
  roleMiddleware('super_admin', 'establishment_admin'),
  tenantMiddleware,
  customersController.getByEstablishment
);

module.exports = router;
