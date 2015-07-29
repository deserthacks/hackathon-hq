'use strict';

module.exports = {
  ip:   process.env.IP ||
        undefined,

  port: process.env.PORT ||
        8080,

  mongodb: {
    uri:  process.env.MONGOLAB_URI ||
          process.env.MONGOHQ_URL ||
          process.env.OPENSHIFT_MONGODB_DB_URL+process.env.OPENSHIFT_APP_NAME ||
          'mongodb://localhost/hackathon-hq'
  }
};
