'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var config = require('../../config');

var ApplicationConfigSchema = new Schema({

  role: {
    type: String,
    enum: config.attendees.roles,
    required: true
  },
  hackathon: { type: Schema.Types.ObjectId, ref: 'Hackathon', required: true },

  open_at: { type: Date },
  close_at: { type: Date },
  decision_at: { type: Date },

  form: { type: Schema.Types.ObjectId, ref: 'Form' },

  createdAt: { type: Date, default: Date.now }

});

ApplicationConfigSchema.index({ hackathon: 1});

module.exports = mongoose.model('ApplicationConfig', ApplicationConfigSchema);
