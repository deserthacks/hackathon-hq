'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var config = require('../../config');

var FormSchema = new Schema({

  module_order: [],
  modules: [{ type: Schema.Types.ObjectId, ref: 'FormModule' }]

});

module.exports = mongoose.model('Form', FormSchema);
