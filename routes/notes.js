'use strict';

const express = require('express');
// Create an router instance (aka "mini-app")
const router = express.Router();
const Note = require('../models/notes.model');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Folder = require('../models/folders.model');
const Tag = require('../models/tags.models');

/* ========== GET/READ ALL ITEM ========== */

router.get('/notes', (req, res, next) => {
  const {searchTerm} = req.query;
  const {folderId} = req.query;
  const {tagId} = req.query;
  const projection = {'title':1,'content':1,'create':1,'tags':1, 'author':1};

  const queries = {};
  queries.author = req.user.id;

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
  Note.findOne({_id:id, author:req.user.id})
    .select('title content create tags author')
    .populate('tags')
  
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
  const {folderId, tags} = req.body;
  const requiredFields = ['title','content'];
  const newNote = {};

  if (tags) { 
    tags.forEach((tag) => {
      if (!mongoose.Types.ObjectId.isValid(tag)) {
        const err = new Error('This is an improperly formatted ID. Not only does what you\'re looking for not exist, it couldn\'t possibly exist!');
        err.status = 400;
        return next(err);
      }
    });
    newNote.tags = tags;
  }


  requiredFields.forEach((field) => {
    if (!(field in req.body)) {
      const err = new Error(`Missing ${field} field!`);
      err.status = 400;
      next(err);
    } else {
      newNote[field] = req.body[field];
    }
  });

  // Assign Author Id to note -- Req.user is the author
  newNote.author = req.user.id;


  // If the new note does not have any assigned folders or tags, validation for folders and tags is not necessary. 
  // We can just create the item.
  if (!folderId && tags.length === 0) {
    Note.create(newNote)
      .then((response) => {
        res.location(`/v3/notes/${response.id}`).status(201).json(response);
      });
  }


  // If there is a folderId, we need to validate that the folder it is being associated with belongs to this user
  // We also need to check to see if the tags that are being assigned to the item (because at this point in the data flow, 
  // we know that there is at least one tag being associated with the note) belong to the user.
  if (folderId) {
    newNote.folderId = folderId;

    return Promise.all([checkTags(tags,req.user.id),checkFolders(folderId,req.user.id)])
      .then(() => {
        return Note.create(newNote);
      })
      .then((note) => {
        res.location(`/v3/notes/${note.id}`).status(201).json(note);
      })
      .catch(err => {
        return next(err);
      });
  }

});
  



// GLOBAL helper functions
const checkTags = (tagsArr, userId) => {
  return new Promise((resolve, reject) => {
    if (!tagsArr) {
      return resolve('Valid');
    }
    if (tagsArr.length === 0) {
      return resolve('Valid');
    }
    return Tag.find({'author':userId})
      .then((myTags) => {
        const myTagIds = [];
        myTags.forEach((tag) => {
          myTagIds.push(tag.id);
        });

        tagsArr.forEach((tag)=>{
          if (!(myTagIds.includes(tag))) {
            const err = new Error('An associated tag does not exist in your acccount');
            return reject(err);
          }
        });

        return resolve('Valid');
      });
  });
};



const checkFolders = (folderId,userId) => {
  return Folder.find({'_id':folderId, 'author':userId})
    .then(folder =>{
      if (!folder) {
        return Promise.reject({
          'Message':'The associated Folder does not exist in your account'
        });
      }
      return Promise.resolve('Valid');
    });  
};


/* ========== PUT/UPDATE A SINGLE ITEM ========== */
router.put('/notes/:id', (req, res, next) => {
  const {id} = req.params;
  const updateObj = {};
  const {folderId,tags} = req.body;
  const updateFields = ['title','content'];
  
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The requested ID is invalid');
    err.status = 400;
    return next(err);
  }

  if (tags) { 
    tags.forEach((tag) => {
      if (!mongoose.Types.ObjectId.isValid(tag)) {
        const err = new Error('This is an improperly formatted ID. Not only does what you\'re looking for not exist, it couldn\'t possibly exist!');
        err.status = 400;
        return next(err);
      }
    });
    updateObj.tags = tags;
  }

  updateFields.forEach(field => {
    if (field in req.body) {
      updateObj[field] = req.body[field];
    }
  });

  return Note.findById(id)
    .then((response) => {
      if (response === null) {
        const err = new Error('Note does not exist!');
        err.status = 404;
        return Promise.reject(err);
      }
      if (response.author.toString() !== req.user.id) {
        const err = new Error('Note does not exist for your account');
        err.status = 404;
        return Promise.reject(err);
      }

      console.log('response: ',response);
    })
    .then(() => {
      return Promise.all([checkTags(tags,req.user.id),checkFolders(folderId,req.user.id)]);
    })
    .then(() => {
      return Note.findByIdAndUpdate(id, updateObj,{new:true});
    })
    .then((note) => {
      res.status(200).json(note);
    })
    .catch(err => {
      return next(err);
    });


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