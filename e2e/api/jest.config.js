module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': ['ts-jest', {
      tsconfig: {
        target: 'ES2022',
        module: 'commonjs',
        lib: ['ES2022', 'DOM'],
        strict: false,
        esModuleInterop: true,
        skipLibCheck: true,
        types: ['jest', 'node'],
        noEmit: true,
      },
      diagnostics: false,
    }],
  },
  testEnvironment: 'node',
  testTimeout: 30000,
  verbose: true,
  // Run sequentially to avoid rate limiting (auth throttle: 10/min)
  maxWorkers: 1,
  // Add delay between test suites
  globalSetup: undefined,
};
