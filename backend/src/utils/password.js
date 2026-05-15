const bcrypt = require('bcryptjs');
const env = require('../config/env');

const hashPassword = (password) => bcrypt.hash(password, env.auth.passwordSaltRounds);

const comparePassword = (password, passwordHash) => bcrypt.compare(password, passwordHash);

module.exports = {
  comparePassword,
  hashPassword,
};
