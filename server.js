'use strict';
require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const { PORT } = require('./config');
const notesRouter = require('./routes/notes');
const foldersRouter = require('./routes/folders');
const tagsRouter = require('./routes/tags');
const mongoose = require('mongoose');
const { MONGODB_URI } = require('./config');
const audioRouter = require('./routes/audio');
const usersRouter = require('./routes/users');
const loginRouter = require('./routes/auth.routes');
const jwtStrategy = require('./passport/jwt');
const passport = require('passport');
const localStrategy = require('./passport/local');


// Create an Express application
const app = express();

// Log all requests. Skip logging during
app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'common', {
  skip: () => process.env.NODE_ENV === 'test'
}));

// Create a static webserver
app.use(express.static('public'));

// Parse request body
app.use(express.json());

// Passport Init
passport.use(localStrategy);
passport.use(jwtStrategy);

// Mount users and login router, will not be protected
app.use('/v3', usersRouter);
app.use('/v3', loginRouter);
app.use('/v3', audioRouter);
const authenticatejwt = passport.authenticate('jwt', {session: false, failWithError:true});

app.use(authenticatejwt);
// // Mount router on "/api"
app.use('/v3', notesRouter);
app.use('/v3', foldersRouter);
app.use('/v3', tagsRouter);


// Catch-all 404
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// Catch-all Error handler
// Add NODE_ENV check to prevent stacktrace leak
app.use((err, req, res) => {
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: app.get('env') === 'development' ? err : {},
  });
});


if (require.main === module) {
  mongoose.connect(MONGODB_URI)
    .then(() => {
      console.log('DB Connected');
    });

  app.listen(PORT, () => {
    console.log(`App is now listening on port ${PORT}`);
  });
}

module.exports = app;
