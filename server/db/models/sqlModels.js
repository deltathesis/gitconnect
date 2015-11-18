// require('dotenv').config({path:'/../../.env'});
var DBURL = process.env.DAGE_DB_URL;
var DbUrl = require('url').parse(DBURL);
var Sequelize = require('sequelize');

var sequelize = new Sequelize(DbUrl, {
  dialect: "postgres",
  dialectOptions: {
    ssl: true
  }
});

var User = sequelize.define('user', {
  id:{
    type:Sequelize.INTEGER,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true
  },
  userName:{
    type: Sequelize.STRING
  },
  name:{
    type: Sequelize.STRING
  },
  interests: {
    type: Sequelize.TEXT
  },
  bio: {
    type: Sequelize.TEXT
  },
  ratingAverage: {
    type: Sequelize.INTEGER
  },
  ratingTotal:{
    type: Sequelize.INTEGER
  },
  ratingCounter: {
    type: Sequelize.INTEGER
  },
  availabilty: {
    type: Sequelize.BOOLEAN
  },
  location:{
    type: Sequelize.STRING
  },
  githubId:{
    type: Sequelize.INTEGER
  },
  pictureUrl:{
    type: Sequelize.TEXT
  },
  blog:{
    type: Sequelize.TEXT
  },
  company:{
    type: Sequelize.TEXT
  }
},{
  freezeTableName: true
});

var Project = sequelize.define('project', {
  id:{
    type:Sequelize.INTEGER,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true
  },
  name: {
    type: Sequelize.STRING
  },
  info: {
    type: Sequelize.TEXT
  },
  photoUrl: {
    type: Sequelize.TEXT
  },
  technologies: {
    type: Sequelize.TEXT
  },
  ratingAverage: {
    type: Sequelize.INTEGER
  },
  ratingCounter: {
    type: Sequelize.INTEGER
  },
  ratingTotal: {
    type: Sequelize.INTEGER
  },
  githubLink: {
    type: Sequelize.TEXT
  },
  projectDescription: {
    type: Sequelize.TEXT
  },
  thumbnail: {
    type: Sequelize.TEXT
  }
},{
  freezeTableName: true
});
//DATABASE TODOS:
  //Comments table
  //Ratings table

var UserProject = sequelize.define('user_projects', {
  project_id: {
    type: Sequelize.INTEGER
  },
  user_id: {
    type: Sequelize.INTEGER
  }
});

var findUsers = function(usersArray){
  User.findAll({ where: {userName: usersArray}})
    .then(function(users){
      console.log(users);
    })
}
//DO NOT REMOVE THE THREE LINES OF CODE BELOW
UserProject.sync({force: true});
// User.sync({force: true});
// Project.sync({force: true});

User.belongsToMany(Project, {as:"projects", through:"user_projects", foreignKey: 'user_id'});
Project.belongsToMany(User, {as:"users", through:"user_projects", foreignKey: 'project_id'});

module.exports.findUsers = findUsers;
module.exports.Project = Project;
module.exports.sequelize = sequelize;
module.exports.User = User;