# gitconnect ![](https://travis-ci.org/deltathesis/gitconnect.svg?branch=dev)

### Neo4j DB Operations

### get(predicate, any, label)
Returns a node with the given properties. Matches against all properties. Returns an array of matching node(s).

__Example__

```javascript
db.get({username: 'ccnixon'}).then(function(result){
  console.log(result) --> 
  /* 
  [ { avatar_url: 'https://avatars.githubusercontent.com/u/12958606?v=3',
    location: '',
    ratingAverage: 'null',
    blog: 'null',
    ratingTotal: 0,
    username: 'ccnixon',
    bio: 'asdada',
    email: 'chrisnxn@gmail.com',
    company: 'null',
    name: 'Chris Nixon',
    apiUrl: 'https://api.github.com/users/ccnixon',
    githubId: 12958606,
    availability: true,
    id: 756 } ]
    */
  })
```

## getRelationshipData(baseNode, relDirection, relLabel)
Returns an array of all the nodes that have a relationship to the base node matching the defined parameters.

__Arguments__

* `baseNode` - {object} - Partially defined object, needs to contain unique data. This is the node that relationships will be found for
* `relDirection` - 'String' - Set the direction of the relationships from the node you want to find. Options are: 'out', 'in', 'all'.
* `relLabel` - Choose the labels of the relationships you want to find. Empty string finds all.

__Example__

```javascript
db.getRelationshipData({username: 'ccnixon'}, 'all', '').then(function(result){
  console.log(result) --> 
  /* 
  { relationships:
   { KNOWS:
      [ [Object],
        [Object],
        [Object],
        [Object],
        [Object],
        [Object],
        [Object],
        [Object] ],
     WATCHES:
      [ [Object],
        [Object],
        [Object],
        [Object],
        [Object],
        [Object],
        [Object],
        [Object],
        [Object],
        [Object],
        [Object],
        [Object],
        [Object],
        [Object],
        [Object],
        [Object],
        [Object],
        [Object],
        [Object],
        [Object] ],
     Lives: [ [Object] ] },
  user:
   { avatar_url: 'https://avatars.githubusercontent.com/u/12958606?v=3',
     location: '',
     ratingAverage: 'null',
     blog: 'null',
     ratingTotal: 0,
     username: 'ccnixon',
     bio: 'asdada',
     email: 'chrisnxn@gmail.com',
     company: 'null',
     name: 'Chris Nixon',
     apiUrl: 'https://api.github.com/users/ccnixon',
     githubId: 12958606,
     availability: true,
     id: 756 } }
    */
  })
```


