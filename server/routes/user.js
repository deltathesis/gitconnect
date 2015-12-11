var User = require('../db/models/user');
var Node = require('../db/models/node');
var nodemailer = require('nodemailer');

var user = {};

var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.GMAIL_ACCOUNT,
        pass: process.env.GMAIL_PWD
    }
});

user.getCurrentUser = function(req, res) {
	res.json({username: req.session.username, avatar_url: req.session.avatar_url});
};

user.getAllUsers = function(req, res) {
  User.getAllUsers().then(function(users) {
	res.json(users);
  });
};

user.getUser = function(req, res) {
  User.get({username: req.params.name}).then(function(user){
    res.json({user: user});
  });
};

user.getRelationships = function(req, res) {
  Node.getRelationshipData({username: req.params.name}, 'all', req.query.relLabel).then(function(user){
  	res.json({user: user});
  });
};

user.getMatchesPOST = function(req, res) {
  User.matches(req.body.filters, req.body.username, req.body.location || null, req.body.queryUsername || null).then(function(users){
    res.json({matches: users})
  });
};

user.getMatchesGET = function(req, res) {
  User.getMatches(req.params.name).then(function(users){
    res.json({matches: users});
  });
};

user.updateForm = function(req, res) {

  var techlist = [];
  req.body.data.resultsTech.forEach(function(tech) {
    techlist.push({name: tech});
  })

  // Get user location
  var objLocation = { 
    baseNode: {username: req.body.data.resultsLocation.username},
    relNodes: [{uniq_id: req.body.data.resultsLocation.cityId, city: req.body.data.resultsLocation.cityName}],
    relNodeLabels: ['City'],
    relDirection: 'out',
    relLabel: 'Lives'
  };

  // Get user Bio and Email
  var userInfos = {
    email: req.body.data.userInfos.email,
    bio: req.body.data.userInfos.bio,
    name: req.body.data.userInfos.name,
    location: req.body.data.userInfos.location
  };

  var objTech = {
    baseNode: {username: req.body.data.resultsLocation.username},
    relNodes: techlist,
    relNodeLabels: ['Language'],
    relDirection: 'out',
    relLabel: 'KNOWS'
  };

  // Saving location / relationship into the DB
  //console.log('city: ', objLocation);
  Node.addRelationships(objLocation)

  .then(function(){
    // We need to do this in case they delete their languages pulled from GitHub.
    User.deleteAllRelationships(req.body.data.resultsLocation.username, 'KNOWS')
      .then(function() {
        // Saving user tech / relationship into the DB
        return Node.addRelationships(objTech);
      });
  })

  .then(function(){

    // Get User Node
    return User.get({username: req.body.data.userInfos.username})

  })

  .then(function(user){

    // Update user info into the DB
    return Node.update(user[0], userInfos)

  })

  .then(function(){

    if (req.body.data.formType === "subscription" ) {
      // setup e-mail data with unicode symbols
      var mailOptions = {
          from: 'GitConnect <gitconnect.app@gmail.com>', // sender address
          to: req.body.data.userInfos.email, // list of receivers
          subject: 'Welcome to GitConnect', // Subject line
          text: 'Welcome ' + req.body.data.userInfos.name, // plaintext body
          html: '<h2>Welcome '+ req.body.data.userInfos.name +'</h2>'
                + '<p>You can know connect, work and share with developers all around the world</p>' // html body
      };
      // send mail with defined transport object
      transporter.sendMail(mailOptions, function(error, info){
          if(error){
              return console.log(error);
          }
          res.end();
      });
    }
  })
};

user.toggleAvailable = function(req, res) {
  var availability = {
    availability: req.body.data.availability
  }
  //console.log(availability);
  //Get User Node
  var objUser = {
    userNode: User.get({username: req.body.data.username})
  }

  // Update user availability into the DB
  objUser.userNode.then(function(users) {
    Node.update(users[0], availability)
  })

  res.end();
};

user.deleteUser = function(req, res) {
  var username = req.params.name;

  User.deleteUser(username).then(function(){
    //console.log("user deleted");
    req.logout();
    res.clearCookie('gitConnectDeltaKS');
    res.redirect('/');
  });

};

user.requestFriend = function(req, res) {
  //Parse out current and selected user info
  var currentUser = req.body.currentUser;
  var selectedUser = req.body.selectedUser;

  //Submit to addRelationships
  Node.addRelationships({
    baseNode: {username: currentUser.username}, 
    relNodes: [{username: selectedUser.username}],
    relNodeLabel: 'User',
    relDirection: 'out',
    relLabel: 'CONNECTION_REQUEST'
  }).then(function(results){
    //console.log(results)
  })
  res.end()
};

user.contactMessage = function(req, res) {
  var mailOptions = {
        from: 'GitConnect <gitconnect.app@gmail.com>', // sender address
        to: 'gitconnect.app@gmail.com', // list of receivers
        subject: 'Contact message from ' + req.body.email, // Subject line
        text: 'Contact message from ' + req.body.email, // plaintext body
        html: '<h2>Contact message from ' + req.body.email +'</h2><br>'
              + '<h4>Subject</h4><br>'
              + req.body.subject + '<br>'
              + '<h4>message</h4><br>'
              + req.body.message
    };
    // send mail with defined transport object
    transporter.sendMail(mailOptions, function(error, info){
        if(error){
            return console.log(error);
        }
        //console.log('Message sent: ' + info.response);
    });
  res.end()
};

user.rate = function(req, res) {
  User.rate(req.body.id, req.body.rating)
    .then(function() {
      res.end();
    });
};

user.getNewsFeed = function(req, res) {
  var newsDataObj = {};
  var city;

  Node.getRelationshipData({username: req.params.name}, 'all', '')
  .then(function(user){
    User.getUserByCity(user.relationships.Lives[0].uniq_id, req.params.name).then(function(people) {
      newsDataObj.people = people;
      city = user.relationships.Lives[0].uniq_id;
    }).then(function(user){
      // console.log("toto",req.params.name);
      User.getFriendsProjects(req.params.name).then(function(projects) {
      newsDataObj.projects = projects;
      }).then(function(user){
        // res.end();
        res.json({news: newsDataObj});
      });
    });
  })
};

module.exports = user;