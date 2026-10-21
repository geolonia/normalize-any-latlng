import { normalize } from './index';
import { encodeOutput } from '../test/golden-codec';

// Loaded with require() so that tsconfig (shared with the build) needs no resolveJsonModule.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const golden: { input: string, output: unknown }[] = require('../test/fixtures/golden.json');

// Outputs recorded from @geolonia/normalize-any-latlng@0.0.4 as published on npm.
// See test/generate-golden.js.
describe('golden: same output as the published package', () => {
  for (const { input, output } of golden) {
    test(JSON.stringify(input), () => {
      expect(encodeOutput(normalize(input))).toStrictEqual(output);
    });
  }
});
