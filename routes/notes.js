'use strict';

const express = require('express');
// Create an router instance (aka "mini-app")
const router = express.Router();
const Note = require('../models/notes.model');
const mongoose = require('mongoose');

/* ========== GET/READ ALL ITEM ========== */

router.get('/notes', (req, res, next) => {
  const {searchTerm} = req.query;
  const {folderId} = req.query;
  const {tagId} = req.query;
  const projection = {'title':1,'content':1,'create':1,'tags':1};


  const queries = {};

  if (searchTerm) {
    queries.$text = {
      $search:searchTerm
    };
    projection.score = {$meta :'textScore'};
  }

  if (tagId) {
    queries.tags = tagId;
  }

  if (folderId) {
    queries.folderId = folderId;
  }

  console.log(queries);
  Note.find(queries,projection)
    .populate('tags')
    .then(notes => {
      res.json(notes);
    });
});


/* ========== GET/READ A SINGLE ITEM ========== */
router.get('/notes/:id', (req, res, next) => {
  const { id } = req.params;

  // Query DB to search for Notes by ID
  Note.findById(id)
  
    .then(note => {
      if (note) {
        return res.json(note);
      } 
      const err = new Error('Note with this ID does not exist');
      err.status = 404;
      next(err);
    })
    .catch(err => {
      if (err.path === '_id') {
        err.status = 400;
        err.message = 'You\'ve requested an invalid Note ID. Not only does that not exist, but according to our schema it couldn\'t possibly exist. Good day sir.';
        next(err);
      } else {
        next(err);
      }
    });

});

/* ========== POST/CREATE AN ITEM ========== */
router.post('/notes', (req, res, next) => {
  const {folderId} = req.body;
  const requiredFields = ['title','content'];
  const newNote = {};

  requiredFields.forEach((field) => {
    if (!(field in req.body)) {
      const err = new Error(`Missing ${field} field!`);
      err.status = 400;
      next(err);
    } else {
      newNote[field] = req.body[field];
    }
  });

  if (folderId) {
    newNote.folderId = folderId;
  }

  Note.create(newNote)
    .then(response => {
      res.location(`/v3/notes/${response.id}`).status(201).json(response);
      // res.status(201).json(response);
    });
});
  



/* ========== PUT/UPDATE A SINGLE ITEM ========== */
router.put('/notes/:id', (req, res, next) => {
  const {id} = req.params;
  const updateObj = {};
  const {folderId} = req.body;
  const updateFields = ['title','content'];
  
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The requested ID is invalid');
    err.status = 400;
    return next(err);
  }

  updateFields.forEach(field => {
    if (field in req.body) {
      updateObj[field] = req.body[field];
    }
  });

  
  if (folderId) {
    updateObj.folderId = folderId;
  }


  Note.findByIdAndUpdate(id, updateObj, {new:true})
    .then(response => {
      if (response === null) {
        const err = new Error('Note with this id does not exist');
        err.status = 404;
        next(err);
      }
      res.json(response);
    })
    .catch(next);
});

/* ========== DELETE/REMOVE A SINGLE ITEM ========== */
router.delete('/notes/:id', (req, res, next) => {

  const { id } = req.params;

  Note.findByIdAndRemove(id)
    .then((response) => {
      if (response === null) {
        const err = new Error('Note with this ID could not be found!');
        err.status = 404;
        next(err);
      } else {
        // res.json(response);
        res.status(204).end();
      }
    })
    .catch(err => {
      if (err.path === '_id') {
        err.status = 404;
        err.message = 'You\'ve requested an invalid Note ID. Not only does that not exist, but according to our schema it couldn\'t possibly exist. Good day sir.';
        next(err);
      } else {
        next(err);
      }
    });

});

module.exports = router;