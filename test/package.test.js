/**
 * Contract tests for the package as published to npm.
 *
 * Packs the built package with `npm pack`, extracts it into a temporary
 * node_modules, and checks every way a consumer can load it: CommonJS/UMD
 * (main), ESM (module), browser global, CLI (bin) and TypeScript types.
 * Each entry point must return exactly the outputs in fixtures/golden.json.
 *
 * Uses node:test instead of jest so that it keeps working while jest itself
 * is being upgraded. Run `npm run build` first (`npm run test:package` does).
 *
 * POSIX only, like the build script (rm, chmod) and CI (ubuntu): it uses tar,
 * file modes and the CLI's shebang.
 */
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { execFileSync, spawnSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const vm = require('node:vm');
const { createRequire } = require('node:module');
const { pathToFileURL } = require('node:url');
const acorn = require('acorn');
const { encodeOutput } = require('./golden-codec');
const golden = require('./fixtures/golden.json');

const repoDir = path.join(__dirname, '..');
const PKG_NAME = '@geolonia/normalize-any-latlng';

let tmpDir;
let pkgDir;
let pkgJson;
let packedFiles;

before(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'normalize-any-latlng-'));
  // Under `npm run`, npm_execpath is the npm CLI that started us; use the same one.
  const npmArgs = ['pack', '--json', '--pack-destination', tmpDir];
  const [packed] = JSON.parse(process.env.npm_execpath
    ? execFileSync(process.execPath, [process.env.npm_execpath, ...npmArgs], { cwd: repoDir, encoding: 'utf8' })
    : execFileSync('npm', npmArgs, { cwd: repoDir, encoding: 'utf8' }));
  packedFiles = packed.files.map((f) => f.path).sort();

  pkgDir = path.join(tmpDir, 'node_modules', PKG_NAME);
  fs.mkdirSync(pkgDir, { recursive: true });
  execFileSync('tar', ['-xzf', path.join(tmpDir, packed.filename), '-C', pkgDir, '--strip-components=1']);
  pkgJson = JSON.parse(fs.readFileSync(path.join(pkgDir, 'package.json'), 'utf8'));
});

after(() => {
  if (tmpDir) fs.rmSync(tmpDir, { recursive: true, force: true });
});

const assertGolden = (normalize, label) => {
  for (const { input, output } of golden) {
    assert.deepStrictEqual(encodeOutput(normalize(input)), output, `${label}: ${JSON.stringify(input)}`);
  }
};

test('tarball ships the built entry points and no sources', () => {
  const expected = [
    'package.json', 'README.md',
    'dist/index.js', 'dist/index.js.map', 'dist/index.es.js', 'dist/index.es.js.map',
    'dist/index.d.ts', 'dist/lib.d.ts', 'dist/cli.js', 'dist/cli.d.ts',
  ];
  for (const f of expected) {
    assert.ok(packedFiles.includes(f), `missing ${f} in ${packedFiles.join(', ')}`);
  }
  const unexpected = packedFiles.filter((f) => !(f === 'package.json' || f === 'README.md' || f === 'LICENSE' || f.startsWith('dist/')));
  assert.deepStrictEqual(unexpected, []);
});

test('package.json main/module/types/bin point to files in the tarball', () => {
  for (const key of ['main', 'module', 'types', 'bin']) {
    assert.equal(typeof pkgJson[key], 'string', `${key} should be a string`);
    assert.ok(fs.existsSync(path.join(pkgDir, pkgJson[key])), `${key}: ${pkgJson[key]} does not exist`);
  }
});

// tsconfig targets es2020. A toolchain upgrade must not raise the syntax level
// of the shipped code, or engines that load 0.0.4 today could no longer load it.
test('shipped JavaScript parses as ES2020', () => {
  for (const [key, sourceType] of [['main', 'script'], ['module', 'module'], ['bin', 'script']]) {
    const code = fs.readFileSync(path.join(pkgDir, pkgJson[key]), 'utf8');
    assert.doesNotThrow(
      () => acorn.parse(code, { ecmaVersion: 2020, sourceType, allowHashBang: true }),
      `${key}: ${pkgJson[key]}`,
    );
  }
});

