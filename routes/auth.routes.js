'use strict';

/** global passport */
const jwt = require('jsonwebtoken');
const express = require('express');
const {JWT_SECRET, JWT_EXPIRY} = require('../config');
const router = express.Router();
// const passport = require('passport');


// Generate JWT for User
const createAuthToken = (user) => {
  return jwt.sign({user}, JWT_SECRET, {
    subject:user.username,
    expiresIn: JWT_EXPIRY
  });
};


// const User = require('../models/users.model');
// const options = { session: false, failWithError: true };
// const localAuth = passport.authenticate('local', options);
const localAuth = require('../passport/local');

router.post('/login', localAuth, (req, res) => {
  const authToken = createAuthToken(req.user);
  res.json({authToken}); 
});

// const jwtAuth = passport.authenticate('jwt', {session:false, failWithError:true});
const jwtAuth = require('../passport/jwt');

router.get('/refresh', jwtAuth, (req,res,next) => {
  const authToken = createAuthToken(req.user);
  console.log(authToken);
  res.json({authToken});
});

module.exports = router;