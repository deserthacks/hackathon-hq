'use strict';

var Hackathon = require('./hackathon.model');

var _now = Date.now();

var HackathonSeed = {

  clearHackathons: function clearHackathons() {
    Hackathon.find({}).remove(function() {
      console.log('hackathons cleared');
    });
  },

  seedHackathons: function seedHackathons(organizers, volunteers, callback) {
    organizers = organizers || [];
    volunteers = volunteers || [];

    var hackathonSeeds = [{
      season: 'Fall 2015',
      subdomain: 'f2015',
      eventDate: _now + (60000 * 100),
      applicationsOpen: _now,
      applicationDecisions: _now + (60000 * 30),
      organiers: organizers,
      volunteers: volunteers
    }, {
      season: 'Spring 2016',
      subdomain: 's2016',
      eventDate: _now + (60000 * 100),
      applicationsOpen: _now,
      applicationDecisions: _now + (60000 * 30),
      organiers: organizers,
      volunteers: volunteers
    }, {
      season: 'Fall 2016',
      subdomain: 'f2016',
      eventDate: _now + (60000 * 100),
      applicationsOpen: _now,
      applicationDecisions: _now + (60000 * 30),
      organiers: organizers,
      volunteers: volunteers
    }, {
      season: 'Spring 2017',
      subdomain: 's2017',
      eventDate: _now + (60000 * 100),
      applicationsOpen: _now,
      applicationDecisions: _now + (60000 * 30),
      organiers: organizers,
      volunteers: volunteers
    }];

    Hackathon.create(hackathonSeeds, function(err, hackathons) {
      return callback(hackathons);
    });
  }
};

module.exports = HackathonSeed;
