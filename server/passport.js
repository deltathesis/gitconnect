var passport = require('passport');
var GitHubStrategy = require('passport-github').Strategy;

module.exports = function(app) {

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

	app.use(passport.initialize());
	app.use(passport.session());

};