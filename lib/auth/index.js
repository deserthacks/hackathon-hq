'use strict';

var express = require('express');

var Auth = require('./auth.helpers'),
    AuthMiddleware = require('./auth.middleware'),
    config = require('../config'),
    User = require('../api/user/user.model');

// Passport stratagies
require('./local/local.passport')(User, config);
//require('./github/passport').setup(User, config);

var router = express.Router();

// Authentication routes
router.use('/local', require('./local'));
//router.use('/github', require('./github'));

/** Check that authentication is valid **/
router.post('/', AuthMiddleware.authenticate(), function(req, res){
  res.status(204).end();
});

/** Hard deauthenticate */
router.delete('/', AuthMiddleware.authenticate(), function(req, res){
  Auth.destroyToken(req.bearerToken);
  res.status(204).end();
});

module.exports = router;