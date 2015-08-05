'use strict';

var async = require('async');
var Chance = require('chance');
var chance = new Chance();
var Hackathon = require('./hackathon.model');
var mongoose = require('mongoose');
var ApplicationConfig = require('../application/application-config.model');

function createApplicationConfig(hackathon, role, date, callback) {
  var year = date.getFullYear();
  var month = date.getMonth();

  ApplicationConfig.create({
    role: role,
    hackathon: hackathon._id,
    open_at: chance.date({year: year, month: (month - 3), day: 3}),
    close_at: chance.date({year: year, month: (month - 1), day: 14}),
    decision_at: chance.date({year: year, month: month, day: 1}),
    form: new mongoose.Types.ObjectId()
  }, function(err, application) {
    return callback(err, application);
  });
}

var HackathonSeed = {

  clearHackathons: function clearHackathons() {
    Hackathon.find({}).remove(function() {
      console.log('Hackathons cleared');
    });
  },

  // #yolo
  seedHackathons: function seedHackathons(organizers, volunteers, callback) {
    organizers = organizers || [];
    volunteers = volunteers || [];
    var today = new Date();
    var currentYear = today.getFullYear();
    var i = 0;
    var seasons = ['Spring', 'Fall'];
    var seeds = [];
    var years = [];

    for (var k = 0; k < 5; k++) {
      if (k % 2 !== 0) {
        currentYear += 1;
      }
      years.push(currentYear);
    }

    async.each(years, function(year, cb) {
      i++;
      var season = seasons[(i % 2)];
      var startDate = chance.date({year: year, month: (season === 'Spring' ? 3 : 10), day: 23});
      var endDate = chance.date({year: year, month: (season === 'Spring' ? 3 : 10), day: 25});

      var seed = {
        season: season + ' ' + year,
        slug: season.charAt(0).toLowerCase() + year,

        event: {
          location: '',
          location_address: chance.address(),
          start_at: startDate,
          end_at: endDate
        },

        organizers: organizers,
        volunteers: volunteers
      };

      seeds.push(seed);
      cb();
    }, function() {
      Hackathon.create(seeds, function(err, hackathons) {
        async.each(hackathons, function(hackathon, cb) {
          async.parallel({
            attendee: function(callback) {
              createApplicationConfig(hackathon, 'participant', hackathon.event.start_at, function(err, application) {
                if (err) callback(err, null);

                callback(null, application);
              });
            },
            mentor: function(callback) {
              createApplicationConfig(hackathon, 'mentor', hackathon.event.start_at, function(err, application) {
                if (err) callback(err, null);

                callback(null, application);
              });
            },
            sponsor: function(callback) {
              createApplicationConfig(hackathon, 'sponsor', hackathon.event.start_at, function(err, application) {
                if (err) callback(err, null);

                callback(null, application);
              });
            },
            volunteer: function(callback) {
              createApplicationConfig(hackathon, 'volunteer', hackathon.event.start_at, function(err, application) {
                if (err) callback(err, null);

                callback(null, application);
              });
            }
          }, function(err) {
            if (err) console.log(err);

            cb();
          });
        }, function() {
          return callback(hackathons);
        });
      });
    });
  }
};

module.exports = HackathonSeed;
