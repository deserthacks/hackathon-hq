'use strict';

var _ = require('lodash'),
    async = require('async'),
    mongoose = require('mongoose'),
    path = require('path'),
    Schema = mongoose.Schema;

var config = require('../../config');

var eventStatus = ['pre', 'live', 'post']

var HackathonSchema = new Schema({
  subdomain: { type: String, unique: true, index: true },
  eventDate: Date,
  applicationsOpen: Date,
  applicationDecisions: Date,

  state: {
    acceptingApplications: { type: Boolean, default: false },
    status: { type: String, enum: eventStatus, default: 'pre' }
  },

  organizers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  volunteers: [{ type: Schema.Types.ObjectId, ref: 'User' }],

  createdAt: { type: Date, default: Date.now }
});

/////////////////
// Validations //
/////////////////

// none

module.exports = mongoose.model('Hackathon', HackathonSchema);