'use strict';

const mongoose = require('mongoose');

const notesSchema = new mongoose.Schema({
  title: {
    type: String,
    required:true,
    index:true
  },
  content:{
    type: String,
    index:true
  },
  create: {
    type: Date,
    default:Date.now
  },
  folderId: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Folder' }
  },{
  tags: [{type:mongoose.Schema.Types.ObjectId, ref:'tag'}]
  }
);

notesSchema.index({title: 'text', content:'text'}, {weights: {title:2, content:1}});

notesSchema.set('toObject', {

  transform: function (doc,ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  }
});


module.exports = mongoose.model('Note', notesSchema);
