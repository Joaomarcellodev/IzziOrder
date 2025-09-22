import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest', 
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'], // carrega antes dos testes
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],

  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
};

export default config;
