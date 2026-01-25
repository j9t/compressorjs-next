const puppeteer = require('puppeteer');
const rollupConfig = require('../rollup.config.cjs');

process.env.CHROME_BIN = puppeteer.executablePath();

module.exports = (config) => {
  config.set({
    autoWatch: false,
    basePath: '..',
    browsers: ['ChromeHeadlessCI'],
    customLaunchers: {
      ChromeHeadlessCI: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
      },
    },
    client: {
      mocha: {
        timeout: 10000,
      },
    },
    coverageIstanbulReporter: {
      reports: ['html', 'lcovonly', 'text-summary'],
    },
    files: [
      'test/setup.js',
      'node_modules/karma-chai/adapter.js',
      'test/helpers.js',
      'test/specs/**/*.spec.js',
      {
        pattern: 'docs/images/*',
        included: false,
      },
    ],
    frameworks: ['mocha'],
    preprocessors: {
      'test/setup.js': ['rollup'],
      'test/helpers.js': ['rollup'],
      'test/specs/**/*.spec.js': ['rollup'],
    },
    reporters: ['mocha', 'coverage-istanbul'],
    rollupPreprocessor: {
      plugins: rollupConfig.plugins,
      output: {
        format: 'iife',
        sourcemap: 'inline',
      },
    },
    singleRun: true,
  });
};
