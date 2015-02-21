'use strict';

var factory = require('factory-lady'),
    User = require('../user.model');

factory.define('user', User, {
  name: 'Test user',
  email: function(use){ return use(Date.now()+'user@example.com'); },
  password: 'password',
  verificationKey: 7654321
});