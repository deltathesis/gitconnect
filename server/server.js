require('dotenv').load();

var express = require('express');
var passport = require('passport');
var GitHubStrategy = require('passport-github').Strategy;
var bodyParser = require('body-parser');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var http = require('http');
var sockets = require('socket.io');
var User = require('./db/models/user.js');
var Project = require('./db/models/project');
var Relationship = require('./db/models/relationship');
var Node = require('./db/models/node');

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
app.use(cookieParser());
app.use(passport.session());
app.use('/', require('./router'));
app.use(express.static(__dirname + '/../client/app'));

httpServer.listen(process.env.PORT);
console.log('Server now running on port: ' + process.env.PORT);


/** Socket.io Messaging **/
var socketRoute = require('./socket');
io.on('connection', socketRoute);
