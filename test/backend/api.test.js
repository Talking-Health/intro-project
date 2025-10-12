const { expect } = require('chai');
const request = require('supertest');
const http = require('http');
const api = require('../../lib/api');
const TestDatabase = require('../database-setup');

describe('API Module', () => {
  let server;
  let testServer;
  let testDb;

  before(async () => {
    testDb = new TestDatabase();
    await testDb.init();
    await testDb.seedTestData();
    // Create a test server
    server = http.createServer(async (req, res) => {
      const url = new URL(req.url, `http://localhost:3000`);
      let data = '';

      req.on('data', (chunk) => {
        data += chunk;
      });

      req.on('end', async () => {
        let receivedobj;
        try {
          receivedobj = JSON.parse(data);
        } catch (e) {
          // silent
        }

        if (req.url.startsWith('/api/')) {
          await api.handleapi(url, res, req, receivedobj);
        } else {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('404 - Not found');
        }
      });
    });

    testServer = request(server);
  });

  after(async () => {
    server.close();
    if (testDb) {
      await testDb.cleanup();
    }
  });

  describe('GET /api/people', () => {
    it('should return people data', (done) => {
      testServer
        .get('/api/people')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body).to.be.an('array');
          expect(res.body.length).to.be.greaterThan(0);
          done();
        });
    });

    it('should return people with correct structure', (done) => {
      testServer
        .get('/api/people')
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body[0]).to.have.property('id');
          expect(res.body[0]).to.have.property('name');
          expect(res.body[0]).to.have.property('email');
          expect(res.body[0]).to.have.property('notes');
          done();
        });
    });
  });

  describe('PUT /api/people', () => {
    it('should add a new person', (done) => {
      const newPerson = {
        name: 'Test Person',
        email: 'test@example.com',
        notes: 'Test notes',
      };

      testServer
        .put('/api/people')
        .send(newPerson)
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body).to.have.property('id');
          expect(res.body.name).to.equal(newPerson.name);
          expect(res.body.email).to.equal(newPerson.email);
          expect(res.body.notes).to.equal(newPerson.notes);
          done();
        });
    });

    it('should update an existing person', (done) => {
      const updatedPerson = {
        id: 1,
        name: 'Updated Name',
        email: 'updated@example.com',
        notes: 'Updated notes',
      };

      testServer
        .put('/api/people')
        .send(updatedPerson)
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body.id).to.equal(updatedPerson.id);
          expect(res.body.name).to.equal(updatedPerson.name);
          expect(res.body.email).to.equal(updatedPerson.email);
          expect(res.body.notes).to.equal(updatedPerson.notes);
          done();
        });
    });
  });

  describe('Invalid endpoints', () => {
    it('should return 404 for invalid API path', (done) => {
      testServer.get('/api/invalid').expect(404).end(done);
    });

    it('should return 404 for invalid HTTP method', (done) => {
      testServer.post('/api/people').expect(404).end(done);
    });
  });
});
