const appointmentsRepo = require('../repositories/appointments.repository');
const servicesRepo = require('../repositories/services.repository');
const businessHoursRepo = require('../repositories/business-hours.repository');
const customersRepo = require('../repositories/customers.repository');

const WEEKDAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

class AppointmentsService {
  async getByEstablishment(establishmentId, filters) {
    return appointmentsRepo.findByEstablishment(establishmentId, filters);
  }

  async getByCustomer(userId) {
    const customer = await customersRepo.findByUserId(userId);
    if (!customer) {
      const err = new Error('Perfil de cliente não encontrado.');
      err.statusCode = 404;
      throw err;
    }
    return appointmentsRepo.findByCustomer(customer.id);
  }

  async book({ establishmentId, userId, professionalId, serviceId, startTime }) {
    // Resolve customer
    const customer = await customersRepo.findByUserId(userId);
    if (!customer) {
      const err = new Error('Perfil de cliente não encontrado.');
      err.statusCode = 404;
      throw err;
    }

    // Get service for duration
    const service = await servicesRepo.findByIdAndEstablishment(serviceId, establishmentId);
    if (!service || !service.is_active) {
      const err = new Error('Serviço não encontrado ou inativo.');
      err.statusCode = 404;
      throw err;
    }

    const start = new Date(startTime);
    const end = new Date(start.getTime() + service.duration_minutes * 60 * 1000);

    // Validate business hours
    await this._validateBusinessHours(establishmentId, start, end);

    // Check conflicts
    const hasConflict = await appointmentsRepo.checkConflict(professionalId, start.toISOString(), end.toISOString());
    if (hasConflict) {
      const err = new Error('Horário indisponível. O profissional já possui um agendamento nesse período.');
      err.statusCode = 409;
      throw err;
    }

    return appointmentsRepo.create({
      establishment_id: establishmentId,
      customer_id: customer.id,
      professional_id: professionalId,
      service_id: serviceId,
      start_time: start.toISOString(),
      end_time: end.toISOString(),
      status: 'pending',
    });
  }

  async cancel(appointmentId, userId, role) {
    const appointment = await appointmentsRepo.findById(appointmentId);
    if (!appointment) {
      const err = new Error('Agendamento não encontrado.');
      err.statusCode = 404;
      throw err;
    }

    if (role === 'customer') {
      const customer = await customersRepo.findByUserId(userId);
      if (appointment.customer_id !== customer?.id) {
        const err = new Error('Acesso negado.');
        err.statusCode = 403;
        throw err;
      }
    }

    if (['completed', 'cancelled'].includes(appointment.status)) {
      const err = new Error(`Não é possível cancelar um agendamento com status "${appointment.status}".`);
      err.statusCode = 400;
      throw err;
    }

    return appointmentsRepo.update(appointmentId, { status: 'cancelled' });
  }

  async updateStatus(appointmentId, status, establishmentId) {
    const appointment = await appointmentsRepo.findById(appointmentId);
    if (!appointment || appointment.establishment_id !== establishmentId) {
      const err = new Error('Agendamento não encontrado.');
      err.statusCode = 404;
      throw err;
    }

    return appointmentsRepo.update(appointmentId, { status });
  }

  async getAvailableSlots(establishmentId, professionalId, serviceId, date) {
    const service = await servicesRepo.findByIdAndEstablishment(serviceId, establishmentId);
    if (!service) {
      const err = new Error('Serviço não encontrado.');
      err.statusCode = 404;
      throw err;
    }

    const targetDate = new Date(date);
    const weekday = WEEKDAYS[targetDate.getDay()];

    const businessHours = await businessHoursRepo.findByEstablishment(establishmentId);
    const dayHours = businessHours.find((bh) => bh.weekday === weekday);

    if (!dayHours || !dayHours.is_open) {
      return [];
    }

    const [startH, startM] = dayHours.start_time.split(':').map(Number);
    const [endH, endM] = dayHours.end_time.split(':').map(Number);

    const dayStart = new Date(targetDate);
    dayStart.setHours(startH, startM, 0, 0);

    const dayEnd = new Date(targetDate);
    dayEnd.setHours(endH, endM, 0, 0);

    const existingAppointments = await appointmentsRepo.findByProfessionalAndDate(professionalId, date);

    const slots = [];
    let current = new Date(dayStart);
    const slotDuration = service.duration_minutes * 60 * 1000;

    while (current.getTime() + slotDuration <= dayEnd.getTime()) {
      const slotEnd = new Date(current.getTime() + slotDuration);

      // Check if slot is in the past
      if (current <= new Date()) {
        current = new Date(current.getTime() + 30 * 60 * 1000);
        continue;
      }

      const isOccupied = existingAppointments.some((appt) => {
        const apptStart = new Date(appt.start_time);
        const apptEnd = new Date(appt.end_time);
        return current < apptEnd && slotEnd > apptStart;
      });

      slots.push({
        start: current.toISOString(),
        end: slotEnd.toISOString(),
        available: !isOccupied,
      });

      current = new Date(current.getTime() + 30 * 60 * 1000);
    }

    return slots;
  }

  async _validateBusinessHours(establishmentId, start, end) {
    const weekday = WEEKDAYS[start.getDay()];
    const businessHours = await businessHoursRepo.findByEstablishment(establishmentId);
    const dayHours = businessHours.find((bh) => bh.weekday === weekday);

    if (!dayHours || !dayHours.is_open) {
      const err = new Error('O estabelecimento não funciona neste dia.');
      err.statusCode = 400;
      throw err;
    }

    const [startH, startM] = dayHours.start_time.split(':').map(Number);
    const [endH, endM] = dayHours.end_time.split(':').map(Number);

    const openTime = new Date(start);
    openTime.setHours(startH, startM, 0, 0);
    const closeTime = new Date(start);
    closeTime.setHours(endH, endM, 0, 0);

    if (start < openTime || end > closeTime) {
      const err = new Error('O horário escolhido está fora do horário de funcionamento.');
      err.statusCode = 400;
      throw err;
    }
  }
}

module.exports = new AppointmentsService();
