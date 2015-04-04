'use strict';

var _ = require('lodash'),
    async = require('async'),
    bcrypt = require('bcrypt'),
    crypto = require('crypto'),
    mongoose = require('mongoose'),
    path = require('path'),
    Schema = mongoose.Schema;

var config = require('../../config');

var UserSchema = new Schema({
  firstName: String,
  lastName: String,
  email: { type: String, lowercase: true, trim: true, required: true },
  bio: String,
  institution: String,
  location: String,

  role: {
    type: String,
    enum: config.users.roles,
    default: 'user'
  },
  passwordDigest: { type: String },
  provider: { type: String, default: 'local' },
  verified: { type: Boolean, default: false },
  verificationKey: { type: String },

  applications: [{
    type: Schema.Types.ObjectId, ref: 'Application'
  }],
  hackathons: [{
    type: Schema.Types.ObjectId, ref: 'Attendee'
  }],

  createdAt: { type: Date, default: Date.now }
});

// Instance methods
_.assign(UserSchema.methods, {
  authenticate: function(checkPassword) {
    if(!checkPassword || !this.passwordDigest) return false;
    return bcrypt.compareSync(checkPassword, this.passwordDigest);
  },

  encrypt: function(password) {
    if(!password) return '';
    return bcrypt.hashSync(password, 10);
  }
});

// Virtuals

UserSchema
  .virtual('isAdmin')
  .get(function() {
    if(!this.role) return null;
    return this.role === 'admin';
  });

UserSchema
  .virtual('password')
  .set(function(password) {
    this._password = password;
    this.passwordDigest = this.encrypt(password);
  })
  .get(function() {
    return this._password;
  });

UserSchema
  .virtual('profile')
  .get(function() {
    return {
      '_id': this._id,
      'firstName': this.firstName,
      'lastName': this.lastName,
      'location': this.location,
      'bio': this.bio,
      'verified': this.verified,
      'hackathons': this.hackathons,
      'applications': this.applications,
      'created_at': this.createdAt
    }
  });

// Validations

UserSchema
  .path('email')
  .validate(function(email, done) {
    var self = this;
    this.constructor.findOne({ email: email }, function(err, user) {
      if(err) return done(err);
      if(user) return done(self.id === user.id);
      done(true);
    });
  }, 'email is already in use');

UserSchema
  .path('passwordDigest')
  .validate(function(passwordDigest) {
    if(config.users.providers.indexOf(this.provider) >= 0) return true;
    return passwordDigest.length;
  }, 'password cannot be blank');

///////////
// Hooks //
///////////


module.exports = mongoose.model('User', UserSchema);