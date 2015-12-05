# Neo4j Database Operations

### User.get(props)
Returns a node with the given properties. Matches against all properties. Returns an array of matching node(s).  

__Arguments__  
* `props` - Object - properties contained within the desired node. Options are "username", "id", "name", "avatar_url" etc.

__Example__

```javascript
User.get({username: 'ccnixon'}).then(function(result){
  console.log(result); 
}
```
### Node.getRelationships(baseNodeId, relDirection, relLabel)  
Returns a promise containing an array of relationship objects.

__Arguments__
* `baseNodeId` - Object - Partially defined object, needs to contain unique data. This is the node that relationships will be found for
* `relDirection` - String - Set the direction of the relationships from the node you want to find. Options are: 'out', 'in', 'all'.
* `relLabel` - Choose the labels of the relationships you want to find. Empty string finds all.

__Example__

```javascript
Node.getRelationships({username: 'ccnixon'}, 'out', '').then(function(result) {
    console.log(result);
})
```
### Node.addRelationships(params)
Returns the 

__Arguments__  
params is an Object containing
* `baseNode` - Object - Partially defined object, needs to contain unique data. This is the node that relationships will be found for
* `relNodes` - Object - the other Nodes you want to add a relationship to
* `relDirection` - String - Set the direction of the relationships from the node you want to find. Options are: 'out', 'in', 'all'.
* `relLabel` - Choose the labels of the relationships you want to find. Empty string finds all.


__Example__
```javascript
Node.addRelationships({
 baseNode: {username: 'ccnixon'},
 relNodes: [{name: 'JavaScript'}, {name: 'Python'}, {name: 'Ruby'}],
 relDirection: 'out',
 relNodeLabels: ['Language'],
 relLabel: 'KNOWS'
})
```

### Node.getRelationshipData(baseNode, relDirection, relLabel)
Returns an array of all the nodes that have a relationship to the base node matching the defined parameters.

__Arguments__

* `baseNode` - Object - Partially defined object, needs to contain unique data. This is the node that relationships will be found for
* `relDirection` - String - Set the direction of the relationships from the node you want to find. Options are: 'out', 'in', 'all'.
* `relLabel` - Choose the labels of the relationships you want to find. Empty string finds all.

__Example__

```javascript
db.getRelationshipData({username: 'ccnixon'}, 'all', '').then(function(result){
  console.log(result)
}
```
### Node.update(node, attrs)
Updates node with specific attributes.

__Arguments__  
* `node` - Object - the node to be updated
* `attrs` - Object - the attributes to be added to the node

__Example__
```javascript
User.get({username: 'jakegarelick'})  
 .then(function(nodes) {
   Node.update(nodes[0], {likes: 'blueberry pie'})
     .then(function() {
       console.log('Node updated!');
     });
 });
```

### Node.findOrCreateNode(prop, labels)
Finds a node with specific properties or it creates a node with those properties.

__Arguments__  
* `props` - Object - properties of a node to be created or found
* `labels` - Object -  labels of the relationships you want to find or create
__Example__
```javascript
Node.findOrCreateNode(({username: 'ccnixon'}, '').then(function(results) {
console.log(results);
})
```


