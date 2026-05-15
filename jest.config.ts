import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],

  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },

  // Configuração de Cobertura
  collectCoverage: true,
  coverageDirectory: "coverage",
  collectCoverageFrom: [
    "app/**/*.{js,jsx,ts,tsx}",
    "!app/**/*.d.ts",
    "!**/node_modules/**",
    "!**/.next/**",
    "!**/coverage/**",
    "lib/entities/**",
    "lib/validators/**"
  ],
  coverageReporters: [
    "text"
  ],

};

export default config;