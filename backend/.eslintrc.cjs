'use strict';

module.exports = {
  env: {
    node: true,
    es2022: true,
  },
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'commonjs',
  },
  extends: ['eslint:recommended'],
  rules: {
    // Erros comuns
    'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
    'no-process-exit': 'error',

    // Segurança
    'no-eval': 'error',
    'no-implied-eval': 'error',
    'no-new-func': 'error',

    // Boas práticas
    'eqeqeq': ['error', 'always'],
    'no-var': 'error',
    'prefer-const': 'error',
    'no-throw-literal': 'error',
  },
  ignorePatterns: ['node_modules/', 'dist/', 'coverage/'],
};
