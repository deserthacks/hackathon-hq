'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var HackathonSchema = new Schema({

  season: { type: String },
  slug: { type: String, unique: true, index: true },

  event: {
    location: { type: String },
    location_address: { type: String },
    start_at: { type: Date },
    end_at: { type: Date}
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
