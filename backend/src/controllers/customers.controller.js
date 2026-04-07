const customersRepo = require('../repositories/customers.repository');

class CustomersController {
  async getByEstablishment(req, res, next) {
    try {
      const result = await customersRepo.findByEstablishment(req.establishmentId, req.query);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async getProfile(req, res, next) {
    try {
      const result = await customersRepo.findByUserId(req.user.userId);
      if (!result) return res.status(404).json({ error: 'Perfil não encontrado.' });
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const customer = await customersRepo.findByUserId(req.user.userId);
      if (!customer) return res.status(404).json({ error: 'Perfil não encontrado.' });

      const { data, error } = await require('../config/supabase')
        .from('customers')
        .update(req.body)
        .eq('id', customer.id)
        .select()
        .single();

      if (error) throw error;
      res.json(data);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new CustomersController();
