'use strict';

var express = require('express');

var controller = require('./hackathon.controller');
var auth = require('../../auth/auth.middleware');

var router = express.Router();

// Param
router.param('id', controller.findHackathon);

// Create
router.post('/', auth.authenticated(), auth.hasRole('admin'), controller.create);

// Read
router.get('/', controller.index);
router.get('/:id', controller.show);

// Update
router.put('/:id', auth.authenticated(), auth.hasRole('admin'), controller.update);

// Delete
router.delete('/:id', auth.authenticated(), auth.hasRole('admin'), controller.destroy);

// Actions
router.post('/:id/organizers', auth.authenticated(), auth.hasRole('admin'), controller.addOrganizer);
router.post('/:id/volunteers', auth.authenticated(), auth.hasRole('admin'), controller.addVolunteer);
router.delete('/:id/organizers/:user_id', auth.authenticated(), auth.hasRole('admin'), controller.removeOrganizer);
router.delete('/:id/volunteers/:user_id', auth.authenticated(), auth.hasRole('admin'), controller.removeVolunteer);


module.exports = router;
