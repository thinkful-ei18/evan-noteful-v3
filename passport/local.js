'use strict';

const User = require('../models/users.model');

// const localStrategy = new LocalStrategy(((username, password, done) => {
//   let user;
//   User.findOne({ username: username })
//     .then((_user) => {
//       user = _user;
//       if (!user) {
//         return Promise.reject({
//           message: 'User does not exist',
//         });
//       }
//       return user.validatePassword(password);
//     })
//     .then((isValid) => {
//       if (!isValid) {
//         return Promise.reject({
//           reason: 'LoginError',
//           message: 'Incorrect Password',
//           location: 'password',
//         });
//       }
//       return done(null, user);
//     })
//     .catch((err) => { 
//       done(err);
//     });
// }));

// module.exports = localStrategy;


const localStrategy = (req,res,next) => {
  if (!req.body) {
    const err = new Error('No credentials Provided');
    err.status = 400;
    return next(err);
  }
  let user;
  return User.findOne({username:req.body.username})
    .then(_user_ => {
      if (!_user_) {
        const err = new Error('You haven\'t signed up yet!');
        err.status = 400;
        return next(err);
      }
      user = _user_;
      return user.validatePassword(req.body.password);
    })
    .then(isValid => {
      if (!isValid) {
        const err = new Error('Username or password incorrect, please try again!');
        err.status = 400;
        return next(err);
      }
      req.user = user.serialize();
      next();
    });

};

module.exports = localStrategy;