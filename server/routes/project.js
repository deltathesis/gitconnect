var Project = require('../db/models/project');
var nodemailer = require('nodemailer');
var User = require('../db/models/user');
var Node = require('../db/models/node');

var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.GMAIL_ACCOUNT,
        pass: process.env.GMAIL_PWD
    }
});

var project = {};

project.create = function(req, res) {
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
};

project.update = function(req, res) {
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
};

project.deleteProject = function(req, res) {
  Project.deleteProject(req.body.projectId).then(function(){
    res.sendStatus(200);
    User.makeAvailable(req.body.user1);
    User.makeAvailable(req.body.user2);
  });
};

project.getAll = function(req, res) {
  Project.getAll()
    .then(function(projects) {
      res.json({projects: projects});
    });
};

project.vote = function(req, res) {
  Project.vote(req.body.projectId, req.body.userId, req.body.up)
    .then(function(resolved) {
      res.json({success: true});
    }, function(rejected) {
      res.json({success: false});
    });
};

project.get = function(req, res) {
  User.get({projectId : req.params.id}).then(function(project){
    res.json({project: project[0]})
  });
};

project.getUsers = function(req, res) {
  Project.getUsers(req.params.id).then(function(userslist){
    res.json({users: userslist})
  });
};

project.getCurrent = function(req, res) {
  User.getCurrentProject(req.params.username)
    .then(function(project) {
      res.json({project: project})
  });
};

project.getLanguages = function(req, res) {
  Project.getLanguages(req.params.id).then(function(languages) {
    res.json({languages: languages});
  });
};

module.exports = project;