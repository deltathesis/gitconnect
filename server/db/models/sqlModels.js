require('dotenv').config({path:'/../../.env'});
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
  firstName: {
    type: Sequelize.STRING
  },
  lastName: {
    type: Sequelize.STRING
  },
  interests: {
    type: Sequelize.STRING
  },
  languages: {
    type: Sequelize.STRING
  },
  starredRepos: {
    type: Sequelize.STRING
  },
  bio: {
    type: Sequelize.STRING
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
  picture:{
    type: Sequelize.STRING
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
    type: Sequelize.STRING,
  },
  info: {
    type: Sequelize.STRING
  },
  photoUrl: {
    type: Sequelize.STRING
  },
  technologies: {
    type: Sequelize.STRING
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
    type: Sequelize.STRING
  },
  projectDescription: {
    type: Sequelize.STRING
  },
  thumbnail: {
    type: Sequelize.STRING
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
//DO NOT REMOVE THE THREE LINES OF CODE BELOW
// UserProject.sync({force: true});
// User.sync({force: true});
// Project.sync({force: true});

User.belongsToMany(Project, {as:"projects", through:"user_projects", foreignKey: 'user_id'});
Project.belongsToMany(User, {as:"users", through:"user_projects", foreignKey: 'project_id'});


module.exports.Project = Project;
module.exports.sequelize = sequelize;
module.exports.User = User;