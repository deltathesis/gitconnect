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
  'https://s3-us-west-1.amazonaws.com/mks-thesis-project/pictures/project-giconnect-default.jpg'
  // 'http://origin.arstechnica.com/journals/thumbs.media/272/250/sstthd_ken-1.jpg',
  // 'http://cdn.idigitaltimes.com/sites/idigitaltimes.com/files/styles/image_embed/public/2015/04/15/super-smash-bros-4-character-ryu-street-fighter.png',
  // 'http://www.cinemablend.com/images/sections/15427/Street_Fighter_IV_15427.jpg',
  // 'http://svgporn.com/logos/autocode.svg',
  // 'http://www.fillmurray.com/284/196',
  // 'https://upload.wikimedia.org/wikipedia/en/0/02/Charlie_Brown_Xmas_tree.jpg',
  // 'http://cdn.hitfix.com/photos/78936/willferrell_headshot.jpg',
  // 'http://www-tc.pbs.org/wgbh/americanexperience/media/uploads/films/heroImages/goldengate_film_landing1.jpg',
  // 'http://dev.bowdenweb.com/a/i/style/textures/plaid/plaid-texture-04-1500px.jpg',
  // 'https://media.timeout.com/images/101705313/image.jpg',
  // 'http://cdn.wikimg.net/strategywiki/images/c/c8/SSF2T_Guile.gif',
  // 'http://www.savetheredwoods.org/wp-content/uploads/Partner_Parks_large_HRSPrenedriversFCC.jpg',
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
    var cypher = 'MATCH (n { projectId:"'+projectId+'" }) DETACH DELETE n';
    db.queryAsync(cypher).then(function(){
      resolve()
    })
  }).catch(function(err){
    console.log(err)
  })
};

Promise.promisifyAll(Project);

module.exports = Project;
