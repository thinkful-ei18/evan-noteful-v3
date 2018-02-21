'use strict';

const express = require('express');

const router = express.Router();

// Bring in Models  */
const User = require('../models/users.model');

router.post('/users', (req, res, next) => {
  
  
  if (!req.body.username || !req.body.password) {
    const err = new Error('Missing Username or Password field');
    err.status = 400;
    return next(err);
  }
  
  Object.keys(req.body).forEach((field) => {
    if (typeof req.body[field] !== 'string') {
      const err = new Error('Invalid data type sent to server. (Hint, the server is looking for strings only');
      err.status = 400;
      return next(err);
    }
    
    if (req.body[field].trim().length !== req.body[field].length) {
      const err = new Error('Username or password fields contain whitespace. That\'s a bad thing');
      err.status = 400;
      return next(err);
    }
    
    if (field === 'username' && field.length < 1) {
      const err = new Error('username needs to be more than one Character.');
      err.status = 400;
      return next(err);
    }
    
    if (field === 'password') {
      if (field.length < 8) {
        const err = new Error('Minimum password length is 8 characters');
        err.status = 400;
        return next(err);
      }
      if (field.length > 72 ) {
        const err = new Error('Max password length is 72 characters');
        err.status - 400;
        return next(err);
      }
    } 
  });
  
  const { username, password, fullname } = req.body;
  
  return User.hashPassword(password)
    .then((digest) => {
      const newUser = {
        username,
        password: digest,
        fullname,
      };
      return User.create(newUser);
    })
    .then((response) => {
      res.status(201).json(response);
    })
    .catch((err) => {
      if (err.code === 11000) {
        err = new Error('The username already exists');
        err.status = 400;
      }
      next(err);
    });
});


module.exports = router;
