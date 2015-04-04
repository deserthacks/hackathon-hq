'use strict';

var sendgrid = require('sendgrid');

var config = require('./');

module.exports = sendgrid(config.sendgrid.api_user, config.sendgrid.api_key);