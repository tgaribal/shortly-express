var express = require('express');
var util = require('./lib/utility');
var partials = require('express-partials');
var bodyParser = require('body-parser');
var session = require('express-session');


var db = require('./app/config');
var Users = require('./app/collections/users');
var User = require('./app/models/user');
var Links = require('./app/collections/links');
var Link = require('./app/models/link');
var Click = require('./app/models/click');

var app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(partials());
// Parse JSON (uniform resource locators)
app.use(bodyParser.json());
// Parse forms (signup/login)
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));

app.use(session({
  secret: 'shortly',
  resave: false,
  saveUninitialized: true
}));


var restrict = function(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    req.session.error = 'Access denied! Please log in';
    res.redirect('/login');
  }
};


app.get('/', restrict, function(req, res) {
  res.render('index');
});

app.get('/create', restrict,
function(req, res) {
  console.log('create', req.session);
  res.render('index');
});

app.get('/links', restrict,
function(req, res) {
  Links.reset().fetch().then(function(links) {
    res.status(200).send(links.models);
  });
});

app.post('/links', 
function(req, res) {
  var uri = req.body.url;
  if (!util.isValidUrl(uri)) {
    console.log('Not a valid url: ', uri);
    return res.sendStatus(404);
  }

  new Link({ url: uri }).fetch().then(function(found) {
    if (found) {
      res.status(200).send(found.attributes);
    } else {
      util.getUrlTitle(uri, function(err, title) {
        if (err) {
          console.log('Error reading URL heading: ', err);
          return res.sendStatus(404);
        }
        console.log('within link create', req.session.user);
        Links.create({
          url: uri,
          title: title,
          baseUrl: req.headers.origin,
          userId: req.session.user.id
        })
        .then(function(newLink) {
          res.status(200).send(newLink);
        });
      });
    }
  });
});

app.get('/signup', function (req, res) {
  res.render('signup');
});

app.post('/signup',
  function (req, res) {
    var username = req.body.username;
    var password = req.body.password;
    new User({username: username, password: password}).fetch().then(function (user) {
      if (user) {
        res.redirect(301, '/login');
        console.log('username already exists', user);
      } else {
        Users.create({
          username: username,
          password: password
        })
        .then(function (newUser) {
          //start new session?
          // req.session.regenerate(function() {
          req.session.user = newUser;
          res.redirect(301, '/');
          // });
        });
      }
    });
  });

app.get ('/logout', function (req, res) {
  console.log('logout get request');
  req.session.destroy();
  console.log('req.session.user should be undefined after sess destroyed', req.session);
  // req.session.user = undefined;
  res.render('login');

});

app.get ('/login', function (req, res) {
  console.log('login get request');
  res.render('login');
});

app.post('/login',
  function (req, res) {
    console.log('login post request');
    var username = req.body.username;
    var password = req.body.password;
    
    Users.fetch().then(function(users) {
      var userList = users.models;
      userList.forEach(function(user) {
        if (user.attributes.username === username && user.attributes.password === password) {
          //start new session?
          // req.session.regenerate(function() {
          // console.log('user in sess regenerate', user);
          req.session.user = user;
          res.redirect(301, '/');
          // });
        }
      });
      // console.log('after then', req.session.user);
      if (req.session.user === undefined) {
        // console.log('outside sess regenerate', req.session.user);
        res.redirect(301, '/login');
      }
    });
  });
/************************************************************/
// Write your authentication routes here
/************************************************************/



/************************************************************/
// Handle the wildcard route last - if all other routes fail
// assume the route is a short code and try and handle it here.
// If the short-code doesn't exist, send the user to '/'
/************************************************************/

app.get('/*', function(req, res) {   
  new Link({ code: req.params[0] }).fetch().then(function(link) {
    if (!link) {
      res.redirect('/');
    } else {
      var click = new Click({
        linkId: link.get('id')
      });

      click.save().then(function() {
        link.set('visits', link.get('visits') + 1);
        link.save().then(function() {
          return res.redirect(link.get('url'));
        });
      });
    }
  });
});

console.log('Shortly is listening on 4568');
app.listen(4568);
