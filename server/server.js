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
var Project = require('./db/models/project.js').Project;

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
    req.session.displayName = req.user.displayName;
  	req.session.username = req.user.username;
    req.session.userid = req.user.id;
    req.session.userlocation = req.user._json.location;
    req.session.avatar_url = req.user._json.avatar_url;

    User.get({username: req.user.username}).then(function(user){
      if(!user.length){
        console.log(user);
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
    })
  });

app.get('/logout', function(req, res) {
	req.logout();
  res.clearCookie('gitConnectDeltaKS');
	res.redirect('/');
});

app.get('/api/user', function(req, res) {
	res.json({username: req.session.username, avatar_url: req.session.avatar_url});
});

//Returns the Node of all Users
app.get('/api/user/getAllUsers', function(req, res) {
  User.getAllUsers().then(function(users) {
    res.json(users);
  })
});

app.get('/api/user/:name', function(req, res) {
  User.get({username: req.params.name}).then(function(user){
    res.json({user: user})
  });
});

app.get('/api/user/relations/:name', function(req, res) {
  // Get all type user relationships
  User.getRelationshipData({username: req.params.name}, 'all', '').then(function(user){
    // console.log(user);
    res.json({user: user})
  });
});

app.post('/api/user/:name/matches', function(req, res){
  User.matches(req.body.filters, req.body.username).then(function(users){
    res.json({matches: users})
  })
})

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
    relDirection: 'out',
    relLabel: 'Lives'
  };

  // Delete all previous city relationship 
  User.deleteAllRelationships(objLocation.baseNode.username, objLocation.relLabel);

  // Saving location / relationship into the DB
  console.log('city: ', objLocation);
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
    relDirection: 'out',
    relLabel: 'KNOWS'
  }
  // Delete all previous city tech and languages 
  User.deleteAllRelationships(objTech.baseNode.username, objTech.relLabel);

  // Saving user tech / relationship into the DB
  User.addRelationships(objTech);

  // Get user Bio and Email
  var userInfos = {
    email: req.body.data.userInfos.email,
    bio: req.body.data.userInfos.bio,
    name: req.body.data.userInfos.name
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
});

app.post('/api/user/availabilitytoggle', function(req, res) {
  var availability = {
    availability: req.body.data.availability
  }
  //console.log(availability);
  //Get User Node
  var objUser = {
    userNode: User.get({username: req.body.data.username})
  }

  // Delete all user connection requests and demands
  if (availability.availability === 'false') {
    User.deleteAllRelationships(req.body.data.username, 'CONNECTION_REQUEST');
  }

  // Update user availability into the DB
  objUser.userNode.then(function(users) {
    User.update(users[0], availability)
  })

  res.end();
});

app.get('/api/user/delete/:name', function(req, res) {
  var username = req.params.name;

  User.deleteUser(username).then(function(){
    console.log("user deleted");
    req.logout();
    res.clearCookie('gitConnectDeltaKS');
    res.redirect('/');
  });

});

app.post('/api/user/connection-request', function(req, res){
  //Parse out current and selected user info
  var currentUser = req.body.currentUser;
  var selectedUser = req.body.selectedUser;

  //Submit to addRelationships
  User.addRelationships({
    baseNode: {username: currentUser.username}, 
    relNodes: [{username: selectedUser.username}],
    relNodeLabel: 'User',
    relDirection: 'out',
    relLabel: 'CONNECTION_REQUEST'
  }).then(function(results){
    console.log(results)
  })
  res.end()
})

// Get user connection demands
app.get('/api/connectionslistDemands/:name', function(req, res) {
  console.log("on server side get");
  User.getUserDemands(req.params.name).then(function(userslist){
    res.json({users: userslist})
  });
});
// Get user connection requests
app.get('/api/connectionslistRequests/:name', function(req, res) {
  console.log("on server side get");
  User.getUserRequests(req.params.name).then(function(userslist){
    res.json({users: userslist})
  });
});

// app.listen(process.env.Port, function(){
// console.log('Server now running on port: ' + process.env.PORT);
// });

// Project page creation after matching
app.post('/api/project/creation', function(req, res){
  User.createProject(req.body.data).then(function(project){
    res.json(project)
  });
});

// Delete other user request
app.post('/api/request/delete', function(req, res){
  User.deleteRequestFromUser(req.body.data.userFirst, req.body.data.userSecond).then(function(data){
    res.json(data)
  });
});

// Delete other user request
app.post('/api/demand/delete', function(req, res){
  User.deleteDemandFromUser(req.body.data.userFirst, req.body.data.userSecond).then(function(data){
    res.json(data)
  });
});

app.post('/api/project/update', function(req, res){
  User.update(req.body.oldProject, req.body.data).then(function(){
    if(req.body.langArray.length){
      User.addRelationships({
        baseNode: req.body.data,
        relNodes: req.body.langArray,
        relNodeLabels: ['Language'],
        relLabel: 'Uses',
        relDirection: 'out'
       })
    }
    if(req.body.user1 || req.body.user2){
      var objUser1 = {
        userNode: User.get({username: req.body.user1})
      }
      // Update user availability into the DB
      objUser1.userNode.then(function(users) {
        User.update(users[0], {availability: "true"})
      });
      // Toggle availability for user 2
      //Get User Node
      var objUser2 = {
        userNode: User.get({username: req.body.user2})
      }
      // Update user availability into the DB
      objUser2.userNode.then(function(users) {
        User.update(users[0], {availability: "true"})
      })
    }
  })
});

app.post('/api/project/delete', function(req, res){
  console.log('delete')
  Project.deleteProject(req.body.projectId).then(function(){
    res.sendstatus(200);
  })
})

// WAIT BEFORE DELETE - Do not give the users relationships
// app.get('/api/project/:id', function(req, res) {
//   // Get all type project relationships and infos
//   User.getRelationshipData({projectId : req.params.id}, 'all', '').then(function(project){
//     res.json({project: project})
//   });
// });

app.get('/api/project/list', function(req, res) {
  User.getProjects()
    .then(function(projects) {
      res.json({projects: projects});
    });
});

app.post('/api/project/vote', function(req, res) {
  User.voteOnProject(req.body.projectId, req.body.userId, req.body.up)
    .then(function(resolved) {
      res.json({success: true});
    }, function(rejected) {
      res.json({success: false});
    });
});

app.get('/api/project/:id', function(req, res) {
  User.get({projectId : req.params.id}).then(function(project){
    res.json({project: project[0]})
  });
});

app.get('/api/project/users/:id', function(req, res) {
  User.getProjectUsers(req.params.id).then(function(userslist){
    // console.log('users project:',userslist)
    res.json({users: userslist})
  });
});

// Check for current Project collaboration
app.get('/api/project/current/:username', function(req, res) {
  console.log(req.params.username);
  User.getCurrentProject(req.params.username).then(function(project){
    // console.log(project);
    res.json({project: project})
  });
});



httpServer.listen(process.env.PORT);
console.log('Server now running on port: ' + process.env.PORT);


/** Socket.io Messaging **/
var socketRoute = require('./routes/socket.js');
io.on('connection', socketRoute);
