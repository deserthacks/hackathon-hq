'use strict';

var _ = require('lodash');
var async = require('async');
var HttpError = require('http-error').HttpError;
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;

var ApplicationTemplate = require('../application-template/template.model');
var Config = require('./config.model');

var ConfigController = {

  /** Create */

  create: function(req, res, next) {
    console.log(req.currentUser);
    req.body.created_by = req.currentUser._id;
    Config.create(req.body, function(err, config) {
      if (err) return next(err);

      res.status(200).json(config);
    });
  },

  /** Read */

  index: function(req, res, next) {
    var query;

    // Filter query
    if (req.query) {
      query = Config.find();

      if (req.query.id) {
        var id = new ObjectId(req.query.id);

        query.find({'_id': id});
      }
    }

    if (!query) {
      query = Config.find({});
    }

    query.exec(function(err, configs) {
      if (err) return next(err);

      Config.populate(configs, [{
        path: 'created_by'
      }, {
        path: 'updated_by'
      }], function(err, populatedConfigs) {
        if (err) return next(err);

        res.json(populatedConfigs);
      });
    });
  },

  getConfigs: function(req, res, next) {
    var query;

    // Filter query
    if (req.query) {
      query = Config.find();

      if (req.query.hackathon) {
        var hackathonId = new ObjectId(req.query.hackathon);

        query.find({'hackathon': hackathonId});
      }

      if (req.query.id) {
        var id = new ObjectId(req.query.id);

        query.find({'_id': id});
      }
    }

    if (!query) {
      query = Config.find({});
    }

    query.populate('template');

    query.exec(function(err, configs) {
      if (err) next(err);
      if (!configs) { return res.sendStatus(404); }

      console.log('THA CONFIGS', configs);

      var populatedConfigs = [];

      async.each(configs, function(config, cb) {
        console.log(config);
        if (!config.template) {
          populatedConfigs.push(config);
          return cb();
        }

        ApplicationTemplate.populate(config.template, [{
          path: 'modules'
        }], function(err, applicationTemplate) {
          if (err) next(err);
          console.log('applicationTemplate', applicationTemplate);
          config.template = applicationTemplate;
          populatedConfigs.push(config);
          cb();
        });
      }, function() {
        console.log('populatedConfigs', populatedConfigs);
        return res.json(populatedConfigs);
      });

      // ApplicationTemplate.populate(configs, [{
      //   path: 'modules'
      // }], function(err, populatedConfigs) {
      //   if (err) next(err);

      //   console.log(populatedConfigs);

      //   return res.json(populatedConfigs);
      // });

    });
  },

  show: function(req, res) {
    return res.status(200).json(req.config).end();
  },

  /** Update **/

  update: function(req, res, next) {
    Config.findById(req.params.id, function(err, config) {
      if (err) next(err);
      if (!config) { return res.sendStatus(404); }

      var updated = _.merge(config, req.body);
      updated.save(function (err) {
        if (err) next(err);

        return res.status(200).json(config);
      });
    });
  },

  /** Delete */

  destroy: function(req, res, next) {
    Config.findById(req.params.id, function(err, config) {
      if (err) return next(err);
      if (!config) return res.status(404);

      config.remove(function(err) {
        if (err) return next(err);

        return res.status(204).end();
      });
    });
  },

  /** Helpers */

  findConfig: function(req, res, next) {
    Config.findById(req.params.id, function(err, config) {
      if (err) return next(err);
      if (!config) return next(new HttpError('not found', 404));

      req.config = config;
      next();
    });
  }

};

module.exports = ConfigController;
