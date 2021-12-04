/* eslint no-undef: "error" */
/*
 * sample.test.js
 * Copyright (C) 2020 vinicius <vinicius@debian>
 *
 * Distributed under terms of the MIT license.
 */
const User = require('../../models/user.js');

const currentEnv = process.env;
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const saltRounds = 10;

const testConfig = require('../../testConfig.js');
testConfig.config();

const { email, password } = { email: 'someone@email.com', password: 'some-passs' };

describe('When to process auth to create an user', () => {
  it('should save user to database for not existing user', async () => {
    const res = await testConfig.request(testConfig.app).post('/signup').send({
      email,
      password
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeTruthy();
  });


  it('does not create a user with very short email, less than 6 characters', async () => {
    const email = 't@a.a';

    const res = await testConfig.request(testConfig.app).post('/signup').send({
      email,
      password
    });
    expect(res.statusCode).toBe(422);
    expect(res.body.err).toBe('Please fill a valid email address');
  });

  it('does not create a user with very large email, more than 60 characters', async () => {
    const email = 'some-large-email-larger-than-60-chars-because-life-is-that@email.com';

    const res = await testConfig.request(testConfig.app).post('/signup').send({
      email,
      password
    });
    expect(res.statusCode).toBe(422);
    expect(res.body.err).toBe('Maximum is 60 characters');
  });
});

describe('When to process to signin an user', () => {
  it('does not signin with a bad password for an existing user', async () => {
    const someGoodPassword = 'some-good-password';
    const someBadPassword = 'some-bad-password';
    await bcrypt.hash(password, saltRounds).then((hash) => {
      User.collection.create({ email, password: someGoodPassword });
    });

    const res = await testConfig.request(testConfig.app).post('/signin').send({
      email,
      password: someBadPassword
    });
    expect(res.statusCode).toBe(401);
    expect(res.body.err).toBe('Incorrect password or email');
  });
});
