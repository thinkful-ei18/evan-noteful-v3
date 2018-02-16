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
const Folder = require('../models/folders.model');
const Tag = require('../models/tags.models');
const seedFolders = require('../db/seed/folders.json');


chai.use(chaiHttp);
chai.use(chaiSpies);


const dbCall = Tag.find();
const serverCall = chai.request(app).get('/v3/tags')

describe('GET /v3/tags', function () {
    it('should return a list of tags', function () {
        return Promise.all([serverCall,dbCall])
        .then(([serverRes,dbRes]) => {
            expect(serverRes).to.have.status(200);
            expect(serverRes.body.length).to.equal(4);
            expect(serverRes.body.length).to.equal(dbRes.length);
            expect(serverRes).to.be.json;
            expect(dbRes[0].name).to.equal('foo')
            expect(serverRes.body[0]).to.have.keys('id','name');
            expect(serverRes.body[0].name).to.equal('foo');
        })
    })

});


describe('GET /v3/tags:id', function () {
    it('Should return the correct tag with valid ID', function () {
        const ID = '222222222222222222222203';
        return chai.request(app)
            .get('/v3/tags/'+ID)
            .then(response => {
                expect(response).to.have.status(200);
                expect(response.body).to.have.keys('id','name');
                expect(response.body.name).to.equal('qux');
            });
    });
    
    it('Should return a 404 error for a non-existent tag ID', function () {
        const ID = '222222222222222222222209';
        return chai.request(app)
            .get('/v3/tags/'+ID)
            .catch(err => {
                expect(err).to.have.status(404);
            })
    });

    it('Should return a 400 error for an improperly formatted tag ID', function () {
        const ID = '2222222222222222abc1323';
        return chai.request(app)
        .get('/v3/tags/'+ID)
        .catch(err => {
            expect(err).to.have.status(400);
        })
    });
});

describe('POST /v3/tags', function () {
    const newTag = {"name":"Ich Bin so Mude"};
    let tag;
    it('Should create a tag with valid post query', function () {
        return chai.request(app)
            .post('/v3/tags')
            .send(newTag)
            .then((response) => {
                tag = response.body;
                expect(response).to.have.status(201);
                expect(response.body).to.have.keys('id','name');
                expect(response.body.name).to.equal("Ich Bin so Mude");

            return Tag.findById(tag.id)
                .then(data =>{
                    expect(data.name).to.equal(tag.name);
                    expect(data.id).to.equal(tag.id);
                })           
            });
    });

    it('Should return a 400 error when \'name\' body is missing', function () {
        return chai.request(app)
            .post('/v3/tags')
            .send({"title":"hey"})
            .catch(err => {
                expect(err).to.have.status(400);
            })
    });
});


describe('PUT /v3/tags', function () {
    const ID = '222222222222222222222201';
    const editTag = {"name":"Personal"};
    return chai.request(app)
        .put('/v3/notes/'+ID)
        .send(editTag)
        .then(response => {
            expect(response).to.have.status(204);
            expect(response.body).to.have.keys('id','name')
        })
})