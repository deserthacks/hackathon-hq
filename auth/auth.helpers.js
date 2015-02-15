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
  createToken: function(res, user){
    this.freshToken(res, user);
    return res.json(user.sanitized);
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