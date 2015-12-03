var express = require('express');
var passport = require('passport');
var auth = require('./routes/auth');
var user = require('./routes/user');
var connectionslist = require('./routes/connectionslist');
var project = require('./routes/project');

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

// Connection Routes
router.get('/api/connectionslistDemands/:name', connectionslist.getDemands);
router.get('/api/connectionslistRequests/:name', connectionslist.getRequests);
router.post('/api/request/delete', connectionslist.deleteRequest);
router.post('/api/demand/delete', connectionslist.deleteDemand);

// Project Routes
router.post('/api/project/creation', project.create);
router.post('/api/project/update', project.update);
router.post('/api/project/delete', project.deleteProject);
router.get('/api/project/list', project.getAll);
router.post('/api/project/vote', project.vote);
router.get('/api/project/:id', project.get);
router.get('/api/project/users/:id', project.getUsers);
router.get('/api/project/current/:username', project.getCurrent);

module.exports = router;