const { Router } = require('express');
const { body } = require('express-validator');
const establishmentsController = require('../controllers/establishments.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');
const validate = require('../middlewares/validate.middleware');

const router = Router();

router.use(authMiddleware, roleMiddleware('establishment_admin'));

router.get('/me', establishmentsController.getMine);
router.post('/me/logo', establishmentsController.uploadLogo);
router.post('/me/cover', establishmentsController.uploadCover);
router.put('/me/portfolio', establishmentsController.updatePortfolio);
router.post('/me/gallery', establishmentsController.uploadGalleryImage);

router.put(
  '/me',
  [
    body('logo_url')
      .optional({ values: 'falsy' })
      .trim()
      .isURL({ protocols: ['http', 'https'], require_protocol: true })
      .withMessage('Informe uma URL válida para a logo.'),
    body('primary_color')
      .optional({ values: 'falsy' })
      .trim()
      .matches(/^#([0-9A-Fa-f]{6})$/)
      .withMessage('Cor principal inválida. Use o formato #RRGGBB.'),
    body('accent_color')
      .optional({ values: 'falsy' })
      .trim()
      .matches(/^#([0-9A-Fa-f]{6})$/)
      .withMessage('Cor de destaque inválida. Use o formato #RRGGBB.'),
    body('booking_heading')
      .optional({ values: 'falsy' })
      .trim()
      .isLength({ max: 80 })
      .withMessage('O título da página deve ter no máximo 80 caracteres.'),
    body('booking_subheading')
      .optional({ values: 'falsy' })
      .trim()
      .isLength({ max: 220 })
      .withMessage('O texto de apoio deve ter no máximo 220 caracteres.'),
  ],
  validate,
  establishmentsController.updateMine
);

module.exports = router;
