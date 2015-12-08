var User = require('../db/models/user');
var Relationship = require('../db/models/relationship');
var Node = require('../db/models/node');

var connectionslist = {};

connectionslist.getDemands = function(req, res) {
  User.getUserDemands(req.params.name).then(function(userslist){
    res.json({users: userslist})
  });
};

connectionslist.getRequests = function(req, res) {
  User.getUserRequests(req.params.name).then(function(userslist){
    res.json({users: userslist})
  });
};

connectionslist.deleteRequest = function(req, res) {
  User.deleteRequestFromUser(req.body.data.userFirst, req.body.data.userSecond).then(function(data){
    res.json(data)
  });
};

connectionslist.deleteDemand = function(req, res) {
  User.deleteDemandFromUser(req.body.data.userFirst, req.body.data.userSecond).then(function(data){
    res.json(data)
  });
};

connectionslist.createMutualConnection = function(req, res){
  Relationship.createMutualConnection(req.body.data.requestingUserId, req.body.data.acceptingUserId, req.body.data.relId).then(function(){
    res.end();
  });
};

connectionslist.deleteMutualConnection = function(req, res) {
  var query = req.query;
  var user1Id = query.user1Id;
  var user2Id = query.user2Id;
  var type = query.type;
  Node.deleteRelationship(user1Id, user2Id, type)
    .then(function() {
      res.end();
    });
};

module.exports = connectionslist;