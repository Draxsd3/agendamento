const { Router } = require('express');
const { body } = require('express-validator');
const professionalsController = require('../controllers/professionals.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');
const tenantMiddleware = require('../middlewares/tenant.middleware');
const validate = require('../middlewares/validate.middleware');

const router = Router({ mergeParams: true });

router.use(authMiddleware, roleMiddleware('super_admin', 'establishment_admin'), tenantMiddleware);

router.get('/', professionalsController.getAll);
router.get('/:id', professionalsController.getById);

router.post(
  '/',
  [body('name').trim().notEmpty().withMessage('Nome é obrigatório.')],
  validate,
  professionalsController.create
);

router.put('/:id', professionalsController.update);
router.delete('/:id', professionalsController.delete);

router.post(
  '/:id/services',
  [body('service_id').isUUID().withMessage('service_id inválido.')],
  validate,
  professionalsController.addService
);

router.delete('/:id/services/:serviceId', professionalsController.removeService);
router.post('/:id/avatar', professionalsController.uploadAvatar);

module.exports = router;
