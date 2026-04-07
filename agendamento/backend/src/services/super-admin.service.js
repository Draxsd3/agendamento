const bcrypt = require('bcryptjs');
const usersRepo = require('../repositories/users.repository');
const establishmentsRepo = require('../repositories/establishments.repository');
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
      const err = new Error('Estabelecimento não encontrado.');
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
      const err = new Error('Slug já está em uso.');
      err.statusCode = 409;
      throw err;
    }
    return establishmentsRepo.create(payload);
  }

  async createAdminUser({ name, email, password, establishmentId }) {
    const existing = await usersRepo.findByEmail(email);
    if (existing) {
      const err = new Error('Email já está em uso.');
      err.statusCode = 409;
      throw err;
    }

    const establishment = await establishmentsRepo.findById(establishmentId);
    if (!establishment) {
      const err = new Error('Estabelecimento não encontrado.');
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
    return usersRepo.findAllPaginated(filters);
  }

  async toggleUserStatus(userId) {
    const user = await usersRepo.findById(userId);
    if (!user) {
      const err = new Error('Usuário não encontrado.');
      err.statusCode = 404;
      throw err;
    }
    if (user.role === 'super_admin') {
      const err = new Error('Não é possível alterar o status do super admin.');
      err.statusCode = 400;
      throw err;
    }
    return usersRepo.update(userId, { is_active: !user.is_active });
  }

  async setEstablishmentStatus(id, status) {
    const establishment = await establishmentsRepo.findById(id);
    if (!establishment) {
      const err = new Error('Estabelecimento não encontrado.');
      err.statusCode = 404;
      throw err;
    }
    return establishmentsRepo.update(id, { status });
  }
}

module.exports = new SuperAdminService();
