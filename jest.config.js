/*
 * jest.config.js
 * Copyright (C) 2020 vinicius <vinicius@debian>
 *
 * Distributed under terms of the MIT license.
 */
module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['./jest.setup.js'],
  coveragePathIgnorePatterns: [
    '/node_modules/'
  ]
};
