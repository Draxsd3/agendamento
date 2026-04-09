const appointmentsRepo = require('../repositories/appointments.repository');
const servicesRepo = require('../repositories/services.repository');
const businessHoursRepo = require('../repositories/business-hours.repository');
const customersRepo = require('../repositories/customers.repository');
const supabase = require('../config/supabase');

const WEEKDAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

class AppointmentsService {
  async _resolvePlanAdjustedPrice({ customerId, establishmentId, serviceId, basePrice }) {
    let totalPrice = Number(basePrice);

    const { data: activeSubs } = await supabase
      .from('subscriptions')
      .select('plan_id, plans(discount_percent, plan_services(service_id, price_override))')
      .eq('customer_id', customerId)
      .eq('establishment_id', establishmentId)
      .eq('status', 'active')
      .limit(1);

    if (activeSubs && activeSubs.length > 0) {
      const plan = activeSubs[0].plans;
      const planSvc = (plan?.plan_services || []).find((ps) => ps.service_id === serviceId);
      if (planSvc) {
        totalPrice = planSvc.price_override !== null ? Number(planSvc.price_override) : 0;
      } else if (plan?.discount_percent > 0) {
        totalPrice = totalPrice * (1 - plan.discount_percent / 100);
      }
    }

    return totalPrice;
  }

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

  async book({ establishmentId, userId, professionalId, serviceId, startTime, branchId }) {
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

    const totalPrice = await this._resolvePlanAdjustedPrice({
      customerId: customer.id,
      establishmentId,
      serviceId,
      basePrice: service.price,
    });

    return appointmentsRepo.create({
      establishment_id: establishmentId,
      customer_id: customer.id,
      professional_id: professionalId,
      service_id: serviceId,
      branch_id: branchId || null,
      start_time: start.toISOString(),
      end_time: end.toISOString(),
      status: 'pending',
      total_price: totalPrice,
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

  async reschedule(appointmentId, userId, { professionalId, serviceId, startTime }) {
    const appointment = await appointmentsRepo.findById(appointmentId);
    if (!appointment) {
      const err = new Error('Agendamento não encontrado.');
      err.statusCode = 404;
      throw err;
    }

    const customer = await customersRepo.findByUserId(userId);
    if (appointment.customer_id !== customer?.id) {
      const err = new Error('Acesso negado.');
      err.statusCode = 403;
      throw err;
    }

    if (['completed', 'cancelled'].includes(appointment.status)) {
      const err = new Error(`Não é possível editar um agendamento com status "${appointment.status}".`);
      err.statusCode = 400;
      throw err;
    }

    const service = await servicesRepo.findByIdAndEstablishment(serviceId, appointment.establishment_id);
    if (!service || !service.is_active) {
      const err = new Error('Serviço não encontrado ou inativo.');
      err.statusCode = 404;
      throw err;
    }

    const start = new Date(startTime);
    const end = new Date(start.getTime() + service.duration_minutes * 60 * 1000);

    await this._validateBusinessHours(appointment.establishment_id, start, end);

    const hasConflict = await appointmentsRepo.checkConflict(
      professionalId,
      start.toISOString(),
      end.toISOString(),
      appointmentId
    );
    if (hasConflict) {
      const err = new Error('Horário indisponível. O profissional já possui um agendamento nesse período.');
      err.statusCode = 409;
      throw err;
    }

    const totalPrice = await this._resolvePlanAdjustedPrice({
      customerId: customer.id,
      establishmentId: appointment.establishment_id,
      serviceId,
      basePrice: service.price,
    });

    return appointmentsRepo.update(appointmentId, {
      professional_id: professionalId,
      service_id: serviceId,
      start_time: start.toISOString(),
      end_time: end.toISOString(),
      total_price: totalPrice,
    });
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

    // Parse date as local time to avoid UTC offset shifting the day
    const [yr, mo, dy] = date.split('-').map(Number);
    const targetDate = new Date(yr, mo - 1, dy);
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
    // Use local date parts to determine weekday and compare times correctly
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

    const openTime = new Date(start.getFullYear(), start.getMonth(), start.getDate(), startH, startM, 0, 0);
    const closeTime = new Date(start.getFullYear(), start.getMonth(), start.getDate(), endH, endM, 0, 0);

    if (start < openTime || end > closeTime) {
      const err = new Error('O horário escolhido está fora do horário de funcionamento.');
      err.statusCode = 400;
      throw err;
    }
  }
}

module.exports = new AppointmentsService();
