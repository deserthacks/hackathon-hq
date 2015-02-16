'use strict';

var _ = require('lodash'),
    fs = require('fs'),
    HttpError = require('http-error').HttpError;

var auth = require('../../auth/auth.helpers'),
    config = require('../../config'),
    Attendee = require('./attendee.model');

var AttendeeController = {

  /** Create */

  create: function(req, res, next) {
    Attendee.safeCreate(req.body, function(err, attendee) {
      if(err) return next(err);
      res.status(201);
    });
  },

  /** Read */

  index: function(req, res, next) {
    Attendee.find(function(err, attendees) {
      if(err) return next(err);
      res.json(attendees);
    });
  },

  show: function(req, res, next) {
    Attendee.findById(req.params.id, function(err, attendee) {
      if(err) return next(err);
      res.json(attendee);
    })
  },

  /** Update **/

  update: function(req, res, next) {
    Attendee.findById(req.params.id, function(err, attendee) {
      if (err) next(err);
      if(!attendee) { return res.status(404); }
      var updated = _.merge(attendee, req.body);
      updated.save(function (err) {
        if (err) next(err);
        return res.json(200, attendee);
      });
    });
  },

  /** Delete */

  destroy: function(req, res, next) {
    Attendee.findById(req.params.id, function(err, attendee) {
      if(err) return next(err);
      if(!attendee) return res.status(404);
      attendee.remove(function(err) {
        if(err) return next(err);
        res.status(204).end();
      });
    });
  },

  /** Collections */


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

module.exports = AttendeeController;