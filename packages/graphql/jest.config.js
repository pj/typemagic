/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  globals: {
    'ts-jest': {
        tsConfig: 'test/tsconfig.json'
    },
  },
  testMatch: [
      "<rootDir>/test/**/?(*.)+(spec|test).[jt]s?(x)"
    ] 
};