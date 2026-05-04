const { Router } = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');

const router = Router();

router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Nome e obrigatorio.'),
    body('businessName').optional({ checkFalsy: true }).trim().isLength({ min: 2 }).withMessage('Nome do estabelecimento invalido.'),
    body('accountType').optional({ checkFalsy: true }).isIn(['customer', 'establishment_admin']).withMessage('Tipo de conta invalido.'),
    body('slug').optional({ checkFalsy: true }).trim().matches(/^[a-z0-9]+(-[a-z0-9]+)*$/).withMessage('Slug invalido.'),
    body('email').isEmail().normalizeEmail().withMessage('Email invalido.'),
    body('password').isLength({ min: 6 }).withMessage('Senha deve ter pelo menos 6 caracteres.'),
  ],
  validate,
  authController.register
);

router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('Email invalido.'),
    body('password').notEmpty().withMessage('Senha e obrigatoria.'),
    body('slug').optional({ checkFalsy: true }).trim().matches(/^[a-z0-9]+(-[a-z0-9]+)*$/).withMessage('Slug invalido.'),
  ],
  validate,
  authController.login
);

router.get('/me', authMiddleware, authController.me);

router.patch(
  '/change-password',
  authMiddleware,
  [
    body('currentPassword').notEmpty().withMessage('Senha atual e obrigatoria.'),
    body('newPassword').isLength({ min: 6 }).withMessage('Nova senha deve ter pelo menos 6 caracteres.'),
  ],
  validate,
  authController.changePassword
);

router.post(
  '/forgot-password',
  [
    body('email').isEmail().normalizeEmail().withMessage('Email invalido.'),
  ],
  validate,
  authController.forgotPassword
);

router.post(
  '/reset-password',
  [
    body('token').notEmpty().withMessage('Token e obrigatorio.'),
    body('newPassword').isLength({ min: 6 }).withMessage('Nova senha deve ter pelo menos 6 caracteres.'),
  ],
  validate,
  authController.resetPassword
);

module.exports = router;
