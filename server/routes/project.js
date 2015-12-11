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

project.createRevised = function(req, res){
  Project.createRevised(req.body.collaborators, req.body.projectName)
  .then(function(project){
    res.json(project);
  })
}

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
    });
  });
};

project.update = function(req, res) {
  res.sendStatus(200);
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
    // The project is being published
    if(req.body.data.users){
      for(var i = 0; i < users.length; i++) {
        User.makeAvailable(req.body.users[i].username);
        User.get({username: req.body.users[i].username})
          .then(function(users) {
            Node.update(users[0], {availability: 'true'});
            var mailOptions = {
              from: 'GitConnect <gitconnect.app@gmail.com>', // sender address
              to: users[0].email,
              subject: 'Your project was published!', // Subject line
              text: 'Your project was published!', // plaintext body
              html: '<h2>Hello '+ users[0].name + '!</h2>'
                    + '<p>Congratulations on publishing your project.</p>'
                    + '<p>Please remember to rate your team members by visiting their profile./p>'
                    + '<p>Have fun!</p>' // html body
            };
            // send mail with defined transport object
            transporter.sendMail(mailOptions, function(error, info){
                if(error){
                    return console.log(error);
                }
            });
          });
      }
    }
  })
};

project.deleteProject = function(req, res) {
  Project.deleteProject(req.body.projectId).then(function(users){
    res.sendStatus(200);
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

project.addCollaborators = function(req, res){
  Node.addRelationships({
    baseNode: {projectId: req.body.projectId},
    relNodes: req.body.newCollaborators,
    relNodeLabels: ['User'],
    relDirection: 'in',
    relLabel: 'WORKED'
  })
    .then(function(){
      res.end()
    });
};

module.exports = project;