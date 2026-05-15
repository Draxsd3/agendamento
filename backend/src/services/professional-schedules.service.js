const professionalSchedulesRepo = require('../repositories/professional-schedules.repository');
const professionalsRepo = require('../repositories/professionals.repository');

const WEEKDAYS = new Set([
  'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday',
]);

const isValidTime = (value) => typeof value === 'string' && /^\d{2}:\d{2}(:\d{2})?$/.test(value);

class ProfessionalSchedulesService {
  async ensureProfessional(professionalId, establishmentId) {
    const professional = await professionalsRepo.findByIdAndEstablishment(
      professionalId,
      establishmentId
    );
    if (!professional) {
      const err = new Error('Profissional nao encontrado.');
      err.statusCode = 404;
      throw err;
    }
    return professional;
  }

  async getByProfessional(professionalId, establishmentId) {
    await this.ensureProfessional(professionalId, establishmentId);
    return professionalSchedulesRepo.findByProfessional(professionalId);
  }

  async replaceAll(professionalId, establishmentId, entries) {
    await this.ensureProfessional(professionalId, establishmentId);

    if (!Array.isArray(entries)) {
      const err = new Error('Lista de horarios invalida.');
      err.statusCode = 422;
      throw err;
    }

    const sanitized = entries
      .map((entry) => {
        if (!entry || !WEEKDAYS.has(entry.weekday)) return null;
        if (!isValidTime(entry.start_time) || !isValidTime(entry.end_time)) return null;
        if (entry.start_time >= entry.end_time) return null;
        return {
          weekday: entry.weekday,
          start_time: entry.start_time,
          end_time: entry.end_time,
          is_working: entry.is_working !== false,
        };
      })
      .filter(Boolean);

    if (sanitized.length === 0) return [];
    return professionalSchedulesRepo.upsertMany(professionalId, sanitized);
  }
}

module.exports = new ProfessionalSchedulesService();
