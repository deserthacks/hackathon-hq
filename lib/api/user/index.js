'use strict';

var express = require('express');

var controller = require('./user.controller');
var auth = require('../../auth/auth.middleware');

var router = express.Router();

// Param
router.param('id', controller.findUser);

// Create
router.post('/', controller.create);

// Read
router.get('/', controller.index);
router.get('/me', auth.authenticated(), controller.me);
router.get('/:id', controller.show);

// Update
router.put('/:id', auth.authenticated(), controller.authenticateSelf, controller.update);
router.put('/:id/timeline', auth.authenticated(), controller.authenticateSelf, controller.updateTimeline);
router.put('/:id/verify', controller.verifyEmail);
router.put('/:id/password', auth.authenticated(), controller.authenticateSelf, controller.changePassword);

// Delete
router.delete('/:id', auth.authenticated(), controller.authenticateSelf, controller.destroy);

// Collections
router.get('/:id/hackathons', controller.getHackathons);
//router.get('/:id/applications', auth.authenticated(), auth.authenticateSelf, controller.getApplications);

module.exports = router;
