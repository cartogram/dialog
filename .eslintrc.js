module.exports = {
  parserOptions: {
    project: ['packages/dialog/tsconfig.json', 'packages/logger/tsconfig.json'],
  },
  extends: [
    'plugin:@shopify/typescript',
    'plugin:@shopify/react',
    'plugin:@shopify/node',
    'plugin:@shopify/typescript-type-checking',
    'plugin:@shopify/prettier',
  ],
  ignorePatterns: [
    'node_modules/',
    'packages/*/build/',
    'packages/*/*.d.ts',
    'packages/*/*.js',
    '!packages/*/.eslintrc.js',
    'packages/*/*.mjs',
    'packages/*/*.node',
    'packages/*/*.esnext',
    'packages/**/tests/fixtures/',
  ],
  rules: {
    'lines-around-comment': 'off',
  },
};
