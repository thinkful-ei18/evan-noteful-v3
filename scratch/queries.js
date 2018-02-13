'use strict';
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const { MONGODB_URI } = require('../config');
const Note = require('../models/notes.model');


mongoose.connect(MONGODB_URI)
  .then(result => {
    console.log('DB Connected');
  });

const searchTerm = 'Lorem';

let reg;
if (searchTerm) {
  reg = new RegExp(searchTerm, 'i');
}

Note.find({$or: [ {"title": {$regex:reg}},{"content":{$regex:reg}}]})
  .then(results => {
    console.log(results);
  });