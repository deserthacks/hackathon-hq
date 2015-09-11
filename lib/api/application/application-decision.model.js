'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ApplicationDecisionModel = new Schema({

  application: { type: Schema.Types.ObjectId, ref: 'Application' },

  // Allow admin users add votes
  votes: [{
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    accept: { type: Boolean }
  }],
  note: { type: String },

  // User who iniated the decision
  decision_by: { type: Schema.Types.ObjectId, ref: 'User' },
  decision_at: { type: Date },
  updated_by: { type: Schema.Types.ObjectId, ref: 'User' },
  updated_at: { type: Date }

});

module.exports = mongoose.model('ApplicationDecision', ApplicationDecisionModel);
