'use strict';

var _ = require('lodash');
var HttpError = require('http-error').HttpError;
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;

var ApplicationTemplate = require('./template.model');

var ApplicationTemplateController = {

  /** Create */

  create: function(req, res, next) {
    ApplicationTemplate.create(req.body, function(err, template) {
      if (err) return next(err);

      res.status(200).json(template);
    });
  },

  /** Read */

  index: function(req, res, next) {
    var query;

    // Filter query
    if (req.query) {
      query = ApplicationTemplate.find();

      if (req.query.id) {
        var id = new ObjectId(req.query.id);

        query.find({'_id': id});
      }
    }

    if (!query) {
      query = ApplicationTemplate.find({});
    }

    query.exec(function(err, templates) {
      if (err) return next(err);

      ApplicationTemplate.populate(templates, [{
        path: 'created_by'
      }, {
        path: 'updated_by'
      }], function(err, populatedApplicationTemplates) {
        if (err) return next(err);

        res.json(populatedApplicationTemplates);
      });
    });
  },

  show: function(req, res) {
    return res.json(200, req.template).end();
  },

  /** Update **/

  update: function(req, res, next) {
    ApplicationTemplate.findById(req.params.id, function(err, template) {
      if (err) return next(err);
      if (!template) { return res.sendStatus(404); }

      var updated = _.merge(template, req.body);
      updated.save(function (err) {
        if (err) return next(err);

        return res.json(200, template);
      });
    });
  },

  /** Delete */

  destroy: function(req, res, next) {
    ApplicationTemplate.findById(req.params.id, function(err, template) {
      if (err) return next(err);
      if (!template) return res.status(404);

      template.remove(function(err) {
        if (err) return next(err);

        return res.status(204).end();
      });
    });
  },

  /** Helpers */

  findApplicationTemplate: function(req, res, next) {
    ApplicationTemplate.findById(req.params.id, function(err, template) {
      if (err) return next(err);
      if (!template) return next(new HttpError('not found', 404));

      req.template = template;
      next();
    });
  }

};

module.exports = ApplicationTemplateController;
