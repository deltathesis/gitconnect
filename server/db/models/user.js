

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


var User = exports.User = function User(_node){  //do not change the node
  //the node wil be an array returned from our database. the array will contain an obj to access it use node[0].nameOfProperty
  this._node = _node 
}

//do not use createUser function unless you are chris
var createUser = function(username){
  var newUser = {};
  return new Promise(function(resolve, reject){
    options.url += username;
    rp(options)
    .then(function(user){
      newUser.apiUrl = user.url
      newUser.name = !user.name ? 'null' : user.name;
      newUser.username = user.login;
      newUser.githubId = user.id;
      newUser.company = !user.company ? 'null' : user.company
      newUser.blog = !user.blog ? 'null' : user.blog
      newUser.avatar_url = user.avatar_url;
      newUser.languages = [];
      options.url = user.repos_url
    })
    .then(function(){
      return rp(options)
    })
    .then(function(repos){
      var uniqueRepoList = _.uniq(_.pluck(repos, 'language'))
      uniqueRepoList.filter(function(element){
        return element !== null;
      })
      .forEach(function(language){
        newUser.languages.push({name: language});
      })
    })
    .then(function(){
      options.url = 'https://api.github.com/users/';
      resolve(newUser);
    }).catch(function(err){
      console.log(err.options)
    })
  }).catch(function(err){
    console.log(err)
  })  
};

//match users to other users
User.getMatches = function(username){
  return new Promise(function(resolve){
    var cypher = "MATCH (user {username:'"+username+"'})-[r*1..2]-(x:User {availability: 'true'})-[:KNOWS]-(p) "
               + "WHERE NOT (user)-->(x) "
               + "RETURN collect(DISTINCT p) AS skills, x AS userData, "
               + "COUNT(x) AS nUsers ORDER BY nUsers DESC LIMIT 20";
    db.queryAsync(cypher).then(function(nodes){
      resolve(nodes.map(function(node){
        var data = node.userData
        data.skills = node.skills
        return data;
      }))
    })
    .catch(function(err){
      console.log(err)
    })
  })
};


User.data = function(data){
  var storage = {};
  storage.userData = {
    apiUrl: data.apiUrl,
    name: data.name,
    username: data.username,
    location: '',
    githubId: data.githubId,
    company: !data.company ? 'null' : data.company,
    blog: !data.blog ? 'null' : data.blog,
    avatar_url: data.avatar_url,
    ratingTotal: 0,
    availability: "true",
    ratingTotal: 0,
    ratingAverage: 'null'
  };
  storage.languages = data.languages;
  return storage;
};

User.getRelationships = function(baseNodeId, relDirection, relLabel){
  return new Promise(function(resolve){
    return db.relationshipsAsync(baseNodeId, relDirection, relLabel).then(function(rel){
      resolve(rel);
    })
  })
}

User.addRelationships = function(params){
  //baseNode, relNodes, relNodeLabel, relDirection, relLabel
  var userId;
  var relNodeIds;
  return new Promise(function(resolve){
    User.get(params.baseNode).then(function(userNode){
      userId = userNode[0].id;
      return User.getRelationships(userId, params.relDirection, params.relLabel); 
    }).then(function(relNodes){
        relNodeIds = relNodes.map(function(rel){
          return rel.end
        })
      return;
    }).then(function(){
      return Promise.map(params.relNodes, function(element){
        return User.findOrCreateNode(element, params.relNodeLabels)
      }).filter(function(element){
        return !_.contains(relNodeIds, element.id)
      })
    }).then(function(nodes){
      var txn = db.batch()
      nodes.forEach(function(node){
        txn.relate(userId, params.relLabel, node.id)
      })
      return txn.commit(function(err, results){
        if(err){
          console.log(err)
        } else {
          return results;
        }
      })
    }).then(function(results){
      resolve(results)
    }).catch(function(err){
      console.log(err)
    })
  })   
};

User.get = function(props){
  return new Promise(function(resolve){
    resolve(db.findAsync(props))
  }).catch(function(err){
    console.log(err);
  })
};

