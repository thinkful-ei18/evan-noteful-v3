'use strict';
const app = require('../server');
const chai = require('chai');
const chaiHttp = require('chai-http');
const chaiSpies = require('chai-spies');
const expect = chai.expect;
const {JWT_SECRET, JWT_EXPIRY} = require('../config');
const Note = require('../models/notes.model');
const Folder = require('../models/folders.model');
const User = require('../models/users.model');
const Tag = require('../models/tags.models');
const jwt = require('jsonwebtoken');

chai.use(chaiHttp);
chai.use(chaiSpies);

const createAuthToken = (user) => {
  return jwt.sign({user}, JWT_SECRET, {
    subject:user.username,
    expiresIn: JWT_EXPIRY
  });
};



const validjwtToken =  createAuthToken({'username':'harvey', 'fullname':'Jimmy Stewart','id':'5a8e283ec634d7231c62cccd'});

describe('Creating a new User', function () {
  const newUser = {
    fullname:'Jimmy Stewart',
    username:'harvey',
    password:'password123'
  };
  it('Should return a new user when a valid post-body is sent', function (){
    return chai.request(app)
      .post('/v3/users')
      .send(newUser)
      .then((response) => {
        expect(response).to.have.status(201);
        expect(response.body).to.have.keys('username','fullname','id');
        expect(response.body).to.be.an('object');
        expect(response.body.fullname).to.equal('Jimmy Stewart');
        expect(response.body.username).to.equal('harvey');
      });
  });

  it('Should return a 400 error if the post body is missing required Fields', function () {
    return chai.request(app)
      .post('/v3/users')
      .send({'fullname':'Hi'})
      .catch(err => {
        expect(err).to.have.status(400);
      });
      
  });
});

describe('Logging In', function () {
  const username = 'evang522';
  const password = 'password123';
  const fullname = 'Evan Garrett';
  // const expectedjwtToken;
  it('Should return a valid JWT on login', function () {
    let authToken;
    return chai.request(app)
      .post('/v3/login')
      .send({ username, password})
      .then(response => {
        expect(response.body).to.be.an('object');
        expect(response).to.have.status(200);
        authToken = response.body.authToken;
        expect(jwt.verify(authToken,JWT_SECRET).user.fullname).to.equal('Evan Garrett');
        expect(jwt.verify(authToken,JWT_SECRET).user.username).to.equal('evang522');
        expect(jwt.verify(authToken,JWT_SECRET).user.id).to.equal('5a8e283ec634d7231c62cccd');
      });
  });


  const expiredToken = jwt.sign({username,password,fullname,exp: Math.floor(Date.now() / 1000) - 90}, JWT_SECRET);
  it('Should reject a user with an expired auth token', function () {
    return chai.request(app)
      .get('/v3/notes')
      .set({'authorization': expiredToken})
      .then((response) => {
        
      })
      .catch(err => {
        expect(err).to.have.status(400);
      });
  });
});




// describe.only('Refresh Token', function () {
//   it('Should return a token with a later expiration date', function () {
//     const currentExp = (Date.now()/1000 + 100);
//     const olderToken = jwt.sign({'username':'evang522', exp: currentExp}, JWT_SECRET);
//     console.log(olderToken);
//     return chai.request(app)
//       .get('/v3/auth/refresh')
//       .set({'authorization':`Bearer ${olderToken}`})
//       .then((response) => {
//         expect(response.exp).is.greaterThan(currentExp);
//       })
//       .catch(err => {
//         console.log(err);
//       });
//   });
// });
