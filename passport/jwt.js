'use strict';
const jwt = require('jsonwebtoken');

const {JWT_SECRET} = require('../config');

const jwtAuth = (req,res,next) => {
  if (!req.headers.authorization) {
    const err = new Error('Not Authenticated, please Login');

  }
  if (req.headers.authorization) {
    const token = req.headers.authorization.split(' ')[1];
    jwt.verify(token, JWT_SECRET, (err,userInfo) => {
      if (err) {
        err.message = 'Not Authenticated, please Login';
        res.json({err});
      } else {
        req.user = userInfo;
        next();
      }
    });
  }
};

module.exports = jwtAuth;