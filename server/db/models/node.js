var Promise = require('bluebird');
var User = require('./user');
var db = require('../database');
var _ = require('underscore');

var Node = {};

Node.getRelationships = function(baseNodeId, relDirection, relLabel){
  return new Promise(function(resolve){
    return db.relationshipsAsync(baseNodeId, relDirection, relLabel).then(function(rel){
      resolve(rel);
    })
  })
};

Node.addRelationships = function(params){
  //baseNode, relNodes, relNodeLabel, relDirection, relLabel
  var userId;
  var relNodeIds;
  return new Promise(function(resolve){
    User.get(params.baseNode).then(function(userNode){
      userId = userNode[0].id;
      return Node.getRelationships(userId, params.relDirection, params.relLabel); 
    }).then(function(relNodes){
        relNodeIds = relNodes.map(function(rel){
          return rel.end
        })
      return;
    }).then(function(){
      return Promise.map(params.relNodes, function(element){
        return Node.findOrCreateNode(element, params.relNodeLabels)
      }).filter(function(element){
        return !_.contains(relNodeIds, element.id)
      })
    }).then(function(nodes){
      var txn = db.batch()
      nodes.forEach(function(node){
        txn.relate(userId, params.relLabel, node.id)
      })
      return txn.commit(function(err, results){
        if(err){
          console.log(err)
        } else {
        	//console.log(results);
          return results;
        }
      })
    }).then(function(results){
      resolve(results)
    }).catch(function(err){
      console.log(err)
    })
  })   
};

Node.getNodesWithLabel = function(label){
  return new Promise(function(resolve){
    db.nodesWithLabelAsync(label).then(function(nodesArray){
      resolve(nodesArray)
    })
  })
}

Node.getRelationshipData = function(baseNode, relDirection, relLabel){
  return new Promise(function(resolve){
    var results = {};
    User.get(baseNode).then(function(node){
      results = node[0];
      return node[0];
    }).then(function(node){
        return Node.getRelationships(node.id, relDirection, relLabel)
    }).then(function(relArray){
        results.relationships = {};
        var relNodes = [];
        relArray.forEach(function(node){
          relNodes.push(db.readAsync(node.end).then(function(nodeData){
            if(!results.relationships[node.type]){
              results.relationships[node.type] = [];
            }
            results.relationships[node.type].push(nodeData);
            return nodeData;
        }));
      })
      return Promise.all(relNodes)
    }).then(function(relNodes){
        resolve(results);
    })
  })
}

// Updates node with specified attributes (similar to extend)
// node: Object
// attrs: Object
Node.update = function(node, attrs) {
  return new Promise(function(resolve) {
    var txn = db.batch();
    for(var key in attrs) {
      txn.save(node, key, attrs[key]);
    }
    txn.commit(function(err, results) {
      if (err) console.log(err);
      resolve();
    });
  });
};

Node.findOrCreateNode = function(props, labels){
  return new Promise(function(resolve){
    User.get(props).then(function(node){
        if(!node.length){
          db.saveAsync(props).then(function(node){
            if(labels){
              db.labelAsync(node, labels).then(function(node){
                resolve(node)
              })
            }
            resolve(node)
          })
        } else {
          resolve(node[0])
        }
      })
    }).catch(function(err){
        console.log(err.body)
  })
};

Promise.promisifyAll(Node);

module.exports = Node;