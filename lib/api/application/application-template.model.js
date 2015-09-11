'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/**
 * This is the model we look to in order to render
 * the actual application form
 *
 * @type {Schema}
 */
var ApplicationTemplateModel = new Schema({

  application_config: { type: Schema.Types.ObjectId, ref: 'ApplicationConfig' },

  // Reusable modules
  modules: [{ type: Schema.Types.ObjectId, ref: 'Module'}],
  module_order: [Schema.Types.ObjectId],

  created_at: { type: Date, default: Date.now() },
  created_by: { type: Schema.Types.ObjectId, ref: 'User' },
  updated_at: { type: Date },
  updated_by: { type: Schema.Types.ObjectId, ref: 'User' }

});

module.exports = mongoose.model('ApplicationTemplate', ApplicationTemplateModel);
