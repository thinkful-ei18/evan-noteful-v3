'use strict';
const mongoose = require('mongoose');

const FolderSchema = mongoose.Schema({
  name: {
    type:String,
    required:true,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref:'User'
  }
});


FolderSchema.set('toObject', {
  transform: function (doc,ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  }
});


FolderSchema.index({name:1, author:1}, {unique:true});

module.exports = mongoose.model('Folder', FolderSchema);


