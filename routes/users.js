'use strict';

const express =require('express');
const router = express.Router();

// Bring in Models  
const User = require('../models/users.model');

router.post('/users', (req,res,next) => {
  const userFields = ['fullname','password','username'];
  const newUser = {};

  userFields.forEach(field => {
    // if (!(field in req.body)) {
    //   const err = new Error(`Missing ${field} field`);
    //   err.status = 404;
    //   return next(err);
    // }
    newUser[field] = req.body[field];
  });

  User.create(newUser)
    .then(response => {
      res.status(201).json(response);
    })
    .catch(next);
});


module.exports = router;