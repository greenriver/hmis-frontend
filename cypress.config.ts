const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'https://hmis.dev.test:5173/',
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
