'use strict';

var mongoose = require('mongoose');
var HttpError = require('http-error').HttpError;
var Schema = mongoose.Schema;

var config = require('../../config');

var ApplicationSchema = new Schema({

  response: [String],

  role: {
    type: String,
    enum: config.attendees.roles,
    default: 'participant'
  },

  hackathon: { type: Schema.Types.ObjectId, ref: 'Hackathon', required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },

  status: {
    type: String, enum: config.applications.status,
    default: 'received'
  },
  accepted: {
    type: Boolean,
    default: false
  },
  reviewNote: String,
  reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  reviewedAt: { type: Date },

  createdAt: { type: Date, default: Date.now }

});

/** Index */

ApplicationSchema.index({ hackathon: 1, user: 1 }, { unique: true });

/////////////////
// Validations //
/////////////////

ApplicationSchema

  /** Ensure only one application per user per hackathon */
  .pre('save', function(next) {
    this.model('Application').find({ hackthon: this.hackathon._id, user: this.user._id }, function(err, applications) {
      if (err) return next(err);
      if (applications <= 1) {
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
    if (!this.isNew) return next();

    this.model('User')
      .update({ _id: this.user }, { $push: { applications: this._id } }, next());
  })

  /** Remove the application object from the user */
  .pre('remove', function(next) {
    this.model('User')
      .update({ _id: this.user }, { $pull: { applications: this._id } }, next());
  });

module.exports = mongoose.model('Application', ApplicationSchema);
