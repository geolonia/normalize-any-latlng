module.exports = {
  extends: ['@geolonia'],
  env: {
    browser: true,
    node: true,
    jest: true,
  },

  rules: {
    'no-irregular-whitespace': ['error', { skipRegExps: true }],
  },

  parserOptions: {
    project: ['tsconfig.json'],
  },

  ignorePatterns: ["dist"],
};
