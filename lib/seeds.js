'use strict';

var Application = require('./api/application/application.seed');
var AttendeeSeed = require('./api/attendee/attendee.seed');
var HackathonSeed = require('./api/hackathon/hackathon.seed');
var UserSeed = require('./api/user/user.seed');
var event = require('./api/event/event.seed');

module.exports = function seed() {
  clearData();

  var users = [];
  var admins = [];

  function addUser(user) {
    users.push(user);
  }

  function addAdmin(user) {
    admins.push(user);
  }

  // Seed users
  for (var i = 0; i < 40; i++) {
    if (i >= 9) {
      UserSeed.createUser(false, addUser);
    } else {
      UserSeed.createUser(true, addAdmin);
    }
  }

  // Create test user we can use
  UserSeed.createTestUser(addUser);

  // Create admin user we can use
  UserSeed.createAdminUser(addAdmin);

  // TODO: Work around having to use timeout
  setTimeout(seedEverything, 1000);

  function seedEverything() {
    console.log(admins.length);
    var arbitraryOrganizers = admins.splice(admins.length - 5);
    var arbitraryVolunteers = admins.splice(admins);

    seedHackathons(arbitraryOrganizers, arbitraryVolunteers, function callbackHellIsReal(hackathons) {

      // Seed hackathons
      for (var k = 0; k < hackathons.length; k++) {
        var hackathon = hackathons[k];

        seedEvents(hackathon._id);
        seedAttendees(users, hackathon._id);
        seedApplications(users, hackathon._id);
      }

      console.log('Finished seeding');
    });

  }

};

function clearData() {
  UserSeed.clearUsers();
  HackathonSeed.clearHackathons();
  AttendeeSeed.clearAttendees();
}

/**
 * Create a set amount hackathons in the
 * database and return them.
 *
 * @param {Number} count - Number of hackathons to create
 * @return {Array} hackathons - Array of hackathons ObjectIDs
 */
function seedHackathons(organizers, volunteers, callback) {
  HackathonSeed.seedHackathons(organizers, volunteers, function(hackathons) {
    return callback(hackathons);
  });
}

/**
 * Seed a hackathon with attendees given an array
 * of users.
 *
 * @param {Array} users - Array of user objects
 * @param {Array} hackathon - Array of hackathon objects
 * @return {Array} attendees - array of attendee objects
 */
function seedAttendees(users, hackathon) {
  var attendees = [];

  for (var i = 0; i < users.length; i++) {
    AttendeeSeed.seedAttendee(users[i], hackathon, attendees.push);
  }

  return attendees;
}

/**
 * Seed a hackathon with applications
 *`
 * @param {Array} users
 * @param {Array} hackathon
 * @return {Array} applications
 */
function seedApplications(users, hackathon) {
  hackathon = hackathon || '';
  var applications = [];

  for (var i = 0; i < users.length; i++) {
    Application(users[i], hackathon, applications.push);
  }

  return applications;
}

function seedEvents(hackathon) {
  return event(hackathon);
}
