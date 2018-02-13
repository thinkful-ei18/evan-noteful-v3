'use strict';

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const notesSchema = mongoose.Schema({
  title: {
    type:String,
    required:true
  },
  content:String,
  create: {
    type: Date, Default:Date.now
  },
});


notesSchema.set('toObject', {

  transform: function (doc,ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  }
});


module.exports = mongoose.model('Note', notesSchema);