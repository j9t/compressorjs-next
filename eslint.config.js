import js from '@eslint/js';

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
      globals: {
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        Image: 'readonly',
        FileReader: 'readonly',
        ArrayBuffer: 'readonly',
        URL: 'readonly',
        Blob: 'readonly',
        File: 'readonly',
        HTMLCanvasElement: 'readonly',
        CanvasRenderingContext2D: 'readonly',
      },
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
        window: 'writable',
        Image: 'readonly',
        URL: 'readonly',
        XMLHttpRequest: 'readonly',
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
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        Image: 'readonly',
        FileReader: 'readonly',
        ArrayBuffer: 'readonly',
        URL: 'readonly',
        Blob: 'readonly',
        File: 'readonly',
        HTMLCanvasElement: 'readonly',
        CanvasRenderingContext2D: 'readonly',
        XMLHttpRequest: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        setTimeout: 'readonly',
        Compressor: 'readonly',
      },
    },
    rules: {
      'no-param-reassign': 'off',
    },
  },
];
