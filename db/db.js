/*
 * db.js
 * Copyright (C) 2020 vinicius <vinicius@debian>
 *
 * Distributed under terms of the MIT license.
 */
const mongoose = require('mongoose');

const db = {};

// Silence Mongoose strictQuery deprecation and lock desired behavior
mongoose.set('strictQuery', true);

db.start = async () => {
  try {
    // Avoid opening multiple connections across tests/suites
    // readyState: 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/livepoetry', { useNewUrlParser: true });
    }
  }
  catch (e) {
    console.log(e);
    throw e;
  }
};

module.exports = db;
