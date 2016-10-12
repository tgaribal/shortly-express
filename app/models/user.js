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
      console.log('initialize model', model.get('password'));
      // var salt = bcrypt.genSaltSync(10);

      // bcrypt.hash(model.password, salt, null, function(err, hash) {
      //   if (err) {
      //     console.log(err);
      //   } else {
      //     console.log('hash from user model', hash);
      //     model.set('password', hash);
      //   }
      // });
    });
  }
});

module.exports = User;



















