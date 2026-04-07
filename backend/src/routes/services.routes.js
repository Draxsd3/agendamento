const { Router } = require('express');
const { body } = require('express-validator');
const servicesController = require('../controllers/services.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');
const tenantMiddleware = require('../middlewares/tenant.middleware');
const validate = require('../middlewares/validate.middleware');

const router = Router({ mergeParams: true });

router.use(authMiddleware, roleMiddleware('super_admin', 'establishment_admin'), tenantMiddleware);

router.get('/', servicesController.getAll);
router.get('/:id', servicesController.getById);

router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Nome é obrigatório.'),
    body('duration_minutes').isInt({ min: 1 }).withMessage('Duração deve ser um número positivo.'),
    body('price').isFloat({ min: 0 }).withMessage('Preço deve ser um número não negativo.'),
  ],
  validate,
  servicesController.create
);

router.put('/:id', servicesController.update);
router.delete('/:id', servicesController.delete);

module.exports = router;
