'use strict';

const express = require('express');

const router = express.Router();


// Bring in Tag Model
const Tag = require('../models/tags.models');

// MAIN GET ROUTE

router.get('/tags', (req, res, next) => {
  Tag.find({'author':req.user.id})
    .then((response) => {
      res.json(response);
    })
    .catch((err) => {
      next(err);
    });
});

router.get('/tags/:id', (req, res, next) => {
  const { id } = req.params;
  Tag.findById(id)
    .select('name id author')
    .then((response) => {
      if (response === null) {
        const err = new Error('A Tag with this ID could not be found');
        err.status = 404;
        return next(err);
      }
      res.json(response);
    })
    .catch((err) => {
      if (err.path === '_id') {
        const err = new Error('The tag ID that you have requested does not exist. Not only does it not exist, it couldn\'t possibly exist!');
        err.status = 400;
        return next(err);
      }
      next(err);
    });
});


router.post('/tags/', (req, res, next) => {
  const { name } = req.body;

  // Validate Name field
  if (!name) {
    const err = new Error('Missing Name of Tag');
    err.status = 400;
    return next(err);
  }

  Tag.create({ name, author:req.user.id })
    .then((response) => {
      if (response === null) {
        const err = new Error('A tag with this id could not be found');
        err.status = 404;
        return next(err);
      }
      res.status(201).json(response);
    })
    .catch((err) => {
      next(err);
    });
});


router.put('/tags/:id', (req, res, next) => {
  const { id } = req.params;
  const { name } = req.body;
  // Validate Name field
  if (!name) {
    const err = new Error('Missing Name of Tag');
    err.status = 400;
    return next(err);
  }

  Tag.findByIdAndUpdate(id, { name }, { new: true })
    .select('id name author')
    .then((response) => {
      res.status(200).json(response);
    })
    .catch((err) => {
      if (err.path === '_id') {
        const error = new Error('The requested tag ID doesn\'t exist. Not only does it not exist, but it couldn\'t possibly exist!');
        error.status = 400;
        return next(error);
      }
      next(err);
    });
});


router.delete('/tags/:id', (req, res, next) => {
  const { id } = req.params;
  Tag.findByIdAndRemove(id)
    .then((response) => {
      if (response === null) {
        const err = new Error('A tag with this id could not be found');
        err.status = 404;
        return next(err);
      }
      res.status(204).end();
    })
    .catch((err) => {
      if (err.path === '_id') {
        const err = new Error('The requested tag ID doesn\'t exist. Not only does it not exist, but it couldn\'t possibly exist!');
        err.status = 400;
        return next(err);
      }
    });
});

// Export Module for Server.js access
module.exports = router;
