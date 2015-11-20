'use strict';

var express = require('express');

var controller = require('./module.controller');
var auth = require('../../auth/auth.middleware');

var router = express.Router();

// Param
router.param('id', controller.findModule);

// Create
router.post('/', auth.hasRole('admin'), auth.authenticated(), controller.create);

// Read
router.get('/', auth.authenticated(), auth.hasRole('admin'), controller.index);
router.get('/:id', controller.show);

// Update
router.put('/:id', auth.authenticated(), auth.hasRole('admin'), controller.update);

// Delete
router.delete('/:id', auth.authenticated(), auth.hasRole('admin'), controller.destroy);

module.exports = router;
