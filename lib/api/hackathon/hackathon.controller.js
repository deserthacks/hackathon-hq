'use strict';

var _ = require('lodash');
var HttpError = require('http-error').HttpError;

var Hackathon = require('./hackathon.model');

var HackathonController = {

  /** Create */

  create: function(req, res, next) {
    Hackathon.create(req.body, function(err, hackathon) {
      if (err) return next(err);

      res.status(200).json(hackathon);
    });
  },

  /** Read */

  index: function(req, res, next) {
    Hackathon.find(function(err, hackathons) {
      if (err) return next(err);

      res.json(hackathons);
    });
  },

  show: function(req, res, next) {
    req.hackathon.populate({ path: 'organizers volunteers'}, function(err, hackathon) {
      if (err) return next(err);
      if (!hackathon) return res.status(404);

      res.json(hackathon);
    });
  },

  /** Update **/

  update: function(req, res, next) {
    Hackathon.findById(req.params.id, function(err, hackathon) {
      if (err) next(err);
      if (!hackathon) { return res.status(404); }

      var updated = _.merge(hackathon, req.body);

      updated.save(function (err) {
        if (err) next(err);

        return res.json(200, hackathon);
      });
    });
  },

  /** Delete */

  destroy: function(req, res, next) {
    Hackathon.findById(req.params.id, function(err, hackathon) {
      if (err) return next(err);
      if (!hackathon) return res.status(404);

      hackathon.remove(function(err) {
        if (err) return next(err);

        res.status(204).end();
      });
    });
  },

  /** Actions */

  addOrganizer: function(req, res, next) {
    req.hackathon.organizers.push(req.body.user);
    req.hackathon.save(function(err) {
      if (err) return next(err);

      // Create new attendee object
      this.model('Attendee').safeCreate(req.body, { role: 'organizer', hackathon: req.hackathon._id }, function(err, attendee) {
          if (err) return next(err);

          // Add new attendee object to user
          this.model('User').findByIdAndUpdate(req.body.user, { $push: { hackathons: attendee._id } }, function(err, user) {
            if (err) return next(err);
            if (!user) return res.status(404);

            res.status(201);
          });
      });
    });
  },

  addVolunteer: function(req, res, next) {
    req.hackathon.volunteers.push(req.body.user);
    req.hackathon.save(function(err) {
      if (err) return next(err);

      // Create new attendee object
      this.model('Attendee').safeCreate(req.body, { role: 'volunteer', hackathon: req.hackathon._id }, function(err, attendee) {
          if (err) return next(err);

          // Add new attendee object to user
          this.model('User').findByIdAndUpdate(req.body.user, { $push: { hackathons: attendee._id } }, function(err, user) {
            if (err) return next(err);
            if (!user) return res.status(404);

            res.status(201);
          });
      });
    });
  },

  removeOrganizer: function(req, res, next) {
    req.hackathon.organizers.id(req.body.user).remove();
    req.hackathon.save(function(err) {
      if (err) return next(err);

      this.model('Attendee').findOne({ user: req.body.user, hackathon: req.hackathon._id }, function(err, attendee) {
        if (err) return next(err);
        if (!attendee) return res.status(404);

        attendee.remove(function(err, attendee) {
          if (err) return next(err);

          this.model('User').findByIdAndUpdate(req.body.user, { $pull: { hackathons: attendee._id } }, function(err, user) {
            if (err) return next(err);
            if (!user) return res.status(404);

            res.status(204);
          });
        });
      });
    });
  },

  removeVolunteer: function(req, res, next) {
    req.hackathon.volunteers.id(req.body.user).remove();
    req.hackathon.save(function(err) {
      if (err) return next(err);

      this.model('Attendee').findOne({ user: req.body.user, hackathon: req.hackathon._id }, function(err, attendee) {
        if (err) return next(err);
        if (!attendee) return res.status(404);

        attendee.remove(function(err, attendee) {
          if (err) return next(err);

          this.model('User').findByIdAndUpdate(req.body.user, { $pull: { hackathons: attendee._id } }, function(err, user) {
            if (err) return next(err);
            if (!user) return res.status(404);

            res.status(204);
          });
        });
      });
    });
  },

  /** Helpers */

  findHackathon: function(req, res, next) {
    if (!req.params.id.length == 3) {
      Hackathon.findById(req.params.id, function(err, hackathon) {
        if (err) return next(err);
        if (!hackathon) return next(new HttpError('not found', 404));

        req.hackathon = hackathon;
        next();
      });
    } else {
      Hackathon
        .findOne({ subdomain: req.params.id }, function(err, hackathon) {
          if (err) return next(err);

          req.hackathon = hackathon;
          next();
        });
    }
  },

  /**
   * Checks if user has permissions for a hackathon
   * given a role
   * @param  {String} role
   * @return {Function}
   */
  authenticateAs: function(role) {
    return function(req, res, next) {
      switch(role) {
        case 'organizer':
          if (req.hackathon.organizers.indexOf(req.currentUser) >= 0) {
            return next();
          }

          next(new HttpError('insufficient permissions', 403));
          break;
        case 'volunteer':
          if (req.hackathon.volunteers.indexOf(req.currentUser) >= 0) {
            return next();
          }

          next(new HttpError('insufficient permissions', 403));
          break;
        default:
          next(new HttpError('insufficient permissions', 403));
      }
    };
  }

};

module.exports = HackathonController;
