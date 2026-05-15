const crypto = require('crypto');
const customersRepo = require('../repositories/customers.repository');
const usersRepo = require('../repositories/users.repository');
const supabase = require('../config/supabase');
const { hashPassword } = require('../utils/password');

const CUSTOMER_FIELDS = [
  'phone',
  'date_of_birth',
  'cpf',
  'gender',
  'notes',
  'address',
  'avatar_url',
  'city',
  'province',
];

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

const normalizeRequiredText = (value) => String(value || '').trim();

const buildCustomerPayload = (body) => {
  const payload = {};

  CUSTOMER_FIELDS.forEach((field) => {
    const normalized = normalizeOptionalValue(field, body[field]);
    if (normalized !== undefined) payload[field] = normalized;
  });

  return payload;
};

const createTemporaryPassword = () => crypto.randomBytes(9).toString('base64url');

class CustomersController {
  async getMyEstablishments(req, res, next) {
    try {
      const customer = await customersRepo.findByUserId(req.user.userId);
      if (!customer) return res.status(404).json({ error: 'Perfil nao encontrado.' });
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

  async getDetail(req, res, next) {
    try {
      const result = await customersRepo.findDetailByEstablishment(
        req.establishmentId,
        req.params.customerId
      );

      if (!result) return res.status(404).json({ error: 'Cliente nao encontrado neste estabelecimento.' });
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async createForEstablishment(req, res, next) {
    let createdUser = null;

    try {
      await customersRepo.assertCustomerEstablishmentsTable();

      const email = normalizeRequiredText(req.body.email).toLowerCase();
      const name = normalizeRequiredText(req.body.name);
      const profileFields = buildCustomerPayload(req.body);
      const rawPassword = normalizeOptionalValue('password', req.body.password);
      const password = rawPassword || createTemporaryPassword();
      const existingUser = await usersRepo.findByEmail(email);

      if (existingUser && existingUser.role !== 'customer') {
        return res.status(409).json({ error: 'Este e-mail ja pertence a uma conta administrativa.' });
      }

      if (existingUser) {
        if (name && existingUser.name !== name) {
          await usersRepo.update(existingUser.id, { name });
        }

        let customer = await customersRepo.findByUserId(existingUser.id);
        if (!customer) {
          customer = await customersRepo.create({ user_id: existingUser.id, ...profileFields });
        } else if (Object.keys(profileFields).length > 0) {
          customer = await customersRepo.update(customer.id, profileFields);
        }

        await customersRepo.linkToEstablishment(customer.id, req.establishmentId, 'manual', {
          ignoreMissingTable: false,
        });

        const detail = await customersRepo.findDetailByEstablishment(req.establishmentId, customer.id);
        return res.status(201).json({
          customer: detail?.customer || customer,
          linked_existing_user: true,
        });
      }

      const password_hash = await hashPassword(password);
      createdUser = await usersRepo.create({
        name,
        email,
        password_hash,
        role: 'customer',
      });

      let customer;
      try {
        customer = await customersRepo.create({ user_id: createdUser.id, ...profileFields });
        await customersRepo.linkToEstablishment(customer.id, req.establishmentId, 'manual', {
          ignoreMissingTable: false,
        });
      } catch (err) {
        await supabase.from('users').delete().eq('id', createdUser.id);
        throw err;
      }

      const detail = await customersRepo.findDetailByEstablishment(req.establishmentId, customer.id);
      return res.status(201).json({
        customer: detail?.customer || customer,
        temporaryPassword: rawPassword ? undefined : password,
      });
    } catch (err) {
      next(err);
    }
  }

  async getProfile(req, res, next) {
    try {
      const result = await customersRepo.findByUserId(req.user.userId);
      if (!result) return res.status(404).json({ error: 'Perfil nao encontrado.' });
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const customer = await customersRepo.findByUserId(req.user.userId);
      if (!customer) return res.status(404).json({ error: 'Perfil nao encontrado.' });

      const userFields = {};
      const normalizedName = normalizeOptionalValue('name', req.body.name);
      const normalizedEmail = normalizeOptionalValue('email', req.body.email);
      if (normalizedName) userFields.name = normalizedName;
      if (normalizedEmail) userFields.email = normalizedEmail;

      const customerFields = buildCustomerPayload(req.body);

      if (Object.keys(userFields).length > 0) {
        const { error } = await supabase
          .from('users')
          .update(userFields)
          .eq('id', req.user.userId);
        if (error) throw error;
      }

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
        updatedCustomer = await customersRepo.findByUserId(req.user.userId);
      }

      res.json(updatedCustomer);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new CustomersController();
