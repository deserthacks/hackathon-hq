'use strict';

var Chance = require('chance');
var chance = new Chance();
var mongoose = require('mongoose');

var Application = require('./application.model');

module.exports = function seedApplications(user, hackathonId, callback) {
  user = user || {};
  hackathonId = hackathonId || new mongoose.Types.ObjectId();
  var application = makeApplication(user, hackathonId);

  Application.find({}).remove(function() {
    Application.create(application, function(err, application) {
      return callback(application);
    });
  });
};

function makeApplication(user, hackathonId) {
  hackathonId = hackathonId || new mongoose.Types.ObjectId();
  var userID = user._id || new mongoose.Types.ObjectId();
  var responses = [];

  for (var i = 0; i < 3; i ++) {
    responses.push(chance.paragraph());
  }

  return {
    response: responses,
    role: chance.pick(['participant', 'mentor']),
    hackathon: hackathonId,
    user: userID,
    reviewedBy: null
  };
}
