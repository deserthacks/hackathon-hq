'use strict';

var _ = require('lodash'),
    async = require('async'),
    mongoose = require('mongoose'),
    crypto = require('crypto'),
    Timeline = require('pebble-api'),
    Schema = mongoose.Schema;

var config = require('../../config'),
    timeline = new Timeline({ apiKey: config.pebble.api_key });

var eventTypes = [
  'food',
  'event',
  'talk',
  'reminder'
];

var EventSchema = new Schema({
  title: String,
  description: String,

  date: Date,
  duration: Number,
  type: { type: String, enum: eventTypes, index: true, default: 'event' },
  pinId: { type: String },

  hackathon: { type: Schema.Types.ObjectId, ref: 'Hackathon' },

  createdAt: { type: Date, default: Date.now }
});

/////////////////
// Validations //
/////////////////

// none

///////////
// Hooks //
///////////

EventSchema

  .pre('save', function(next) {
    var that = this;

    _createPin(this, function(pin) {
      that.pinId = pin.id;
      timeline.sendSharedPin([that.type], pin, function(err, body, res) {
        if(err) return next(err);
        next();
      });
    });
  })

  .pre('remove', function(next) {
    // Need to add delete method for timeline pin
  });

function _createPin(event, done) {
  var pin;

  switch(event.type) {
    case 'reminder':
      pin = new Timeline.Pin({
        id: event.pinId ? event.pinId : crypto.randomBytes(7).toString('hex'),
        time: event.date,
        updateNotification: {
          time: event.date,
          layout: new Timeline.Pin.Layout({
            type: Timeline.Pin.LayoutType.GENERIC_REMINDER,
            tinyIcon: Timeline.Pin.Icon.PIN,
            title: 'Event updated'
          })
        },
        layout: new Timeline.Pin.Layout({
          type: Timeline.Pin.LayoutType.GENERIC_REMINDER,
          tinyIcon: Timeline.Pin.Icon.ALARM,
          title: event.title,
          shortTitle: 'Hackathon: Reminder',
          body: event.description
        })
      });
      break;
    case 'food':
      pin = new Timeline.Pin({
        id: event.pinId ? event.pinId : crypto.randomBytes(7).toString('hex'),
        time: event.date,
        reminders: [{
          time: new Date(event.date - 15 * 60000),
          layout: new Timeline.Pin.Layout({
            type: Timeline.Pin.LayoutType.GENERIC_REMINDER,
            tinyIcon: Timeline.Pin.Icon.CALENDAR,
            title: 'Meal in 15 minutes'
          })
        }],
        updateNotification: {
          time: event.date,
          layout: new Timeline.Pin.Layout({
            type: Timeline.Pin.LayoutType.GENERIC_REMINDER,
            tinyIcon: Timeline.Pin.Icon.ALARM,
            title: 'Meal updated'
          })
        },
        layout: new Timeline.Pin.Layout({
          type: Timeline.Pin.LayoutType.GENERIC_PIN,
          tinyIcon: Timeline.Pin.Icon.BULB,
          title: event.title,
          body: event.description
        })
      });
      break;
    case 'talk':
      pin = new Timeline.Pin({
        id: event.pinId ? event.pinId : crypto.randomBytes(7).toString('hex'),
        time: event.date,
        duration: event.duration,
        reminders: [{
          time: new Date(event.date - 15 * 60000),
          layout: new Timeline.Pin.Layout({
            type: Timeline.Pin.LayoutType.GENERIC_REMINDER,
            tinyIcon: Timeline.Pin.Icon.CALENDAR,
            title: 'Tech talk in 15 minutes'
          })
        }],
        createNotification: {
          time: event.date,
          layout: new Timeline.Pin.Layout({
            type: Timeline.Pin.LayoutType.GENERIC_REMINDER,
            tinyIcon: Timeline.Pin.Icon.PIN,
            title: 'New talk',
            body: 'A new tech talk has been added to your timeline'
          })
        },
        updateNotification: {
          time: event.date,
          layout: new Timeline.Pin.Layout({
            type: Timeline.Pin.LayoutType.GENERIC_REMINDER,
            tinyIcon: Timeline.Pin.Icon.PIN,
            title: 'Talk updated'
          })
        },
        layout: new Timeline.Pin.Layout({
          type: Timeline.Pin.LayoutType.GENERIC_PIN,
          tinyIcon: Timeline.Pin.Icon.PIN,
          title: event.title,
          shortTitle: 'Tech talk',
          body: event.description
        })
      });
      break;
    case 'event':
      pin = new Timeline.Pin({
        id: event.pinId ? event.pinId : crypto.randomBytes(7).toString('hex'),
        time: event.date,
        duration: event.duration,
        reminders: [{
          time: new Date(event.date - 15 * 60000),
          layout: new Timeline.Pin.Layout({
            type: Timeline.Pin.LayoutType.GENERIC_REMINDER,
            tinyIcon: Timeline.Pin.Icon.CALENDAR,
            title: 'Activity in 15 minutes'
          })
        }],
        createNotification: {
          time: event.date,
          layout: new Timeline.Pin.Layout({
            type: Timeline.Pin.LayoutType.GENERIC_REMINDER,
            tinyIcon: Timeline.Pin.Icon.PIN,
            title: 'New activity',
            body: 'A new activity has been added to your timeline'
          })
        },
        updateNotification: {
          time: event.date,
          layout: new Timeline.Pin.Layout({
            type: Timeline.Pin.LayoutType.GENERIC_REMINDER,
            tinyIcon: Timeline.Pin.Icon.PIN,
            title: 'Activity updated'
          })
        },
        layout: new Timeline.Pin.Layout({
          type: Timeline.Pin.LayoutType.GENERIC_PIN,
          tinyIcon: Timeline.Pin.Icon.CALENDAR,
          title: event.title,
          body: event.description
        })
      });
      break;
  }
  done(pin);
}

module.exports = mongoose.model('Event', EventSchema);