'use strict';

module.exports = {
  root: true,
  env: {
    browser: true,
    es2022: true,
  },
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
  },
  settings: {
    react: { version: 'detect' },
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
  ],
  rules: {
    // Erros comuns
    'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    'no-console': ['warn', { allow: ['warn', 'error'] }],

    // Segurança
    'no-eval': 'error',
    'no-implied-eval': 'error',

    // Boas práticas
    'eqeqeq': ['error', 'always'],
    'no-var': 'error',
    'prefer-const': 'error',

    // React
    'react/prop-types': 'off',          // projeto usa TypeScript-free + inferência
    'react-hooks/exhaustive-deps': 'warn',
  },
  ignorePatterns: ['node_modules/', 'dist/', 'coverage/'],
};
