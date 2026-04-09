const establishmentsService = require('../services/establishments.service');
const professionalsService = require('../services/professionals.service');
const servicesService = require('../services/services.service');
const businessHoursService = require('../services/business-hours.service');
const appointmentsService = require('../services/appointments.service');
const branchesRepo = require('../repositories/branches.repository');

class PublicController {
  async getEstablishmentBySlug(req, res, next) {
    try {
      const establishment = await establishmentsService.getBySlug(req.params.slug);
      res.json(establishment);
    } catch (err) {
      next(err);
    }
  }

  async getPublicServices(req, res, next) {
    try {
      const services = await servicesService.getByEstablishment(req.params.establishmentId, true);
      res.json(services);
    } catch (err) {
      next(err);
    }
  }

  async getPublicProfessionals(req, res, next) {
    try {
      const professionals = await professionalsService.getByEstablishment(
        req.params.establishmentId,
        true
      );
      res.json(professionals);
    } catch (err) {
      next(err);
    }
  }

  async getPublicBusinessHours(req, res, next) {
    try {
      const hours = await businessHoursService.getByEstablishment(req.params.establishmentId);
      res.json(hours);
    } catch (err) {
      next(err);
    }
  }

  async getPublicBranches(req, res, next) {
    try {
      const branches = await branchesRepo.findByEstablishment(req.params.establishmentId);
      res.json(branches.filter((b) => b.is_active));
    } catch (err) { next(err); }
  }

  async getAvailableSlots(req, res, next) {
    try {
      const { professionalId, serviceId, date } = req.query;
      const slots = await appointmentsService.getAvailableSlots(
        req.params.establishmentId,
        professionalId,
        serviceId,
        date
      );
      res.json(slots);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new PublicController();
