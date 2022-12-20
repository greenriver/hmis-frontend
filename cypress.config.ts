const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    defaultCommandTimeout: 15000,
    // Can be overridden by CYPRESS_BASE_URL
    baseUrl: 'https://hmis.dev.test:5173/',
    // Prevent navigating to a default blank page between each test
    testIsolation: false,
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
