'use strict';

var async = require('async');

var auth = require('../../auth/auth.helpers'),
    User = require('./user.model'),
    Hackathon = require('../hackathon/hackathon.model'),
    Attendee = require('../attendee/attendee.model');

User.find().exec(function(err, users){
  /** Delete users individually to trigger document middleware */
  async.eachLimit(users, 20, function(user, done){
    user.remove(done);
  }, function(err){
    if(err) return console.error(err);

    console.log('finished removing pre-seed users with remove hooks');

    User.create({
      firstName: 'Admin',
      lastName: 'Joe',
      email: 'admin@admin.com',
      password: 'admin',
      role: 'admin',
      bio: 'My name is Admin. I like cheese.'
    }, {
      firstName: 'Jerry',
      lastName: 'Louis',
      email: 'test@test.com',
      password: 'test',
      bio: 'Hello, I am Jerry.'
    }, function(err, admin, test){
      if(err) return console.error(err);

      Hackathon.find({}).remove(function(err) {
        if(err) return console.error(err);

        Hackathon.create({ subdomain: 'f15' }, function(err, hackathon) {
          if(err) return console.error(err);

          Attendee.find({}).remove(function() {
            Attendee.create({
              hackathon: hackathon.id,
              user: test.id,
              phone: '480-000-0000'
            }, function(err, attendee) {
              if(err) return console.error(err);

            });
            Attendee.create({
              hackathon: hackathon.id,
              user: admin.id,
              phone: '602-000-0000',
              role: 'organizer'
            }, function(err, attendee) {
              if(err) return console.error(err);

            });
          });
        });
      });

      console.log('finished seeding users');
      console.log('admin user token', auth.signToken(admin));
      console.log('test user token', auth.signToken(test));
    });
  });
});
