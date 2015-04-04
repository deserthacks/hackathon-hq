'use strict';

var _ = require('lodash'),
    async = require('async'),
    mongoose = require('mongoose'),
    crypto = require('crypto'),
    Timeline = require('pebble-api'),
    Schema = mongoose.Schema;

var config = require('../../config');

var timeline = new Timeline({ apiKey: config.pebble.api_key });

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
  type: { type: String, enum: eventTypes, required: true, index: true },
  pinId: String,

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
    _createPin(this, function(pin) {
      this.pinId = pin.id;
      timeline.sendSharedPin([this.type], pin, function(err, body, res) {
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
        id: crypto.randomBytes(7).toString('hex'),
        time: event.date,
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
        id: crypto.randomBytes(7).toString('hex'),
        time: event.date,
        reminders: [{
          time: new Date(event.date - 10 * 60000),
          layout: new Timeline.Pin.Layout({
            type: Timeline.Pin.LayoutType.GENERIC_REMINDER,
            tinyIcon: Timeline.Pin.Icon.ALARM,
            title: '10 minutes before food'
          })
        }],
        updateNotification: {
          time: event.date,
          layout: new Timeline.Pin.Layout({
            type: Timeline.Pin.LayoutType.GENERIC_REMINDER,
            tinyIcon: Timeline.Pin.Icon.ALARM,
            title: 'Food updated'
          })
        },
        layout: new Timeline.Pin.Layout({
          type: Timeline.Pin.LayoutType.GENERIC_PIN,
          tinyIcon: Timeline.Pin.Icon.BULB,
          title: event.title,
          body: event.description
        });
      });
      break;
    case 'talk':
      pin = new Timeline.Pin({
        id: crypto.randomBytes(7).toString('hex'),
        time: event.date,
        duration: event.duration,
        layout: new Timeline.Pin.Layout({
          type: Timeline.Pin.LayoutType.GENERIC_PIN,
          tinyIcon: Timeline.Pin.Icon.PIN,
          title: event.title,
          shortTitle: 'Hackathon: Talk',
          body: event.description
        })
      });
      break;
    case 'event':
      pin = new Timeline.Pin({
        id: crypto.randomBytes(7).toString('hex'),
        time: event.date,
        duration: event.duration,
        updateNotification: {
          time: event.date,
          layout: new Timeline.Pin.Layout({
            type: Timeline.Pin.LayoutType.GENERIC_REMINDER,
            tinyIcon: Timeline.Pin.Icon.ALARM,
            title: 'Event updated'
          })
        },
        layout: new Timeline.Pin.Layout({
          type: Timeline.Pin.LayoutType.GENERIC_PIN,
          tinyIcon: Timeline.Pin.Icon.PIN,
          title: event.title,
          body: event.description
        })
      });
      break;
  }
  done(pin);
}

module.exports = mongoose.model('Event', EventSchema);