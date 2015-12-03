require('dotenv').load();

var express = require('express');
var passport = require('passport');
var GitHubStrategy = require('passport-github').Strategy;
var bodyParser = require('body-parser');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var http = require('http');
var sockets = require('socket.io');
var nodemailer = require('nodemailer');
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

// create reusable transporter object using SMTP transport
var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.GMAIL_ACCOUNT,
        pass: process.env.GMAIL_PWD
    }
});

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

// Get user connection demands
app.get('/api/connectionslistDemands/:name', function(req, res) {
  //console.log("on server side get");
  User.getUserDemands(req.params.name).then(function(userslist){
    res.json({users: userslist})
  });
});
// Get user connection requests
app.get('/api/connectionslistRequests/:name', function(req, res) {
  //console.log("on server side get");
  User.getUserRequests(req.params.name).then(function(userslist){
    res.json({users: userslist})
  });
});

// app.listen(process.env.Port, function(){
// console.log('Server now running on port: ' + process.env.PORT);
// });

// Project page creation after matching
app.post('/api/project/creation', function(req, res){
  Project.create(req.body.data).then(function(project){
    res.json(project)
  }).then(function() {
    var mailOptions = {
        from: 'GitConnect <gitconnect.app@gmail.com>', // sender address
        to: req.body.data.userFirstEmail +','+ req.body.data.userSecondEmail, // list of receivers
        subject: 'Your new project on GitConnect', // Subject line
        text: 'New project on Gitconnect', // plaintext body
        html: '<h2>Hello '+ req.body.data.userFirst +' & '+ req.body.data.userSecond +'</h2>'
              + '<p>You are now working together on the same project</p>'
              + '<p>Feel free to contact and share information about your project</p>'
              + '<p>Notice you are set now as unavaible on Gitconnect until you publish or delete your project</p>'
              + '<p>Have fun!</p>' // html body
    };
    // send mail with defined transport object
    transporter.sendMail(mailOptions, function(error, info){
        if(error){
            return console.log(error);
        }
        console.log('Message sent: ' + info.response);
    });
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
  Node.update(req.body.oldProject, req.body.data).then(function(){
    if(req.body.langArray.length){
      Node.addRelationships({
        baseNode: req.body.data,
        relNodes: req.body.langArray,
        relNodeLabels: ['Language'],
        relLabel: 'Uses',
        relDirection: 'out'
       })
    }
    if(req.body.user1 || req.body.user2){
      User.makeAvailable(req.body.user1);
      User.makeAvailable(req.body.user2);
      var objUser1 = {
        userNode: User.get({username: req.body.user1})
      }
      // Update user availability into the DB
      objUser1.userNode.then(function(users) {
        Node.update(users[0], {availability: "true"})
      });
      // Toggle availability for user 2
      //Get User Node
      var objUser2 = {
        userNode: User.get({username: req.body.user2})
      }
      // Update user availability into the DB
      objUser2.userNode.then(function(users) {
        Node.update(users[0], {availability: "true"})
      })
    }
  })
});

app.post('/api/project/delete', function(req, res){
  Project.deleteProject(req.body.projectId).then(function(){
    res.sendStatus(200);
    User.makeAvailable(req.body.user1);
    User.makeAvailable(req.body.user2);
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
  Project.getAll()
    .then(function(projects) {
      res.json({projects: projects});
    });
});

app.post('/api/project/vote', function(req, res) {
  Project.vote(req.body.projectId, req.body.userId, req.body.up)
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

app.get('/api/project/languages/:id', function(req, res) {
  Project.getLanguages(req.params.id).then(function(languages) {
    res.json({languages: languages});
  })
})

app.get('/api/project/users/:id', function(req, res) {
  Project.getUsers(req.params.id).then(function(userslist){
    // console.log('users project:',userslist)
    res.json({users: userslist})
  });
});

// Check for current Project collaboration
app.get('/api/project/current/:username', function(req, res) {
  //console.log(req.params.username);
  User.getCurrentProject(req.params.username).then(function(project){
    // console.log(project);
    res.json({project: project})
  });
});



httpServer.listen(process.env.PORT);
console.log('Server now running on port: ' + process.env.PORT);


/** Socket.io Messaging **/
var socketRoute = require('./socket');
io.on('connection', socketRoute);
