'use strict';

var _ = require('lodash'),
    fs = require('fs'),
    HttpError = require('http-error').HttpError;

var auth = require('../../auth/auth.helpers'),
    mail = require('../../mail'),
    config = require('../../config'),
    User = require('./user.model');

var UserController = {

  /** Create */

  create: function(req, res, next) {
    User.create(req.body, function(err, user) {
      if(err) return next(err);
      res.status(201);
      mail.verifyEmail(user);
      auth.createToken(res, user);
    });
  },

  /** Read */

  index: function(req, res, next) {
    User.find(function(err, users) {
      if(err) return next(err);
      var profiles = _.map(users, function(user) {
        return user.profile;
      });
      res.json(profiles);
    });
  },

  show: function(req, res, next) {
    res.json(req.user.profile);
  },

  me: function(req, res, next) {
    res.json(req.currentUser.profile);
  },

  /** Update **/

  update: function(req, res, next) {
    User.findById(req.params.id, function (err, user) {
      if (err) next(err);
      if(!user) { return res.status(404); }
      var updated = _.merge(user, req.body);
      updated.save(function (err) {
        if (err) next(err);
        return res.json(200, user);
      });
    });
  },

  verifyEmail: function(req, res, next) {
    var userKey = req.body.key;
    if(userKey == req.user.verificationKey) {
      req.user.set({ path: 'verified' }, true, Boolean);
      req.user.save(function(err, user) {
        if(err) return next(err);

        mail.onRegistration(user);
      });
    } else {
      return next(new HttpError('invalid verification key', 400));
    }
  },

  changePassword: function(req, res, next) {
    if(req.currentUser.role !== 'admin' && !req.user.authenticate(req.body.oldPassword))
      return next(new HttpError('oldPassword must be provided', 400));

    req.user.safeUpdate({}, { password: req.body.password }, function(err) {
      if(err) return next(err);
      res.status(204).end();
    });
  },

  /** Delete */

  destroy: function(req, res, next) {
    req.user.remove(function(err){
      if(err) return next(err);
      res.status(204).end();
    });
  },

  /** Collections */

  getHackathons: function(req, res, next) {
    req.user.populate({ path: 'hackathons', model: 'Attendee' }, function(err, attendees) {
      if(err) return next(err);
      if(!attendees) return next(new HttpError('user has not been an attendee at a hackathon', 400));
      res.json(attendees);
    });
  },

  getApplications: function(req, res, next) {
    req.user.populate({ path: 'applications', model: 'Application' }, function(err, applications) {
      if(err) return next(err);
      if(!applications) return next(new HttpError('user does not have any applications', 400));
      res.json(applications);
    });
  },

  /** Helpers */

  authenticateSelf: function(req, res, next) {
    if(req.user.id === req.currentUser.id || req.currentUser.isAdmin) return next();
    next(new HttpError('insufficient permissions', 403));
  },

  findUser: function(req, res, next){
    User.findById(req.params.id, function(err, user) {
      if(err) return next(err);
      if(!user) return next(new HttpError('not found', 404));
      req.user = user;
      next();
    });
  }

};

module.exports = UserController;