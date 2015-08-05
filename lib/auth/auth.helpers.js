'use strict';

var jwt = require('jsonwebtoken');

var config = require('../config');

var AuthHelpers = {
  /** @type {Array} tokens that have been blacklisted (or user logged out) */
  destroyedTokens: [],

  /**
   * Sign a JWT token for user
   *
   * @param  {User}   user Subject to sign token as
   *
   * @return {String}      Signed token
   */
  signToken: function(user){
    return jwt.sign({ id: user.id || String(user._id) }, config.secretKey, config.jwt.options);
  },

  /**
   * Sign and respond with user and bearer token header
   *
   * @param  {Response} res  Response object for current request
   * @param  {User}     user Subject to sign token as
   *
   * @return {Response}      Response object with rendered JSON
   */
  createToken: function(res, user) {
    this.freshToken(res, user);

    // Mongoose can't handle toObject() nor does it have any intelligent
    // way to select fields off a document object so we're doing it the
    // ugly way and setting fields to undefined like heathens
    user.populate('hackathons applications', function(err, doc) {
      doc.toObject();

      // Remove fields
      doc.email = undefined;
      doc.passwordDigest = undefined;
      doc.verificationKey = undefined;
      doc.__v = undefined;
      return res.json(doc);
    });
  },

  /**
   * Sign and set bearer token header
   *
   * @param  {Response} res  Response object for current request
   * @param  {User}     user Subject to sign token as
   *
   * @return {String}        Signed token
   */
  freshToken: function(res, user){
    var token = this.signToken(user);
    res.header('X-Bearer-Token', token);
    return token;
  },

  /**
   * Add user token to blacklist
   *
   * @param  {String} token JWT token to blacklist
   *
   * @return {void}
   */
  destroyToken: function(token){
    this.destroyedTokens.push(token);
  }
};

module.exports = AuthHelpers;
