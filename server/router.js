var express = require('express');
var passport = require('passport');
var auth = require('./routes/auth');
var user = require('./routes/user');
var connectionslist = require('./routes/connectionslist');
var project = require('./routes/project');
var aws_s3 = require('./routes/aws');

var router = express.Router();

// Authentication Routes
router.get('/auth/github', auth.github);
router.get('/auth/github/callback', auth.githubCallback, auth.validate);
router.get('/auth/logout', auth.logout);

// User Routes
router.get('/api/user', user.getCurrentUser);
router.get('/api/user/getAllUsers', user.getAllUsers);
router.get('/api/user/:name', user.getUser);
router.get('/api/user/relations/:name', user.getRelationships);
router.post('/api/user/:name/matches', user.getMatchesPOST);
router.get('/api/user/:name/matches', user.getMatchesGET);
router.post('/api/user/updateform', user.updateForm);
router.post('/api/user/availabilitytoggle', user.toggleAvailable);
router.get('/api/user/delete/:name', user.deleteUser);
router.post('/api/user/connection-request', user.requestFriend);
router.post('/api/contactmessage', user.contactMessage);
router.post('/api/user/:name/rate', user.rate);
router.get('/api/newsfeed/:name', user.getNewsFeed);

// Connection Routes
router.get('/api/connectionslistDemands/:name', connectionslist.getDemands);
router.get('/api/connectionslistRequests/:name', connectionslist.getRequests);
router.post('/api/request/delete', connectionslist.deleteRequest);
router.post('/api/demand/delete', connectionslist.deleteDemand);
router.post('/api/connect/mutualConnection', connectionslist.createMutualConnection);
router.get('/api/connection/delete', connectionslist.deleteMutualConnection);

// Project Routes
router.post('/api/project/creation', project.createRevised);
router.post('/api/project/update', project.update);
router.post('/api/project/delete', project.deleteProject);
router.get('/api/project/list', project.getAll);
router.post('/api/project/vote', project.vote);
router.get('/api/project/:id', project.get);
router.get('/api/project/languages/:id', project.getLanguages);
router.get('/api/project/users/:id', project.getUsers);
router.get('/api/project/current/:username', project.getCurrent);
router.post('/api/project/addCollaborators', project.addCollaborators);

// AWS Routes
router.get('/api/sign_s3', aws_s3.getSignedRequest);

module.exports = router;