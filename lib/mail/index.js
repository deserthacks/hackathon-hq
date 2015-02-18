'use strict';

var sendgrid = require('sendgrid')(config.sendgrid.api_user, config.sendgrid.api_key);

var config = require('../config'),
    helpers = require('./auth.helpers'),
    User = require('../api/user/user.model');

var EmailFunctions = {

  /**
   * Send email verification to newly registered user
   * @param  {Object} user User Object
   */
  verifyEmail: function(user) {
    var email = new sendgrid.Email();
    email.addTo(user.email);
    email.addCategory('registration');
    email.setFilters({
      'templates': {
        'settings': {
          'enabled': 1,
          'template_id': config.email.templates.verify
        }
      }
    });
    email.setSubstitutions({'subject': ['Verify email']});
    email.setSections({'-key-': user.verificationKey}, {'-name-', user.firstName});
    sendgrid.send(email, function(err, res) {
      if(err) return console.log('error sending email');
    });
  },

  onRegistration: function(user) {
    var email = new sendgrid.Email();
    email.addTo(user.email);
    email.addCategory('registration');
    email.setFilters({
      'templates': {
        'settings': {
          'enabled': 1,
          'template_id': config.email.templates.registration
        }
      }
    });
    email.setSubstitutions({'subject': ['Welcome']});
    email.setSections({'-name-', user.firstName});
    sendgrid.send(email, function(err, res) {
      if(err) return console.log('error sending email');
    });
  },

  onApplicationSubmitted: function(user, data) {
    var email = new sendgrid.Email();
    email.addTo(data.user.email);
    email.addCategory('application');
    email.setFilters({
      'templates': {
        'settings': {
          'enabled': 1,
          'template_id': config.email.templates.application
        }
      }
    });
    email.setSubstitutions({'subject': ['We\'ve recieved your application!']});
    email.setSections({'-hackathon-': data.title}, {'-name-', user.firstName});
    sendgrid.send(email, function(err, res) {
      if(err) return console.log('error sending email');
    });
  },

  onApplicationDecision: function(user, data) {
    var email = new sendgrid.Email();
    email.addTo(user.email);
    email.addCategory('application');
    email.setFilters({
      'templates': {
        'settings': {
          'enabled': 1,
          'template_id': config.email.templates.decision
        }
      }
    });
    email.setSubstitutions({'subject': ['Welcome']});
    sendgrid.send(email, function(err, res) {
      if(err) return console.log('error sending email');
    });
  },

  onAttendeeCreated: function(user, data) {
    var email = new sendgrid.Email();
    email.addTo(user.email);
    email.addCategory('attendee');
    email.setFilters({
      'templates': {
        'settings': {
          'enabled': 1,
          'template_id': config.email.templates.attendee
        }
      }
    });
    email.setSubstitutions({'subject': ['Welcome']});
    sendgrid.send(email, function(err, res) {
      if(err) return console.log('error sending email');
    });
  },

  onCheckin: function() {

  }
};

module.exports = EmailFunctions;