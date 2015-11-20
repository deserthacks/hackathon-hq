'use strict';

var async = require('async');
var Chance = require('chance');
var chance = new Chance();
var mongoose = require('mongoose');

var Application = require('./application.model');
var ApplicationConfig = require('../application-config/config.model');
var ApplicationTemplate = require('../application-template/template.model');
var Module = require('../application-module/module.model');

module.exports = function seedApplications(users, hackathonId, callback) {
  users = users || [];
  hackathonId = hackathonId || new mongoose.Types.ObjectId();


  ApplicationTemplate.find({}).remove(function() {
    makeTemplate(hackathonId, function(template) {
      for (var i = 0; i < users.length; i++) {
        var user = users[i];


        makeApplication(user, hackathonId, template, function(application) {
          Application.find({}).remove(function() {
            Application.create(application, function(err, application) {
              return callback(application);
            });
          });
        });

      }
    });
  });
};

function makeApplication(user, hackathonId, template, callback) {
  hackathonId = hackathonId || new mongoose.Types.ObjectId();
  var userID = user._id || new mongoose.Types.ObjectId();
  var module_values = [];

  async.each(template.modules, function(moduleId, cb) {
    Module.findById(moduleId, function(err, module) {
      var value;

      switch (module.type) {
        case 'string':
          if (module.options.length > 0) {
            value = chance.pick(module.options);
          } else {
            value = 'wow';
          }
          break;
        case 'array':
          if (module.options.length > 0) {
            value = [chance.pick(module.options)];
          } else {
            value = 'wow';
          }
          break;
        case 'boolean':
          value = chance.bool();
          break;
        case 'number':
          value = chance.integer({min: 0, max: 15});
          break;
        default:
          // nathan
          break;
      }

      var response = {
        question: module.question,
        value: value
      };
      module_values.push(response);
      cb();
    });
  }, function() {
    var application = {
      template: template._id,
      module_values: module_values,
      hackathon: hackathonId,
      user: userID
    };

    callback(application);
  });
}

function makeTemplate(hackathonId, callback) {
  hackathonId = hackathonId || new mongoose.Types.ObjectId();


  // define dummy modules of a few types
  var modules = [
    {
      question: 'How many hackathons have you been to?',
      description: 'Self explanitory',
      type: 'number'
    },
    {
      question: 'Favourite dev language',
      description: 'One true',
      type: 'string',
      options: ['nodejs', 'node.js', 'NodeJS'],
      required: true,
      help_text: 'There\'s no incorrect answer'
    },
    {
      question: 'Colors you enjoy',
      description: 'Select the colors you like',
      type: 'array',
      options: ['green', 'blue', 'orange', 'red']
    }
  ];


  Module.find({}).remove(function() {
    Module.create(modules, function(err, ModuleDocuments) {
      if (!err) {
        var moduleIDs = function() {
          var ids = [];

          for (var i = 0; i < ModuleDocuments.length; i++) {
            ids.push(ModuleDocuments[i]._id);
          }

          return ids;
        };

        ApplicationConfig.findOne({ 'hackathon': hackathonId }, function(err, config) {
          var template = {
            application_config: config._id,
            modules: moduleIDs(),
            module_order: moduleIDs()
          };

          ApplicationTemplate.create(template, function(err, templateDocument) {
            ApplicationConfig.findOne({ 'hackathon': hackathonId }, function(err, applicationConfig) {
              applicationConfig.template = templateDocument._id;
              applicationConfig.save(function(err, doc) {
                if (!err) {
                  callback(templateDocument);
                }
              });
            });
          });
        });

      }
    });
  });
}
