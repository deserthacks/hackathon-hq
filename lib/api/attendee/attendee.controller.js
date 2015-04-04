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
    Attendee.create(req.body, function(err, attendee) {
      if(err) return next(err);
      res.status(201);
    });
  },

  /** Read */

  index: function(req, res, next) {
    Attendee
      .find({})
      .populate('user hackathon', function(err, attendees) {
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

  checkin: function(req, res, next) {
    req.attendee.set({ path: 'checkedIn' }, true, Boolean);
    req.attendee.save(function(err, attendee) {
      if(err) return next(err);
      res.status(200);
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

  /** Helpers */

  authenticateSelf: function(req, res, next) {
    if(req.user.id === req.currentUser.id || req.currentUser.isAdmin) return next();
    next(new HttpError('insufficient permissions', 403));
  },

  /** Makes sure application exists and was approved */
  applicationApproved: function(req, res, next) {
    this.model('Application').findOne({ hackathon: req.body.hackthon, user: req.user._id }, function(err, application) {
      if(err) return next(err);
      if(!application) return next(new HttpError('application does not exist', 400));

      if(application.approved) {
        return next();
      }
      next(new HttpError('application was not approved', 400));
    });
  },

  findAttendee: function(req, res, next){
    Attendee.findById(req.params.id, function(err, attendee) {
      if(err) return next(err);
      if(!attendee) return next(new HttpError('not found', 404));
      req.attendee = attendee;
      next();
    });
  }

};

module.exports = AttendeeController;