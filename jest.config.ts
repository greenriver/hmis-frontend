export default {
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2)$':
      '<rootDir>/src/test/__mocks__/fileTransformer.js',
    '\\.(css|less|sass|scss)$': 'identity-obj-proxy',
    // replace lodash-es with the commonjs version during testing runtime
    '^lodash-es$': 'lodash',
  },
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  transformIgnorePatterns: ['/node_modules/(?!(@rails)/)'],
};
