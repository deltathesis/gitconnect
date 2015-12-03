var passport = require('passport');
var User = require('../db/models/user');

var auth = {};

auth.github = passport.authenticate('github');

auth.githubCallback = passport.authenticate('github', { failureRedirect: '/' });

auth.validate = function(req, res, next) {
	req.session.displayName = req.user.displayName;
  	req.session.username = req.user.username;
    req.session.userid = req.user.id;
    req.session.userlocation = req.user._json.location;
    req.session.avatar_url = req.user._json.avatar_url;

    User.get({username: req.user.username}).then(function(user){
      if(!user.length){
        //console.log(user);
        User.saveNewUser(req.user.username).then(function(newUser){

          // Store github cookie for 7 days
          res.cookie('gitConnectDeltaKS', { 
            id: req.user.id,
            availability: "true",
            username: req.user.username,
            displayName: req.user.displayName,
            avatar: req.user._json.avatar_url,
            location: req.user._json.location
          }, { expires: new Date(Date.now() + (1000 * 60 * 60 * 24 * 7))});

          res.redirect('/#/subscription/' + req.user.username);
        });
        
      } else {
        // Get availability Cookie
        // Store github cookie for 7 days
        res.cookie('gitConnectDeltaKS', { 
          id: req.user.id,
          availability: user[0].availability,
          username: req.user.username,
          displayName: req.user.displayName,
          avatar: req.user._json.avatar_url,
          location: req.user._json.location
        }, { expires: new Date(Date.now() + (1000 * 60 * 60 * 24 * 7))});

        res.redirect('/')
      }
  });
};

auth.logout = function(req, res) {
	req.logout();
	res.clearCookie('gitConnectDeltaKS');
	res.redirect('/');
};

module.exports = auth;