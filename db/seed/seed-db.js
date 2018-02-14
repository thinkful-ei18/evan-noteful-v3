'use strict';
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const { MONGODB_URI } = require('../../config');
const Note = require('../../models/notes.model.js');

const seedNotes = require('../../db/seed/notes');


const seedDB = () => {
  mongoose.connect(MONGODB_URI)
    .then(() => {
      return mongoose.connection.db.dropDatabase()
        .then(result => {
          console.info(`Dropped Database: ${result}`);
        });
    })
    .then(() => {
      return Note.insertMany(seedNotes)
        .then(results => {
          console.info(`Inserted ${results.length} Notes`);
        });
    })
    .then(() => {
      return mongoose.disconnect()
        .then(() => {
          console.info('Disconnected');
        });
    })
    .catch(err => {
      console.error(`ERROR: ${err.message}`);
      console.error(err);
    });

};

if (require.main === module) {
  seedDB();
}
module.exports = seedDB;