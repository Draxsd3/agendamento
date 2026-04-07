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
    body('name').trim().notEmpty().withMessage('Nome é obrigatório.'),
    body('slug')
      .trim()
      .notEmpty()
      .matches(/^[a-z0-9]+(-[a-z0-9]+)*$/)
      .withMessage('Slug deve conter apenas letras minúsculas, números e hífens.'),
  ],
  validate,
  superAdminController.createEstablishment
);

router.patch(
  '/establishments/:id/status',
  [body('status').isIn(['active', 'inactive', 'suspended']).withMessage('Status inválido.')],
  validate,
  superAdminController.setEstablishmentStatus
);

router.get('/users', superAdminController.getAllUsers);

router.post(
  '/users/admin',
  [
    body('name').trim().notEmpty().withMessage('Nome é obrigatório.'),
    body('email').isEmail().normalizeEmail().withMessage('Email inválido.'),
    body('password').isLength({ min: 6 }).withMessage('Senha deve ter pelo menos 6 caracteres.'),
    body('establishmentId').isUUID().withMessage('establishmentId inválido.'),
  ],
  validate,
  superAdminController.createAdminUser
);

router.patch('/users/:userId/toggle-status', superAdminController.toggleUserStatus);

module.exports = router;
