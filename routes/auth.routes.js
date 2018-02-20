'use strict';

/*global passport*/
const express =require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/users.model');
const options = {sessions:false, failWithError:true};
const localAuth = passport.authenticate('local', options);


router.post('/login', localAuth, (req,res) => {
  console.log('made it here');
  console.log(req.user);
});

module.exports = router;