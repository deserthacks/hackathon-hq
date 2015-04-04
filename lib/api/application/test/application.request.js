// 'use strict';
// // jshint expr: true, unused: false

// var factory = require('factory-lady'),
//     nock = require('nock'),
//     request = require('supertest'),
//     expect = require('chai').expect;

// var app = require('../../../app'),
//     auth = require('../../../auth/auth.helpers'),
//     User = require('../application.model');

// require('./application.factory');

// describe('Application API requests', function() {
//   var action, user, mock;

//   //////////////////
//   // Before hooks //
//   //////////////////

//   before(function(done) {
//     User.remove().exec(done);
//   });

//   /////////////////
//   // After hooks //
//   /////////////////

//   afterEach(function(done) {
//     User.remove().exec(done);
//   });

//   describe('GET /api/applications', function() {
//     beforeEach(function(done) {
//       action = request(app).get('/api/applications');
//       done();
//     });

//     it('does not return array with insufficient permissions', function(done) {
//       action
//         .send()
//         .expect('Content-Type', /json/)
//         .expect(401)
//         .end(function(err, res) {
//           expect(res).to.exist;
//           expect(res.body.error).to.equal('valid user token is required');
//           done();
//         });
//     });

//     it('returns an array with correct permissions', function(done) {
//       factory.create('adminUser', function(admin) {
//         var token = auth.signToken(admin);

//         action
//           .set('Authorization', 'Bearer '+ token)
//           .send()
//           .expect(200)
//           .end(function(err, res) {
//             if(err) return done(err);
//             expect(err).to.not.exist;
//             expect(res).to.exist;
//             expect(res.body).to.be.an('Array');
//             done();
//           });
//       });
//     });
//   });

//   describe('POST /api/applications', function() {
//     beforeEach(function(done) {
//       action = request(app).post('/api/applications');
//       mock = nock('https://api.sendgrid.com')
//         .post('/api/mail.send.json')
//         .reply(200, {
//           message: 'success'
//         });
//       done();
//     });

//     it('should require authentication to create an application', function(done) {
//       action
//         .send()
//         .expect(401)
//         .end(function(err, res) {
//           if(err) return done(err);
//           expect(res).to.exist;
//           done();
//         });
//     });

//     it('should create application with proper authentication', function(done) {
//       var hackathon;

//       factory.create('hackathon', function(doc) {
//         hackathon = doc;
//       });

//       factory.create('user', function(user) {
//         var token = auth.signToken(user);

//         action
//           .set('Authorization', 'Bearer '+ token)
//           .send({ hackathon: hackathon.id, user: user.id })
//           .expect(201)
//           .end(function(err, res) {
//             if(err) return done(err);
//             expect(res).to.exist;
//             done();
//           });
//       });
//     });
//   });

//   describe('GET /api/applications/:id', function() {
//     var application, token;

//       factory.create('user', function(doc) {
//         user = doc;
//         token = auth.signToken(user);
//       });
//       factory.create('application', function(doc) {
//         application = doc;
//       });

//     it('should not return application without proper authentication', function(done) {
//       request(app)
//         .get('/api/applications/' + application.id)
//         .send()
//         .expect(401)
//         .end(function(err, res) {
//           if(err) return done(err);
//           expect(res).to.exist;
//           done();
//         });
//     });

//     it('should allow the creator of the application to access route', function(done) {
//       console.log('should allow creator', application);

//       request(app)
//         .get('/api/applications/' + application.id)
//         .set('Authorization', 'Bearer ' + token)
//         .send()
//         .expect(200)
//         .end(function(err, res) {
//           if(err) return done(err);
//           console.log('ERROR', err);
//           expect(res.body).to.exist;
//           expect(res.body.user.id).to.equal(user.id);
//           done();
//         });
//     });

//     it('should allow admin to access application', function(done) {
//       factory.create('adminUser', function(admin) {
//         action
//           .set('Authorization', 'Bearer ' + token)
//           .send()
//           .expect(200)
//           .end(function(err, res) {
//             if(err) return done(err);
//             expect(res.body).to.exist;
//             done();
//           });
//       });
//     });
//   });

//   describe('PUT /api/applications/:id', function() {
//     beforeEach(function(done) {
//       factory.create('application', function(application) {
//         action = request(app).put('/api/applications/' + applications.id);
//         done();
//       });
//     });

//     it('should not update application without proper permissions', function(done) {
//       action
//         .send()
//         .expect(401)
//         .end(function(err, res) {
//           if(err) return done(err);
//           expect(res.body).to.exist;
//           done();
//         });
//     });

//     it('should allow the creator to update the application', function(done) {
//       factory.create('user', function(user) {
//         var token = auth.signToken(user);

//         action
//           .set('Authorization', 'Bearer ' + token)
//           .send({ application: { swag: true }})
//           .expect(200)
//           .end(function(err, res) {
//             if(err) return done(err);
//             expect(res).to.exist;
//             expect(res.body).to.be.an('object');
//             done();
//           });
//       });
//     });
//   });

//   describe('PUT /api/applications/:id/approval', function() {
//     beforeEach(function(done) {
//       factory.create('application', function(application) {
//         action = request(app).put('/api/applications/' + application.id + '/approval');
//         done();
//       });
//     });

//     it('should not allow access with insufficient permissions', function(done) {
//       action
//         .send()
//         .expect(401)
//         .end(function(err, res) {
//           if(err) return done(err);
//           expect(res).to.exist;
//           done();
//         });
//     });

//     it('should allow an admin to access the route', function(done) {
//       factory.create('adminUser', function(admin) {
//         var token = auth.signToken(admin);

//         action
//           .set('Authorization', 'Bearer ' + token)
//           .send()
//           .expect(201)
//           .end(function(err, res) {
//             if(err) return done(err);
//             expect(res).to.exist;
//             done();
//           });
//       });
//     });
//   });

//   describe('PUT /api/applications/:id/rejection', function() {
//     beforeEach(function(done) {
//       factory.create('application', function(application) {
//         action = request(app).put('/api/applications/' + application.id + '/rejection');
//         done();
//       });
//     });

//     it('should not allow access with insufficient permissions', function(done) {
//       action
//         .send()
//         .expect(401)
//         .end(function(err, res) {
//           if(err) return done(err);
//           expect(res).to.exist;
//           done();
//         });
//     });

//     it('should allow an admin to access the route', function(done) {
//       factory.create('adminUser', function(admin) {
//         var token = auth.signToken(admin);

//         action
//           .set('Authorization', 'Bearer ' + token)
//           .send()
//           .expect(201)
//           .end(function(err, res) {
//             if(err) return done(err);
//             expect(res).to.exist;
//             done();
//           });
//       });
//     });
//   });

//   describe('DELETE /api/applications', function() {
//     beforeEach(function(done) {
//       factory.create('application', function(application) {
//         action = request(app).del('/api/applications/' + application.id);
//         done();
//       });
//     });

//     it('should not allow access with insufficient permissions', function(done) {
//       action
//         .send()
//         .expect(401)
//         .end(function(err, res) {
//           if(err) return done(err);
//           expect(res).to.exist;
//           done();
//         });
//     });

//     it('should allow an admin to access the route', function(done) {
//       factory.create('adminUser', function(admin) {
//         var token = auth.signToken(admin);

//         action
//           .set('Authorization', 'Bearer ' + token)
//           .send()
//           .expect(201)
//           .end(function(err, res) {
//             if(err) return done(err);
//             expect(res).to.exist;
//             done();
//           });
//       });
//     });
//   });

// });