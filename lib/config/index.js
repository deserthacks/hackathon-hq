'use strict';

var _ = require('lodash'),
    path = require('path');

/** @type {String} default to development environment */
if(['production', 'development', 'test'].indexOf(process.env.NODE_ENV) < 0)
  process.env.NODE_ENV = 'development';

var config = {
  /** @type {String} environment to use in application */
  env: process.env.NODE_ENV,

  /** @type {String} domain url to root (without trailing slash) */
  domain: process.env.DOMAIN || 'http://localhost:9000',

  /** @type {String} root path of the application */
  root: path.normalize(__dirname + '/..'),

  /** @type {Number} port to execute HTTP server on */
  port: process.env.PORT || 9000,

  /** @type {Object} HTTPS server options */
  https: {
    /** @type {Boolean} toggle for use of https */
    enabled: process.env.HTTPS_KEY && process.env.HTTPS_CERTIFICATE,
    /** @type {Number} port to execute HTTPS server on */
    port: process.env.HTTPS_PORT || 9443,
    /** @type {String} path to SSL private key */
    key: process.env.HTTPS_KEY || '',
    /** @type {String} path to SSL certificate */
    certificate: process.env.HTTPS_CERTIFICATE || ''
  },

  /** @type {Object} sockets configuration */
  socketio: {
    /** @type {Boolean} toggle for use of sockets */
    enabled: true
  },

  /** @type {Boolean} populate the database with seed data */
  seedDB: process.env.SEED_DB === 'true',

  /** @type {String} session secret key used with jsonwebtoken */
  secretKey: process.env.SECRET_KEY || 'hq-api-secret',

  /** @type {Object} CORS configuration (see npmjs.com/cors) */
  cors: {
    /** @type {Array} origins to whitelist, use true to automatically whitelist all */
    origin: true,
    /** @type {Array} HTTP request methods to permit by CORS */
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    /** @type {Array} HTTP headers to permit by CORS */
    allowedHeaders: ['Origin', 'Content-Type', 'Authorization'],
    /** @type {Array} HTTP headers to expose by CORS */
    exposedHeaders: ['X-Bearer-Token']
  },

  /** @type {Object} JWT token options */
  jwt: {
    /** @type {Object} JWT token creation options (see npmjs.com/jsonwebtoken) */
    options: {
      expiresInMinutes: 180
    },
    /** @type {Number} minutes until token expiration before new one is issued */
    maxMinutesRefresh: 10
  },

  /** @type {Object} mongodb connection arguments */
  mongodb: {
    options: {
      db: {
        safe: true
      }
    }
  },

  /** @type {Object} user configuration */
  users: {
    /** @type {Array} whitelisted passport-(provider) strategies (don't include 'local') */
    providers: [],
    /** @type {Array} user roles in order from lowest to highest */
    roles: ['guest', 'user', 'sponsor', 'volunteer', 'admin'],
    /** @type {Array} name prefixes for default avatars */
    defaultAvatars: ['deafult']
  },

  /** @type {Object} hackathon attendee configuration */
  attendees: {
    /** @type {Array} attendee roles at a hackathon from lowest to highest */
    roles: ['hacker', 'mentor', 'recruiter', 'volunteer', 'organizer']
  },

  email: {
    templates: {
      verify: '',
      registration: '',
      attendee: '',
      team: '',
      application: '',
      decision: ''
    }
  },

  /** @type {Object} AWS information */
  awsS3: {
    key:      process.env.AWS_S3_KEY || '',
    secret:   process.env.AWS_S3_SECRET || '',
    bucket:   process.env.AWS_S3_BUCKET || '',
    region:   process.env.AWS_REGION || '',
    path:     'hackathon/'
  },

  sendgrid: {
    api_user: process.env.SENDGRID_API_USER || '',
    api_key:  process.env.SENDGRID_API_KEY || ''
  }
};

module.exports = _.merge(config, require('./environment'));