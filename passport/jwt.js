'use strict';

const {JWT_SECRET} = require('../config');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const options = {
  secretOrKey: JWT_SECRET,
  jwtFromRequest:ExtractJwt.fromAuthHeaderWithScheme('Bearer'),
  algorithms: ['HS256']
};

const jwtstrategy = new JwtStrategy(options, (payload, done) => {
  done(null, payload.user);
});

module.exports = jwtstrategy;