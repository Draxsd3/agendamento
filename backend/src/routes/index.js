const { Router } = require('express');

const authRoutes = require('./auth.routes');
const publicRoutes = require('./public.routes');
const professionalsRoutes = require('./professionals.routes');
const servicesRoutes = require('./services.routes');
const appointmentsRoutes = require('./appointments.routes');
const businessHoursRoutes = require('./business-hours.routes');
const customersRoutes = require('./customers.routes');
const superAdminRoutes = require('./super-admin.routes');

const router = Router();

router.use('/auth', authRoutes);
router.use('/public', publicRoutes);
router.use('/professionals', professionalsRoutes);
router.use('/services', servicesRoutes);
router.use('/appointments', appointmentsRoutes);
router.use('/business-hours', businessHoursRoutes);
router.use('/customers', customersRoutes);
router.use('/super-admin', superAdminRoutes);

module.exports = router;
