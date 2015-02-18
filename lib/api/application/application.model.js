'use strict';

var _ = require('lodash'),
    async = require('async'),
    mongoose = require('mongoose'),
    path = require('path'),
    HttpError = require('http-error').HttpError,
    Schema = mongoose.Schema;

var config = require('../../config');

var ApplicationSchema = new Schema({
  // Eventual application form fields here

  hackathon: { type: Schema.Types.ObjectId, ref: 'Hackathon', required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },

  approved: { type: Boolean },
  reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },

  createdAt: { type: Date, default: Date.now },
  approvedAt: { type: Date },
  rejectedAt: { type: Date }
});

/** Index */

ApplicationSchema.index({ hackathon: 1, user: 1 }, { unique: true });

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

ApplicationSchema

  /** Ensure only one application per user per hackathon */
  .pre('save', function(next) {
    this.model('Application').find({ hackthon: this.hackathon._id, user: this.user._id }, function(err, applications) {
      if(err) return next(err);
      if(applications <= 1) {
        return next();
      }
      next(new HttpError('cannot submit more than one application for a hackathon', 400));
    });
  });

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