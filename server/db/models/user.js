// require('dotenv').config({path:'../../../.env'});
var rp = require('request-promise');
var URL = process.env.NEO4J_UFL || process.env.GRAPHENE_DB_URL;
var url = require('url').parse(URL);

var db = exports.db = require("seraph")({
  server: url.protocol + '//' + url.host,
  user: url.auth.split(':')[0],
  pass: url.auth.split(':')[1]
});

var findUsers = require('./sqlModels.js').findUsers;


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

var createUser = function(username, callback){
  options.url += username;
  rp(options)
  .then(function(user){
    newUser.apiUrl = user.url
    newUser.name = user.name;
    newUser.username = user.login;
    newUser.location = user.location;
    newUser.id = user.id;
    newUser.company = user.company;
    newUser.blog = user.blog;
    newUser.avatar_url = user.avatar_url;
    options.url = user.repos_url
  })
  .then(function(){
    return rp(options)
  })
  .then(function(repos){
    var reposLength = repos.length;
    repos.forEach(function(element){
      if(element['language'] === null){
        return;
      }
      if(!newUser.languages[element['language']]){
        newUser.languages[element['language']] = 1;
      } else {
        newUser.languages[element['language']] += 1;
      }
    });
    options.url = newUser.apiUrl + '/starred';
  })
  .then(function(){
    return rp(options);
  })
  .then(function(starredRepos){
    starredRepos.forEach(function(element){
      var repo = {
        id: element['id'],
        name: element['name'],
        html_url: element['html_url'],
        description: element['description']
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
    console.log(newUser)
    callback(newUser);
  })
  .catch(function(err){
    console.log(err)
  })
}


var User = exports.User = function User(_node){  //do not change the node
  //the node wil be an array returned from our database. the array will contain an obj to access it use node[0].nameOfProperty
  this._node = _node 
}

//object with key value pairs already filtered to contain only data to be stored in user node
User.create = function(username){
  createUser(username, function(obj){
    var txn = db.batch();
    var username = JSON.stringify(obj.username)
    
    for(var language in obj.languages){
      var lang = JSON.stringify(language)
      var languageCypher =  "MERGE (user:User {id: " + obj.id + ", username: " + username + "}) MERGE (language:Language {name: " + lang + "}) "
                          + "MERGE (user)-[:KNOWS]-(language) "
                          + "RETURN language, user";
      txn.query(languageCypher, function(err, result){
        if(err){
          console.log(err)
        }
      })
    }
    for(var i = 0; i < obj.starredRepos.length; i++){
      var currRepoId = obj.starredRepos[i].id
      var repoCypher =  "MERGE (user:User {id: " + obj.id + "}) MERGE (repo:Repo {id: " + currRepoId + "}) "
                      + "MERGE (user)-[:WATCHES]-(repo) "
                      + "RETURN repo, user";
      txn.query(repoCypher, function(err, results){
        if(err){
          console.log(err)
        }
      })
    }
    txn.commit(function(err, results){
      if(err){
        console.log(err)
      }
    })
  })
};

User.get = function(userName, cb){  
 db.find({username: userName}, 'USER', function(err, person){
   var user = new User(person);
   cb(user._node[0]);
 })
}


//match users to other users based on a label or variable. pass in username and callback to handle result
User.matchBy = function(username, cb){
  var cypher = 'MATCH (user {username:"'+username+'"})-[r*1..2]-(x:User) '
             + 'RETURN DISTINCT x, COUNT(x) '
             + 'ORDER BY COUNT(x) DESC '
             + 'LIMIT 10';
  db.query(cypher, function(err, result){
    if(err){
      console.log(err);
    }
    var usernames = []
    for(var i = 0; i < result.length; i++){
      usernames.push(result[i].x.username)
    }
    findUsers(usernames, function(users){
      cb(users)
    })
  })
}

// User.matchBy('ccnixon')








