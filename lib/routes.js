'use strict';

var HttpError = require('http-error').HttpError;

var auth = require('./auth/auth.middleware'),
    config = require('./config');

module.exports = function(app) {
  // Authentication
  app.use(auth.authenticate());
  app.use('/auth', require('./auth'));

  // Main routes
  app.use('/users', require('./api/user'));
  app.use('/applications', require('./api/application'));
  app.use('/attendees', require('./api/attendee'));
  app.use('/hackathons', require('./api/hackathon'));
  app.use('/events', require('./api/event'));
  //app.use('/admin', require('./api/admin'));

  app.get('/', function(req, res) {
    res.send('The application is alive in '+app.get('env')+' mode!');
  });

  // Catch all
  app.all('*', function(req, res, next) {
    /** Pass to error handling */
    next(new HttpError('invalid endpoint', 404));
  });

  // Error catch
  // jshint unused: false
  app.use(function(err, req, res, done) {
    /** @type {HttpError} fallback to a 404 Not Found */
    if(!err) err = new HttpError('invalid endpoint', 404);

    /** @type {String} Use ValidationError string helper or Error message */
    var message;
    if(err.name === 'ValidationError') {
      message = err.toString().replace(/^ValidationError: /,'');
      err.code = 422;
    } else {
      message = err.message || 'An error occured';
    }

    /** Only log the stack trace if error status code is greater than 404 */
    if(err.code > 404 || err.message && !err.code) console.error(err.stack || err);
    return res.status(err.code || err.status || 500).json({ error: message });
  });
};