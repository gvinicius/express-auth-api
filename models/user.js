const mongoose = require('mongoose');

const User = {};

const validateEmail = function (email) {
  const re = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  return re.test(email);
};

User.schema = new mongoose.Schema({
  email: {
    type: String,
    lowercase: true,
    trim: true,
    validate: [validateEmail, 'Please fill a valid email address'],
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address'],
    required: true,
    minlength: [6, 'Minimum is 6 characters'],
    maxlength: [60, 'Maximum is 60 characters'],
    unique: true
  },
  password: {
    type: String,
    required: true,
    minlength: [6, 'Minimum is 6 characters'],
    maxlength: [60, 'Maximum is 60 characters']
  },
  createdAt: {
    type: Date,
    default: Date.now()
  }
});

User.collection = mongoose.model('collection', User.schema);

module.exports = User;
