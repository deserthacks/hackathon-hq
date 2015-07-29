'use strict';

var _ = require('lodash');
var async = require('async');
var HttpError = require('http-error').HttpError;
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;

var mail = require('../../mail');
var Application = require('./application.model');

var ApplicationController = {

  /** Create */

  create: function(req, res, next) {
    Application.create(req.body, function(err, application) {
      if (err) return next(err);

      res.status(200).json(application);
      mail.onApplicationSubmitted(req.currentUser, application);
    });
  },

  /** Read */

  index: function(req, res, next) {
    var query;

    // Filter query
    if (req.query) {
      query = Application.find();

      if (req.query.hackathon) {
        var id = new ObjectId(req.query.hackathon);

        query.find({'hackathon': id});
      }
    }

    if (!query) {
      query = Application.find({});
    }

    query.exec(function(err, applications) {
      if (err) return next(err);

      Application.populate(applications, [{
        path: 'user'
      }, {
        path: 'hackathon'
      }, {
        path: 'reviewedBy'
      }], function(err, populatedApplications) {
        if (err) return next(err);

        res.json(populatedApplications);
      });
    });
  },

  indexForHackathon: function(req, res, next) {
    Application.find({ hackathon: req.query.hackathon }, function(err, applications) {
      if (err) return next(err);

      res.json(applications);
    });
  },

  getAdjacentApplications: function(req, res) {
    var nextApplication = Application.find({ '_id': { $gt: req.params.id } }).limit(1);
    var prevApplication = Application.find({ '_id': { $lt: req.params.id } }).limit(1);

    async.parallel({
      next: function getNextApplication(callback) {
        nextApplication.exec(function(err, applications) {
          if (!err && applications) {
            callback(null, applications[0]);
          } else {
            callback(err, null);
          }
        });
      },
      previous: function getPrevApplication(callback) {
        prevApplication.exec(function(err, applications) {
          if (!err && applications) {
            callback(null, applications[0]);
          } else {
            callback(err, null);
          }
        });
      }
    }, function(err, result) {
      return res.status(200).json(result);
    });
  },

  show: function(req, res, next) {
    req.application
      .populate('hackathon')
      .populate('user')
      .populate('reviewedBy', function(err, application) {
        if (err) return next(err);

        res.json(200, application).end();
      });
  },

  /** Update **/

  update: function(req, res, next) {
    Application.findById(req.params.id, function(err, application) {
      if (err) next(err);
      if (!application) { return res.status(404); }

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
      if (err) return next(err);
      if (!application) return res.status(404);

      application.remove(function(err) {
        if (err) return next(err);

        return res.status(204).end();
      });
    });
  },

  /** Actions */

  approveApplication: function(req, res, next) {
    Application.findById(req.params.id, function(err, application) {
      if (err) return next(err);
      if (!application) return res.status(404);

      application.accepted = true;
      application.reviewedAt = Date.now();
      application.reviewNote = req.body.reviewNote;
      application.reviewedBy = req.currentUser._id;
      application.status = 'reviewed';
      application.save(function(err, savedApplication) {
        if (err) return next(err);

        Application.populate(savedApplication, {path: 'reviewedBy'}, function(err, populatedApplication) {
          if (err) return next(err);

          return res.status(200).json(populatedApplication);
        });
      });
    });
  },

  rejectApplication: function(req, res, next) {
    Application.findById(req.params.id, function(err, application) {
      if (err) return next(err);
      if (!application) return res.status(404);

      application.accepted = false;
      application.reviewedAt = Date.now();
      application.reviewedBy = req.currentUser._id;
      application.reviewNote = req.body.reviewNote;
      application.status = 'reviewed';
      application.save(function(err, savedApplication) {
        if (err) return next(err);

        Application.populate(savedApplication, {path: 'reviewedBy'}, function(err, populatedApplication) {
          if (err) return next(err);

          return res.status(200).json(populatedApplication);
        });
      });
    });
  },

  /** Helpers */

  authenticateSelf: function(req, res, next) {
    if (req.application.user === req.currentUser.id || req.currentUser.isAdmin) return next();

    next(new HttpError('insufficient permissions', 403));
  },

  findApplication: function(req, res, next) {
    Application.findById(req.params.id, function(err, application) {
      if (err) return next(err);
      if (!application) return next(new HttpError('not found', 404));

      req.application = application;
      next();
    });
  }

};

module.exports = ApplicationController;
