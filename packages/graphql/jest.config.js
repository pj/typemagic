/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  globals: {
    'ts-jest': {
        tsconfig: 'test/tsconfig.json'
    },
  },
  testMatch: [
      "<rootDir>/test/**/?(*.)+(spec|test).[jt]s?(x)"
    ] 
};