'use strict';

var express = require('express');

var controller = require('./attendee.controller'),
    auth = require('../../auth/auth.middleware');

var router = express.Router();

// Param
router.param('id', controller.findUser);

// Create
router.post('/', auth.authenticated(), auth.hasRole('admin'), controller.create);

// Read
router.get('/', controller.index);
router.get('/:id', controller.show);

// Update
router.put('/:id', auth.authenticated(), controller.authenticateSelf, controller.update);
router.put('/:id/checkin', auth.authenticated(), controller.updateCheckin);

// Delete
router.delete('/:id', auth.authenticated(), controller.authenticateSelf, controller.destroy);

// Collections


// Actions


module.exports = router;