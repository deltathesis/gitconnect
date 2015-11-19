var sqlDb = require('./sqlModels.js').User;

var User = {};

//finds all users in given array(usersArray)
User.findUsers = function(usersArray, cb){
  sqlDb.findAll({ where: {userName: usersArray}})
    .then(function(users){
      cb(users);
  });
};

User.addToSql = function(obj){
      var anotherObj = {};
      anotherObj.userName = obj.username;
      anotherObj.name = obj.name;
      anotherObj.location = obj.location;
      anotherObj.blog = obj.blog;
      anotherObj.company = obj.company;
      anotherObj.pictureUrl = obj.avatar_url;
      anotherObj.githubId = obj.id;
      
      sqlDb.findOrCreate({
        where: anotherObj
      });
};

//get all of the data for one user except for projects
User.getData = function(gitIdOrUsername, cb){
  if(isNaN(gitIdOrUsername)){
    sqlDb.findOne({where: {userName: gitIdOrUsername}})
    .then(function(user){
      cb(user);
    })
  }else{
    sqlDb.findOne({where: {githubId: gitIdOrUsername}})
    .then(function(user){
      cb(user);
    })
  }
}

//gets all projects associated with the user
User.getProjects = function(userObj, cb){
  userObj.getProjects()
  .then(function(projectArray){
    cb(projectArray)
  })
}

//create a project and associate it with the creator (a user)
//this does not need a callback
User.createProject = function(userObj, projectObj, cb){
  if(cb){
    userObj.createProject(projectObj)
    .then(function(project){
      cb(project);
    })
  }else{
    userObj.createProject(projectObj)
  }
}


module.exports = User;