'use strict';

var Event = require('./event.model');

var _now = Date.now();

Event.find({}).remove(function() {
  Event.create({
    title: 'Breakfast',
    description: 'Krispy Kreme Donuts',
    type: 'food',
    pinId: 1234,
    date: _now - (60000 * 5)
  }, {
    title: 'Node.js + Docker Microservices talk',
    description: 'Listen to employees from a top tech startup talk about some cool stuff',
    type: 'food',
    pinId: 12345,
    duration: 60,
    date: _now + (60000 * 10)
  }, {
    title: 'LA Hacks Fall 2015?',
    description: 'Remember to submit your application',
    type: 'food',
    pinId: 112233,
    date: _now + (60000 * 25)
  }, {
    title: 'Pastry Coding Challenge',
    description: 'Chug water, do push ups, and solve 999 factorial!',
    type: 'food',
    pinId: 1234567,
    date: _now + (60000 * 35)
  },function() {
      console.log('finished populating events');
    }
  );
});