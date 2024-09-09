/* eslint-disable import/no-extraneous-dependencies */
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';

const packageJson = require('./package.json');

const plugins = [
  resolve(),
  commonjs({
    requireReturnsDefault: 'auto',
  }),
  typescript({
    useTsconfigDeclarationDir: true,
    tsconfig: 'tsconfig.prod.json',
  }),
];

export default [
  {
    input: 'src/index.ts',
    output: [
      {
        file: packageJson.main,
        format: 'umd',
        sourcemap: true,
        name: 'NormalizeAnyLatLng',
      },
      {
        file: packageJson.module,
        format: 'esm',
        sourcemap: true,
      },
    ],
    plugins,
  },
  {
    input: 'src/cli.ts',
    output: [
      {
        file: packageJson.bin,
        format: 'cjs',
        banner: '#!/usr/bin/env node',
      },
    ],
    plugins,
  },
];
