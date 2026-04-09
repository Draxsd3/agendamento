const BaseRepository = require('./base.repository');

class BranchesRepository extends BaseRepository {
  constructor() {
    super('branches');
  }

  async findByEstablishment(establishmentId) {
    const { data, error } = await this.db
      .from('branches')
      .select('*')
      .eq('establishment_id', establishmentId)
      .order('name');

    if (error) throw error;
    return data;
  }
}

module.exports = new BranchesRepository();
