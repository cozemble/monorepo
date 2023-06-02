import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    video: false,
    defaultCommandTimeout: 20000,
    screenshotOnRunFailure: false,
    retries: {
      runMode: 1,
      openMode: 0,
    },
  },
})
