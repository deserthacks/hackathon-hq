'use strict';

var compose = require('composable-middleware'),
    HttpError = require('http-error').HttpError,
    jwt = require('jsonwebtoken');

var config = require('../config'),
    helpers = require('./auth.helpers'),
    User = require('../api/user/user.model');

var AuthMiddleware = {

  authenticate: function() {
    return compose()
      .use(function(req, res, next) {
        if(req.query.token) {
          if(!req.secure) return next(new HttpError('token may only be used over HTTPS, use Authorization: Bearer {token} instead',400));
          req.headers.authorization = 'Bearer ' + req.query.token;
        }
        next();
      })

      /** Check for token and check for validity */
      .use(function(req, res, next) {
        var bearer = req.headers.authorization || '';
        var token = bearer.replace(/^Bearer /,'');
        req.bearerToken = token;

        /** Check if token has been blacklisted (usually via DELETE /auth) */
        if(helpers.destroyedTokens.indexOf(token) >= 0) return next(new HttpError('invalid token provided: destroyed',400));

        if(!token) return next();
        /** Verify token if one was provided */
        jwt.verify(token, config.secretKey, function(err, decoded) {
          if(err) return next(new HttpError('invalid token provided', 400));
          req.currentUser = decoded || {};
          /** Verify User Exists */
          User
            .findOne({ _id: req.currentUser.id })
            .select('_id role')
            .lean()
            .exec(function(err, user) {
              if(err) console.error(err);
              if(err || !user) return next(new HttpError('invalid token provided', 400));
              req.currentUser = user;
              next();
            });
          });
      })

      /** Check if token is about to expire to issue a fresh token */
      .use(function(req, res, next) {
        if(!req.currentUser) return next();
        /** Issue new token if it expires within x minutes (configured by jwt.maxMinutesRefresh) */
        if((req.currentUser.exp - config.jwt.maxMinutesRefresh * 60) * 1000 < Date.now())
          helpers.freshToken(res, req.currentUser);
        next();
      });
  },

  authenticated: function() {
    return compose()

      /** Parse bearer token (if exists) */
      .use(this.authenticate())

      /** Require token to exist and load current user into Request */
      .use(function(req, res, next) {
        if(!req.currentUser) return next(new HttpError('valid user token is required', 401));
        User.findById(req.currentUser._id, '-passwordDigest', function(err, user) {
          if(err) return next(err);
          if(!user) return next(new HttpError('valid user token is required', 401));
          /** @type {User} authenticated user for request */
          req.currentUser = user;
          next();
        });
      });
  },

  hasRole: function(role) {
    return compose()
      .use(this.authenticate())
      .use(function(req, res, next) {
        var roles = config.users.roles;
        if(roles.indexOf(req.currentUser.role) < roles.indexOf(role))
          return next(new HttpError('insufficient permissions', 403));
        next();
      });
  }
};

module.exports = AuthMiddleware;