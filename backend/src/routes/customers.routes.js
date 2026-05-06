const { Router } = require('express');
const { body, param } = require('express-validator');
const customersController = require('../controllers/customers.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');
const tenantMiddleware = require('../middlewares/tenant.middleware');
const validate = require('../middlewares/validate.middleware');

const router = Router({ mergeParams: true });

// Customer profile
router.get('/profile', authMiddleware, roleMiddleware('customer'), customersController.getProfile);
router.put('/profile', authMiddleware, roleMiddleware('customer'), customersController.updateProfile);

// My establishments + plans (via appointment history)
router.get('/my-establishments', authMiddleware, roleMiddleware('customer'), customersController.getMyEstablishments);

// Admin: list establishment customers
router.get(
  '/establishment/:establishmentId',
  authMiddleware,
  roleMiddleware('super_admin', 'establishment_admin'),
  tenantMiddleware,
  customersController.getByEstablishment
);

// Admin: create/link a customer for this establishment
router.post(
  '/establishment/:establishmentId',
  authMiddleware,
  roleMiddleware('super_admin', 'establishment_admin'),
  tenantMiddleware,
  [
    param('establishmentId').isUUID().withMessage('establishmentId invalido.'),
    body('name').trim().notEmpty().withMessage('Nome e obrigatorio.'),
    body('email').isEmail().withMessage('E-mail invalido.'),
    body('password').optional({ checkFalsy: true }).isLength({ min: 6 }).withMessage('Senha deve ter ao menos 6 caracteres.'),
    body('date_of_birth').optional({ checkFalsy: true }).isISO8601().withMessage('Data de nascimento invalida.'),
  ],
  validate,
  customersController.createForEstablishment
);

// Admin: full customer detail for this establishment
router.get(
  '/establishment/:establishmentId/:customerId',
  authMiddleware,
  roleMiddleware('super_admin', 'establishment_admin'),
  tenantMiddleware,
  [
    param('establishmentId').isUUID().withMessage('establishmentId invalido.'),
    param('customerId').isUUID().withMessage('customerId invalido.'),
  ],
  validate,
  customersController.getDetail
);

module.exports = router;
