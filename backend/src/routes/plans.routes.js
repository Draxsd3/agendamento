const { Router } = require('express');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');
const ctrl = require('../controllers/plans.controller');

const router = Router();

// Admin-only plan management
router.use(authMiddleware, roleMiddleware('establishment_admin'));

router.get('/', ctrl.getAll.bind(ctrl));
router.get('/subscribers', ctrl.getSubscribers.bind(ctrl));
router.get('/:id/services', ctrl.getPlanServices.bind(ctrl));
router.post('/:id/services', ctrl.addPlanService.bind(ctrl));
router.delete('/:id/services/:serviceId', ctrl.removePlanService.bind(ctrl));
router.get('/:id', ctrl.getById.bind(ctrl));
router.post('/', ctrl.create.bind(ctrl));
router.put('/:id', ctrl.update.bind(ctrl));
router.delete('/:id', ctrl.delete.bind(ctrl));

module.exports = router;
