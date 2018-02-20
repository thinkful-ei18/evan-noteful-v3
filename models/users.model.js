'use strict';

const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  fullname: {
    type:String
  },
  username: {
    type:String,
    unique:true,
    required:true
  },
  password: {
    type:String,
    required:true
  }
});

UserSchema.set('toObject', {
  transform: function (doc,ret) {
    delete ret.password;
  }
});

UserSchema.methods.validatePassword = function (password) {
  return password === this.password;
};

module.exports = mongoose.model('User', UserSchema);
