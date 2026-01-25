const { babel } = require('@rollup/plugin-babel');
const commonjs = require('@rollup/plugin-commonjs');
const { nodeResolve } = require('@rollup/plugin-node-resolve');
const pkg = require('./package.json');

const name = 'Compressor';
const fileName = 'compressor';
const year = new Date().getFullYear();
const banner = `/*!
 * ${name}.js v${pkg.version}
 * https://github.com/j9t/compressorjs-next
 *
 * Copyright 2018-${year} Chen Fengyuan
 * Copyright 2025-${year} Jens Oliver Meiert
 *
 * Released under the MIT license.
 */`;

module.exports = {
  input: 'src/index.js',
  output: [
    {
      banner,
      name,
      file: `dist/${fileName}.js`,
      format: 'umd',
    },
    {
      banner,
      file: `dist/${fileName}.common.js`,
      format: 'cjs',
      exports: 'auto',
    },
    {
      banner,
      file: `dist/${fileName}.esm.js`,
      format: 'esm',
    },
    {
      banner,
      name,
      file: `docs/js/${fileName}.js`,
      format: 'umd',
    },
  ],
  plugins: [
    nodeResolve(),
    commonjs(),
    babel({
      babelHelpers: 'bundled',
    }),
  ],
};
