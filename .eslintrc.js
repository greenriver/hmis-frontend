module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'airbnb/hooks',
    'plugin:import/recommended',
    'plugin:jsx-a11y/recommended',
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
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
      ],
      parserOptions: {
        project: ['./tsconfig.json'],
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
      'error',
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
        'newlines-between': 'always',
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
      },
    ],
    'import/default': 'off',
    'import/no-named-as-default-member': 'off',
    'import/no-named-as-default': 'off',
  },
  ignorePatterns: ['jest.config.ts', 'gqltypes.ts'],
};
