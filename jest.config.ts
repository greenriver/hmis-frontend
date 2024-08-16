export default {
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2)$':
      '<rootDir>/src/test/__mocks__/fileTransformer.js',
    '\\.(css|less|sass|scss)$': 'identity-obj-proxy',
    '\\pdf.worker.*': '<rootDir>/src/test/__mocks__/workerMock.js',
    // moduleNameMapper: { '^react-pdf$': '<rootDir>/__mocks__/react-pdf.js',
    // replace lodash-es with the commonjs version during testing runtime
    '^lodash-es$': 'lodash',
  },
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  transformIgnorePatterns: [
    '/node_modules/(?!react-pdf|@mui/x-tree-view|@rails|react-pdf|pdfjs-dist)/',
  ],
};
