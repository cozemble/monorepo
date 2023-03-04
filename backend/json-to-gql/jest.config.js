/** @type {import('jest').Config} */

const config = {
  verbose: true,
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  roots: ['<rootDir>/src', '<rootDir>/test'],
  testEnvironment: 'node',
  testMatch: ['**/?(*.)spec.ts'],
  setupFilesAfterEnv: ['<rootDir>/test/matchers/index.ts'],
  transform: {
    '^.+\\.(js|ts)$': 'ts-jest',
  },
}

module.exports = config
