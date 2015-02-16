'use strict';

var _ = require('lodash'),
    async = require('async'),
    mongoose = require('mongoose'),
    path = require('path'),
    Schema = mongoose.Schema;

var config = require('../../config');

var ApplicationSchema = new Schema({
  // Eventual application form fields here

  hackathon: { type: Schema.Types.ObjectId, ref: 'Hackathon', required: true, index: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },

  approved: { type: Boolean },
  reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },

  createdAt: { type: Date, default: Date.now },
  approvedAt: { type: Date },
  rejectedAt: { type: Date }
});

//////////////
// Virtuals //
//////////////

/** Get an applicant's previous attendance, if any */
ApplicationSchema
  .virtual('previousHackathons')
  .get(function() {
    this.model('User')
      .findById(this.user, function(err, user) {
        if(err) return
        return user.hackathons;
      });
  });

/////////////////
// Validations //
/////////////////

// none

///////////
// Hooks //
///////////

ApplicationSchema

  /** Add application object to user */
  .pre('save', function(next) {
    if(!this.isNew) return next();
    this.model('User')
      .update({ _id: this.user }, { $push: { applications: this._id } }, next());
  })

  /** Remove the application object from the user */
  .pre('remove', function(next) {
    this.model('User')
      .update({ _id: this.user }, { $pull: { applications: this._id } }, next());
  });

module.exports = mongoose.model('Application', ApplicationSchema);