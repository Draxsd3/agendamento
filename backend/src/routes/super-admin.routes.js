const { Router } = require('express');
const { body } = require('express-validator');
const superAdminController = require('../controllers/super-admin.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');
const validate = require('../middlewares/validate.middleware');

const router = Router();

router.use(authMiddleware, roleMiddleware('super_admin'));

router.get('/dashboard', superAdminController.getDashboard);

router.get('/establishments', superAdminController.getAllEstablishments);
router.get('/establishments/:id', superAdminController.getEstablishmentById);
router.get('/establishments/:id/admins', superAdminController.getEstablishmentAdmins);

router.post(
  '/establishments',
  [
    body('name').trim().notEmpty().withMessage('Nome \u00e9 obrigat\u00f3rio.'),
    body('slug')
      .trim()
      .notEmpty()
      .matches(/^[a-z0-9]+(-[a-z0-9]+)*$/)
      .withMessage('Slug deve conter apenas letras min\u00fasculas, n\u00fameros e h\u00edfens.'),
  ],
  validate,
  superAdminController.createEstablishment
);

router.put(
  '/establishments/:id',
  [
    body('name').optional().trim().notEmpty().withMessage('Nome \u00e9 obrigat\u00f3rio.'),
    body('slug')
      .optional()
      .trim()
      .notEmpty()
      .matches(/^[a-z0-9]+(-[a-z0-9]+)*$/)
      .withMessage('Slug deve conter apenas letras min\u00fasculas, n\u00fameros e h\u00edfens.'),
  ],
  validate,
  superAdminController.updateEstablishment
);

router.patch(
  '/establishments/:id/status',
  [body('status').isIn(['active', 'inactive', 'suspended']).withMessage('Status inv\u00e1lido.')],
  validate,
  superAdminController.setEstablishmentStatus
);

router.get('/users', superAdminController.getAllUsers);

router.post(
  '/users/admin',
  [
    body('name').trim().notEmpty().withMessage('Nome \u00e9 obrigat\u00f3rio.'),
    body('email').isEmail().normalizeEmail().withMessage('Email inv\u00e1lido.'),
    body('password').isLength({ min: 6 }).withMessage('Senha deve ter pelo menos 6 caracteres.'),
    body('establishmentId').isUUID().withMessage('establishmentId inv\u00e1lido.'),
  ],
  validate,
  superAdminController.createAdminUser
);

router.patch('/users/:userId/toggle-status', superAdminController.toggleUserStatus);

module.exports = router;
