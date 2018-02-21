'use strict';

const { Strategy: LocalStrategy } = require('passport-local');
const User = require('../models/users.model');

const localStrategy = new LocalStrategy(((username, password, done) => {
  let user;
  User.findOne({ username: username })
    .then((_user) => {
      user = _user;
      if (!user) {
        return Promise.reject({
          message: 'User does not exist',
        });
      }
      return user.validatePassword(password);
    })
    .then((isValid) => {
      if (!isValid) {
        return Promise.reject({
          reason: 'LoginError',
          message: 'Incorrect Password',
          location: 'password',
        });
      }
      return done(null, user);
    })
    .catch((err) => {
      done(err);
    });
}));

module.exports = localStrategy;
