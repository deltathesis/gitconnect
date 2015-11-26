

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

var newUser = {
  languages: {},
  starredRepos: [],
  organizations: []
};

var User = exports.User = function User(_node){  //do not change the node
  //the node wil be an array returned from our database. the array will contain an obj to access it use node[0].nameOfProperty
  this._node = _node 
}

//do not use createUser function unless you are chris
var createUser = function(username){
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
      options.url = newUser.apiUrl + '/starred';
    })
    .then(function(){
      return rp(options);
    })
    .then(function(starredRepos){
      starredRepos.forEach(function(element){
        var repo = {
          githubId: element['id'],
          name: element['name'],
          html_url: element['html_url'],
        }
        newUser.starredRepos.push(repo);
      });
      options.url = newUser.apiUrl + '/orgs';
    })
    .then(function(){
      return rp(options);
    })
    .then(function(orgs){
      orgs.forEach(function(element){
        var org = {
          id: element['id'],
          name: element['name']
        }
        newUser.organizations.push(org);
      });
    })
    .then(function(){
      resolve(newUser);
    })
  })  
};

//match users to other users
User.getMatches = function(username){
  return new Promise(function(resolve){
    var cypher = 'MATCH (user {username:"'+username+'"})-[r*1..2]-(x:User {availability: "true"}) '
               + 'WHERE NOT (user)-->(x) '
               + 'RETURN DISTINCT x, COUNT(x) '
               + 'ORDER BY COUNT(x) DESC '
               + 'LIMIT 10';
    db.queryAsync(cypher).then(function(nodes){
      resolve(nodes.map(function(element){
        return element.x
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
  storage.repos = data.starredRepos;
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
      User.addRelationships({
        baseNode: {username: githubData.userData.username},
        relNodes: githubData.repos,
        relDirection: 'out',
        relNodeLabels: ['Repo'],
        relLabel: 'WATCHES'
      })
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
        User.saveNewUser(username.username);
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
        console.log(err)
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
  console
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
// Get user connection demands
User.getUserRequests = function(username){
  console
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

Promise.promisifyAll(User);
