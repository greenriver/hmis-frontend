// To see all enabled rules, run `yarn eslint --print-config .eslintrc.js`
module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'airbnb/hooks',
    'plugin:import/recommended',
    'plugin:jsx-a11y/strict',
    'plugin:react-hooks/recommended',
    'prettier',
    'plugin:storybook/recommended',
  ],
  plugins: ['react', '@typescript-eslint', 'jest'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  overrides: [
    {
      files: ['**/*.test.ts', '**/*.test.tx'],
      env: {
        'jest/globals': true,
      },
      plugins: ['jest'],
      extends: ['plugin:jest/recommended'],
    },
    {
      files: ['*.ts', '*.tsx'],
      extends: [
        'airbnb-typescript',
        'plugin:@typescript-eslint/recommended',
        // 'plugin:@typescript-eslint/recommended-requiring-type-checking',
      ],
      parserOptions: {
        project: [
          './tsconfig.json',
          './cypress/tsconfig.json',
          './cypress.config.ts',
        ],
      },
      rules: {
        'import/extensions': 'off',
        '@typescript-eslint/no-unused-vars': 'error',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-shadow': 'off',
        // Disable rules that are redundant with prettier (found with eslint-config-prettier)
        '@typescript-eslint/comma-dangle': 'off',
        '@typescript-eslint/brace-style': 'off',
        '@typescript-eslint/comma-dangle': 'off',
        '@typescript-eslint/comma-dangle': 'off',
        '@typescript-eslint/brace-style': 'off',
        '@typescript-eslint/comma-dangle': 'off',
        '@typescript-eslint/comma-spacing': 'off',
        '@typescript-eslint/func-call-spacing': 'off',
        '@typescript-eslint/indent': 'off',
        '@typescript-eslint/keyword-spacing': 'off',
        '@typescript-eslint/no-extra-semi': 'off',
        '@typescript-eslint/object-curly-spacing': 'off',
        '@typescript-eslint/semi': 'off',
        '@typescript-eslint/space-before-blocks': 'off',
        '@typescript-eslint/space-before-function-paren': 'off',
        '@typescript-eslint/space-infix-ops': 'off',
        '@typescript-eslint/quotes': 'off',
        'import/no-extraneous-dependencies': [
          'error',
          {
            devDependencies: ['**/.storybook/**/*.*', '**/*.stories.*'],
            peerDependencies: true,
          },
        ],
      },
    },
  ],
  rules: {
    'import/order': [
      'warn',
      {
        groups: [
          'builtin',
          'external',
          'internal',
          'parent',
          'sibling',
          'index',
          'object',
        ],
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
        warnOnUnassignedImports: false,
      },
    ],
    'no-console': [
      'warn',
      {
        allow: ['warn', 'error'],
      },
    ],
    'import/no-duplicates': 'error',
    'import/default': 'off',
    'import/no-named-as-default-member': 'off',
    'import/no-named-as-default': 'off',
    'jsx-a11y/anchor-ambiguous-text': 'error',
    'react/button-has-type': 'error',
    'react/no-array-index-key': 'error',
    'react/display-name': 'off',
    'react/no-children-prop': 'error',
    'react/no-danger-with-children': 'error',
    'react-hooks/exhaustive-deps': 'error',
    'no-restricted-imports': [
      'warn',
      {
        name: 'react-router-dom',
        importNames: ['useParams'],
        message: 'use useSafeParams',
      },
    ],
    eqeqeq: 'error',
  },
  ignorePatterns: ['jest.config.ts', 'gqltypes.ts', 'cypress.config.ts'],
};
