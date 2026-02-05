import { babel } from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import { readFileSync } from 'node:fs';

const pkg = JSON.parse(readFileSync('./package.json', 'utf8'));

const name = 'Compressor';
const fileName = 'compressor';
const banner = `/*!
 * ${name}.js v${pkg.version}
 * https://github.com/j9t/compressorjs-next
 *
 * Copyright 2018-2024 Chen Fengyuan
 * Copyright 2026 Jens Oliver Meiert
 *
 * Released under the MIT license.
 */`;

export default {
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
