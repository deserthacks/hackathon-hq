'use strict';

var express = require('express');
var mongoose = require('mongoose');

var config = require('./config');

mongoose.connect(config.mongodb.uri, config.mongodb.options);

var app = express();
require('./config/express')(app);
require('./routes')(app);

// Server initialization
require('./config/server/http')(app);
if (config.seedDB) require('./seeds')();

// HTTPS server initialization
if (config.https.enabled) require('./config/server/https')(app);

module.exports = app;
