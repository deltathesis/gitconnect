require('dotenv').load();

var express = require('express');
var passport = require('passport');
var GitHubStrategy = require('passport-github').Strategy;
var bodyParser = require('body-parser');
var session = require('express-session');
var cookieParser = require('cookie-parser');

var app = express();

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

    // Store github cookie for 7 days
    res.cookie('github', req.user.username, { expires: new Date(Date.now() + (1000 * 60 * 60 * 24 * 7))});

  	console.log('Attached username to session object.');
    res.redirect('/');
  });

app.get('/logout', function(req, res) {
	req.logout();
  res.clearCookie('github');
	res.redirect('/');
});

app.get('/api/user', function(req, res) {
	res.json({username: req.session.username});
});

app.listen(process.env.PORT, function() {
	console.log('Server now running on port: ' + process.env.PORT);
});