const bcrypt = require('bcryptjs');
const usersRepo = require('../repositories/users.repository');
const establishmentsRepo = require('../repositories/establishments.repository');
const establishmentsService = require('./establishments.service');
const asaasAccountService = require('./asaas-account.service');
const supabase = require('../config/supabase');

const SALT_ROUNDS = 12;

class SuperAdminService {
  async getDashboardStats() {
    const [
      { count: totalEstablishments },
      { count: activeEstablishments },
      { count: totalUsers },
      { count: totalAppointments },
    ] = await Promise.all([
      supabase.from('establishments').select('*', { count: 'exact', head: true }),
      supabase.from('establishments').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('users').select('*', { count: 'exact', head: true }).neq('role', 'super_admin'),
      supabase.from('appointments').select('*', { count: 'exact', head: true }),
    ]);

    return {
      totalEstablishments,
      activeEstablishments,
      totalUsers,
      totalAppointments,
    };
  }

  async getEstablishmentById(id) {
    const establishment = await establishmentsRepo.findById(id);
    if (!establishment) {
      const err = new Error('Estabelecimento n\u00e3o encontrado.');
      err.statusCode = 404;
      throw err;
    }
    return establishment;
  }

  async getEstablishmentAdmins(establishmentId) {
    const { data, error } = await supabase
      .from('establishment_admins')
      .select('users(id, name, email, is_active, created_at)')
      .eq('establishment_id', establishmentId);

    if (error) throw error;
    return data.map((row) => row.users).filter(Boolean);
  }

  async getAllEstablishments(filters) {
    return establishmentsRepo.findAllPaginated(filters);
  }

  async createEstablishment(payload) {
    const existing = await establishmentsRepo.findBySlug(payload.slug);
    if (existing) {
      const err = new Error('Slug j\u00e1 est\u00e1 em uso.');
      err.statusCode = 409;
      throw err;
    }
    return establishmentsRepo.create(payload);
  }

  async updateEstablishment(id, payload) {
    return establishmentsService.update(id, payload);
  }

  async createAdminUser({ name, email, password, establishmentId }) {
    const existing = await usersRepo.findByEmail(email);
    if (existing) {
      const err = new Error('Email j\u00e1 est\u00e1 em uso.');
      err.statusCode = 409;
      throw err;
    }

    const establishment = await establishmentsRepo.findById(establishmentId);
    if (!establishment) {
      const err = new Error('Estabelecimento n\u00e3o encontrado.');
      err.statusCode = 404;
      throw err;
    }

    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await usersRepo.create({ name, email, password_hash, role: 'establishment_admin' });

    await supabase
      .from('establishment_admins')
      .insert({ user_id: user.id, establishment_id: establishmentId });

    const { password_hash: _, ...safeUser } = user;
    return safeUser;
  }

  async getAllUsers(filters) {
    const result = await usersRepo.findAllPaginated(filters);
    const users = result.data || [];

    if (users.length === 0) {
      return result;
    }

    const userIds = users.map((user) => user.id);

    const [{ data: adminLinks, error: adminError }, { data: customerLinks, error: customerError }] = await Promise.all([
      supabase
        .from('establishment_admins')
        .select('user_id, establishments(id, name, slug)')
        .in('user_id', userIds),
      supabase
        .from('appointments')
        .select('establishment_id, customer_id, establishments(id, name, slug), customers!inner(user_id)')
        .in('customers.user_id', userIds),
    ]);

    if (adminError) throw adminError;
    if (customerError) throw customerError;

    const establishmentsByUser = new Map();

    const appendEstablishment = (userId, establishment, relationship) => {
      if (!userId || !establishment?.id) return;

      const current = establishmentsByUser.get(userId) || [];
      const exists = current.some(
        (item) => item.id === establishment.id && item.relationship === relationship
      );

      if (!exists) {
        current.push({
          id: establishment.id,
          name: establishment.name,
          slug: establishment.slug,
          relationship,
        });
        establishmentsByUser.set(userId, current);
      }
    };

    (adminLinks || []).forEach((link) => {
      appendEstablishment(link.user_id, link.establishments, 'admin');
    });

    (customerLinks || []).forEach((link) => {
      appendEstablishment(link.customers?.user_id, link.establishments, 'customer');
    });

    result.data = users.map((user) => ({
      ...user,
      establishments: establishmentsByUser.get(user.id) || [],
    }));

    return result;
  }

  async toggleUserStatus(userId) {
    const user = await usersRepo.findById(userId);
    if (!user) {
      const err = new Error('Usu\u00e1rio n\u00e3o encontrado.');
      err.statusCode = 404;
      throw err;
    }
    if (user.role === 'super_admin') {
      const err = new Error('N\u00e3o \u00e9 poss\u00edvel alterar o status do super admin.');
      err.statusCode = 400;
      throw err;
    }
    return usersRepo.update(userId, { is_active: !user.is_active });
  }

  async setEstablishmentStatus(id, status) {
    const establishment = await establishmentsRepo.findById(id);
    if (!establishment) {
      const err = new Error('Estabelecimento n\u00e3o encontrado.');
      err.statusCode = 404;
      throw err;
    }
    return establishmentsRepo.update(id, { status });
  }

  async createAsaasSubaccount(establishmentId, payload) {
    return asaasAccountService.createSubaccount(establishmentId, payload);
  }

  async getAsaasSubaccount(establishmentId, options) {
    return asaasAccountService.getSubaccount(establishmentId, options);
  }

  async syncAsaasSubaccount(establishmentId) {
    const updated = await asaasAccountService.syncSubaccount(establishmentId);
    return asaasAccountService.getSubaccount(updated.id);
  }
}

module.exports = new SuperAdminService();
