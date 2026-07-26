/* eslint no-undef: "error" */
/*
 * sample.test.js
 * Copyright (C) 2020 vinicius <vinicius@debian>
 *
 * Distributed under terms of the MIT license.
 */
const currentEnv = process.env;
const testConfig = {};
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const User = require('./models/user');

testConfig.db = require('./db/db');

testConfig.request = require('supertest');
testConfig.app = require('./src/app');

process.env = { TOKEN_KEY: 'SOME-KEY' };

testConfig.config = function () {
  let mongoServer;
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    process.env.MONGODB_URI = uri;
    await testConfig.db.start();
  });

  afterEach(async () => {
    await User.collection.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    if (mongoServer) {
      await mongoServer.stop();
    }
  });
};

module.exports = testConfig;
