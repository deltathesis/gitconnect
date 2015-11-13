require('dotenv').config({path: '../../../.env'})
var rp = require('request-promise');


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

var pipes = {}

pipes.userInfo = function(options, username){
  options.url += username;
  console.log(options)
  rp(options).then(function(userInfo){
    console.log(userInfo)
    return userInfo
  });
};

pipes.repoLanguages = function(options, username){
  options.url + username + '/repos';
  rp(options).then(function(reposArray){
    return reposArray;
  });
};

pipes.starredRepos = function(options, username){
  options.url + username + '/starred'
  rp(options).then(function(starredRepos){
    return starredRepos;
  });
};

pipes.organizations = function(options, username){
  options.url + username + '/orgs';
  rp(options).then(function(orgs){
    return orgs;
  });
};


var newUser = {
  languages: {},
  starredRepos: [],
  organizations: []
};

var createUser = function(username){
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
    return newUser;
  })
  .catch(function(err){
    console.log(err)
  })
}

module.exports = createUser
// console.log(pipes.userInfo(options, 'ccnixon'))









