'use strict';

var compression = require('compression'),
    cookieParser = require('cookie-parser'),
    cors = require('cors'),
    express = require('express'),
    methodOverride = require('method-override'),
    morgan = require('morgan'),
    path = require('path'),
    passport = require('passport'),
    skipper = require('skipper');

var config = require('./');

module.exports = function(app) {
  app.use(cors(config.cors));

  // Request parsers
  app.use(cookieParser());
  app.use(methodOverride());
  app.use(skipper());

  // Sessions
  app.use(passport.initialize());

  // Output config
  app.use(compression());
  if(app.get('env') === 'development') {
    app.use(morgan('dev'));
    app.use('/assets', express.static(path.join(config.root,'.tmp')));
  } else if(app.get('env') === 'production') {
    app.use(morgan('short'));
  }
};