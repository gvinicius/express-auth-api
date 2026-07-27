/*
 * jest.setup.js
 * Copyright (C) 2020 vinicius <vinicius@debian>
 *
 * Distributed under terms of the MIT license.
 */
jest.setTimeout(30000);

// Ensure Mongoose does not warn about strictQuery default change in tests
const mongoose = require('mongoose');
mongoose.set('strictQuery', true);
