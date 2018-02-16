'use strict';
const mongoose = require('mongoose');

const { MONGODB_URI } = require('../../config');
const Note = require('../../models/notes.model.js');
const Folder = require('../../models/folders.model');
const Tag = require('../../models/tags.models');

const seedNotes = require('../../db/seed/notes.json');
const seedFolders = require('../../db/seed/folders.json');
const seedTags = require('../../db/seed/tags.json');


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
      return Folder.insertMany(seedFolders)
        .then(results => {
          console.log(`Inserted ${results.length} Folders`);
        });
    })
    .then(() => {
      Tag.insertMany(seedTags)
        .then((results) => {
          console.log(`Inserted ${results.length} Tags`);
        });
    })
    .then(() => {
      return Note.ensureIndexes();
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