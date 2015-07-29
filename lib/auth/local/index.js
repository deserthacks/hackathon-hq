'use strict';

var express = require('express');
var HttpError = require('http-error').HttpError;
var passport = require('passport');

var authHelpers = require('../auth.helpers');

var router = express.Router();

router.post('/', function(req, res, next) {
  passport.authenticate('local', function(err, user) {
    if (err) return next(err);
    if (user === false) return next(new HttpError('Invalid email or password',400));

    authHelpers.createToken(res, user);
  })(req, res, next);
});

module.exports = router;
