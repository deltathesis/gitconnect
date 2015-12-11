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
  //baseNode, relNodes, relNodeLabels, relDirection, relLabel
  var userId;
  var relNodeIds;
  return new Promise(function(resolve){

    //Get request for the base node
    User.get(params.baseNode).then(function(userNode){
      userId = userNode[0].id;

      // Get all of the relationship nodes for the base node
      return Node.getRelationships(userId, params.relDirection, params.relLabel); 

    }).then(function(relNodes){

      /* If the relationship direction we want to add is 'out' then we want the ending
      relationship nodes for the base node. If the rel direction is 'in' we want the start
      node ids. Using a conditional to check and defaulting to in relationships if there is
      an error */

      if(params.relDirection === 'in'){
        relNodeIds = relNodes.map(function(rel){
          return rel.start
        })
      } else {
        relNodeIds = relNodes.map(function(rel){
          return rel.end
        })
      }
      return;

    }).then(function(){

      /* Running a findOrCreateNode function on all nodes in the relNodes
      array. Then running a filter to ensure we are not adding relationships
      to newly returned we do not want to add a relationship to.
      */


      return Promise.map(params.relNodes, function(element){
        return Node.findOrCreateNode(element, params.relNodeLabels)
      }).filter(function(element){
        return !_.contains(relNodeIds, element.id)
      })
    })

    .then(function(nodes){

      /* Running a batch query on each new relationship node to add a relationship
      to the base node running another conditional to check which direction we want 
      to add the relationship to.
      */
      var txn = db.batch()

      if(params.relDirection === 'in'){
        nodes.forEach(function(node){
          txn.relate(node.id, params.relLabel, userId)
        })
      } else {
        nodes.forEach(function(node){
          txn.relate(userId, params.relLabel, node.id)
        })
      }
      return txn.commit(function(err, results){
        if(err){
          console.log(err)
        } else {
        	//console.log(results);
          return results;
        }
      })
    })

    //Resolving results
    .then(function(results){
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

    // Set up an object to build the database results as we progress

    var results = {};

    User.get(baseNode)

    .then(function(node){
      results = node[0];
      return node[0];
    })

    .then(function(node){
      // get all relationships for the base node
        return Node.getRelationships(node.id, relDirection, relLabel)
    })

    .then(function(relArray){
        results.relationships = {};
        var relNodes = [];

         //loop through array of all the relationships
        relArray.forEach(function(node){
          var nodeId;
          //Check to see if the relationship is inward or outward
          
          node.start === results.id ? nodeId = node.end : nodeId = node.start;
          relNodes.push(db.readAsync(nodeId).then(function(nodeData){
            if(!results.relationships[node.type]){
              results.relationships[node.type] = [];
            }
            var newNode = nodeData;
            newNode.relId = node.id;
            results.relationships[node.type].push(newNode);
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

Node.deleteRelationship = function(node1Id, node2Id, type) {
  return new Promise(function(resolve) {
    var cypher = 'match n-[rel:' + type + ']-m where id(n) = ' + node1Id + ' and id(m) = ' + node2Id + ' delete rel';
    db.queryAsync(cypher)
      .then(resolve)
    }).catch(function(err) {
      console.log(err);
    });
};

Promise.promisifyAll(Node);

module.exports = Node;