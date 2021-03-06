'use strict';

var factory = require('factory-lady');
var User = require('../user.model');

module.exports = function() {
  factory.define('user', User, {
    firstName: 'Test',
    lastName: 'User',
    email: function(use){ return use(Date.now()+'user@example.com'); },
    password: 'password',
    verificationKey: 7654321
  });
};
