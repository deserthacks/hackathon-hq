'use strict';

var _ = require('lodash'),
    async = require('async'),
    mongoose = require('mongoose'),
    path = require('path'),
    HttpError = require('http-error').HttpError,
    Schema = mongoose.Schema;

var config = require('../../config');

var AttendeeSchema = new Schema({
  // Attendee information
  team: { type: Schema.Types.ObjectId, ref: 'Team', sparse: true },
  resume: { type: String },
  phone: { type: String },

  // Administrative
  hackathon: { type: Schema.Types.ObjectId, ref: 'Hackathon', required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  role: {
    type: String,
    enum: config.attendees.roles,
    default: 'participant'
  },
  checkedIn: { type: Boolean, default: false },
  checkin_time: Date,

  createdAt: { type: Date, default: Date.now }
});

///////////
// Index //
///////////

AttendeeSchema.index({ hackathon: 1, user: 1}, { unique: true });

//////////////
// Virtuals //
//////////////

AttendeeSchema
  .virtual('isOrganizer')
  .get(function() {
    if(!this.role) return null;
    return this.role === 'organizer';
  });

AttendeeSchema
  .virtual('isVolunteer')
  .get(function() {
    if(!this.role) return null;
    return this.role === 'volunteer';
  });

/////////////////
// Validations //
/////////////////

AttendeeSchema

  /** Ensure there is only one attendee per user per hackthon */
  .pre('save', function(next) {
    this.model('Attendee').findOne({ hackathon: this.hackathon, user: this.user }, function(err, attendee) {
      if(err) return next(err);
      if(attendee) {
        return next(new HttpError('attendee already exists for this user and hackthon', 400));
      }
      next();
    });
  });

///////////
// Hooks //
///////////

AttendeeSchema

  /** Add attendee object to user */
  .pre('save', function(next) {
    if(!this.isNew) return next();
    this.model('User')
      .update({ _id: this.user }, { $push: { hackathons: this._id } }, next());
  })

  /** Remove the attendee object from the user */
  .pre('remove', function(next) {
    this.model('User')
      .update({ _id: this.user }, { $pull: { hackathons: this._id } }, next());
  });

  //TODO: When teams are created, on deletion of attendee
  //      we have to remove the reference there too

module.exports = mongoose.model('Attendee', AttendeeSchema);