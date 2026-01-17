const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../../models/user.js');
const tokenHelper = require('../helpers/tokenHelper.js');

const saltRounds = 10;
const login = {};

const mongoose = require('mongoose');

login.signup = function (req, res, next) {
  const { email, password } = req.body;

  User.collection.findOne({ email }).exec((err, user) => {
    if (err) {
      res.status(401).json({ err });
    }
    else if (user !== null) {
      res.status(409).json({ err: 'User already exists' });
    }
    else {
      bcrypt.hash(password, saltRounds).then((hash) => {
        User.collection.create({ email, password: hash }).then((newUser) => {
          res.status(200).json({ token: tokenHelper.generateToken(newUser.email) });
        }).catch((err) => {
          if (err.name == 'ValidationError') {
            res.status(422).json({ err: err.errors.email.message });
          }
          else {
            res.status(500).json(err);
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

  User.collection.findOne({ email }).exec((err, user) => {
    if (err) {
      res.status(401).json({ err });
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
