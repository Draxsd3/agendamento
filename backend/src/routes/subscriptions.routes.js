const { Router } = require('express');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');
const ctrl = require('../controllers/subscriptions.controller');

const router = Router();

// Public: get plans by establishment ID or slug (no auth required)
router.post('/webhooks/asaas', ctrl.asaasWebhook.bind(ctrl));
router.get('/public/:establishmentId', ctrl.getPublicPlans.bind(ctrl));
router.get('/public/slug/:slug', ctrl.getPublicPlansBySlug.bind(ctrl));

// Customer-only routes
router.get('/mine', authMiddleware, roleMiddleware('customer'), ctrl.getMine.bind(ctrl));
router.post('/', authMiddleware, roleMiddleware('customer'), ctrl.subscribe.bind(ctrl));
router.patch('/:id/cancel', authMiddleware, roleMiddleware('customer'), ctrl.cancel.bind(ctrl));

// Admin-only routes
router.get('/admin', authMiddleware, roleMiddleware('establishment_admin'), ctrl.getByEstablishment.bind(ctrl));
router.patch('/admin/:id/activate', authMiddleware, roleMiddleware('establishment_admin'), ctrl.adminActivate.bind(ctrl));
router.patch('/admin/:id/cancel', authMiddleware, roleMiddleware('establishment_admin'), ctrl.adminCancel.bind(ctrl));
router.post('/admin/:id/checkout', authMiddleware, roleMiddleware('establishment_admin'), ctrl.adminGenerateCheckout.bind(ctrl));

module.exports = router;
