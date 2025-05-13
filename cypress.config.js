const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3800',
    viewportWidth: 1280,
    viewportHeight: 720,
  },
});