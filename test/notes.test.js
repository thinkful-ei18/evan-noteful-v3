'use strict';
const app = require('../server');
const chai = require('chai');
const chaiHttp = require('chai-http');
const chaiSpies = require('chai-spies');
const expect = chai.expect;
const {TEST_MONGODB_URI} = require('../config');
const {runServer, closeServer} = require('../server');
const seedNotes = require('../db/seed/notes.json');
const mongoose = require('mongoose');
const Note = require('../models/notes.model');



chai.use(chaiHttp);
chai.use(chaiSpies);


before(function () {
  return mongoose.connect(TEST_MONGODB_URI, { autoIndex: false });
});

beforeEach(function () {
  return Note.insertMany(seedNotes)
    .then(() => Note.ensureIndexes());
});

afterEach(function () {
  return mongoose.connection.db.dropDatabase();
});

after(function () {
  return mongoose.disconnect();
});


const dbCall = Note.find();
const serverCall = chai.request(app).get('/v3/notes');

describe('GET /v3/notes', function () {
  it('should return a list of 8 notes', function () {
    return Promise.all([dbCall,serverCall])
      .then(([dbresults,apiresults]) => {
        expect(dbresults.length).to.equal(8);
        expect(dbresults.length).to.equal(apiresults.body.length);
        expect(apiresults).to.be.json;
        expect(apiresults.body).to.be.a('array');
      });
  });
});

let note;
describe('GET /v3/notes/:id', function () {
  it('Should select the correct note when given a valid ID', function () {
    const id = '000000000000000000000004'; 
    return Note
      .findById(id)
      .then(_note => {
        note = _note;
        return chai.request(app)
          .get('/v3/notes/000000000000000000000004');
      })
      .then((response) => {
        expect(response).to.be.json;
        expect(response).to.have.status(200);
        expect(response.body).to.be.an('object');
        expect(response.body.id).to.equal(note.id);
        expect(response.body.title).to.equal(note.title);
        expect(response.body.content).to.equal(note.content);
      });

  });

  it('Should return a 404 when the wrong ID is supplied', function () {
    const id = '000000098270000000000004';
    return Note
      .findById(id)
      .then((note) => {
      })
      .catch(err => {
        expect(err).to.have.status(404);
      });
  });
});

let newNote;
const newObj = {"title":"My name is Bob", "content":"Bob is pretty cool"};

describe('POST /v3/notes', function() {
  it('Should create an item when a valid note is created', function () {
    return chai.request(app)
      .post('/v3/notes/')
      .send(newObj)
      .then((_newNote) => {
        newNote = _newNote.body;
        expect(_newNote).to.have.status(201);
        expect(_newNote).to.have.header('location');
        expect(_newNote).to.be.json;
        expect(_newNote).to.be.an('object');
        expect(_newNote.body).to.have.keys('id','title','content','create');
        return Note.findById(newNote.id);
      })
      .then(queryNote => {
        expect(newNote.content).to.equal(queryNote.content);
        expect(newNote.title).to.equal(queryNote.title);
        expect(newNote.id).to.equal(queryNote.id);
        expect(newObj.title).to.equal(queryNote.title);
      });
  });

  it('should throw an error when the user fails to post a required field', function () {
    const postData = {"content":"I am a penguin"};
    return chai.request(app)
      .post('/v3/notes')
      .send(postData)
      .then(response => {

      })
      .catch(err => {
        expect(err).to.have.status(400);
      });
  });
} );


describe('PUT /v3/notes/:id', function () {
  const id = '000000000000000000000000';
  const updateData = {
    "content":"I am a penguin"
  };
  return chai.request(app)
    .put('/v4/notes/000000000000000000000000')
    .send(updateData)
    .then((response) => {
      expect(response).to.have.status(200);
      expect(response.body).to.have.keys('title','content','create','id');
    });
});