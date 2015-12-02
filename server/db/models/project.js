var rp = require('request-promise');
var Promise = require('bluebird');
var _ = require('underscore')


var db = exports.db = require("seraph")({
  server: process.env.NEO_AWS,
  user: process.env.NEO_AWS_USR,
  pass: process.env.NEO_AWS_PWD
});

Promise.promisifyAll(db)


var options = {
  qs: {
    client_id: process.env.GITHUB_CLIENT_ID,
    client_secret: process.env.GITHUB_CLIENT_SECRET
  },
  url: 'https://api.github.com/users/',
  headers: {
    'User-Agent': 'ccnixon'
  },
  json: true
}


var Project = exports.Project = function Project(_node){  //do not change the node
  //the node wil be an array returned from our database. the array will contain an obj to access it use node[0].nameOfProperty
  this._node = _node 
}

Project.deleteProject = function(projectId){
  return new Promise(function(resolve){
    var cypher = 'MATCH (n { projectId:"'+projectId+'" })'
                + ' DETACH DELETE n';
    db.queryAsync(cypher).then(function(node){
      resolve(function() {
        console.log("project deleted");
      })
    })
    .catch(function(err){
      console.log(err)
    })
  })

}