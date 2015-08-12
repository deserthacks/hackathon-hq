'use strict';

module.exports = {
  mongodb: {
    uri: process.env.MONGO_URI_HOST ? 'mongodb://' + process.env.MONGO_URI_HOST + '/hackathon-hq' : 'mongodb://localhost/hackathon-hq'
  },

  https: {
    enabled: false
  },

  seedDB: true
};
