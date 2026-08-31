import { babel } from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import { readFileSync } from 'node:fs';

const pkg = JSON.parse(readFileSync('./package.json', 'utf8'));

const name = 'Compressor';
const fileName = 'compressor';
const banner = `/*!
 * ${name}.js Next v${pkg.version}
 * https://github.com/j9t/compressorjs-next
 *
 * Copyright 2018–2024 Chen Fengyuan
 * Copyright 2026 Jens Oliver Meiert
 *
 * Released under the MIT license.
 */`;

export default {
  input: 'src/index.js',
  output: [
    {
      banner,
      file: `dist/${fileName}.esm.js`,
      format: 'esm',
      sourcemap: true,
    },
    {
      banner,
      file: `docs/setup/${fileName}.esm.js`,
      format: 'esm',
      sourcemap: true,
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
