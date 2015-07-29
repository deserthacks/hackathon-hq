'use strict';

var Timeline = require('pebble-api');

var config = require('./');

module.exports = new Timeline({ apiKey: config.pebble.api_key });
