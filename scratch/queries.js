'use strict';

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const { MONGODB_URI } = require('../config');
const Note = require('../models/notes.model');

mongoose.connect(MONGODB_URI)
  .then(() => Note.ensureIndexes())
  .then(() => {
    return Note.find({})
      .then(notes => {
        console.log(notes);
      });
  });