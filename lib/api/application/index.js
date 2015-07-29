'use strict';

var express = require('express');

var controller = require('./application.controller');
var auth = require('../../auth/auth.middleware');

var router = express.Router();

// Param
router.param('id', controller.findApplication);

// Create
router.post('/', auth.authenticated(), controller.create);

// Read
router.get('/', auth.authenticated(), auth.hasRole('admin'), controller.index);
router.get('/:id', auth.authenticated(), controller.authenticateSelf, controller.show);
router.get('/:id/adjacent', auth.authenticated(), auth.hasRole('admin'), controller.getAdjacentApplications);

// Update
router.put('/:id', auth.authenticated(), controller.authenticateSelf, controller.update);

// Delete
router.delete('/:id', auth.authenticated(), controller.authenticateSelf, controller.destroy);

// Actions
router.post('/:id/approval', auth.authenticated(), auth.hasRole('admin'), controller.approveApplication);
router.post('/:id/rejection', auth.authenticated(), auth.hasRole('admin'), controller.rejectApplication);

module.exports = router;
