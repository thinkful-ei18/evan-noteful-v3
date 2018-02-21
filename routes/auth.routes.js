'use strict';

/** global passport */

const express = require('express');

const router = express.Router();
const passport = require('passport');

// const User = require('../models/users.model');
const options = { session: false, failWithError: true };
const localAuth = passport.authenticate('local', options);
router.post('/login', localAuth, (req, res) => {
  res.json(req.user);
});

module.exports = router;