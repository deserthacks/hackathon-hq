'use strict';

var Event = require('./event.model');

Event.find({}).remove(function() {
  Event.create({
    title: 'Breakfast',
    description: 'Krispy Kreme Donuts',
    type: 'food',
    pinId: 1234,
    date: new Date(2015, 4, 4, 7)
  }, {
    title: 'Node.js + Docker Microservices talk',
    description: 'Listen to employees from a top tech startup talk about some cool stuff',
    type: 'talk',
    pinId: 12345,
    duration: 60,
    date: new Date(2015, 4, 4, 17)
  }, {
    title: 'Hacking ends at 12:00 PM',
    description: 'Hacking ends at 12:00 PM',
    type: 'reminder',
    pinId: 123456,
    date: new Date(2015, 4, 5, 12)
  }, {
    title: 'LA Hacks Fall 2015?',
    description: 'Remember to submit your application',
    type: 'event',
    pinId: 112233,
    date: new Date(2015, 6, 6, 12)
  }, {
    title: 'Pastry Coding Challenge',
    description: 'Chug water, do push ups, and solve 999 factorial!',
    type: 'event',
    pinId: 1234567,
    date: new Date(2015, 4, 4, 0)
  },function() {
      console.log('finished populating events');
    }
  );
});