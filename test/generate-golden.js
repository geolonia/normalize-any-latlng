#!/usr/bin/env node
/**
 * Regenerate test/fixtures/golden.json from a built copy of the package.
 *
 *   node test/generate-golden.js [path/to/package]   (default: this repository)
 *
 * The golden file records what the published package returns for every input
 * in test/fixtures/inputs.json, including inputs whose current output may be
 * questionable. It is a characterization of existing behavior, not a spec:
 * if a change alters an output on purpose, regenerate and review the diff.
 *
 * The committed golden.json was generated from @geolonia/normalize-any-latlng@0.0.4
 * as published on npm.
 */
const fs = require('fs');
const path = require('path');

const pkgDir = path.resolve(process.argv[2] || path.join(__dirname, '..'));
const { normalize } = require(path.join(pkgDir, 'dist', 'index.js'));
const { encodeOutput } = require('./golden-codec');

const inputs = require('./fixtures/inputs.json');
const golden = inputs.map((input) => ({ input, output: encodeOutput(normalize(input)) }));

const outFile = path.join(__dirname, 'fixtures', 'golden.json');
fs.writeFileSync(outFile, `${JSON.stringify(golden, null, 2)}\n`);
process.stdout.write(`wrote ${golden.length} cases to ${path.relative(process.cwd(), outFile)}\n`);
