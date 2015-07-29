'use strict';

var Chance = require('chance');
var chance = new Chance();
var mongoose = require('mongoose');

var Event = require('./event.model');

var _now = Date.now();

module.exports = function seedEvents(hackathon) {
  var hackathonID = hackathon._id || new mongoose.Types.ObjectId();
  var events = [];

  for (var i = 0; i < 10; i++) {
    var event = makeEvent(hackathonID);

    events.push(event);
  }

  Event.find({}).remove(function() {
    Event.create(events, function(err, events) {
        return events;
      }
    );
  });
};

function makeEvent(hackathonID) {
  return {
    title: chance.sentence(),
    description: chance.sentence(),
    type: chance.pick(['food', 'talk', 'event']),
    pinId: null,
    hackathon: hackathonID,
    date: _now - (60000 * chance.natural({min: 1, max: 20}))
  };
}
