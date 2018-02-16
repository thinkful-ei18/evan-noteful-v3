'use strict';
const express =require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Require Folder Module
const Folder = require('../models/folders.model');

// Require Note Module
const Note = require('../models/notes.model');

//===================<MAIN GET ROUTE>==========================>
router.get('/folders', (req,res,next) => {
  Folder.find({})
    .sort({'name':1})
    .then(folders => {
      res.json(folders);
    })
    .catch(err => {
      next(err);
    });
});


//=============================>GET BY ID<=====================>

router.get('/folders/:id', (req,res,next) => {
  const {id} = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('This is an improperly formatted ID. Not only does what you\'re looking for not exist, it couldn\'t possibly exist!');
    err.status = 400;
    return next(err);
  }
  Folder.findById(id)
    .then(folder => {
      if (folder === null) {
        const err = new Error('A folder with this id was not found');
        err.status = 404;
        return next(err);
      } else {
        res.json(folder);
      }
    })
    .catch(err => {
      next(err);
    });
});

//======================>Create FOLDER ROUTE<=============================>
router.post('/folders', (req,res,next) => {
  if  (!('name' in req.body)) {
    const err = new Error('Missing name Field!');
    err.status = 400;
    return  next(err);
  }

  Folder.create({
    'name':req.body.name,
  })
    .then((newFolder) => {
      res.location(`${req.originalUrl}${newFolder.id}`).status(201).json(newFolder);
    })
    .catch(err => {
      if (err.code === 11000) {
        const err = new Error('An existing folder already has this name.');
        err.status = 400;
        return next(err);
      } 
      next(err);
    });
});

//==================================>UPDATE FOLDER ROUTE<========================>
router.put('/folders/:id', (req,res,next) => {
  const { id } = req.params;
  const {name} = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('This is an improperly formatted ID. Not only does what you\'re looking for not exist, it couldn\'t possibly exist!');
    err.status = 400;
    return next(err);
  }

  if (!name) {
    const err = new Error('No Update Data Supplied');
    err.status = 400;
    return next(err);
  }
  const updateObj = {
    'name':name,
  };

  Folder.findByIdAndUpdate(id, updateObj, {new:true})
    .then((response) => {
      if (response === null) {
        const err = new Error('A folder with this id was not found');
        err.status = 404;
        return next(err);
      }
      res.json(response);
    })
    .catch(err => {
      if (err.code === 11000) {
        const err = new Error('An existing folder already has this name.');
        err.status = 400;
        return next(err);
      }
      next(err);
    });
});



//============================>DELETE FOLDER ROUTE============================>
router.delete('/folders/:id', (req,res,next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('This is an improperly formatted ID. Not only does what you\'re looking for not exist, it couldn\'t possibly exist!');
    err.status = 400;
    return next(err);
  }

  Folder.findByIdAndRemove(id)
    .then((response) => {
      if (response === null) {
        const err = new Error('A folder with this id was not found.');
        err.status = 404;
        return next(err);
      }
    })
    .then(() => {
      Note.find({'folderId':id})
        .then((response) => {
          if (response.length) {
            const err = new Error('Cannot delete folder because it contains notes!');
            err.status = 400;
            return next(err);
          }
        });
    })
    .catch(err => {
      next(err);
    });
});


module.exports = router;
