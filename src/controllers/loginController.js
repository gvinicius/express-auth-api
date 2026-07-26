const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../../models/user');
const tokenHelper = require('../helpers/tokenHelper');

const saltRounds = 10;
const login = {};

// no mongoose import needed here

login.signup = function (req, res, next) {
  const { email, password } = req.body;

  User.collection.findOne({ email }).exec((findErr, user) => {
    if (findErr) {
      res.status(401).json({ err: findErr });
    }
    else if (user !== null) {
      res.status(409).json({ err: 'User already exists' });
    }
    else {
      bcrypt.hash(password, saltRounds).then((hash) => {
        User.collection.create({ email, password: hash }).then((newUser) => {
          res.status(200).json({ token: tokenHelper.generateToken(newUser.email) });
        }).catch((createErr) => {
          if (createErr.name === 'ValidationError') {
            res.status(422).json({ err: createErr.errors.email.message });
          }
          else {
            res.status(500).json(createErr);
          }
        });
      }).catch((hashErr) => {
        res.status(500).json({ err: hashErr });
      });
    }
  });
};

login.signin = function (req, res, next) {
  const { email, password } = req.body;

  User.collection.findOne({ email }).exec((findErr, user) => {
    if (findErr) {
      res.status(401).json({ err: findErr });
    }
    else if (user === null) {
      res.status(401).json({ err: 'Incorrect password or email' });
    }
    else {
      bcrypt.compare(password, user.password).then((result) => {
        if (result === true) {
          res.status(200).json({ token: tokenHelper.generateToken(user.email) });
        }
        else {
          res.status(401).json({ err: 'Incorrect password or email' });
        }
      }).catch((compareErr) => {
        res.status(500).json({ err: compareErr });
      });
    }
  });
};

module.exports = login;
