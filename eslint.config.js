import js from '@eslint/js';
import globals from 'globals';

const esm = { ecmaVersion: 'latest', sourceType: 'module' };

export default [
  {
    ignores: ['dist/**', 'docs/setup/**', 'coverage/**', '*.config.js', '*.config.cjs'],
  },
  js.configs.recommended,
  {
    files: ['src/**/*.js'],
    languageOptions: { ...esm, globals: globals.browser },
    rules: {
      'no-param-reassign': 'off',
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
  {
    // Runs in the browser, via Vitest browser mode
    files: ['test/browser/**/*.js'],
    languageOptions: { ...esm, globals: globals.browser },
    rules: {
      'no-param-reassign': 'off',
    },
  },
  {
    // Runs in Node, via the built-in test runner
    files: ['test/node/**/*.js'],
    languageOptions: { ...esm, globals: globals.node },
  },
];
