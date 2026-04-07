const businessHoursRepo = require('../repositories/business-hours.repository');

class BusinessHoursService {
  async getByEstablishment(establishmentId) {
    return businessHoursRepo.findByEstablishment(establishmentId);
  }

  async upsert(establishmentId, weekday, payload) {
    return businessHoursRepo.upsert(establishmentId, weekday, payload);
  }

  async bulkUpsert(establishmentId, entries) {
    const results = await Promise.all(
      entries.map(({ weekday, ...rest }) =>
        businessHoursRepo.upsert(establishmentId, weekday, rest)
      )
    );
    return results;
  }
}

module.exports = new BusinessHoursService();
