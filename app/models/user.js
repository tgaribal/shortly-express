var db = require('../config');
var bcrypt = require('bcrypt-nodejs');
var Link = require('./link');
var Promise = require('bluebird');



var User = db.Model.extend({
  tableName: 'users',

  urls: function() {
    return this.hasMany(Link);
  },
  initialize: function() {
    this.on('creating', function (model, attrs, options) {
      // console.log('model', model);
      // console.log('attr', attrs);
      // console.log('options', options);
    });
  }
});

module.exports = User;