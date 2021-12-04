/*
 * user_test.js
 * Copyright (C) 2020 vinicius <vinicius@debian>
 *
 * Distributed under terms of the MIT license.
 */
const bcrypt = require('bcrypt');
const User = require('../../models/user.js');
const testConfig = require('../../testConfig.js');

const saltRounds = 10;
testConfig.config();
const password = 'some-pass';
const email = 'someuser@somemail.com';

describe('When to create an user', () => {
  it('creates normally with the correct params', async () => {
    await bcrypt.hash(password, saltRounds).then((hash) => {
      User.collection.create({ email, password: hash }).then((newUser) => {
        expect(newUser.id).toBeTruthy();
      });
    });
  });

  it('does not create a user without email', async () => {
    const email = '';

    await bcrypt.hash(password, saltRounds).then((hash) => {
      User.collection.create({ email, password: hash }).then((newUser) => {null}).catch((err) => {
        expect(err.errors.email.message).toBe("Path `email` is required.");
      });
    });
  });

  it('does not create a user with email in not valid format', async () => {
    const email = 't@a.a';

    await bcrypt.hash(password, saltRounds).then((hash) => {
      User.collection.create({ email, password: hash }).then((newUser) => {null}).catch((err) => {
        expect(err.errors.email.message).toBe('Please fill a valid email address');
      });
    });
  });

  it('does not create a user with a too long email', async () => {
    const email = 'some-large-email-larger-than-60-chars-because-life-is-that@email.com';

    await bcrypt.hash(password, saltRounds).then((hash) => {
      User.collection.create({ email, password: hash }).then((newUser) => {null}).catch((err) => {
        expect(err.errors.email.message).toBe('Maximum is 60 characters');
      });
    });
  });
});
