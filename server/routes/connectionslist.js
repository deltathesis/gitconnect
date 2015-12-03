var User = require('../db/models/user');

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

module.exports = connectionslist;