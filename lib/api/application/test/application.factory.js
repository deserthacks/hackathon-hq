'use strict';

var factory = require('factory-lady'),
    Application = require('../application.model'),
    Hackathon = require('../../hackathon/hackathon.model'),
    User = require('../../user/user.model');

factory.define('application', Application, {
  user: factory.assoc('user', 'id'),
  hackathon: factory.assoc('hackathon', 'id'),
});

factory.define('hackathon', Hackathon, {
  subdomain: 'TestHackathon'
});

factory.define('user', User, {
  name: 'Test user',
  email: function(use){ return use(Date.now()+'user@example.com'); },
  password: 'password',
  verificationKey: 7654321
});

factory.define('adminUser', User, {
  name: 'Admin user',
  email: function(use){ return use(Date.now()+'admin@example.com'); },
  password: 'password',
  verificationKey: 7654321,
  role: 'admin'
});