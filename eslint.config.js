import js from '@eslint/js';
import globals from 'globals';

export default [
  {
    ignores: ['dist/**', 'docs/setup/**', 'coverage/**', '*.config.js', '*.config.cjs', 'test/*.cjs'],
  },
  js.configs.recommended,
  {
    files: ['src/**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.browser,
    },
    rules: {
      'no-param-reassign': 'off',
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
  {
    files: ['test/setup.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        window: 'writable',
      },
    },
    rules: {
      'no-param-reassign': 'off',
    },
  },
  {
    files: ['test/specs/**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        Compressor: 'readonly',
      },
    },
    rules: {
      'no-param-reassign': 'off',
    },
  },
];
