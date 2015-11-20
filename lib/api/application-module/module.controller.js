'use strict';

var _ = require('lodash');
var HttpError = require('http-error').HttpError;
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;

var Module = require('./module.model');

var ModuleController = {

  /** Create */

  create: function(req, res, next) {
    Module.create(req.body, function(err, module) {
      if (err) return next(err);

      res.status(200).json(module);
    });
  },

  /** Read */

  index: function(req, res, next) {
    var query;

    // Filter query
    if (req.query) {
      query = Module.find();

      if (req.query.id) {
        var id = new ObjectId(req.query.id);

        query.find({'_id': id});
      }
    }

    if (!query) {
      query = Module.find({});
    }

    query.exec(function(err, modules) {
      if (err) return next(err);

      Module.populate(modules, [{
        path: 'created_by'
      }, {
        path: 'updated_by'
      }], function(err, populatedModules) {
        if (err) return next(err);

        res.json(populatedModules);
      });
    });
  },

  show: function(req, res) {
    return res.status(200).json(req.module).end();
  },

  /** Update **/

  update: function(req, res, next) {
    Module.findById(req.params.id, function(err, module) {
      if (err) next(err);
      if (!module) { return res.sendStatus(404); }

      var updated = _.merge(module, req.body);
      updated.save(function (err) {
        if (err) next(err);

        return res.status(200).json(module);
      });
    });
  },

  /** Delete */

  destroy: function(req, res, next) {
    Module.findById(req.params.id, function(err, module) {
      if (err) return next(err);
      if (!module) return res.status(404);

      module.remove(function(err) {
        if (err) return next(err);

        return res.status(204).end();
      });
    });
  },

  /** Helpers */

  findModule: function(req, res, next) {
    Module.findById(req.params.id, function(err, module) {
      if (err) return next(err);
      if (!module) return next(new HttpError('not found', 404));

      req.module = module;
      next();
    });
  }

};

module.exports = ModuleController;
