'use strict';
const mongoose = require('mongoose');

const tagSchema = mongoose.Schema({
  name: {
    type:String,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref:'User'
  }
});


tagSchema.set('toObject', {
  transform: function transform(doc,ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  }
});

tagSchema.index({name:1, author:1}, {unique:true});


module.exports = mongoose.model('Tag', tagSchema);