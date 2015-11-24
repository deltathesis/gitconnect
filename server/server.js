require('dotenv').load();

var express = require('express');
var passport = require('passport');
var GitHubStrategy = require('passport-github').Strategy;
var bodyParser = require('body-parser');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var http = require('http');
var sockets = require('socket.io');
var User = require('./db/models/user.js').User;
var sql = require('./db/models/sqlModels.js');

var app = express();

var httpServer = module.exports = http.Server(app);
//Hook socket.io into express
var io = sockets(httpServer);

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: "http://" + process.env.HOST + ":" + process.env.PORT + "/auth/github/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    process.nextTick(function () {
      return done(null, profile);
    });
  }
));

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(session({
	secret: 'Hhhhhaaaah!',
	resave: true,
	saveUninitialized: true,
	cookie: {
		maxAge: 60000
	}
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(cookieParser());
app.use(express.static(__dirname + '/../client/app'));

app.get('/auth/github',
  passport.authenticate('github'));

app.get('/auth/github/callback', 
  passport.authenticate('github', { failureRedirect: '/login' }),
  function(req, res) {
  	req.session.username = req.user.username;
    req.session.userid = req.user.id;
    req.session.userlocation = req.user._json.location;
    req.session.avatar_url = req.user._json.avatar_url;

    // Store github cookie for 7 days
    res.cookie('github', { 
      id: req.user.id,
      username: req.user.username,
      avatar: req.user._json.avatar_url,
      location: req.user._json.location
    }, { expires: new Date(Date.now() + (1000 * 60 * 60 * 24 * 7))});

    User.get({username: req.user.username}).then(function(user){
      if(!user.length){
        console.log(user)
        User.saveNewUser(req.user.username)
        res.redirect('/#/subscription');
      } else {
        res.redirect('/')
      }
    })
  });

app.get('/logout', function(req, res) {
	req.logout();
  res.clearCookie('github');
	res.redirect('/');
});

app.get('/api/user', function(req, res) {
	res.json({username: req.session.username, avatar_url: req.session.avatar_url});
});

app.get('/api/user/:name', function(req, res) {
  User.get({username: req.params.name}).then(function(user){
    res.json({user: user})
  });
});

app.get('/api/user/:name/matches', function(req, res) {
  User.getMatches(req.params.name).then(function(users){
    res.json({matches: users});
  });
});

app.post('/api/user/updateform', function(req, res) {
  // Get user location
  var objLocation = { 
    baseNode: {username: req.body.data.resultsLocation.username},
    relNodes: [{uniq_id: req.body.data.resultsLocation.cityId, city: req.body.data.resultsLocation.cityName}],
    relNodeLabels: ['City'],
    relLabel: 'Lives'
  };
  // Saving location / relationship into the DB
  User.addRelationships(objLocation);

  // Get all user techs list
  var techlist = [];
  req.body.data.resultsTech.forEach(function(tech) {
    techlist.push({name: tech});
  })

  var objTech = {
    baseNode: {username: req.body.data.resultsLocation.username},
    relNodes: techlist,
    relNodeLabels: ['Language'],
    relLabel: 'KNOWS'
  }
  // Saving user tech / relationship into the DB
  User.addRelationships(objTech);

  // Get user Bio and Email
  var userInfos = {
    email: req.body.data.userInfos.email,
    bio: req.body.data.userInfos.bio
  }
  // Get User Node
  var objUser = {
    userNode: User.get({username: req.body.data.userInfos.username})
  }
  // Update user info into the DB
  objUser.userNode.then(function(users) {
    User.update(users[0], userInfos)
  })
  
  res.end();
})

// app.listen(process.env.Port, function(){
// console.log('Server now running on port: ' + process.env.PORT);
// });


httpServer.listen(process.env.PORT);
console.log('Server now running on port: ' + process.env.PORT);


/** Socket.io Messaging **/
var socketRoute = require('./routes/socket.js');
io.on('connection', socketRoute);
