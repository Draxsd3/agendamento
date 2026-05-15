const BaseRepository = require('./base.repository');

const isMissingTable = (error) => {
  if (!error) return false;
  const message = error.message || '';
  return error.code === '42P01'
    || error.code === 'PGRST205'
    || (/professional_schedules/i.test(message)
      && /schema cache|does not exist|could not find/i.test(message));
};

class ProfessionalSchedulesRepository extends BaseRepository {
  constructor() {
    super('professional_schedules');
  }

  async findByProfessional(professionalId) {
    const { data, error } = await this.db
      .from('professional_schedules')
      .select('*')
      .eq('professional_id', professionalId)
      .order('weekday');

    if (error) {
      if (isMissingTable(error)) return [];
      throw error;
    }
    return data || [];
  }

  async findByProfessionals(professionalIds) {
    if (!professionalIds || professionalIds.length === 0) return [];

    const { data, error } = await this.db
      .from('professional_schedules')
      .select('*')
      .in('professional_id', professionalIds);

    if (error) {
      if (isMissingTable(error)) return [];
      throw error;
    }
    return data || [];
  }

  async upsertMany(professionalId, entries) {
    if (!entries || entries.length === 0) return [];

    const payload = entries.map((entry) => ({
      professional_id: professionalId,
      weekday: entry.weekday,
      start_time: entry.start_time,
      end_time: entry.end_time,
      is_working: entry.is_working,
    }));

    const { data, error } = await this.db
      .from('professional_schedules')
      .upsert(payload, { onConflict: 'professional_id,weekday' })
      .select();

    if (error) {
      if (isMissingTable(error)) {
        const err = new Error('Execute database/professional_schedules.sql no Supabase antes de configurar horarios por profissional.');
        err.statusCode = 500;
        throw err;
      }
      throw error;
    }
    return data || [];
  }

  isMissingTableError(error) {
    return isMissingTable(error);
  }
}

module.exports = new ProfessionalSchedulesRepository();
