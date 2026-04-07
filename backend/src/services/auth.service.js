const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const usersRepo = require('../repositories/users.repository');
const customersRepo = require('../repositories/customers.repository');
const supabase = require('../config/supabase');

const SALT_ROUNDS = 12;

const signToken = (user, establishment = {}) => {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
      ...(establishment.id   && { establishmentId:   establishment.id }),
      ...(establishment.slug && { establishmentSlug: establishment.slug }),
    },
    env.jwt.secret,
    { expiresIn: env.jwt.expiresIn }
  );
};

const sanitizeUser = (user) => {
  const { password_hash, ...safe } = user;
  return safe;
};

class AuthService {
  async register({ name, email, password, phone }) {
    const existing = await usersRepo.findByEmail(email);
    if (existing) {
      const err = new Error('Email já está em uso.');
      err.statusCode = 409;
      throw err;
    }

    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await usersRepo.create({ name, email, password_hash, role: 'customer' });

    // Create customer profile
    const customer = await customersRepo.create({ user_id: user.id, phone: phone || null });

    const token = signToken(user, {});
    return { user: sanitizeUser(user), customer, token };
  }

  async login({ email, password }) {
    const user = await usersRepo.findByEmail(email);
    if (!user) {
      const err = new Error('Credenciais inválidas.');
      err.statusCode = 401;
      throw err;
    }

    if (!user.is_active) {
      const err = new Error('Conta desativada. Entre em contato com o suporte.');
      err.statusCode = 403;
      throw err;
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      const err = new Error('Credenciais inválidas.');
      err.statusCode = 401;
      throw err;
    }

    let establishment = {};

    if (user.role === 'establishment_admin') {
      const { data } = await supabase
        .from('establishment_admins')
        .select('establishment_id, establishments(id, slug)')
        .eq('user_id', user.id)
        .limit(1)
        .single();

      if (data?.establishments) {
        establishment = {
          id:   data.establishments.id,
          slug: data.establishments.slug,
        };
      }
    }

    const token = signToken(user, establishment);
    return { user: sanitizeUser(user), token, establishment };
  }

  async me(userId) {
    const user = await usersRepo.findById(userId);
    if (!user) {
      const err = new Error('Usuário não encontrado.');
      err.statusCode = 404;
      throw err;
    }
    return sanitizeUser(user);
  }

  async changePassword(userId, { currentPassword, newPassword }) {
    const user = await usersRepo.findById(userId);
    const valid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!valid) {
      const err = new Error('Senha atual incorreta.');
      err.statusCode = 400;
      throw err;
    }

    const password_hash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await usersRepo.update(userId, { password_hash });
    return { message: 'Senha atualizada com sucesso.' };
  }
}

module.exports = new AuthService();
