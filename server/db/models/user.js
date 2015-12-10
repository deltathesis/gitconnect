var rp = require('request-promise');
var Promise = require('bluebird');
var _ = require('underscore');

var db = require('../database');
// var db = exports.db = require("seraph")({
//   server: process.env.NEO_AWS,
//   user: process.env.NEO_AWS_USR,
//   pass: process.env.NEO_AWS_PWD
// });

// Promise.promisifyAll(db)


var options = {
  qs: {
    client_id: process.env.GITHUB_CLIENT_ID,
    client_secret: process.env.GITHUB_CLIENT_SECRET
  },
  url: 'https://api.github.com/users/',
  headers: {
    'User-Agent': 'deltaThesisdeploy'
  },
  json: true
}


var User = {}; 
// function(_node){  //do not change the node
//   //the node wil be an array returned from our database. the array will contain an obj to access it use node[0].nameOfProperty
//   this._node = _node 
// }

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
    var cypher = "MATCH (user {username:'"+username+"'})-[r*1..2]-(x:User) "
               + "WHERE NOT (user)--(x) AND NOT x.username = '"+username+"' AND x.availability = 'true'"
               + "RETURN DISTINCT x,  "
               + "COUNT(x) ORDER BY COUNT(x) DESC LIMIT 20";
    db.queryAsync(cypher).then(function(nodes){
      var getRelationshipData = require('./node.js').getRelationshipData
      var promises = [];
      nodes.forEach(function(user){
        promises.push(getRelationshipData({username: user.x.username}, 'all', ''))
      })
      return Promise.all(promises)
    })
    .then(function(users){
      resolve(users);
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
    location: 'ChIJIQBpAG2ahYAR_6128GcTUEo',
    githubId: data.githubId,
    company: !data.company ? 'null' : data.company,
    blog: !data.blog ? 'null' : data.blog,
    avatar_url: data.avatar_url,
    ratingTotal: 5,
    ratings: 1,
    availability: "true"
  };
  storage.languages = data.languages;
  return storage;
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
      var Node = require('./node');
      Node.addRelationships({
        baseNode: {username: githubData.userData.username},
        relNodes: githubData.languages,
        relDirection: 'out',
        relNodeLabels: ['Language'],
        relLabel: 'KNOWS'
      })
      return data;
    })
    // .then(function(data){
    //   var Node = require('./node');
    //   Node.addRelationships({
    //     baseNode: {username: githubData.userData.username},
    //     relNodes: [{name: 'San Francisco'}, {uniq_id: 'ChIJIQBpAG2ahYAR_6128GcTUEo'}],
    //     relDirection: 'out',
    //     relNodeLabels: ['City'],
    //     relLabel: 'Lives'
    //   })
    // })
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

// Get user connection demands
User.getUserDemands = function(username){
  return new Promise(function(resolve){
    var cypher = 'MATCH ({username: "'+username+'"})-[r:CONNECTION_REQUEST]->(n)'
               + 'RETURN n,r';
    db.queryAsync(cypher).then(function(nodes){
      resolve(nodes.map(function(element){
        var data = element.n;
        data.relId = element.r.id;
        return data;
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
    var cypher = 'MATCH ({username: "'+username+'"})<-[r:CONNECTION_REQUEST]-(n)'
               +'RETURN n, r';
    db.queryAsync(cypher).then(function(nodes){
      resolve(nodes.map(function(element){
        var data = element.n;
        data.relId = element.r.id;
        return data;
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

User.matches = function(skills, username, location, queryUsername){
  return new Promise(function(resolve){
    var cypher;
    if(queryUsername){
      cypher = "MATCH (user {username:'"+username+"'}) MATCH (n:User)-[:KNOWS]-(x:Language) WHERE NOT n.username = '"+username+"' AND NOT (user)-->(n) AND n.availability='true' AND n.username='"+queryUsername+"' RETURN n, COUNT(x) AS nSkills ORDER BY nSkills DESC;";
    } else if(location){
      cypher = "MATCH (user {username:'"+username+"'}) MATCH (n:User)-[:KNOWS]-(x:Language) WHERE NOT n.username = '"+username+"' AND NOT (user)-->(n) AND  x.name IN {skills} AND n.availability='true' AND n.location='"+location+"' RETURN n, COUNT(x) AS nSkills ORDER BY nSkills DESC;";
    } else {
      cypher = "MATCH (user {username:'"+username+"'}) MATCH (n:User)-[:KNOWS]-(x:Language) WHERE NOT n.username = '"+username+"' AND NOT (user)-->(n) AND  x.name IN {skills} AND n.availability='true' RETURN n, COUNT(x) AS nSkills ORDER BY nSkills DESC;";
    }
    db.queryAsync(cypher, {skills: skills} || {}).then(function(nodes){
      return nodes.map(function(element){
        return element.n;
      })
    }).then(function(users){
      var getRelationshipData = require('./node.js').getRelationshipData
      var promises = [];
      users.forEach(function(user){
        promises.push(getRelationshipData({username: user.username}, 'all', ''))
      })
      return Promise.all(promises)
    }).then(function(result){
      resolve(result)
    })
  }).catch(function(err){
    console.log(err);
  })
}

User.makeAvailable = function(username){
  var objUser = {
    userNode: User.get({username: username})
  }
  // Update user availability into the DB
  objUser.userNode.then(function(users) {
    require('./node').update(users[0], {availability: "true"})
  });
};

User.rate = function(id, rating) {
  return new Promise(function(resolve) {
    var cypher = 'match (n) where id(n) = ' + id + ' set n.ratingTotal = n.ratingTotal + ' + rating + ', n.ratings = n.ratings + 1';
    db.queryAsync(cypher)
      .then(resolve)
      .catch(function(err) {
        console.log(err);
      });
  });
};

// Get user connection demands
User.getUserByCity = function(cityId, username){
  return new Promise(function(resolve){
    var cypher = 'MATCH (n:User {location:"'+cityId+'"}) WHERE n.availability="true" AND NOT n.username="'+username+'" '
                + ' RETURN n';
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

// Get friends latest projects
User.getFriendsProjects = function(username){
  return new Promise(function(resolve){
    var date = new Date();
    var dateMs = date.getTime();
    // Get News from one month
    var pastWeek = dateMs - 1000 * 60 * 60 * 24 * 31
    var cypher = 'MATCH (User {username: "'+username+'"})-[:CONNECTED]-(x:User)-[:WORKED]-(y:Project {published: "true"}) WHERE y.publishDate > '+pastWeek
                + ' RETURN x,y';
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

Promise.promisifyAll(User);

module.exports = User;
