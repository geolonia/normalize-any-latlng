/**
 * JSON cannot hold `undefined` or `-0`, and normalize() returns both
 * (`lat: undefined` for an empty string, `-0` for "-0, -0").
 * Encode them as strings so the golden file keeps the distinction.
 */
const encodeValue = (v) => {
  if (v === undefined) return 'undefined';
  if (Object.is(v, -0)) return '-0';
  if (typeof v === 'number' && Number.isNaN(v)) return 'NaN';
  return v;
};

// Array.from / Object.fromEntries rebuild the result in the caller's realm,
// so results from a vm context (the UMD global test) compare as equal.
const encodeOutput = (results) => Array.from(
  results,
  (r) => Object.fromEntries(Object.keys(r).map((k) => [k, encodeValue(r[k])])),
);

module.exports = { encodeOutput };
