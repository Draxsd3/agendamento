const { Router } = require('express');

const authRoutes          = require('./auth.routes');
const publicRoutes        = require('./public.routes');
const establishmentsRoutes = require('./establishments.routes');
const professionalsRoutes = require('./professionals.routes');
const servicesRoutes      = require('./services.routes');
const appointmentsRoutes  = require('./appointments.routes');
const businessHoursRoutes = require('./business-hours.routes');
const customersRoutes     = require('./customers.routes');
const superAdminRoutes    = require('./super-admin.routes');
const branchesRoutes      = require('./branches.routes');
const plansRoutes         = require('./plans.routes');
const subscriptionsRoutes = require('./subscriptions.routes');
const financialRoutes     = require('./financial.routes');
const asaasRoutes         = require('./asaas.routes');

const router = Router();

router.use('/auth',          authRoutes);
router.use('/public',        publicRoutes);
router.use('/establishments', establishmentsRoutes);
router.use('/professionals', professionalsRoutes);
router.use('/services',      servicesRoutes);
router.use('/appointments',  appointmentsRoutes);
router.use('/business-hours', businessHoursRoutes);
router.use('/customers',     customersRoutes);
router.use('/super-admin',   superAdminRoutes);
router.use('/branches',      branchesRoutes);
router.use('/plans',         plansRoutes);
router.use('/subscriptions', subscriptionsRoutes);
router.use('/financial',    financialRoutes);
router.use('/asaas',        asaasRoutes);

module.exports = router;
