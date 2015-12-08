var Promise = require('bluebird');
var User = require('./user');
var db = require('../database');
var Node = require('./node');

var Project = {};

// Gets a list of published projects
// Returns an array of projects sorted by votes (highest to lowest)
Project.getAll = function() {
	return new Promise(function(resolve) {
	    var cypher = 'match (n: Project {published:"true"}) return n';
	    db.queryAsync(cypher)
	      .then(function(nodes) {
	        nodes = nodes.sort(function(a, b) {
	          var aVotes = a.upVote - a.downVote;
	          var bVotes = b.upVote - b.downVote;
	          return bVotes - aVotes;
	        });
	        var finished = 0;
	        nodes.forEach(function(node, i) {
	          cypher = 'match (n:User)-[:WORKED*]->(m) where id(m)=' + node.id + ' return n';
	          db.queryAsync(cypher)
	            .then(function(teams) {
	              node.teams = teams;
	              if (++finished === nodes.length) resolve(nodes);
	            });
	        });
	        
	      });
	  })
	  .catch(function(err) {
	    console.log(err);
	  });
};

// Adds votes to a project
// projectId: int - the id of the project
// userId: int - the id of the user
// up: boolean - true -> upvote, false -> downvote
Project.vote = function(projectId, userId, up) {
  userId = parseInt(userId);
  return new Promise(function(resolve, reject) {
    var vote = up ? 'UPVOTED' : 'DOWNVOTED';
    var cypher = 'match (a:Project) where id(a)=' + projectId + ' match (a)<-[r:' + vote + ']-(b) where b.githubId=' + userId + ' return b';
    db.queryAsync(cypher)
      .then(function(nodes) {
        if (nodes.length) {
          reject('User already voted.');
        } else {
          var vote2 = up ? 'upVote' : 'downVote';
          cypher = 'MATCH (a:User),(b:Project) WHERE a.githubId=' + userId + ' AND id(b)=' + projectId + ' CREATE (a)-[r:' + vote + ']->(b) return b';
          db.queryAsync(cypher)
            .then(function() {
              cypher = 'match (b) where id(b)=' + projectId + ' set b.' + vote2 + '= b.' + vote2 + ' + 1';
              db.queryAsync(cypher)
                .then(resolve);
            });
        }
      });
  })
};

// Get user connection requests
Project.getUsers = function(id){
  return new Promise(function(resolve){
    var cypher = 'MATCH ({projectId: "'+id+'"})<-[:WORKED]-(n)'
               +'RETURN n';
    db.queryAsync(cypher).then(function(nodes){
      resolve(nodes.map(function(element){
        return element
      }))
    })
    .catch(function(err){
      console.log(err)
    })
  })
};

// Get languages of project requests
Project.getLanguages = function(id) {
  return new Promise(function(resolve) {
    var cypher = 'MATCH ({projectId: "'+id+'"})-[:Uses]->(n)' +'RETURN n';
    db.queryAsync(cypher).then(function(nodes) {
      resolve(nodes.map(function(element) {
        return element;
      }))
    })
    .catch(function(err) {
      console.log(err);
    })
  })
};

// Project creation

