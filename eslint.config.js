import js from '@eslint/js';

export default [
  {
    ignores: ['dist/**', 'docs/js/**', 'coverage/**', 'eslint.config.js'],
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
      },
    },
    rules: {
      'no-param-reassign': 'off',
    },
  },
  {
    files: ['test/specs/**/*.js', 'test/helpers.js'],
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
  {
    files: ['**/*.config.js', '.eslintrc', 'test/karma.conf.js', 'karma.conf.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'commonjs',
      globals: {
        module: 'writable',
        require: 'readonly',
        __dirname: 'readonly',
        process: 'readonly',
      },
    },
    rules: {
      'no-param-reassign': 'off',
    },
  },
];