User.saveNewUser = function(username){
  var githubData = {};
  var node = {};
  return new Promise(function(resolve){
    createUser(username)
    .then(function(data){
      githubData = User.data(data);
      return githubData;
    })
    .then(function(data){
      return db.saveAsync(data.userData, 'User').then(function(newNode){
        node = newNode;
        return newNode;
      })
    })
    .then(function(data){
      User.addRelationships({
        baseNode: {username: githubData.userData.username},
        relNodes: githubData.languages,
        relDirection: 'out',
        relNodeLabels: ['Language'],
        relLabel: 'KNOWS'
      })
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

User.findOrCreateUser = function(username){
  return new Promise(function(resolve){
    User.get({username: username}).then(function(user){
      if(user.length){
        resolve(user)
      } else {
        resolve(User.saveNewUser(username))
      }
    })
  })
};

User.findOrCreateNode = function(props, labels){
  return new Promise(function(resolve){
    User.get(props).then(function(node){
        if(!node.length){
          db.saveAsync(props).then(function(node){
            if(labels){
              db.labelAsync(node, labels).then(function(node){
                resolve(node)
              })
            }
            resolve(node)
          })
        } else {
          resolve(node[0])
        }
      })
    }).catch(function(err){
        console.log(err.body)
  })
};

// Updates node with specified attributes (similar to extend)
// node: Object
// attrs: Object
User.update = function(node, attrs) {
  return new Promise(function(resolve) {
    var txn = db.batch();
    for(var key in attrs) {
      txn.save(node, key, attrs[key]);
    }
    txn.commit(function(err, results) {
      if (err) console.log(err);
      resolve();
    });
  });
};

User.getRelationshipData = function(baseNode, relDirection, relLabel){
  return new Promise(function(resolve){
    var results = {};
    results.relationships = {};
    User.get(baseNode).then(function(node){
      results.user = node[0];
      return node[0];
    }).then(function(node){
        return User.getRelationships(node.id, relDirection, relLabel)
    }).then(function(relArray){
        var relNodes = [];
        relArray.forEach(function(node){
          relNodes.push(db.readAsync(node.end).then(function(nodeData){
            if(!results.relationships[node.type]){
              results.relationships[node.type] = [];
            }
            results.relationships[node.type].push(nodeData);
            return nodeData;
        }));
      })
      return Promise.all(relNodes)
    }).then(function(relNodes){
        resolve(results);
    })
  })
}

User.getNodesWithLabel = function(label){
  return new Promise(function(resolve){
    db.nodesWithLabelAsync(label).then(function(nodesArray){
      resolve(nodesArray)
    })
  })
}

// Get user connection demands
User.getUserDemands = function(username){
  return new Promise(function(resolve){
    var cypher = 'MATCH ({username: "'+username+'"})-[:CONNECTION_REQUEST]->(n)'
               + 'RETURN n';
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

// Get user connection requests
User.getUserRequests = function(username){
  return new Promise(function(resolve){
    var cypher = 'MATCH ({username: "'+username+'"})<-[:CONNECTION_REQUEST]-(n)'
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


// Delete a user
User.deleteUser = function(username){
  return new Promise(function(resolve){
    var cypher = 'MATCH (n { username:"'+username+'" })'
                + ' DETACH DELETE n';
    db.queryAsync(cypher).then(function(node){
      resolve(function() {
        console.log("user deleted");
      })
    })
    .catch(function(err){
      console.log(err)
    })
  })
};

// TODO, Refactor with a project.js page
// Project creation
User.createProject = function(usersData){
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
      User.addRelationships({
        baseNode: {username: usersData.userFirst},
        relNodes: [node],
        relDirection: 'out',
        relNodeLabels: ['Project'],
        relLabel: 'WORKED'
      });
      User.addRelationships({
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
        User.update(users[0], {availability: "false"})
      });
      // Toggle availability for user 2
      //Get User Node
      var objUser2 = {
        userNode: User.get({username: usersData.userSecond})
      }
      // Update user availability into the DB
      objUser2.userNode.then(function(users) {
        User.update(users[0], {availability: "false"})
      })

      // ******
      // *** Delete relationships requests/demands
      // ******

      // Delete requests relationship for User 1
      var cypherUserFirstRequests = 'MATCH ({username: "'+ usersData.userFirst +'"})-[r:CONNECTION_REQUEST]-(n)'
                                  + 'DELETE r';
      db.queryAsync(cypherUserFirstRequests).then(function(node){
        resolve(function() {
          console.log("user 1 requests relationship deleted");
        })
      });
      // Delete demands relationship for User 1
      var cypherUserFirstDemands = 'MATCH ({username: "'+ usersData.userFirst +'"})-[r:CONNECTION_REQUEST]->(n)'
                                  + 'DELETE r';
      db.queryAsync(cypherUserFirstDemands).then(function(node){
        resolve(function() {
          console.log("user 1 requests relationship deleted");
        })
      });
      // Delete requests relationship for User 2
      var cypherUserSecondRequests = 'MATCH ({username: "'+ usersData.userSecond +'"})-[r:CONNECTION_REQUEST]-(n)'
                                    + 'DELETE r';
      db.queryAsync(cypherUserSecondRequests).then(function(node){
        resolve(function() {
          console.log("user 2 requests reslationship deleted");
        })
      });
      // Delete demands relationship for User 2
      var cypherUserSecondDemands = 'MATCH ({username: "'+ usersData.userSecond +'"})-[r:CONNECTION_REQUEST]->(n)'
                                  + 'DELETE r';
      db.queryAsync(cypherUserSecondDemands).then(function(node){
        resolve(function() {
          console.log("user 1 requests relationship deleted");
        })
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

// Delete user all selected type of relationships
User.deleteAllRelationships = function(username, relationship){
  return new Promise(function(resolve){
    var cypher = 'MATCH ({username: "'+ username +'"})-[r:'+ relationship +']-(n) DELETE r'
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

// Delete Requests made to user
User.deleteRequestFromUser = function(username, otherUsername){
  return new Promise(function(resolve){
    var cypher = 'MATCH ({username: "'+ username +'"})<-[r:CONNECTION_REQUEST]-({username: "'+ otherUsername +'"})'
              + 'DELETE r'
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

// Delete Demands made by user
User.deleteDemandFromUser = function(username, otherUsername){
  return new Promise(function(resolve){
    var cypher = 'MATCH ({username: "'+ username +'"})-[r:CONNECTION_REQUEST]->({username: "'+ otherUsername +'"})'
              + 'DELETE r'
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

// Get user connection requests
User.getProjectUsers = function(id){
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

// Get user connection requests
User.getCurrentProject = function(username){
  return new Promise(function(resolve){
    var cypher = 'MATCH ({username: "'+username+'"})-[:WORKED]->(n {published: "false"})'
                  + 'RETURN n';
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

// Deletes a relationship
// id: int
User.deleteRelationship = function(id) {
  return new Promise(function(resolve) {
    var cypher = 'start r=rel(' + id + ') delete r;';
    db.queryAsync(cypher)
      .then(resolve);
  })
  .catch(function(err) {
    console.log(err);
  });
};

// Updates a relationship, overwriting properties if necessary
// id: int
// properties: Object
// Returns the updated node
User.updateRelationship = function(id, properties) {
  return new Promise(function(resolve) {
    var cypher = 'start r=rel(' + id + ') ';
    for(var key in properties) {
      cypher += 'set r.' + key + ' = "' + properties[key] + '" ';
    }
    cypher += 'return r;';
    db.queryAsync(cypher)
      .then(function(nodes) {
        resolve(nodes[0]);
      });
  })
  .catch(function(err) {
    console.log(err);
  });
};

// Get all Users
User.getAllUsers = function() {
  return new Promise(function(resolve) {
    var cypher = 'match (n: User) return n';
    db.queryAsync(cypher)
      .then(function(nodes) {
        resolve(nodes);
      })
  })
}

// Gets a list of published projects
// Returns an array of projects sorted by votes (highest to lowest)
User.getProjects = function() {
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
          cypher = 'match (n)-[:WORKED*]->(m) where id(m)=' + node.id + ' return n';
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

User.matches = function(skills, username){
  return new Promise(function(resolve){
    var cypher = "MATCH (user {username:'"+username+"'}) MATCH (n:User)-[:KNOWS]-(x:Language) WHERE NOT n.username = 'ccnixon' AND NOT (user)-->(n) AND  x.name IN {skills} RETURN n, COUNT(x) AS nSkills ORDER BY nSkills DESC;";
    db.queryAsync(cypher, {skills: skills}).then(function(nodes){
      return nodes.map(function(element){
        return element.n;
      })
    }).then(function(users){
      var promises = [];
      users.forEach(function(user){
        promises.push(db.queryAsync("match (n {username: '"+user.username+"'})-[:KNOWS]-(l) return l").then(function(skills){
          user.skills = skills
          return user;
        }))
      })
      return Promise.all(promises)
    }).then(function(result){
      resolve(result)
    })
  }).catch(function(err){
    console.log(err);
  })
}


// Adds votes to a project
// projectId: int - the id of the project
// userId: int - the id of the user
// up: boolean - true -> upvote, false -> downvote
User.voteOnProject = function(projectId, userId, up) {
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

// var matchTesting = function(){
//   var cypher = "MATCH (user {username:'ccnixon'})-[r*1..2]-(x:User {availability: 'true'})-[:KNOWS]-(p) WHERE NOT (user)-->(x) RETURN collect(DISTINCT p) AS skills, x, COUNT(x) AS nUsers ORDER BY nUsers DESC LIMIT 20"
//   db.queryAsync(cypher).then(function(data){
//     console.log(data)
//   })
// }

// User.getMatches('ccnixon').then(function(result){
//   console.log(result)
// })

Promise.promisifyAll(User);
