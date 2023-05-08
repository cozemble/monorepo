import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    video: false,
    defaultCommandTimeout: 10000,
    screenshotOnRunFailure: false,
    retries: 1,
  },
})
