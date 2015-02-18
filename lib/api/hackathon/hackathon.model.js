'use strict';

var _ = require('lodash'),
    async = require('async'),
    mongoose = require('mongoose'),
    path = require('path'),
    Schema = mongoose.Schema;

var config = require('../../config');

var HackathonSchema = new Schema({
  subdomain: String,
  eventDate: Date,
  applicationDecisions: Date,

  organizers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  volunteers: [{ type: Schema.Types.ObjectId, ref: 'User' }],

  createdAt: { type: Date, default: Date.now }
});

/////////////////
// Validations //
/////////////////

// none

module.exports = mongoose.model('Hackathon', HackathonSchema);