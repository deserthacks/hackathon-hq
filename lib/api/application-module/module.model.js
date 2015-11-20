'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ModuleSchema = new Schema({

  question: { type: String },
  description: { type: String },
  type: { type: String, enum: ['string', 'boolean', 'number', 'array'] },
  options: [],
  required: Boolean,
  placeholder: String,
  help_text: String,
  maximum_characters: Number,
  multiple_selections: { type: Boolean, default: false},
  randomize: { type: Boolean, default: false },

  created_at: { type: Date, default: Date.now() },
  created_by: { type: Schema.Types.ObjectId, ref: 'User' },
  updated_at: { type: Date },
  updated_by: { type: Schema.Types.ObjectId, ref: 'User' }

});

module.exports = mongoose.model('Module', ModuleSchema);
