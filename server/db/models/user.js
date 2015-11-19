// require('dotenv').config({path:'../../../.env'});
var rp = require('request-promise');
var URL = process.env.NEO4J_UFL || process.env.GRAPHENE_DB_URL;
var url = require('url').parse(URL);
var sqlUser = require('./sqlUserFns.js')

var db = exports.db = require("seraph")({
  server: url.protocol + '//' + url.host,
  user: url.auth.split(':')[0],
  pass: url.auth.split(':')[1]
});


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

//do not use createUser function unless you are chris
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

//create User and add to neo4j and SQL database
User.create = function(username){
  createUser(username, function(obj){
    sqlUser.addToSql(obj);
    var txn = db.batch();
    var username = JSON.stringify(obj.username)
    
    for(var language in obj.languages){
      var lang = JSON.stringify(language)
      var languageCypher =  "MERGE (user:User {id: " + obj.id + ", username: " + username + ", availability: true}) MERGE (language:Language {name: " + lang + "}) "
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

//get username and github id from neo4j node
User.get = function(username, cb){  
 db.find({username: username}, 'User', function(err, person){
   var user = new User(person);
   cb(user._node[0]);
 })
}


//match users to other users
User.getMatches = function(username, cb){
  var cypher = 'MATCH (user {username:"'+username+'"})-[r*1..2]-(x:User {availability: true}) '
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
    sqlUser.findUsers(usernames, function(users){
      cb(users);
    })
  })
};

