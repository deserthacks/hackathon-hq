'use strict';
// jshint expr: true, unused: false

var factory = require('factory-lady');
var nock = require('nock');
var request = require('supertest');
var expect = require('chai').expect;

var app = require('../../../app');
var auth = require('../../../auth/auth.helpers');
var User = require('../user.model');

require('./user.factory')();

describe('User Requests', function() {
  var action, user, mock;

  //////////////////
  // Before hooks //
  //////////////////

  before(function(done) {
    User.remove().exec(done);
  });

  /////////////////
  // After hooks //
  /////////////////

  afterEach(function(done) {
    User.remove().exec(done);
  });

  ////////////////
  // Unit Tests //
  ////////////////

  describe('GET /api/users', function() {
    beforeEach(function(done) {
      action = request(app).get('/api/users');
      done();
    });

    it('is a valid route returning an array', function(done) {
      action
        .send()
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);

          expect(err).to.not.exist;
          expect(res).to.exist;
          expect(res.body).to.be.an('Array');
          done();
        });
    });
  });

  describe('GET /api/users/me', function() {
    beforeEach(function(done) {
      action = request(app).get('/api/users/me');
      done();
    });

    it('returns the authenticated user', function(done) {
      factory.create('user', function(user) {
        var token = auth.signToken(user);

        action
          .set('Authorization', 'Bearer '+ token)
          .send()
          .expect(200)
          .end(function(err, res) {
            if (err) return done(err);

            expect(res.body.email).to.equal(user.email);
            done();
          });
      });
    });
  });

  describe('POST /api/users', function() {
    beforeEach(function(done) {
      action = request(app).post('/api/users');
      mock = nock('https://api.sendgrid.com')
        .post('/api/mail.send.json')
        .reply(200, {
          message: 'success'
        });
      done();
    });

    it('creates a user on email and password and returns a bearer token', function(done) {
      action
        .send({email: Date.now() + '@example.com', password: 'password'})
        .expect(201)
        .end(function(err, res) {
          if (err) return done(err);

          expect(res).to.exist;
          expect(res.headers).to.have.property('x-bearer-token');
          done();
        });
    });

  });

  /**
   * Wrapper for token tests to allow use in multiple contexts
   *
   * @param  {Number} successStatusCode HTTP status code expecting on success,
   *                                    skips success tests if falsy
   *
   * @return {void}
   */
  var tokenTests = function(successStatusCode) {
    it('requires a bearer token',function(done) {
      action
        .send({name: 'changing name'})
        .expect(401)
        .end(done);
    });

    it('rejects other non-admin users', function(done) {
      factory.create('user', function(otherUser) {
        var token = auth.signToken(otherUser);

        action
          .set('Authorization', 'Bearer '+ token)
          .send({name: 'changing name'})
          .expect(403)
          .end(done);
      });
    });

    if (successStatusCode) {
      it('works with a valid bearer token', function(done) {
        var token = auth.signToken(user);

        action
          .set('Authorization', 'Bearer '+ token)
          .send({name: 'changing name'})
          .expect(successStatusCode)
          .end(done);
      });

      it('works with any admin bearer token', function(done) {
        factory.create('user', {role: 'admin'}, function(otherUser) {
          var token = auth.signToken(otherUser);

          action
            .set('Authorization', 'Bearer '+ token)
            .send({name: 'changing name'})
            .expect(successStatusCode)
            .end(done);
        });
      });
    }
  };

  describe('PUT /api/users/:id', function() {
    beforeEach(function(done) {
      factory.create('user', function(doc) {
        user = doc;
        action = request(app).put('/api/users/' + user.id);
        done();
      });
    });

    tokenTests(200);
  });

  describe('PUT /api/users/:id/verify', function() {
    beforeEach(function(done) {
      factory.create('user', function(doc) {
        user = doc;
      });
      mock = nock('https://api.sendgrid.com')
        .post('/api/mail.send.json')
        .reply(200, {
          message: 'success'
        });
      done();
    });

    it('should verify user with correct key', function(done) {
      var token = auth.signToken(user);

      request(app)
        .put('/api/users' + user.id + '/verify')
        .set('Authorization', 'Bearer' + token)
        .query({ token: user.verificationKey })
        .send()
        .expect(204)
        .end(done);
    });

    it('should fail with incorrect token', function(done) {
      var token = auth.signToken(user);

      request(app)
        .put('/api/users' + user.id + '/verify')
        .set('Authorization', 'Bearer' + token)
        .query({ token: 1234 })
        .send()
        .expect(400)
        .end(done);
    });
  });

  describe('PUT /api/users/:id/password', function() {
    beforeEach(function(done) {
      factory.create('user', function(doc) {
        user = doc;
        action = request(app).put('/api/users/' + user.id + '/password');
        done();
      });
    });

    tokenTests(false);

    it('requires oldPassword for non-admins', function(done) {
      var token = auth.signToken(user);

      action
        .set('Authorization', 'Bearer '+ token)
        .send({password: 'change password'})
        .expect(400)
        .end(done);
    });

    it('works when oldPassword is provided', function(done) {
      var token = auth.signToken(user);

      action
        .set('Authorization', 'Bearer '+ token)
        .send({oldPassword: 'password', password: 'newPassword'})
        .expect(204)
        .end(done);
    });

    it('works without oldPassword for admins', function(done) {
      factory.create('user', {role: 'admin'}, function(otherUser) {
        var token = auth.signToken(otherUser);

        action
          .set('Authorization', 'Bearer '+ token)
          .send({password: 'change password'})
          .expect(204)
          .end(done);
      });
    });

    it('updates the user\'s password', function(done) {
      var token = auth.signToken(user);

      action
        .set('Authorization', 'Bearer '+ token)
        .send({oldPassword: 'password', password: 'newPassword'})
        .expect(204)
        .end(function(err, res) {
          expect(err).to.not.exist;
          expect(res).to.exist;
          action = request(app)
            .post('/auth/local')
            .send({email: user.email, password: 'newPassword'})
            .expect(200)
            .end();
        });
    });
  });

  describe('DELETE /api/users/:id', function(done) {
    beforeEach(function(done) {
      factory.create('user', function(doc) {
        user = doc;
        action = request(app).delete('/api/users/' + user.id);
        done();
      });
    });

    tokenTests(204);
  });
});
