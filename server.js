'use strict';

const express = require('express');
const morgan = require('morgan');
const { PORT } = require('./config');
const notesRouter = require('./routes/notes');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const {MONGODB_URI} = require('./config');

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

// Mount router on "/api"
app.use('/v3', notesRouter);

// Catch-all 404
app.use(function (req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// Catch-all Error handler
// Add NODE_ENV check to prevent stacktrace leak
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: app.get('env') === 'development' ? err : {}
  });
});


// let server;

// function runServer(MONGODB_URI) {
//   return new Promise((resolve,reject) => {
//     mongoose.connect(MONGODB_URI, err => {
//       if (err) 
//         return reject(err);
//     });
//     server = app.listen(PORT, () => {
//       console.log(`Server listening on ${PORT}`);
//       resolve();
//     })
//       .on('error', err => {
//         mongoose.disconnect();
//         reject(err);
//       });
//   });
// }



// const closeServer = () => {
//   return mongoose.disconnect().then(() => {
//     return new Promise((resolve,reject) => {
//       console.log('Closing Server');
//       server.close(err => {
//         if (err) {
//           return reject(err);
//         }
//         resolve();
//       });
//     });
//   });
// };

// if (require.main === module) {
//   runServer();
// }

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