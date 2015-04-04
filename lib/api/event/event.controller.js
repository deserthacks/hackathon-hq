'use strict';

var _ = require('lodash'),
    fs = require('fs'),
    async = require('async'),
    HttpError = require('http-error').HttpError;

var auth = require('../../auth/auth.helpers'),
    config = require('../../config'),
    Event = require('./event.model');

var EventController = {

  /** Create */

  create: function(req, res, next) {
    Event.create(req.body, function(err, event) {
      if(err) return next(err);
      res.status(201);
    });
  },

  /** Read */

  index: function(req, res, next) {
    Event.find(function(err, events) {
      if(err) return next(err);
      res.json(events);
    });
  },

  show: function(req, res, next) {
    req.event.populate({ path: 'hackathon'}, function(err, event) {
      if(err) return next(err);
      if(!event) return res.status(404);
      res.json(event);
    });
  },

  /** Update **/

  update: function(req, res, next) {
    Event.findById(req.params.id, function(err, event) {
      if (err) next(err);
      if(!event) { return res.status(404); }
      var updated = _.merge(event, req.body);
      updated.save(function (err) {
        if (err) next(err);
        return res.json(200, event);
      });
    });
  },

  /** Delete */

  destroy: function(req, res, next) {
    Event.findById(req.params.id, function(err, event) {
      if(err) return next(err);
      if(!event) return res.status(404);
      event.remove(function(err) {
        if(err) return next(err);
        res.status(204).end();
      });
    });
  },

  /** Actions */

  /** Helpers */

  findEvent: function(req, res, next){
    Event.findById(req.params.id, function(err, event) {
      if(err) return next(err);
      if(!event) return next(new HttpError('not found', 404));
      req.event = event;
      next();
    });
  }

};

module.exports = EventController;