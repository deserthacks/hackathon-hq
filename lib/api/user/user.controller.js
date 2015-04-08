'use strict';

var _ = require('lodash'),
    fs = require('fs'),
    crypto = require('crypto'),
    HttpError = require('http-error').HttpError;

var auth = require('../../auth/auth.helpers'),
    mail = require('../../mail'),
    config = require('../../config'),
    timeline = require('../../config/timeline'),
    User = require('./user.model');

var UserController = {

  /** Create */

  create: function(req, res, next) {
    var key = crypto.randomBytes(7).toString('hex');
    req.body.verificationKey = key;
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

  verifyAttendee: function(req, res, next) {
    req.user.populate('hackathons applications', function(err, user) {
      if(err) return next(err);
      for(var hackathon in user.hackathons) {
        if(hackathon == req.params.hackathon) {
          return res.json(hackathon);
        }
      }
      return res.json(false);
    });
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

  updateTimeline: function(req, res, next) {
    req.user.update({ $set: { notificationSettings: req.body.topics } }, function(err, user) {
      if(err) return next(err);
      if(req.body.topics instanceof Array) return next(new HttpError('expected topics to be array', 400));

      _.forEach(req.body.topics, function(topic, value) {
        if(topic instanceof String) return next(new HttpError('expected topic to be string', 400));

        if(value === false) {
          // Unsubscribe
          timeline.unsubscribe(req.user.pebbleTimelineToken, topic, function(err, body, res) {
            if(err) return next(err);
            res.sendStatus(200);
          });
        } else {
          // Subscribe
          timeline.subscribe(req.user.pebbleTimelineToken, topic, function(err, body, res) {
            if(err) return next(err);
            res.sendStatus(200);
          });
        }
      });
    });
  },

  verifyEmail: function(req, res, next) {
    var userKey = req.params.token;
    if(userKey == req.user.verificationKey) {
      req.user.set({ path: 'verified' }, true, Boolean);
      req.user.save(function(err, user) {
        if(err) return next(err);
        res.status(204);
        mail.onRegistration(user);
      });
    } else {
      return next(new HttpError('invalid verification key', 400));
    }
  },

  changePassword: function(req, res, next) {
    if(req.currentUser.role !== 'admin' && !req.user.authenticate(req.body.oldPassword))
      return next(new HttpError('oldPassword must be provided', 400));

    req.user.set({ path: 'password' }, req.body.password);
    req.user.save(function(err, user) {
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