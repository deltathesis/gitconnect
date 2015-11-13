require('dotenv').config({path: '../../../.env'})
var rp = require('request-promise');
var URL = process.env.NEO4J_UFL || 'http://app43775504:Q9OxlkqHDlLgCqj4UjXx@app43775504.sb02.stations.graphenedb.com:24789';
var url = require('url').parse(URL)

var db = require("seraph")({
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

var createUser = function(username, callback){
  options.url += username;
  rp(options)
  .then(function(user){
    newUser.apiUrl = user.url
    newUser.name = user.name;
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
      if(!newUser.languages[element['language']] && element['language'] !== null){
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


var User = module.exports = function User(_node){  //do not change the node
  //the node wil be an array returned from our database. the array will contain an obj to access it use node[0].nameOfProperty
  this._node = _node 
}

//object with key value pairs already filtered to contain only data to be stored in user node
User.create = function(username){
  createUser(username, function(githubObj){
    var obj = {};
    obj.name = githubObj.name || "No Name";
    obj.location = githubObj.location || "No location";
    obj.idNum = githubObj.id || "no Id num";            //cannot have a property with name ID
    obj.blog = githubObj.blog || "no blog";            //cannot set null properties
    console.log('obj inside create: ', obj)

    db.save(obj, function(err, node){
      db.label(node, 'USER', function(err){
        if(err){
          console.error('error creating User label on user', err)
        }
      })
      console.log('the node that is created: ', node);
    })
  })
}

//pass in a username and callback the callback will act on the new User object 
User.get = function(userName, cb){  
  db.find({name: userName}, 'USER', function(err, person){
    var user = new User(person);
    cb('the user you retrieved is', user._node[0]);
  })
}











