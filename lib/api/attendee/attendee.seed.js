'use strict';

var Chance = require('chance');
var chance = new Chance();
var mongoose = require('mongoose');

var Attendee = require('./attendee.model');

var AttendeeSeed = {

  clearAttendees: function clearAttendees() {
    Attendee.find({}).remove(function() {
      console.log('Attendees cleared');
    });
  },

  seedAttendee: function seedAttendee(user, hackathon, callback) {
    user = user || new mongoose.Types.ObjectId();
    var hackathonID = hackathon._id || new mongoose.Types.ObjectId();
    var attendees = [];

    var attendee = makeAttendee(user, null, hackathonID);

    attendees.push(attendee);

    Attendee.create(attendees, function(err, attendees) {
      return callback(attendees);
    });
  }
};

module.exports = AttendeeSeed;

function makeAttendee(user, team, hackathon) {
  user = user || {};
  team = team || {};
  hackathon = hackathon || {};
  var hackathonID = hackathon._id || new mongoose.Types.ObjectId();
  var teamID = team._id || new mongoose.Types.ObjectId();
  var userID = user._id || new mongoose.Types.ObjectId();
  var responses = [];

  for (var i = 0; i < 3; i ++) {
    responses.push(chance.paragraph());
  }

  return {
    team: teamID,
    resume: chance.paragraph,
    phone: chance.phone(),
    hackathon: hackathonID,
    user: userID,
    role: 'participant'
  };
}
