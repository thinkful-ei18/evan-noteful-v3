'use strict';

const express = require('express');
// Create an router instance (aka "mini-app")
const router = express.Router();
const Note = require('../models/notes.model');
/* ========== GET/READ ALL ITEM ========== */
router.get('/notes', (req, res, next) => {
  console.log('Get All Notes');
  Note.find({})
    .then((notes) => {
      res.json(notes);
    });
}   
);


/* ========== GET/READ A SINGLE ITEM ========== */
router.get('/notes/:id', (req, res, next) => {
  const { id } = req.params;

  // Query DB to search for Notes by ID
  Note.findById(id)
    .then(note => {
      if (note) {
        res.json(note);
      } else {
        console.log('err');
        const err = new Error('Note with this ID does not exist');
        err.status = 404;
        next(err);
      }
    })
    .catch(err => {
      err.message = 'There was an error';
      err.status = 404;
      next(err);
    });

});

/* ========== POST/CREATE AN ITEM ========== */
router.post('/notes', (req, res, next) => {

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

  Note.create(newNote)
    .then(response => {
      res.status(201).json(response);
    });
});
  
// res.location('path/to/new/document').status(201).json({ id: 2 });


/* ========== PUT/UPDATE A SINGLE ITEM ========== */
router.put('/notes/:id', (req, res, next) => {
  const {id} = req.params;
  const updateObj = {};
  const updateFields = ['title','content'];

  updateFields.forEach(field => {
    if (field in req.body) {
      updateObj[field] = req.body[field];
    }
  });

  Note.findByIdAndUpdate(id, updateObj, {new:true})
    .then(response => {
      res.json(response);
    }); 

});

/* ========== DELETE/REMOVE A SINGLE ITEM ========== */
router.delete('/notes/:id', (req, res, next) => {

  const { id } = req.params;

  Note.findByIdAndRemove(id)
    .then((response) => {
      res.status(204).json(response);
    });

});

module.exports = router;