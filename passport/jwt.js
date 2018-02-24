'use strict';
const jwt = require('jsonwebtoken');

const {JWT_SECRET} = require('../config');

const jwtAuth = (req,res,next) => {
  if (!req.headers.authorization) {
    const err = new Error('Not Authenticated, please Login');
    return next(err);
  }
  const token = req.headers.authorization.split(' ')[1];
  jwt.verify(token, JWT_SECRET, (err,info) => {
    if (err) {
      err.message = 'Session Expired, please login!';
      err.status = 400;
      return next(err);
    }
    req.user = info.user;
    next();
  });
};

module.exports = jwtAuth;