var Firebase = require('firebase');
var firebase = new Firebase('https://deltadage.firebaseio.com/');

var people = {};

var rooms;

firebase.once("value", function(data) {
  // do some stuff once
  rooms = data.val();
});
// export function for listening to the socket
module.exports = function (socket) {

  console.log('user connected');
  var name;

  socket.on('myusername', function(data) {
    name = data;
    people[data] = socket;
    var peopleArray = [];
    var roomsObj = {};
    for(var key in people) {
      peopleArray.push(key);
    }
    for(var key in rooms) {
      if(rooms[key].users.indexOf(name) > -1) {
       roomsObj[key] = rooms[key];
      }
    }
    socket.emit('init', {
      name: data,
      users: peopleArray,
      rooms: roomsObj
    })
    socket.broadcast.emit('bigInit', {
      users: peopleArray
    })
  })

  // join two users into a privateMessaging room
  socket.on('join:privateRoom', function(data) {
    for(var key in people) {
      if(key === data.users[0]) {
        console.log('joined myself to Room: ', data.roomName);
        people[key].join(data.roomName);
      }
      if(key === data.users[1]) {
        console.log('joined ' + data.users[1] + ' to ' + data.roomName);
        people[key].join(data.roomName);
      }
    }
  });

  socket.on('send:privateMessage', function(data) {
    socket.to(data.room).emit('send:message', {
      room: data.room,
      user: name,
      text: data.message
    });
    socket.emit('insertData');
  });

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

  socket.on('storeData', function(data){
    if(data){
      firebase.update(data);
    }
  });

  // clean up when a user leaves, and broadcast it to other people
  socket.on('disconnect', function () {
    console.log('user disconnected');
    socket.broadcast.emit('user:left', {
      name: name
    });
    // userNames.free(name);
  });
};
