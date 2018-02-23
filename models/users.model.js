'use strict';

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  fullname: {
    type: String,
    default:''
  },
  username: {
    type: String,
    unique: true,
    required: true
  },
  password: {
    type: String,
    required: true
  },
});

UserSchema.set('toObject', {
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__V;
    delete ret.password;
  },
});

UserSchema.methods.validatePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

UserSchema.statics.hashPassword = function (password) {
  return bcrypt.hash(password, 10); 
};

UserSchema.methods.serialize = function () {
  return {
    fullname:this.fullname,
    username:this.username,
    id:this._id
  };
};

module.exports = mongoose.model('User', UserSchema);
