var Promise = require('bluebird');
var db = require('../database');

var Relationship = {};

// Deletes a relationship
// id: int
Relationship.delete = function(id) {
  return new Promise(function(resolve) {
    var cypher = 'start r=rel(' + id + ') delete r;';
    db.queryAsync(cypher)
      .then(function(){
        resolve()
      });
  })
  .catch(function(err) {
    console.log(err);
  });
};

// Updates a relationship, overwriting properties if necessary
// id: int
// properties: Object
// Returns the updated node
Relationship.update = function(id, properties) {
  return new Promise(function(resolve) {
    var cypher = 'start r=rel(' + id + ') ';
    for(var key in properties) {
      cypher += 'set r.' + key + ' = "' + properties[key] + '" ';
    }
    cypher += 'return r;';
    db.queryAsync(cypher)
      .then(function(nodes) {
        resolve(nodes[0]);
      });
  })
  .catch(function(err) {
    console.log(err);
  });
};

Relationship.createMutualConnection = function(requestingUserId, acceptingUserId, relId){
  return new Promise(function(resolve){
    Relationship.delete(relId).then(function(){
      return db.relateAsync(requestingUserId, 'CONNECTED', acceptingUserId);
    }).then(function(){
      resolve();
    })
  }).catch(function(err){
    console.log(err)
  })
}

Promise.promisifyAll(Relationship);

module.exports = Relationship;