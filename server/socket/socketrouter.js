var Firebase = require('firebase');
var firebase = new Firebase('https://deltadage.firebaseio.com/');

//all users online that are connected to the socket
var people = {};

//all private Messaging rooms
var rooms = {};
var users = {};

//collabMessages, currently not in room format yet
var collabRooms = [];

var projectComments;

var retrieveData = function () {
  firebase.once("value", function(data) {
    if(data.val()) {  
      rooms = data.val().privateRooms;
      collabRooms = data.val().collabRooms;
      users = data.val().users;
      projectComments = data.val().projectRooms;
      // console.log('users', rooms);
    }
  });
}

retrieveData();

// export function for listening to the socket
module.exports = function (socket) {

  var name;
  //console.log('Socket User connected');
  
  retrieveData();

  //init data for the user
  socket.on('myusername', function(data) {
    name = data;
    // people[data] = socket;
    var peopleArray = [];
    var roomsObj = {};
    // console.log('peeeple in socket io people object', people.yusufmodan.id)

    firebase.once("value", function(bigData) {
      if(bigData.val()) {
        rooms = bigData.val().privateRooms;
      }
      for(var key in people) {
        peopleArray.push(key);
      }

      for(var key in rooms) {
        if(rooms[key].users.indexOf(name) > -1) {
          socket.join(key);
          roomsObj[key] = rooms[key];
          // console.log('joined ' + name + ' to room: ', key);
        }
      }

      socket.emit('init', {
        name: name,
        users: peopleArray,
        rooms: roomsObj
      })
      socket.broadcast.emit('bigInit', {
        users: peopleArray
      })
    })
  });

  // join two users into a privateMessaging room
  socket.on('join:privateRoom', function(data) {
    for(var key in people) {
      if(key === data.users[0]) {
        // console.log('joined myself to Room: ', data.roomName);
        people[key].join(data.roomName);
      }
      if(key === data.users[1]) {
        // console.log('joined ' + data.users[1] + ' to ' + data.roomName);
        people[key].join(data.roomName);
      }
    }
  });

  //sends Messages to room
  socket.on('send:privateMessage', function(data) {
    socket.to(data.room).emit('send:message', {
      room: data.room,
      user: name,
      text: data.message
    });
    socket.emit('insertData');
  });

  socket.on('store:firstMessageData', function(data) {
    var userRef = firebase.child('privateRooms');
    var foundRoom = data.user + data.target;
    if(!rooms) {
      rooms = {};
    }
    if(rooms[data.user + data.target]) {
      rooms[data.user + data.target].messages.push(data.message);
      foundRoom = data.user + data.target;
    } else if(rooms[data.target + data.user]) {
      rooms[data.target + data.user].messages.push(data.message);
      foundRoom = data.target = data.user;
    } else {
      var twoUsers = [data.user, data.target];
      var roomMessages = [data.message];
      rooms[foundRoom] = {};
      rooms[foundRoom].messages = roomMessages;
      rooms[foundRoom].users = twoUsers;
    }
    socket.emit('send:foundRoom', {
      room: foundRoom
    })
    if(data) {
      userRef.update(rooms);
    }
  })

  // notify other clients that a new user has joined
  socket.broadcast.emit('user:join', {
    name: name
  });

  // broadcast a user's message to other people
  socket.on('send:message', function (data) {
    socket.broadcast.emit('send:message', {
      user: name,
      text: data.message
    });
  });

  //stores private messaging data into firebase
  socket.on('storeData', function(data) {
    var userRef = firebase.child('privateRooms');
    for(var key in data) {
      delete data[key].avatar;
    }
    if(data){
      userRef.update(data);
    }
  });

  /** Collab Page Socket Functions **/

  //intialized username and adds socket info to people array
  socket.on('initCollab', function(data) {
    name = data.name;
    people[data.name] = socket;
    people[data.name].join(data.collabRoom);
    socket.emit('initCollab', collabRooms);
  });

  //stores collab message data into firebase
  socket.on('store:collabData', function(data) {
    var userRef = firebase.child('collabRooms');
    if(data) {
      userRef.update(data);
    }
  });

  socket.on('send:collabMessage', function(data) {
    socket.to(data.room).emit('send:collabMessage', {
      username: data.name,
      message: data.message,
      date: data.date,
      avatar: data.avatar
    });
  });
  /** End of Collab Page Socket Functions **/


  /** Project-Page Page Socket Functions **/

  //intialized username and adds socket info to people array
  socket.on('initProject', function(data) {
    name = data.name;
    people[data.name] = socket;
    people[data.name].join(data.projectRoom);
    socket.emit('initProject', projectComments);
  });

  //stores collab message data into firebase
  socket.on('store:projectData', function(data) {
    var userRef = firebase.child('projectRooms');
    if(data) {
      userRef.update(data);
    }
  });

  socket.on('send:projectMessage', function(data) {
    socket.broadcast.emit('send:projectMessage', {
      username: name,
      message: data.message,
      date: data.date,
      avatar: data.avatar
    });
  });

  socket.on('initListComments', function() {
    socket.emit('initListComments', {
      comment: projectComments
    })
  })
  
  /** End of Project-Page Page Socket Functions **/


  /*  notify your friend*/
  socket.on('notify:potentialFriend', function(data){
    var fireUsers = firebase.child('users');
    var fireTargetUser = fireUsers.child(data.target);
    var friendRequests = fireTargetUser.child('friendRequests')
    socket.emit('notify:potentialFriendSuccess')
    friendRequests.transaction(function(number){
     return (number || 0) + 1;
    }, function(error, committed, snapshot){
      if(!error){
        firebase.once("value", function(values) {
          if(values.val()) {  
            users = values.val().users;
            socket.emit('theDATA', users[data.currentUser]);
            socket.emit('waitForFirebase');
          }
        });
      }
    });
  });


  socket.on('notify:message', function(data){
     var fireUsers = firebase.child('users');
     var fireTargetUser = fireUsers.child(data.target).child('messageNotifications');
     var fireCurrentUser = fireUsers.child(data.currentUser).child('messageNotifications');
     // var currentUserMessages = fireCurrentUser.child('messageNotifications');

     for(var key in people){
      if(key === data){
        return
      }
     }
     fireTargetUser.transaction(function(number){
      return (number || 0) + 1;
     }, function(err, committed, snapshot){
      if(!err){
        fireCurrentUser.set(0);
        firebase.once("value", function(values) {
          if(values.val()) {  
            users = values.val().users;
            socket.emit('theDATA', users[data.currentUser]);
          }
        });
      }
     });
  })

  socket.on('clear:friendRequests', function(data){
    var fireUsers = firebase.child('users');
    var userFriendRequests = fireUsers.child(data.currentUser).child('friendRequests');

    userFriendRequests.set(0);
    firebase.once("value", function(values) {
      if(values.val()) {  
        users = values.val().users;
        socket.emit('theDATA', users[data.currentUser]);
      }
    });
  })

  // clean up when a user leaves, and broadcast it to other people
  socket.on('disconnect', function () {
    // console.log('user disconnected');
    socket.broadcast.emit('user:left', {
      name: name
    });
    delete people[name];
  });


  //sends user data stored in users object to header.js
  socket.on('giveMeDATA', function(data){
    if(users) {
      socket.emit('theDATA', users[data.username]);
    }
    people[data.username] = socket;
  })

  socket.on('notify:otherUser', function(data){
    if(people[data.username]){
      switch (data.subject){
        case "messages":
          socket.broadcast.to(people[data.username].id).emit('youveGotMail', {data:'livenotify'});
          break;
        case "friendRequest":
          socket.broadcast.to(people[data.username].id).emit('friendRequest:notification', {data:'livenotify'});
          break;
        case "myConnections":
          socket.broadcast.to(people[data.username].id).emit('friendAccepted:notification', {data:'blinkyblinkBlinkityBlink'});
          break;
        case "projectInvite":
          console.log('dayum bro');
          socket.broadcast.to(people[data.username].id).emit('projectInvite:notification');
          break;
      }
    }
  });
//store my connections notification in firebase
  socket.on('store:otherUser', function(data){
    if(data.username){
      var fireUsers = firebase.child('users');
      var friendAccepted = fireUsers.child(data.username).child('friendAccepted');

      for(var key in people){
       if(key === data){
         return
       }
      }
      friendAccepted.transaction(function(number){
       return (number || 0) + 1;
      });

    }
  });

// clear friendAccepted field in firebase 
  socket.on('clear:friendAccepted', function(data){
    var fireUsers = firebase.child('users');
    var friendAccepted = fireUsers.child(data.currentUser).child('friendAccepted');

    friendAccepted.set(0);
    firebase.once("value", function(values) {
      if(values.val()) {  
        users = values.val().users;
        socket.emit('theDATA', users[data.currentUser]);
      }
    });
  })

  socket.on('store:projectInvite', function(data) {
    if(data.username){
      var fireUsers = firebase.child('users');
      var friendAccepted = fireUsers.child(data.username).child('projectInvite');

      for(var key in people){
       if(key === data){
         return
       }
      }
      friendAccepted.transaction(function(number){
       return (number || 0) + 1;
      });

    }
  })

  socket.on('clear:projectInvite', function(data){
    var fireUsers = firebase.child('users');
    var friendAccepted = fireUsers.child(data.currentUser).child('projectInvite');

    friendAccepted.set(0);
    firebase.once("value", function(values) {
      if(values.val()) {  
        users = values.val().users;
        socket.emit('theDATA', users[data.currentUser]);
      }
    });
  })
};
