'use strict';

var express = require('express');

var controller = require('./event.controller'),
    auth = require('../../auth/auth.middleware');

var router = express.Router();

// Param
router.param('id', controller.findEvent);

// Create
router.post('/', auth.authenticated(), auth.hasRole('admin'), controller.create);

// Read
router.get('/', controller.index);
router.get('/:id', controller.show);

// Update
router.put('/:id', auth.authenticated(), auth.hasRole('admin'), controller.update);

// Delete
router.delete('/:id', auth.authenticated(), auth.hasRole('admin'), controller.destroy);


module.exports = router;