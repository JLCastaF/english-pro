const { defineConfig } = require("cypress");
require('dotenv').config(); // Esto carga tu archivo .env automáticamente

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    setupNodeEvents(on, config) {
      // Pasamos las variables del .env a Cypress
      config.env = {
        ...process.env,
        VITE_FIREBASE_API_KEY: process.env.VITE_FIREBASE_API_KEY,
        VITE_FIREBASE_PROJECT_ID: process.env.VITE_FIREBASE_PROJECT_ID,
      };
      return config;
    },
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
  },
});