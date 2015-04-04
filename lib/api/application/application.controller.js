'use strict';

var _ = require('lodash'),
    fs = require('fs'),
    HttpError = require('http-error').HttpError;

var auth = require('../../auth/auth.helpers'),
    mail = require('../../mail'),
    config = require('../../config'),
    Application = require('./application.model');

var ApplicationController = {

  /** Create */

  create: function(req, res, next) {
    Application.create(req.body, function(err, application) {
      if(err) return next(err);
      res.status(201).end();
      mail.onApplicationSubmitted(req.currentUser, application);
    });
  },

  /** Read */

  index: function(req, res, next) {
    Application.find(function(err, applications) {
      if(err) return next(err);
      res.json(applications);
    });
  },

  indexForHackathon: function(req, res, next) {
    Application.find({ hackathon: req.body.hackathon }, function(err, applications) {
      if(err) return next(err);
      res.json(apllications);
    });
  },

  show: function(req, res, next) {
    req.application
      .populate('hackathon')
      .populate('user')
      .populate('reviewedBy', function(err, application) {
        if(err) return next(err);
        res.json(200, application).end();
      });
  },

  /** Update **/

  update: function(req, res, next) {
    Application.findById(req.params.id, function(err, application) {
      if (err) next(err);
      if(!application) { return res.status(404); }
      var updated = _.merge(application, req.body);
      updated.save(function (err) {
        if (err) next(err);
        return res.json(200, application);
      });
    });
  },

  /** Delete */

  destroy: function(req, res, next) {
    Application.findById(req.params.id, function(err, application) {
      if(err) return next(err);
      if(!application) return res.status(404);
      application.remove(function(err) {
        if(err) return next(err);
        res.status(204).end();
      });
    });
  },

  /** Actions */

  approveApplication: function(req, res, next) {
    Application.findByIdAndUpdate(req.params.id, { $set: { approved: true, approvedAt: Date.now, reviewedBy: req.user } },
      function(err, application) {
        if(err) return next(err);
        if(!application) return res.status(404);
        res.json(200, 'Application has been approved');
      });
  },

  rejectApplication: function(req, res, next) {
    Application.findByIdAndUpdate(req.params.id, { $set: { approved: false, rejectedAt: Date.now, reviewedBy: req.user } },
      function(err, application) {
        if(err) return next(err);
        if(!application) return res.status(404);
        res.json(200, 'Application has been rejected');
      });
  },

  /** Helpers */

  authenticateSelf: function(req, res, next) {
    if(req.application.user === req.currentUser.id || req.currentUser.isAdmin) return next();
    next(new HttpError('insufficient permissions', 403));
  },

  findApplication: function(req, res, next) {
    Application.findById(req.params.id, function(err, application) {
      if(err) return next(err);
      if(!application) return next(new HttpError('not found', 404));
      req.application = application;
      next();
    });
  }

};

module.exports = ApplicationController;