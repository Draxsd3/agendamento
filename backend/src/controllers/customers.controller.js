const customersRepo = require('../repositories/customers.repository');
const supabase = require('../config/supabase');

const normalizeOptionalValue = (field, value) => {
  if (value === undefined) return undefined;

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return null;
    return trimmed;
  }

  if (field === 'date_of_birth' && value === '') {
    return null;
  }

  return value;
};

class CustomersController {
  async getMyEstablishments(req, res, next) {
    try {
      const customer = await customersRepo.findByUserId(req.user.userId);
      if (!customer) return res.status(404).json({ error: 'Perfil não encontrado.' });
      const data = await customersRepo.findMyEstablishmentsWithPlans(customer.id);
      res.json(data);
    } catch (err) {
      next(err);
    }
  }

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

      // Fields that go to the users table
      const userFields = {};
      const normalizedName = normalizeOptionalValue('name', req.body.name);
      const normalizedEmail = normalizeOptionalValue('email', req.body.email);
      if (normalizedName) userFields.name = normalizedName;
      if (normalizedEmail) userFields.email = normalizedEmail;

      // Fields that go to the customers table
      const customerFields = {};
      const customerAllowed = ['phone', 'date_of_birth', 'cpf', 'gender', 'notes', 'address', 'avatar_url', 'city', 'province'];
      customerAllowed.forEach((f) => {
        const normalized = normalizeOptionalValue(f, req.body[f]);
        if (normalized !== undefined) customerFields[f] = normalized;
      });

      // Update users table if needed
      if (Object.keys(userFields).length > 0) {
        const { error } = await supabase
          .from('users')
          .update(userFields)
          .eq('id', req.user.userId);
        if (error) throw error;
      }

      // Update customers table
      let updatedCustomer = customer;
      if (Object.keys(customerFields).length > 0) {
        const { data, error } = await supabase
          .from('customers')
          .update(customerFields)
          .eq('id', customer.id)
          .select('*, users(id, name, email, is_active)')
          .single();
        if (error) throw error;
        updatedCustomer = data;
      } else {
        // Re-fetch to include updated user fields
        updatedCustomer = await customersRepo.findByUserId(req.user.userId);
      }

      res.json(updatedCustomer);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new CustomersController();