test('require() by package name (main, CommonJS)', () => {
  const consumerRequire = createRequire(path.join(tmpDir, 'consumer.js'));
  const mod = consumerRequire(PKG_NAME);
  assert.equal(typeof mod.normalize, 'function');
  assertGolden(mod.normalize, 'cjs');
});

test('import of the module entry (ESM, as bundlers consume it)', async () => {
  // dist/index.es.js has a .js extension in a package without "type": "module",
  // so Node itself would load it as CommonJS. Copy it to .mjs to load it as ESM.
  const esmFile = path.join(tmpDir, 'index.mjs');
  fs.copyFileSync(path.join(pkgDir, pkgJson.module), esmFile);
  const mod = await import(pathToFileURL(esmFile).href);
  assert.deepStrictEqual(Object.keys(mod).sort(), ['normalize']);
  assertGolden(mod.normalize, 'esm');
});

test('browser global NormalizeAnyLatLng (main, UMD without a module system)', () => {
  const context = vm.createContext({});
  vm.runInContext(fs.readFileSync(path.join(pkgDir, pkgJson.main), 'utf8'), context);
  assert.equal(typeof context.NormalizeAnyLatLng?.normalize, 'function');
  assertGolden(context.NormalizeAnyLatLng.normalize, 'umd-global');
});

test('CLI (bin) prints "<lat> <lng>" for every golden input', () => {
  const cli = path.join(pkgDir, pkgJson.bin);
  assert.match(fs.readFileSync(cli, 'utf8'), /^#!\/usr\/bin\/env node\n/);
  assert.ok(fs.statSync(cli).mode & 0o111, 'cli should be executable');

  // The CLI prints String(value): undefined -> "undefined", -0 -> "0", NaN -> "NaN".
  const decode = (v) => (v === '-0' ? -0 : v);
  for (const { input, output } of golden) {
    if (input === '') continue; // an empty argument is an error, tested below
    const res = spawnSync(process.execPath, [cli, input], { encoding: 'utf8' });
    assert.equal(res.status, 0, `exit status for ${JSON.stringify(input)}: ${res.stderr}`);
    const expected = `${String(decode(output[0].lat))} ${String(decode(output[0].lng))}\n`;
    assert.equal(res.stdout, expected, JSON.stringify(input));
  }
});

test('CLI exits 1 without an argument', () => {
  const res = spawnSync(process.execPath, [path.join(pkgDir, pkgJson.bin)], { encoding: 'utf8' });
  assert.equal(res.status, 1);
  assert.equal(res.stdout, '');
  assert.match(res.stderr, /^Invalid LatLng string/);
});

test('CLI runs directly through its shebang', () => {
  const out = execFileSync(path.join(pkgDir, pkgJson.bin), ['N35.1234, E135.6789'], { encoding: 'utf8' });
  assert.equal(out, '35.1234 135.6789\n');
});

test('TypeScript types: a consumer compiles under strict mode', () => {
  const consumer = path.join(tmpDir, 'consumer.ts');
  fs.writeFileSync(consumer, [
    `import { normalize, NormalizationResult, Normalize } from '${PKG_NAME}';`,
    'const fn: Normalize = normalize;',
    'const results: NormalizationResult[] = fn(\'35, 135\');',
    'const lat: number | null = results[0].lat;',
    'const lng: number | null = results[0].lng;',
    'const format: string | undefined = results[0].format;',
    '// @ts-expect-error normalize() takes a string',
    'normalize(35);',
    '// @ts-expect-error lat may be null',
    'const notNull: number = results[0].lat;',
    'export { lat, lng, format, notNull };',
    '',
  ].join('\n'));

  // types: [] keeps @types/* (pulled in by jest, versions drift) out of the check;
  // the consumer needs only the package's own .d.ts.
  fs.writeFileSync(path.join(tmpDir, 'tsconfig.json'), JSON.stringify({
    compilerOptions: {
      noEmit: true, strict: true, module: 'commonjs', moduleResolution: 'node', types: [],
    },
    files: ['consumer.ts'],
  }));
  const tsc = require.resolve('typescript/bin/tsc', { paths: [repoDir] });
  const res = spawnSync(process.execPath, [tsc, '-p', tmpDir], { cwd: tmpDir, encoding: 'utf8' });
  assert.equal(res.status, 0, res.stdout + res.stderr);
});
