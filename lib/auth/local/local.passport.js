'use strict';

var passport = require('passport'),
    HttpError = require('http-error').HttpError,
    LocalStrategy = require('passport-local').Strategy;

module.exports = function(User) {
  passport.use(new LocalStrategy({ usernameField: 'email' }, function(email, password, done) {
    User.findOne({
      email: email.toLowerCase()
    }, function(err, user) {
      if(err) return done(err);
      if(!user || !user.authenticate(password)) return done(new HttpError('Invalid email or password', 400));
      done(null, user);
    });
  }));
};