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
  sqlDb.findOne({where: {githubId: obj.id}}).then(function(user){
    if(user){
      console.log('NO');
    }else{
      var anotherObj = {};
      anotherObj.userName = obj.username;
      anotherObj.name = obj.name;
      anotherObj.location = obj.location;
      anotherObj.blog = obj.blog;
      anotherObj.company = obj.company;
      anotherObj.pictureUrl = obj.avatar_url;
      anotherObj.githubId = obj.id;
      
      sqlDb.create(anotherObj);
    }
  })
};

User.getData = function(gitId, cb){
  sqlDb.findOne({where: {githubId: gitId}})
  .then(function(user){
    cb(user);
  })
}

module.exports = User;