'use strict';
const app = require('../server');
const chai = require('chai');
const chaiHttp = require('chai-http');
const chaiSpies = require('chai-spies');
const expect = chai.expect;
const Folder = require('../models/folders.model');
const jwt = require('jsonwebtoken');
const {JWT_EXPIRY, JWT_SECRET} = require('../config');

chai.use(chaiHttp);
chai.use(chaiSpies);



const createAuthToken = (user) => {
  return jwt.sign({user}, JWT_SECRET, {
    subject:user.username,
    expiresIn: JWT_EXPIRY
  });
};


const validjwtToken =  createAuthToken({'username':'evang522', 'fullname':'Evan Garrett','id':'5a8e283ec634d7231c62cccd'});

const dbcall = Folder.find();
const servercall = chai.request(app).get('/v3/folders').set({'authorization':`Bearer ${validjwtToken}`});

describe('GET /v3/folders', function () {
  it('Should return 4 folders', function () {
    return Promise.all([servercall,dbcall])
      .then(([serverRes, dbRes]) => {
        expect(serverRes.body.length).to.equal(4);
        expect(dbRes.length).to.equal(serverRes.body.length);
        expect(serverRes.body[0]).to.have.keys('id','name','author');
        expect(serverRes).to.have.status(200);
        expect(dbRes).to.be.an('array');
        expect(dbRes[0].name).to.equal(serverRes.body[0].name);
      });
  });
});


describe('GET /v3/folders/:id', function () {
  it('Should return the first note when querying the first note ID', function () {
    const id = '111111111111111111111101';
    return chai.request(app)
      .get('/v3/folders/'+id)
      .set({'authorization':`Bearer ${validjwtToken}`})
      .then((response) => {
        expect(response.body.id).to.equal('111111111111111111111101');
        expect(response.body.name).to.equal('Drafts');
        expect(response).to.have.status(200);
        expect(response).to.be.json;
        return Folder.findById(id);
      })
      .then((folder) => {
        expect(folder.name).to.equal('Drafts');
        expect(folder.id).to.equal('111111111111111111111101');
      });
  });

  it('should return a 404 for non-existent ID', function () {
    const id = '111111111111111111111130';
    return chai.request(app)
      .get('/v3/folders/'+id)
      .set({'authorization':`Bearer ${validjwtToken}`})
      .catch(err => {
        expect(err.status).to.equal(404);
      });
  });
});

describe('POST /v3/folders', function () {
  it('Should create a new note when required fields are specified', function () {
    const newItem = {'name':'Jerry'};
    return chai.request(app)
      .post('/v3/folders')
      .set({'authorization':`Bearer ${validjwtToken}`})
      .send(newItem)
      .then((response) => {
        expect(response).to.have.status(201);
        expect(response).to.be.json;
        expect(response.body).to.have.keys('id','name','author');
        expect(response.body.name).to.equal('Jerry');
        return Folder.findById(response.body.id);
      })
      .then(folder => {
        expect(folder.name).to.equal('Jerry');
      });
  });

  it('Should return a 400 status error when the submission is missing a required field', function () {
    const newItem = {'title':'Moonland'};
    return chai.request(app)
      .post('/v3/folders')
      .set({'authorization':`Bearer ${validjwtToken}`})
      .send(newItem)
      .catch(err => {
        expect(err).to.have.status(400);
      });
  });
});