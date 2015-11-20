'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var config = require('../../config');

var ApplicationConfigSchema = new Schema({

  role: {
    type: String,
    enum: config.attendees.roles,
    required: true
  },
  hackathon: { type: Schema.Types.ObjectId, ref: 'Hackathon', required: true },

  open_at: { type: Date },
  close_at: { type: Date },
  decision_at: { type: Date },

  template: { type: Schema.Types.ObjectId, ref: 'ApplicationTemplate' },

  created_at: { type: Date, default: Date.now() },
  created_by: { type: Schema.Types.ObjectId, ref: 'User' },
  updated_at: { type: Date },
  updated_by: { type: Schema.Types.ObjectId, ref: 'User' }

});

ApplicationConfigSchema.index({ hackathon: 1});

///////////
// Hooks //
///////////

ApplicationConfigSchema

  /** Create new application template on creation */
  .pre('save', function(next) {
    var config = this;
    console.log('application config hook', this.isNew);
    if (!this.isNew) return next();
    if (this.template) return next();

    console.log('after hook print', this.template);

    this.model('ApplicationTemplate')
      .create({'application_config': this._id, 'created_by': this.created_by}, function(err, template) {
        console.log('ApplicationTemplate create in config hook', err, template, config);

        config.template = new mongoose.Types.ObjectId(template._id);
        next();
      });
  })
  .pre('save', function(next) {
    console.log(this);
    next();
  })

  /** Remove the application object from the user */
  .pre('remove', function(next) {

  });

// TODO:
// validate only one config per role

module.exports = mongoose.model('ApplicationConfig', ApplicationConfigSchema);