Project.createRevised = function(collaboratorsArray, projectName){
  var defaultImages = [
  'http://cdn.wikimg.net/strategywiki/images/4/44/SSF2T_Chun-Li.gif',
  'http://cdn.wikimg.net/strategywiki/images/0/06/SSF2T_T._Hawk.gif',
  'http://cdn.wikimg.net/strategywiki/images/e/ee/SSF2T_Sagat.gif',
  'http://cdn.wikimg.net/strategywiki/images/7/70/SSF2T_M._Bison.gif',
  'http://cdn.wikimg.net/strategywiki/images/a/a2/SSF2T_Balrog.gif',
  'http://cdn.wikimg.net/strategywiki/images/0/01/SSF2T_Dhalsim.gif',
  'http://cdn.wikimg.net/strategywiki/images/4/48/SSF2T_Zangief.gif',
  'http://cdn.wikimg.net/strategywiki/images/5/57/SSF2T_Fei_Long.gif',
  'http://cdn.wikimg.net/strategywiki/images/4/4b/SSF2T_Dee_Jay.gif',
  'http://cdn.wikimg.net/strategywiki/images/6/65/SSF2T_Ryu.gif',
  'http://cdn.wikimg.net/strategywiki/images/c/c8/SSF2T_Guile.gif',
  'http://cdn.wikimg.net/strategywiki/images/d/dc/SSF2T_Blanka.gif',
  'http://cdn.wikimg.net/strategywiki/images/1/14/SSF2T_E._Honda.gif',
  'http://cdn.wikimg.net/strategywiki/images/a/a4/SSF2T_Ken.gif'
  ]
  var node = {};
  return new Promise(function(resolve, reject){
    var storage = {};
    var dateNow = new Date();

    storage.projectData = {
      // Generate Random Id
      projectId: '_' + Math.random().toString(36).substr(2, 15),
      name: projectName,
      creationDate: dateNow.getTime(),
      publishDate : 'null',
      published: 'false',
      shortDesc: 'null',
      longDesc: 'null',
      picture: defaultImages[Math.floor(Math.random()*defaultImages.length)],
      thumbnail: 'null',
      voteTotal: 0,
      upVote: 0,
      downVote: 0,
      projectRepo: 'null',
      scrumBoard: 'null',
      projectSnippet: 'null',
      projectWebsite: 'null',
      cloudStorage: 'null',
      database: 'null'
    };

    db.saveAsync(storage.projectData, 'Project')

    .then(function(newNode){
      node = newNode;
      return newNode;
    })

    .then(function(projectNode){
      return Node.addRelationships({
        baseNode: {projectId: projectNode.projectId},
        relNodes: collaboratorsArray,
        relDirection: 'in',
        relNodeLabels: ['Project'],
        relLabel: 'WORKED'
      })
    })

    .then(function(){
      resolve(node);
    })

  })
}
Project.create = function(usersData){
  var node = {};
  return new Promise(function(resolve, reject){

    var storage = {};
    var dateNow = new Date();

    storage.projectData = {
      // Generate Random Id
      projectId: '_' + Math.random().toString(36).substr(2, 15),
      name: 'null',
      creationDate: dateNow.getTime(),
      publishDate : 'null',
      published: 'false',
      shortDesc: 'null',
      longDesc: 'null',
      picture: 'null',
      thumbnail: 'null',
      voteTotal: 0,
      upVote: 0,
      downVote: 0,
      projectRepo: 'null',
      scrumBoard: 'null',
      projectSnippet: 'null',
      projectWebsite: 'null',
      cloudStorage: 'null',
      database: 'null'
    };
    // Create Project node into the DB
    db.saveAsync(storage.projectData, 'Project').then(function(newNode){
      node = newNode;
      return newNode;
    })
    // ******
    // *** Add project - users relationships
    // ******

    // Add user to project relationships
    .then(function(data){
      Node.addRelationships({
        baseNode: {username: usersData.userFirst},
        relNodes: [node],
        relDirection: 'out',
        relNodeLabels: ['Project'],
        relLabel: 'WORKED'
      });
      Node.addRelationships({
        baseNode: {username: usersData.userSecond},
        relNodes: [node],
        relDirection: 'out',
        relNodeLabels: ['Project'],
        relLabel: 'WORKED'
      });
      // ******
      // *** Toggle availability 
      // ******

      // Toggle availability for user 1
      //Get User Node
      var objUser1 = {
        userNode: User.get({username: usersData.userFirst})
      }
      // Update user availability into the DB
      objUser1.userNode.then(function(users) {
        Node.update(users[0], {availability: "false"})
      });
      // Toggle availability for user 2
      //Get User Node
      var objUser2 = {
        userNode: User.get({username: usersData.userSecond})
      }
      // Update user availability into the DB
      objUser2.userNode.then(function(users) {
        Node.update(users[0], {availability: "false"})
      })

      // ******
      // *** Delete relationships requests/demands
      // ******

      // Delete requests relationship for User 1
      var cypherUserFirstRequests = 'MATCH ({username: "'+ usersData.userFirst +'"})-[r:CONNECTION_REQUEST]-(n)'
                                  + 'DELETE r';
      db.queryAsync(cypherUserFirstRequests).then(function(node){
        resolve();
      });
      // Delete demands relationship for User 1
      var cypherUserFirstDemands = 'MATCH ({username: "'+ usersData.userFirst +'"})-[r:CONNECTION_REQUEST]->(n)'
                                  + 'DELETE r';
      db.queryAsync(cypherUserFirstDemands).then(function(node){
        resolve();
      });
      // Delete requests relationship for User 2
      var cypherUserSecondRequests = 'MATCH ({username: "'+ usersData.userSecond +'"})-[r:CONNECTION_REQUEST]-(n)'
                                    + 'DELETE r';
      db.queryAsync(cypherUserSecondRequests).then(function(node){
        resolve();
      });
      // Delete demands relationship for User 2
      var cypherUserSecondDemands = 'MATCH ({username: "'+ usersData.userSecond +'"})-[r:CONNECTION_REQUEST]->(n)'
                                  + 'DELETE r';
      db.queryAsync(cypherUserSecondDemands).then(function(node){
        resolve();
      });
      return data;
    })
    .then(function(data){
      resolve(node)
    })
    .catch(function(err){
      console.log(err);
    })
  })
};

Project.deleteProject = function(projectId){
  return new Promise(function(resolve){
    Node.getRelationshipData({projectId: projectId}, 'all', 'WORKED')
      .then(function(nodes) {
        var cypher = 'MATCH (n { projectId:"'+projectId+'" })'
                    + ' DETACH DELETE n';
        db.queryAsync(cypher).then(function(){
          resolve(nodes.relationships.WORKED);
        })
        .catch(function(err){
          console.log(err)
        });
      });
  })
};

Promise.promisifyAll(Project);

module.exports = Project;
