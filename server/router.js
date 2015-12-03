var express = require('express');
var passport = require('passport');
var auth = require('./routes/auth');
var user = require('./routes/user');

var router = express.Router();

router.get('/auth/github', auth.github);
router.get('/auth/github/callback', auth.githubCallback, auth.validate);
router.get('/auth/logout', auth.logout);

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

module.exports = router;