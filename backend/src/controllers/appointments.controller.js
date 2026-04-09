const appointmentsService = require('../services/appointments.service');

class AppointmentsController {
  async getByEstablishment(req, res, next) {
    try {
      const result = await appointmentsService.getByEstablishment(req.establishmentId, req.query);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async getMyAppointments(req, res, next) {
    try {
      const result = await appointmentsService.getByCustomer(req.user.userId);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async book(req, res, next) {
    try {
      const result = await appointmentsService.book({
        ...req.body,
        userId: req.user.userId,
      });
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }

  async reschedule(req, res, next) {
    try {
      const result = await appointmentsService.reschedule(
        req.params.id,
        req.user.userId,
        req.body
      );
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async cancel(req, res, next) {
    try {
      const result = await appointmentsService.cancel(
        req.params.id,
        req.user.userId,
        req.user.role
      );
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async updateStatus(req, res, next) {
    try {
      const result = await appointmentsService.updateStatus(
        req.params.id,
        req.body.status,
        req.establishmentId
      );
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async getAvailableSlots(req, res, next) {
    try {
      const { professionalId, serviceId, date } = req.query;
      const result = await appointmentsService.getAvailableSlots(
        req.params.establishmentId,
        professionalId,
        serviceId,
        date
      );
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AppointmentsController();
