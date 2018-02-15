'use strict';
const mongoose = require('mongoose');

const FolderSchema = mongoose.Schema({
  name: {
    type:String,
    required:true,
    unique:true
  }
});


FolderSchema.set('toObject', {
  transform: function (doc,ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  }
});

module.exports = mongoose.model('Folder', FolderSchema);


