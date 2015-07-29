'use strict';

var Chance = require('chance');
var chance = new Chance();

var auth = require('../../auth/auth.helpers');
var User = require('./user.model');

var userSeed = {

  clearUsers: function clearUsers() {
    User.find({}).remove(function(err, users) {
      console.log(users);
    });
  },

  createUser: function createUser(isAdmin, cb) {
    var user = {
      firstName: chance.first(),
      lastName: chance.last(),
      email: chance.email(),
      password: chance.word({length: 9}),
      role: isAdmin ? 'admin' : 'user',
      bio: chance.paragraph()
    };

    User.create(user, function(err, user) {
      return cb(user);
    });
  },

  createTestUser: function createTestUser(cb) {
    User.create({
      firstName: 'User',
      lastName: 'Joe',
      email: 'user@user.com',
      password: 'user',
      role: 'user',
      bio: 'yo i\'m a user'
    }, function(err, user) {
      if (!err) {
        console.log('%s token for %s: $s', user.role, user.firstName, auth.signToken(user));

        return cb(user);
      }
    });
  },

  createAdminUser: function createAdminUser(cb) {
    User.create({
      firstName: 'Admin',
      lastName: 'Joe',
      email: 'admin@admin.com',
      password: 'admin',
      role: 'admin',
      bio: 'yo i\'m an admin'
    }, function(err, admin) {
      if (!err) {
        console.log('%s token for %s: $s', admin.role, admin.firstName, auth.signToken(admin));

        return cb(admin);
      }
    });
  }

};

module.exports = userSeed;
