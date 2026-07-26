const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../../models/user');

const saltRounds = 10;
const auth = {};

// no mongoose import needed here

auth.proctectRoute = function (req, res, next) {
  if (req.headers.authorization) {
    const token = (req.headers.authorization || '').replace('Bearer ', '');
    jwt.verify(token, process.env.TOKEN_KEY, (err, decoded) => {
      if (err) {
        res.status(401).json({ err });
      }
      else {
        res.status(200).json({ email: decoded.email });
      }
    });
  }
  else {
    res.status(401).json({ err: 'Missing token' });
  }
};

module.exports = auth;
