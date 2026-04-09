const { Router } = require('express');
const { body } = require('express-validator');
const appointmentsController = require('../controllers/appointments.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');
const tenantMiddleware = require('../middlewares/tenant.middleware');
const validate = require('../middlewares/validate.middleware');

const router = Router({ mergeParams: true });

// Admin: list appointments for establishment
router.get(
  '/establishment/:establishmentId',
  authMiddleware,
  roleMiddleware('super_admin', 'establishment_admin'),
  tenantMiddleware,
  appointmentsController.getByEstablishment
);

// Customer: my appointments
router.get('/my', authMiddleware, roleMiddleware('customer'), appointmentsController.getMyAppointments);

// Book appointment (customer only)
router.post(
  '/',
  authMiddleware,
  roleMiddleware('customer'),
  [
    body('establishmentId').isUUID().withMessage('establishmentId inválido.'),
    body('professionalId').isUUID().withMessage('professionalId inválido.'),
    body('serviceId').isUUID().withMessage('serviceId inválido.'),
    body('startTime').isISO8601().withMessage('startTime deve ser uma data ISO válida.'),
  ],
  validate,
  appointmentsController.book
);

// Reschedule (customer only)
router.patch(
  '/:id/reschedule',
  authMiddleware,
  roleMiddleware('customer'),
  [
    body('professionalId').isUUID().withMessage('professionalId inválido.'),
    body('serviceId').isUUID().withMessage('serviceId inválido.'),
    body('startTime').isISO8601().withMessage('startTime deve ser uma data ISO válida.'),
  ],
  validate,
  appointmentsController.reschedule
);

// Cancel (customer or admin)
router.patch(
  '/:id/cancel',
  authMiddleware,
  roleMiddleware('customer', 'establishment_admin', 'super_admin'),
  appointmentsController.cancel
);

// Update status (admin only)
router.patch(
  '/:id/status',
  authMiddleware,
  roleMiddleware('establishment_admin', 'super_admin'),
  tenantMiddleware,
  [body('status').isIn(['confirmed', 'completed', 'no_show', 'cancelled']).withMessage('Status inválido.')],
  validate,
  appointmentsController.updateStatus
);

module.exports = router;
