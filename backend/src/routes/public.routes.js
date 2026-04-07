const { Router } = require('express');
const publicController = require('../controllers/public.controller');

const router = Router();

// Public booking page routes (no auth required)
router.get('/establishments/:slug', publicController.getEstablishmentBySlug);
router.get('/establishments/:establishmentId/services', publicController.getPublicServices);
router.get('/establishments/:establishmentId/professionals', publicController.getPublicProfessionals);
router.get('/establishments/:establishmentId/business-hours', publicController.getPublicBusinessHours);
router.get('/establishments/:establishmentId/slots', publicController.getAvailableSlots);

module.exports = router;
