var Promise = require('bluebird');
var Seraph = require('seraph');

var database = Seraph({
  server: process.env.NEO_AWS,
  user: process.env.NEO_AWS_USR,
  pass: process.env.NEO_AWS_PWD	
});

Promise.promisifyAll(database);

module.exports = database;