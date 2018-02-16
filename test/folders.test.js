'use strict';
const app = require('../server');
const chai = require('chai');
const chaiHttp = require('chai-http');
const chaiSpies = require('chai-spies');
const expect = chai.expect;
const {TEST_MONGODB_URI} = require('../config');
const seedNotes = require('../db/seed/notes.json');
const mongoose = require('mongoose');
const Folder = require('../models/folders.model');
const seedFolders = require('../db/seed/folders.json');
const Note = require('../models/notes.model');

chai.use(chaiHttp);
chai.use(chaiSpies);



describe('GET /v3/folders', function () {
  it('Should return 4 folders', function () {
    return chai.request(app)
      .get('/v3/folders')
      .then((folders) => {
        expect(folders.body.length).to.equal(4);
        expect(folders.body[0]).to.have.keys('id','name');
        expect(folders).to.have.status(200);
        expect(folders).to.be.json;
      });
  });
});
