var sqlDb = require('./sqlModels.js').Project;

var Project = {};


//create a project. obj has keys matching project model/schema
Project.create = function(obj){
  sqlDb.findOrCreate({
    where: obj
  });
}

//get all of the data (except users) for a project using the projects unique id 
Project.getData = function(projectId, cb){
  sqlDb.findOne({where: {id: projectId}})
  .then(function(project){
    cb(project);
  })
}

//get all users associated with the project
Project.getUsers = function(projectObj, cb){
  projectObj.getUsers()
  .then(function(usersArray){
    cb(usersArray)
  })
}

//user parameter can be an array of user objects or ids 
//user parameter can also be a single id or single object no array
Project.addUsers = function(projectObj, user){
  //todo handle duplicate relationships
  if (!!user.length){
    projectObj.addUsers(user)
  }else{
    projectObj.addUser(user)
  }
}


module.exports = Project;