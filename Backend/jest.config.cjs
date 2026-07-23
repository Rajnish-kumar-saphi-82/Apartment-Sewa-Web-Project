module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\\.ts$': ['ts-jest', {
        useESM: true,
    }]
  },
  resolver: 'jest-ts-webcompat-resolver',
  moduleNameMapper: {
    '^uuid$': '<rootDir>/src/__tests__/__mocks__/uuid.js'
  },
  setupFilesAfterEnv: ['<rootDir>/src/jest.setup.ts'],
  transformIgnorePatterns: [
    'node_modules/(?!(uuid)/)'
  ]
};
