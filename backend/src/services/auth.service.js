const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const env = require('../config/env');
const usersRepo = require('../repositories/users.repository');
const customersRepo = require('../repositories/customers.repository');
const supabase = require('../config/supabase');

const SALT_ROUNDS = 12;
const RESET_TOKEN_EXPIRES_MS = 60 * 60 * 1000; // 1 hora

function createMailTransport() {
  return nodemailer.createTransport({
    host: env.email.host,
    port: env.email.port,
    secure: env.email.port === 465,
    auth: { user: env.email.user, pass: env.email.pass },
  });
}

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
  const { password_hash: _ph, password_reset_token: _prt, password_reset_expires_at: _pre, ...safe } = user;
  return safe;
};

class AuthService {
  async register({ name, email, password, phone }) {
    const existing = await usersRepo.findByEmail(email);
    if (existing) {
      const err = new Error('Email ja esta em uso.');
      err.statusCode = 409;
      throw err;
    }

    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await usersRepo.create({ name, email, password_hash, role: 'customer' });
    const customer = await customersRepo.create({ user_id: user.id, phone: phone || null });
    const token = signToken(user, {});
    return { user: sanitizeUser(user), customer, token };
  }

  async login({ email, password, slug }) {
    const user = await usersRepo.findByEmail(email);
    if (!user) {
      const err = new Error('Credenciais invalidas.');
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
      const err = new Error('Credenciais invalidas.');
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

      if (data && data.establishments) {
        establishment = {
          id:   data.establishments.id,
          slug: data.establishments.slug,
        };
      }

      if (slug && establishment.slug !== slug) {
        const err = new Error('Esta conta de administrador nao pertence a este estabelecimento.');
        err.statusCode = 403;
        throw err;
      }
    }

    const token = signToken(user, establishment);
    return { user: sanitizeUser(user), token, establishment };
  }

  async me(userId) {
    const user = await usersRepo.findById(userId);
    if (!user) {
      const err = new Error('Usuario nao encontrado.');
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

  // Recuperacao de senha

  async forgotPassword({ email }) {
    const GENERIC = { message: 'Se o e-mail existir, voce recebera as instrucoes em breve.' };

    const user = await usersRepo.findByEmail(email);
    if (!user) return GENERIC;

    if (!env.email.host) {
      if (env.nodeEnv !== 'production') {
        console.warn('[auth] E-mail nao configurado. Configure EMAIL_HOST no .env');
      }
      return GENERIC;
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRES_MS).toISOString();

    await usersRepo.update(user.id, {
      password_reset_token: token,
      password_reset_expires_at: expiresAt,
    });

    const resetUrl = env.app.frontendUrl + '/redefinir-senha?token=' + token;

    const transport = createMailTransport();
    await transport.sendMail({
      from: env.email.from,
      to: user.email,
      subject: 'Redefinicao de senha',
      text: 'Ola ' + user.name + ',\n\nClique no link para redefinir sua senha (valido por 1 hora):\n' + resetUrl + '\n\nSe nao solicitou, ignore este e-mail.',
      html: '<p>Ola <strong>' + user.name + '</strong>,</p>'
        + '<p>Clique no botao abaixo para redefinir sua senha. O link expira em <strong>1 hora</strong>.</p>'
        + '<p style="margin:24px 0"><a href="' + resetUrl + '" style="background:#2563EB;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600">Redefinir senha</a></p>'
        + '<p>Se nao solicitou, ignore este e-mail.</p>'
        + '<p style="color:#9ca3af;font-size:12px">' + resetUrl + '</p>',
    });

    return GENERIC;
  }

  async resetPassword({ token, newPassword }) {
    const user = await usersRepo.findByResetToken(token);
    if (!user) {
      const err = new Error('Link invalido ou expirado. Solicite um novo link de recuperacao.');
      err.statusCode = 400;
      throw err;
    }

    const password_hash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await usersRepo.update(user.id, { password_hash });
    await usersRepo.clearResetToken(user.id);

    return { message: 'Senha redefinida com sucesso. Voce ja pode fazer login.' };
  }
}

module.exports = new AuthService();
